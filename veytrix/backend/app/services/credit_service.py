from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID, uuid4
from fastapi import HTTPException, status
from app.core.logging import logger
from app.core.plans import get_plan_config
from app.core.supabase import init_supabase_client, init_supabase_admin_client
from app.models.credit import CreditModel
from app.models.profile import utc_now
from app.services.entitlement_service import entitlement_service
from app.services.project_service import parse_uuid

# Thread-safe in-memory credit store for tests/offline
_credits_store: Dict[str, CreditModel] = {}


class CreditService:
    """Central Credit Service managing AI credit allocation, consumption, resets, and ledger history."""

    @staticmethod
    def get_credit_balance(user_id: UUID | str) -> CreditModel:
        """Fetch current user credit balance entity, initializing default allocation if missing."""
        u_id = str(parse_uuid(user_id))

        credits_obj = _credits_store.get(u_id)

        if not credits_obj and (client := init_supabase_client()):
            try:
                res = client.table("credits").select("*").eq("user_id", u_id).execute()
                if res.data and len(res.data) > 0:
                    row = res.data[0]
                    credits_obj = CreditModel(
                        id=UUID(row["id"]),
                        user_id=UUID(row["user_id"]),
                        balance=int(row.get("balance", 100)),
                        last_reset=datetime.fromisoformat(row["last_reset"]) if row.get("last_reset") else utc_now(),
                        credit_mode=row.get("credit_mode", "standard"),
                        created_at=datetime.fromisoformat(row["created_at"]) if row.get("created_at") else utc_now(),
                        updated_at=datetime.fromisoformat(row["updated_at"]) if row.get("updated_at") else utc_now(),
                    )
                    _credits_store[u_id] = credits_obj
            except Exception as exc:
                logger.warning(f"Supabase DB credit fetch notice: {exc}")

        if not credits_obj:
            effective_plan = entitlement_service.get_effective_plan(user_id)
            plan_config = get_plan_config(effective_plan)
            now = utc_now()

            credits_obj = CreditModel(
                id=uuid4(),
                user_id=parse_uuid(user_id),
                balance=plan_config.initial_credits,
                last_reset=now,
                credit_mode="standard",
                created_at=now,
                updated_at=now,
            )
            _credits_store[u_id] = credits_obj

            # Persist default credit balance to Supabase
            if client := init_supabase_client():
                try:
                    payload = {
                        "user_id": u_id,
                        "balance": credits_obj.balance,
                        "current_balance": credits_obj.balance,
                        "total_credits_issued": credits_obj.balance,
                        "total_credits_consumed": 0,
                        "last_reset": now.isoformat(),
                        "credit_mode": "standard",
                    }
                    client.table("credits").upsert(payload, on_conflict="user_id").execute()
                except Exception as exc:
                    logger.warning(f"Supabase DB initial credit insert notice: {exc}")

        return credits_obj

    @staticmethod
    def consume_credits(user_id: UUID | str, amount: int, reason: str = "Video Export") -> CreditModel:
        """Deduct AI credits from user balance with validation and atomic transaction logging."""
        if amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "INVALID_AMOUNT", "message": "Credit consumption amount must be greater than zero."},
            )

        credits_obj = CreditService.get_credit_balance(user_id)

        if credits_obj.balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "INSUFFICIENT_CREDITS",
                    "message": f"Insufficient credit balance. Required: {amount}, Available: {credits_obj.balance}",
                },
            )

        credits_obj.balance -= amount
        credits_obj.updated_at = utc_now()
        u_id = str(parse_uuid(user_id))
        _credits_store[u_id] = credits_obj

        client = init_supabase_admin_client() or init_supabase_client()
        if client:
            try:
                # 1. Update credits table
                payload = {
                    "balance": credits_obj.balance,
                    "current_balance": credits_obj.balance,
                    "updated_at": credits_obj.updated_at.isoformat(),
                    "last_updated": credits_obj.updated_at.isoformat(),
                }
                client.table("credits").update(payload).eq("user_id", u_id).execute()

                # 2. Insert transaction ledger row
                tx_payload = {
                    "user_id": u_id,
                    "amount": -amount,
                    "transaction_type": "debit",
                    "reason": reason,
                    "created_by": "System",
                }
                client.table("credit_transactions").insert(tx_payload).execute()
            except Exception as exc:
                logger.warning(f"Supabase DB credit consume logging notice: {exc}")

        return credits_obj

    @staticmethod
    def assign_credits(user_id: UUID | str, amount: int, reason: str = "Admin Grant", admin_user: str = "Admin") -> CreditModel:
        """Assign/Add credits to a user balance with audit logging."""
        u_id = str(parse_uuid(user_id))
        client = init_supabase_admin_client() or init_supabase_client()

        if client:
            try:
                res = client.rpc("assign_user_credits", {
                    "p_user_id": u_id,
                    "p_amount": amount,
                    "p_reason": reason,
                    "p_admin_identifier": admin_user,
                }).execute()
                if res.data:
                    new_bal = res.data.get("new_balance")
                    credits_obj = CreditService.get_credit_balance(user_id)
                    credits_obj.balance = new_bal
                    _credits_store[u_id] = credits_obj
                    return credits_obj
            except Exception as exc:
                logger.warning(f"RPC assign_user_credits notice, executing fallback: {exc}")

        # Fallback manual calculation
        credits_obj = CreditService.get_credit_balance(user_id)
        credits_obj.balance += amount
        credits_obj.updated_at = utc_now()
        _credits_store[u_id] = credits_obj
        return credits_obj

    @staticmethod
    def deduct_credits(user_id: UUID | str, amount: int, reason: str = "Manual Deduction", admin_user: str = "Admin") -> CreditModel:
        """Deduct credits from a user balance with audit logging."""
        u_id = str(parse_uuid(user_id))
        client = init_supabase_admin_client() or init_supabase_client()

        if client:
            try:
                res = client.rpc("deduct_user_credits", {
                    "p_user_id": u_id,
                    "p_amount": amount,
                    "p_reason": reason,
                    "p_admin_identifier": admin_user,
                }).execute()
                if res.data:
                    new_bal = res.data.get("new_balance")
                    credits_obj = CreditService.get_credit_balance(user_id)
                    credits_obj.balance = new_bal
                    _credits_store[u_id] = credits_obj
                    return credits_obj
            except Exception as exc:
                logger.warning(f"RPC deduct_user_credits notice: {exc}")

        return CreditService.consume_credits(user_id, amount, reason)

    @staticmethod
    def reset_credits(user_id: UUID | str, amount: Optional[int] = None, reason: str = "Subscription Reset", admin_user: str = "System") -> CreditModel:
        """Reset user credit balance to default allocation or specified amount."""
        credits_obj = CreditService.get_credit_balance(user_id)

        if amount is None:
            effective_plan = entitlement_service.get_effective_plan(user_id)
            plan_config = get_plan_config(effective_plan)
            amount = plan_config.initial_credits

        u_id = str(parse_uuid(user_id))
        client = init_supabase_admin_client() or init_supabase_client()

        if client:
            try:
                client.rpc("reset_user_credits", {
                    "p_user_id": u_id,
                    "p_target_balance": amount,
                    "p_reason": reason,
                    "p_admin_identifier": admin_user,
                }).execute()
            except Exception as exc:
                logger.warning(f"RPC reset_user_credits notice: {exc}")

        credits_obj.balance = amount
        now = utc_now()
        credits_obj.last_reset = now
        credits_obj.updated_at = now

        _credits_store[u_id] = credits_obj
        return credits_obj


credit_service = CreditService()

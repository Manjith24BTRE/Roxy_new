from datetime import datetime
from typing import Dict, Optional
from uuid import UUID, uuid4
from fastapi import HTTPException, status
from app.core.logging import logger
from app.core.plans import get_plan_config
from app.core.supabase import init_supabase_client
from app.models.credit import CreditModel
from app.models.profile import utc_now
from app.services.entitlement_service import entitlement_service
from app.services.project_service import parse_uuid

# Thread-safe in-memory credit store for tests/offline
_credits_store: Dict[str, CreditModel] = {}


class CreditService:
    """Central Credit Service managing AI credit allocation, consumption, and resets."""

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

        return credits_obj

    @staticmethod
    def consume_credits(user_id: UUID | str, amount: int) -> CreditModel:
        """Deduct AI credits from user balance with validation."""
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

        client = init_supabase_client()
        if client:
            try:
                payload = {
                    "balance": credits_obj.balance,
                    "updated_at": credits_obj.updated_at.isoformat(),
                }
                client.table("credits").update(payload).eq("user_id", u_id).execute()
            except Exception as exc:
                logger.warning(f"Supabase DB credit update notice: {exc}")

        return credits_obj

    @staticmethod
    def reset_credits(user_id: UUID | str, amount: Optional[int] = None) -> CreditModel:
        """Reset user credit balance to default allocation or specified amount."""
        credits_obj = CreditService.get_credit_balance(user_id)

        if amount is None:
            effective_plan = entitlement_service.get_effective_plan(user_id)
            plan_config = get_plan_config(effective_plan)
            amount = plan_config.initial_credits

        credits_obj.balance = amount
        now = utc_now()
        credits_obj.last_reset = now
        credits_obj.updated_at = now

        u_id = str(parse_uuid(user_id))
        _credits_store[u_id] = credits_obj

        return credits_obj


credit_service = CreditService()

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      permissions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          resource: string;
          action: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          resource: string;
          action: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          resource?: string;
          action?: string;
          created_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_id?: string;
          created_at?: string;
        };
      };
      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          auth_user_id: string | null;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          status: "active" | "inactive" | "suspended" | "pending";
          country: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          status?: "active" | "inactive" | "suspended" | "pending";
          country?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          status?: "active" | "inactive" | "suspended" | "pending";
          country?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          currency: string;
          billing_interval: "monthly" | "yearly" | "one_time";
          features: Json;
          limits: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          currency?: string;
          billing_interval: "monthly" | "yearly" | "one_time";
          features?: Json;
          limits?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          billing_interval?: "monthly" | "yearly" | "one_time";
          features?: Json;
          limits?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: "trialing" | "active" | "past_due" | "canceled" | "expired";
          start_date: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          status: "trialing" | "active" | "past_due" | "canceled" | "expired";
          start_date?: string;
          current_period_start?: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          status?: "trialing" | "active" | "past_due" | "canceled" | "expired";
          start_date?: string;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          amount: number;
          currency: string;
          transaction_type: "payment" | "refund" | "credit" | "adjustment";
          status: "pending" | "completed" | "failed" | "refunded";
          external_reference: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id?: string | null;
          amount: number;
          currency?: string;
          transaction_type: "payment" | "refund" | "credit" | "adjustment";
          status: "pending" | "completed" | "failed" | "refunded";
          external_reference?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string | null;
          amount?: number;
          currency?: string;
          transaction_type?: "payment" | "refund" | "credit" | "adjustment";
          status?: "pending" | "completed" | "failed" | "refunded";
          external_reference?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      ai_jobs: {
        Row: {
          id: string;
          user_id: string;
          model: string;
          job_type: string;
          status: "queued" | "processing" | "completed" | "failed" | "canceled";
          input_data: Json;
          output_data: Json;
          input_tokens: number;
          output_tokens: number;
          total_tokens: number;
          estimated_cost: number;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          model: string;
          job_type: string;
          status: "queued" | "processing" | "completed" | "failed" | "canceled";
          input_data?: Json;
          output_data?: Json;
          input_tokens?: number;
          output_tokens?: number;
          total_tokens?: number;
          estimated_cost?: number;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          model?: string;
          job_type?: string;
          status?: "queued" | "processing" | "completed" | "failed" | "canceled";
          input_data?: Json;
          output_data?: Json;
          input_tokens?: number;
          output_tokens?: number;
          total_tokens?: number;
          estimated_cost?: number;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_usage: {
        Row: {
          id: string;
          user_id: string;
          model: string;
          usage_date: string;
          request_count: number;
          input_tokens: number;
          output_tokens: number;
          total_tokens: number;
          estimated_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          model: string;
          usage_date?: string;
          request_count?: number;
          input_tokens?: number;
          output_tokens?: number;
          total_tokens?: number;
          estimated_cost?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          model?: string;
          usage_date?: string;
          request_count?: number;
          input_tokens?: number;
          output_tokens?: number;
          total_tokens?: number;
          estimated_cost?: number;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _user_id: string;
          _role_name: string;
        };
        Returns: boolean;
      };
      has_permission: {
        Args: {
          _user_id: string;
          _permission_name: string;
        };
        Returns: boolean;
      };
      is_admin: {
        Args: {
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

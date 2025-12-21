export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          admin_email: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_email: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_email: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_email?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_email?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_email?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          is_user_message: boolean
          message: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          is_user_message?: boolean
          message: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          is_user_message?: boolean
          message?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      investment_plans: {
        Row: {
          active: boolean
          created_at: string
          description: string
          duration_days: number
          expected_roi_max: number
          expected_roi_min: number
          id: string
          max_amount: number
          min_amount: number
          name: string
          risk_level: Database["public"]["Enums"]["risk_level"]
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          duration_days: number
          expected_roi_max: number
          expected_roi_min: number
          id?: string
          max_amount: number
          min_amount: number
          name: string
          risk_level: Database["public"]["Enums"]["risk_level"]
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          duration_days?: number
          expected_roi_max?: number
          expected_roi_min?: number
          id?: string
          max_amount?: number
          min_amount?: number
          name?: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount_usdt: number
          created_at: string
          current_value: number
          ends_at: string | null
          id: string
          plan_id: string
          roi_percentage: number
          started_at: string | null
          status: Database["public"]["Enums"]["investment_status"]
          user_id: string
        }
        Insert: {
          amount_usdt: number
          created_at?: string
          current_value: number
          ends_at?: string | null
          id?: string
          plan_id: string
          roi_percentage?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["investment_status"]
          user_id: string
        }
        Update: {
          amount_usdt?: number
          created_at?: string
          current_value?: number
          ends_at?: string | null
          id?: string
          plan_id?: string
          roi_percentage?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["investment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "investment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          balance_usdt: number
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_suspended: boolean
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          kyc_submitted_at: string | null
          phone: string | null
          upgrade_fee_paid: boolean
          wallet_btc: string | null
          wallet_usdt: string | null
        }
        Insert: {
          balance_usdt?: number
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_suspended?: boolean
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          kyc_submitted_at?: string | null
          phone?: string | null
          upgrade_fee_paid?: boolean
          wallet_btc?: string | null
          wallet_usdt?: string | null
        }
        Update: {
          balance_usdt?: number
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          kyc_submitted_at?: string | null
          phone?: string | null
          upgrade_fee_paid?: boolean
          wallet_btc?: string | null
          wallet_usdt?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_amount: number
          bonus_paid: boolean
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          bonus_amount?: number
          bonus_paid?: boolean
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          bonus_amount?: number
          bonus_paid?: boolean
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_bot_performance: {
        Row: {
          action: string
          amount: number
          id: string
          investment_id: string
          notes: string | null
          price: number
          profit_loss: number
          timestamp: string
        }
        Insert: {
          action: string
          amount: number
          id?: string
          investment_id: string
          notes?: string | null
          price: number
          profit_loss: number
          timestamp?: string
        }
        Update: {
          action?: string
          amount?: number
          id?: string
          investment_id?: string
          notes?: string | null
          price?: number
          profit_loss?: number
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_bot_performance_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          currency: string
          id: string
          processed_at: string | null
          processed_by: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          transaction_hash: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          currency?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_hash?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_hash?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_deposit_atomic: {
        Args: {
          p_admin_email: string
          p_admin_id: string
          p_admin_notes?: string
          p_transaction_id: string
        }
        Returns: Json
      }
      approve_withdrawal_atomic: {
        Args: {
          p_admin_email: string
          p_admin_id: string
          p_admin_notes?: string
          p_transaction_hash?: string
          p_transaction_id: string
        }
        Returns: Json
      }
      auto_approve_withdrawal: {
        Args: { p_transaction_id: string }
        Returns: Json
      }
      create_investment_atomic: {
        Args: { p_amount_usdt: number; p_plan_id: string; p_user_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reject_deposit_atomic: {
        Args: {
          p_admin_email: string
          p_admin_id: string
          p_admin_notes?: string
          p_transaction_id: string
        }
        Returns: Json
      }
      reject_withdrawal_atomic: {
        Args: {
          p_admin_email: string
          p_admin_id: string
          p_admin_notes?: string
          p_transaction_id: string
        }
        Returns: Json
      }
      verify_kyc_atomic: {
        Args: {
          p_admin_email: string
          p_admin_id: string
          p_reason?: string
          p_user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
      investment_status: "pending" | "active" | "completed" | "cancelled"
      kyc_status: "pending" | "verified" | "rejected"
      risk_level: "low" | "medium" | "high"
      transaction_status: "pending" | "approved" | "rejected" | "completed"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "profit"
        | "loss"
        | "fee"
        | "referral_bonus"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      investment_status: ["pending", "active", "completed", "cancelled"],
      kyc_status: ["pending", "verified", "rejected"],
      risk_level: ["low", "medium", "high"],
      transaction_status: ["pending", "approved", "rejected", "completed"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "profit",
        "loss",
        "fee",
        "referral_bonus",
      ],
    },
  },
} as const

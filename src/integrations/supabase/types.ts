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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          key_hash: string
          last_four: string
          last_used_at: string | null
          name: string
          prefix: string
          revoked_at: string | null
          scopes: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash: string
          last_four: string
          last_used_at?: string | null
          name: string
          prefix: string
          revoked_at?: string | null
          scopes?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          last_four?: string
          last_used_at?: string | null
          name?: string
          prefix?: string
          revoked_at?: string | null
          scopes?: string[]
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json
          user_agent?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_amount_cents: number
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at: string
          uses_count: number
          valid_from: string
          valid_until: string | null
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_amount_cents?: number
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          uses_count?: number
          valid_from?: string
          valid_until?: string | null
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_amount_cents?: number
          type?: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          uses_count?: number
          valid_from?: string
          valid_until?: string | null
          value?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_cents: number
          boleto_url: string | null
          coupon_code: string | null
          created_at: string
          currency: string
          description: string
          discount_cents: number
          due_at: string
          id: string
          metadata: Json
          mp_payment_id: string | null
          mp_preference_id: string | null
          number: string
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          pix_copy_paste: string | null
          pix_qr_code: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          total_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          boleto_url?: string | null
          coupon_code?: string | null
          created_at?: string
          currency?: string
          description: string
          discount_cents?: number
          due_at: string
          id?: string
          metadata?: Json
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          number: string
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          total_cents: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          boleto_url?: string | null
          coupon_code?: string | null
          created_at?: string
          currency?: string
          description?: string
          discount_cents?: number
          due_at?: string
          id?: string
          metadata?: Json
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          number?: string
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          total_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          backups_count: number
          bandwidth_gb: number | null
          cpu_cores: number
          created_at: string
          databases_count: number
          description: string | null
          disk_gb: number
          features: Json
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          pelican_egg_id: number | null
          pelican_nest_id: number | null
          price_cents: number
          ram_mb: number
          slots: number | null
          slug: string
          sort_order: number
          type: Database["public"]["Enums"]["plan_type"]
          updated_at: string
        }
        Insert: {
          backups_count?: number
          bandwidth_gb?: number | null
          cpu_cores: number
          created_at?: string
          databases_count?: number
          description?: string | null
          disk_gb: number
          features?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          pelican_egg_id?: number | null
          pelican_nest_id?: number | null
          price_cents: number
          ram_mb: number
          slots?: number | null
          slug: string
          sort_order?: number
          type: Database["public"]["Enums"]["plan_type"]
          updated_at?: string
        }
        Update: {
          backups_count?: number
          bandwidth_gb?: number | null
          cpu_cores?: number
          created_at?: string
          databases_count?: number
          description?: string | null
          disk_gb?: number
          features?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          pelican_egg_id?: number | null
          pelican_nest_id?: number | null
          price_cents?: number
          ram_mb?: number
          slots?: number | null
          slug?: string
          sort_order?: number
          type?: Database["public"]["Enums"]["plan_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          document: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          document?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          document?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          activated_at: string | null
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          cancelled_at: string | null
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json
          name: string
          next_due_at: string | null
          node_name: string | null
          pelican_identifier: string | null
          pelican_server_id: number | null
          plan_id: string
          port: number | null
          price_cents: number
          status: Database["public"]["Enums"]["service_status"]
          suspended_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          cancelled_at?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          name: string
          next_due_at?: string | null
          node_name?: string | null
          pelican_identifier?: string | null
          pelican_server_id?: number | null
          plan_id: string
          port?: number | null
          price_cents: number
          status?: Database["public"]["Enums"]["service_status"]
          suspended_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          cancelled_at?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          name?: string
          next_due_at?: string | null
          node_name?: string | null
          pelican_identifier?: string | null
          pelican_server_id?: number | null
          plan_id?: string
          port?: number | null
          price_cents?: number
          status?: Database["public"]["Enums"]["service_status"]
          suspended_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachments: Json
          author_id: string
          body: string
          created_at: string
          id: string
          is_internal_note: boolean
          ticket_id: string
        }
        Insert: {
          attachments?: Json
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_internal_note?: boolean
          ticket_id: string
        }
        Update: {
          attachments?: Json
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_internal_note?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          closed_at: string | null
          created_at: string
          id: string
          last_reply_at: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          rating: number | null
          rating_comment: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string
          id?: string
          last_reply_at?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          rating?: number | null
          rating_comment?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string
          id?: string
          last_reply_at?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          rating?: number | null
          rating_comment?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "client" | "moderator" | "admin"
      billing_cycle: "monthly" | "quarterly" | "semiannual" | "annual"
      coupon_type: "percent" | "fixed"
      invoice_status:
        | "draft"
        | "pending"
        | "paid"
        | "overdue"
        | "refunded"
        | "cancelled"
      notification_type:
        | "info"
        | "success"
        | "warning"
        | "error"
        | "billing"
        | "service"
        | "ticket"
        | "security"
      payment_method: "pix" | "credit_card" | "boleto"
      plan_type: "minecraft" | "discord_bot" | "vps"
      service_status:
        | "provisioning"
        | "active"
        | "suspended"
        | "cancelled"
        | "expired"
      ticket_category: "technical" | "billing" | "sales" | "other"
      ticket_priority: "low" | "normal" | "high" | "urgent"
      ticket_status:
        | "open"
        | "pending_client"
        | "pending_staff"
        | "resolved"
        | "closed"
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
      app_role: ["client", "moderator", "admin"],
      billing_cycle: ["monthly", "quarterly", "semiannual", "annual"],
      coupon_type: ["percent", "fixed"],
      invoice_status: [
        "draft",
        "pending",
        "paid",
        "overdue",
        "refunded",
        "cancelled",
      ],
      notification_type: [
        "info",
        "success",
        "warning",
        "error",
        "billing",
        "service",
        "ticket",
        "security",
      ],
      payment_method: ["pix", "credit_card", "boleto"],
      plan_type: ["minecraft", "discord_bot", "vps"],
      service_status: [
        "provisioning",
        "active",
        "suspended",
        "cancelled",
        "expired",
      ],
      ticket_category: ["technical", "billing", "sales", "other"],
      ticket_priority: ["low", "normal", "high", "urgent"],
      ticket_status: [
        "open",
        "pending_client",
        "pending_staff",
        "resolved",
        "closed",
      ],
    },
  },
} as const

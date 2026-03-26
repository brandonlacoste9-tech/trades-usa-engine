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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          client_email: string | null
          client_name: string
          client_phone: string | null
          contractor_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          lead_id: string | null
          notes: string | null
          scheduled_date: string
          scheduled_time: string
          status: string | null
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          contractor_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          contractor_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      automated_logs: {
        Row: {
          channel: string
          contractor_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          recipient: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          channel?: string
          contractor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          recipient?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          channel?: string
          contractor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          recipient?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          city: string | null
          claimed_at: string | null
          contractor_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          project_type: string | null
          score: number | null
          source: string | null
          state: string | null
          status: Database["public"]["Enums"]["lead_status"]
          trade: Database["public"]["Enums"]["trade_type"] | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          claimed_at?: string | null
          contractor_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          project_type?: string | null
          score?: number | null
          source?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          trade?: Database["public"]["Enums"]["trade_type"] | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          claimed_at?: string | null
          contractor_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          project_type?: string | null
          score?: number | null
          source?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          trade?: Database["public"]["Enums"]["trade_type"] | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          company_name: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          phone: string | null
          state: string | null
          stripe_customer_id: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          telegram_chat_id: string | null
          trade: Database["public"]["Enums"]["trade_type"] | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          state?: string | null
          stripe_customer_id?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          telegram_chat_id?: string | null
          trade?: Database["public"]["Enums"]["trade_type"] | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          state?: string | null
          stripe_customer_id?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          telegram_chat_id?: string | null
          trade?: Database["public"]["Enums"]["trade_type"] | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      scraped_inventory: {
        Row: {
          address: string | null
          city: string | null
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          description: string | null
          estimated_value: number | null
          // Added in migration 20260326000001
          heat_score: number | null
          heat_tier: "elite" | "high" | "medium" | "standard" | null
          id: string
          is_claimed: boolean
          owner_contact: string | null
          owner_name: string | null
          permit_number: string | null
          project_type: string | null
          scraped_at: string
          scraped_source: string | null
          state: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          heat_score?: number | null
          heat_tier?: "elite" | "high" | "medium" | "standard" | null
          id?: string
          is_claimed?: boolean
          owner_contact?: string | null
          owner_name?: string | null
          permit_number?: string | null
          project_type?: string | null
          scraped_at?: string
          scraped_source?: string | null
          state?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          heat_score?: number | null
          heat_tier?: "elite" | "high" | "medium" | "standard" | null
          id?: string
          is_claimed?: boolean
          owner_contact?: string | null
          owner_name?: string | null
          permit_number?: string | null
          project_type?: string | null
          scraped_at?: string
          scraped_source?: string | null
          state?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "admin" | "moderator" | "user"
      lead_status: "new" | "contacted" | "qualified" | "converted" | "lost"
      subscription_plan:
        | "web_starter"
        | "lead_engine"
        | "market_dominator"
        | "empire_builder"
      trade_type:
        | "hvac"
        | "plumbing"
        | "electrical"
        | "roofing"
        | "general_contracting"
        | "landscaping"
        | "solar"
        | "pool"
        | "hurricane_protection"
        | "renovations"
        | "other"
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
      app_role: ["admin", "moderator", "user"],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
      subscription_plan: [
        "web_starter",
        "lead_engine",
        "market_dominator",
        "empire_builder",
      ],
      trade_type: [
        "hvac",
        "plumbing",
        "electrical",
        "roofing",
        "general_contracting",
        "landscaping",
        "solar",
        "pool",
        "hurricane_protection",
        "renovations",
        "other",
      ],
    },
  },
} as const

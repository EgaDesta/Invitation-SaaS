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
      guests: {
        Row: {
          created_at: string
          email: string | null
          id: string
          invitation_id: string
          name: string
          phone: string | null
          rsvp_guests_count: number | null
          rsvp_message: string | null
          rsvp_status: Database["public"]["Enums"]["rsvp_status"]
          unique_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          invitation_id: string
          name: string
          phone?: string | null
          rsvp_guests_count?: number | null
          rsvp_message?: string | null
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"]
          unique_token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          invitation_id?: string
          name?: string
          phone?: string | null
          rsvp_guests_count?: number | null
          rsvp_message?: string | null
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"]
          unique_token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          id: string
          is_public: boolean
          name: string
          template_data: Json
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_public?: boolean
          name: string
          template_data?: Json
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_public?: boolean
          name?: string
          template_data?: Json
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          cover_image_url: string | null
          created_at: string
          custom_data: Json | null
          event_date: string | null
          event_description: string | null
          event_location: string | null
          event_name: string | null
          event_time: string | null
          event_type: string
          gallery_urls: Json | null
          host_names: string | null
          id: string
          is_published: boolean
          map_embed_url: string | null
          music_url: string | null
          slug: string
          template_id: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
          view_count: number
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          custom_data?: Json | null
          event_date?: string | null
          event_description?: string | null
          event_location?: string | null
          event_name?: string | null
          event_time?: string | null
          event_type?: string
          gallery_urls?: Json | null
          host_names?: string | null
          id?: string
          is_published?: boolean
          map_embed_url?: string | null
          music_url?: string | null
          slug: string
          template_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
          view_count?: number
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          custom_data?: Json | null
          event_date?: string | null
          event_description?: string | null
          event_location?: string | null
          event_name?: string | null
          event_time?: string | null
          event_type?: string
          gallery_urls?: Json | null
          host_names?: string | null
          id?: string
          is_published?: boolean
          map_embed_url?: string | null
          music_url?: string | null
          slug?: string
          template_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "invitations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "invitation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          invitation_id: string | null
          size_bytes: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_type: string
          file_url: string
          id?: string
          invitation_id?: string | null
          size_bytes?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          invitation_id?: string | null
          size_bytes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_files_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json | null
          transaction_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json | null
          transaction_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price: number
          weekly_quota: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
          weekly_quota?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          weekly_quota?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          plan_id: string
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          external_id: string | null
          gateway_response: Json | null
          id: string
          payment_method: string | null
          plan_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          external_id?: string | null
          gateway_response?: Json | null
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          external_id?: string | null
          gateway_response?: Json | null
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_logs: {
        Row: {
          created_at: string
          id: string
          invitation_count: number
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitation_count?: number
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          invitation_count?: number
          updated_at?: string
          user_id?: string
          week_start?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      get_invitation_owner: {
        Args: { _invitation_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      payment_status: "pending" | "success" | "failed" | "expired" | "refunded"
      rsvp_status: "pending" | "attending" | "not_attending" | "maybe"
      subscription_status: "active" | "expired" | "cancelled" | "pending"
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
      payment_status: ["pending", "success", "failed", "expired", "refunded"],
      rsvp_status: ["pending", "attending", "not_attending", "maybe"],
      subscription_status: ["active", "expired", "cancelled", "pending"],
    },
  },
} as const

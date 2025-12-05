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
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audio_history: {
        Row: {
          audio_id: string
          completed: boolean | null
          id: string
          played_at: string
          progress_seconds: number | null
          user_id: string
        }
        Insert: {
          audio_id: string
          completed?: boolean | null
          id?: string
          played_at?: string
          progress_seconds?: number | null
          user_id: string
        }
        Update: {
          audio_id?: string
          completed?: boolean | null
          id?: string
          played_at?: string
          progress_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      audios: {
        Row: {
          created_at: string
          duration: string
          field_id: string
          id: string
          is_demo: boolean
          tags: string[] | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          duration: string
          field_id: string
          id?: string
          is_demo?: boolean
          tags?: string[] | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          duration?: string
          field_id?: string
          id?: string
          is_demo?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "audios_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      background_music: {
        Row: {
          created_at: string
          file_url: string
          id: string
          is_active: boolean
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          is_active?: boolean
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          is_active?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      background_music_settings: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          volume_percentage: number
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          volume_percentage?: number
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          volume_percentage?: number
        }
        Relationships: []
      }
      favorites: {
        Row: {
          audio_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          audio_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          audio_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      fields: {
        Row: {
          audio_count: number
          created_at: string
          description: string | null
          display_order: number
          icon_name: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          audio_count?: number
          created_at?: string
          description?: string | null
          display_order?: number
          icon_name?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          audio_count?: number
          created_at?: string
          description?: string | null
          display_order?: number
          icon_name?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      guarantee_daily: {
        Row: {
          created_at: string | null
          day: string
          enrollment_id: string
          id: string
          meets_20: boolean | null
          plays_valid: number
        }
        Insert: {
          created_at?: string | null
          day: string
          enrollment_id: string
          id?: string
          meets_20?: boolean | null
          plays_valid?: number
        }
        Update: {
          created_at?: string | null
          day?: string
          enrollment_id?: string
          id?: string
          meets_20?: boolean | null
          plays_valid?: number
        }
        Relationships: [
          {
            foreignKeyName: "guarantee_daily_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "guarantee_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guarantee_daily_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "v_guarantee_status"
            referencedColumns: ["id"]
          },
        ]
      }
      guarantee_enrollments: {
        Row: {
          created_at: string | null
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          id: string
          monitoring_until: string
          purchase_id: string
          retention_until: string
          start_date: string
          status: string
          unconditional_until: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          id?: string
          monitoring_until: string
          purchase_id: string
          retention_until: string
          start_date?: string
          status?: string
          unconditional_until: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          id?: string
          monitoring_until?: string
          purchase_id?: string
          retention_until?: string
          start_date?: string
          status?: string
          unconditional_until?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      landing_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          section: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          section: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          interest_field: string | null
          name: string
          phone: string | null
          source: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interest_field?: string | null
          name: string
          phone?: string | null
          source?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interest_field?: string | null
          name?: string
          phone?: string | null
          source?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          session_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          subscription_tier: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          session_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          subscription_tier?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          session_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          subscription_tier?: string | null
        }
        Relationships: []
      }
      playlist_items: {
        Row: {
          audio_id: string
          created_at: string
          id: string
          playlist_id: string
          position: number
        }
        Insert: {
          audio_id: string
          created_at?: string
          id?: string
          playlist_id: string
          position: number
        }
        Update: {
          audio_id?: string
          created_at?: string
          id?: string
          playlist_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_audio_id_fkey"
            columns: ["audio_id"]
            isOneToOne: false
            referencedRelation: "audios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriber_access_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          success: boolean
          target_subscriber_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          success: boolean
          target_subscriber_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          success?: boolean
          target_subscriber_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status_enum"]
            | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status_enum"]
            | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status_enum"]
            | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_guarantee_status: {
        Row: {
          best_len: number | null
          computed_state: string | null
          created_at: string | null
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          id: string | null
          monitoring_until: string | null
          purchase_id: string | null
          retention_until: string | null
          start_date: string | null
          status: string | null
          unconditional_until: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      aggregate_guarantee_daily: {
        Args: { target_date?: string }
        Returns: undefined
      }
      get_current_user_role: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_subscription_active: {
        Args: {
          status: Database["public"]["Enums"]["subscription_status_enum"]
        }
        Returns: boolean
      }
      search_unified_content: {
        Args: { search_query: string }
        Returns: {
          description: string
          field_id: string
          id: string
          title: string
          type: string
        }[]
      }
      validate_subscriber_access: {
        Args: { target_email: string; target_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      subscription_status_enum:
        | "none"
        | "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "unpaid"
        | "paused"
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
      subscription_status_enum: [
        "none",
        "active",
        "trialing",
        "past_due",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "unpaid",
        "paused",
      ],
    },
  },
} as const

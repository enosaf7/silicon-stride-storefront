export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cart_items: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          size: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          size: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          size?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_admin_message: boolean | null
          is_read: boolean
          receiver_id: string
          reply_to: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_admin_message?: boolean | null
          is_read?: boolean
          receiver_id: string
          reply_to?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_admin_message?: boolean | null
          is_read?: boolean
          receiver_id?: string
          reply_to?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          size: number
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          size: number
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
          size?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_type: string | null
          gps_coordinates: string | null
          id: string
          otp_code: string | null
          payment_intent: string | null
          processed_by_admin: string | null
          region: string | null
          shipping_address: string
          shipping_fee: number | null
          status: string
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_type?: string | null
          gps_coordinates?: string | null
          id?: string
          otp_code?: string | null
          payment_intent?: string | null
          processed_by_admin?: string | null
          region?: string | null
          shipping_address: string
          shipping_fee?: number | null
          status?: string
          total: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_type?: string | null
          gps_coordinates?: string | null
          id?: string
          otp_code?: string | null
          payment_intent?: string | null
          processed_by_admin?: string | null
          region?: string | null
          shipping_address?: string
          shipping_fee?: number | null
          status?: string
          total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          colors: string[]
          created_at: string | null
          description: string
          discount: number | null
          featured: boolean | null
          id: string
          images: string[]
          name: string
          new_arrival: boolean | null
          price: number
          rating: number | null
          sizes: number[]
          stock: number
          updated_at: string | null
        }
        Insert: {
          category: string
          colors: string[]
          created_at?: string | null
          description: string
          discount?: number | null
          featured?: boolean | null
          id?: string
          images: string[]
          name: string
          new_arrival?: boolean | null
          price: number
          rating?: number | null
          sizes: number[]
          stock: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          colors?: string[]
          created_at?: string | null
          description?: string
          discount?: number | null
          featured?: boolean | null
          id?: string
          images?: string[]
          name?: string
          new_arrival?: boolean | null
          price?: number
          rating?: number | null
          sizes?: number[]
          stock?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          date: string | null
          id: string
          product_id: string
          rating: number
          user_id: string
          username: string
        }
        Insert: {
          comment: string
          date?: string | null
          id?: string
          product_id: string
          rating: number
          user_id: string
          username: string
        }
        Update: {
          comment?: string
          date?: string | null
          id?: string
          product_id?: string
          rating?: number
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_conversations: {
        Row: {
          admin_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_conversations_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      [_ in never]: never
    }
    Functions: {
      get_admin_conversations: {
        Args: Record<PropertyKey, never> | { admin_id: string }
        Returns: {
          user_id: string
          first_name: string
          last_name: string
          unread_count: number
          last_message_at: string
        }[]
      }
      get_admin_user_conversation: {
        Args: { target_user_id: string }
        Returns: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at: string
          is_read: boolean
          is_admin_message: boolean
        }[]
      }
      get_conversation_messages: {
        Args: { user1: string; user2: string }
        Returns: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at: string
          is_read: boolean
        }[]
      }
      get_user_messages: {
        Args: { user_id: string }
        Returns: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at: string
          is_read: boolean
          is_admin_message: boolean
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      mark_messages_as_read: {
        Args: { user_id: string; message_ids: string[] }
        Returns: undefined
      }
      mark_user_messages_as_read: {
        Args: { target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin"],
    },
  },
} as const

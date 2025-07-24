export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_wallet: {
        Row: {
          available_funds: number | null
          balance: number | null
          created_at: string | null
          id: string
          last_commission_date: string | null
          pending_funds: number | null
          total_cashbacks_paid: number | null
          total_commissions: number | null
          total_transactions: number | null
          updated_at: string | null
        }
        Insert: {
          available_funds?: number | null
          balance?: number | null
          created_at?: string | null
          id?: string
          last_commission_date?: string | null
          pending_funds?: number | null
          total_cashbacks_paid?: number | null
          total_commissions?: number | null
          total_transactions?: number | null
          updated_at?: string | null
        }
        Update: {
          available_funds?: number | null
          balance?: number | null
          created_at?: string | null
          id?: string
          last_commission_date?: string | null
          pending_funds?: number | null
          total_cashbacks_paid?: number | null
          total_commissions?: number | null
          total_transactions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ads: {
        Row: {
          created_at: string
          created_by: string
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean
          seller_id: string | null
          start_date: string | null
          target_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          seller_id?: string | null
          start_date?: string | null
          target_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          seller_id?: string | null
          start_date?: string | null
          target_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      cashback_history: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          order_id: string | null
          processed_at: string | null
          status: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          processed_at?: string | null
          status?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          processed_at?: string | null
          status?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cashback_history_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashback_history_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "wallet_audit_view"
            referencedColumns: ["last_transaction_id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message: string | null
          last_message_at: string | null
          unread_count_user1: number | null
          unread_count_user2: number | null
          updated_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          unread_count_user1?: number | null
          unread_count_user2?: number | null
          updated_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          unread_count_user1?: number | null
          unread_count_user2?: number | null
          updated_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string | null
          metadata: Json | null
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      commission_history: {
        Row: {
          amount: number
          commission_rate: number
          created_at: string | null
          id: string
          metadata: Json | null
          order_id: string | null
          processed_at: string | null
          seller_id: string | null
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount?: number
          commission_rate?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          processed_at?: string | null
          seller_id?: string | null
          status?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          commission_rate?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          processed_at?: string | null
          seller_id?: string | null
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_history_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_history_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "wallet_audit_view"
            referencedColumns: ["last_transaction_id"]
          },
        ]
      }
      commission_settings: {
        Row: {
          cashback_percent: number
          created_at: string
          customer_commission_percent: number
          id: string
          seller_withdrawal_fee_percent: number
          updated_at: string
        }
        Insert: {
          cashback_percent?: number
          created_at?: string
          customer_commission_percent?: number
          id?: string
          seller_withdrawal_fee_percent?: number
          updated_at?: string
        }
        Update: {
          cashback_percent?: number
          created_at?: string
          customer_commission_percent?: number
          id?: string
          seller_withdrawal_fee_percent?: number
          updated_at?: string
        }
        Relationships: []
      }
      commissions_history: {
        Row: {
          admin_gain: number
          buyer_id: string | null
          cashback: number
          commission: number
          created_at: string | null
          id: string
          order_id: string | null
          product_price: number
          seller_id: string | null
          total_paid: number
          updated_at: string | null
        }
        Insert: {
          admin_gain?: number
          buyer_id?: string | null
          cashback?: number
          commission?: number
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_price?: number
          seller_id?: string | null
          total_paid?: number
          updated_at?: string | null
        }
        Update: {
          admin_gain?: number
          buyer_id?: string | null
          cashback?: number
          commission?: number
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_price?: number
          seller_id?: string | null
          total_paid?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_history_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_history_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_with_details"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "commissions_history_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_history_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_consent: {
        Row: {
          consent_type: string
          created_at: string | null
          granted: boolean | null
          granted_at: string | null
          id: string
          ip_address: unknown | null
          user_id: string | null
          version: string | null
          withdrawn_at: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string | null
          granted?: boolean | null
          granted_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_id?: string | null
          version?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string | null
          granted?: boolean | null
          granted_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_id?: string | null
          version?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_consent_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_consent_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_queue: {
        Row: {
          assigned_to: string | null
          auto_flags: Json | null
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          notes: string | null
          priority: number | null
          reviewed_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          auto_flags?: Json | null
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          notes?: string | null
          priority?: number | null
          reviewed_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          auto_flags?: Json | null
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          notes?: string | null
          priority?: number | null
          reviewed_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          sound: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          sound?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          sound?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
          subtotal: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name: string
          product_price: number
          quantity: number
          subtotal: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          subtotal?: number
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
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_with_details"
            referencedColumns: ["order_id"]
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
          admin_commission: number | null
          buyer_id: string | null
          cashback: number | null
          commission: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          original_amount: number | null
          payment_method: string | null
          product_id: string | null
          product_price: number | null
          quantity: number
          seller_id: string | null
          service_date: string | null
          service_time: string | null
          status: string | null
          total_amount: number
          total_price: number | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          admin_commission?: number | null
          buyer_id?: string | null
          cashback?: number | null
          commission?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          original_amount?: number | null
          payment_method?: string | null
          product_id?: string | null
          product_price?: number | null
          quantity: number
          seller_id?: string | null
          service_date?: string | null
          service_time?: string | null
          status?: string | null
          total_amount: number
          total_price?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_commission?: number | null
          buyer_id?: string | null
          cashback?: number | null
          commission?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          original_amount?: number | null
          payment_method?: string | null
          product_id?: string | null
          product_price?: number | null
          quantity?: number
          seller_id?: string | null
          service_date?: string | null
          service_time?: string | null
          status?: string | null
          total_amount?: number
          total_price?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          phone: string
          role: string
          used: boolean
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          otp_code: string
          phone: string
          role: string
          used?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          phone?: string
          role?: string
          used?: boolean
        }
        Relationships: []
      }
      payment_transaction: {
        Row: {
          admin_commission: number | null
          amount: number
          category: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          metadata: Json | null
          provider: string | null
          status: string
          transaction_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_commission?: number | null
          amount: number
          category?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id: string
          metadata?: Json | null
          provider?: string | null
          status: string
          transaction_id?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_commission?: number | null
          amount?: number
          category?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          status?: string
          transaction_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          admin_commission: number | null
          amount: number
          cashback_amount: number | null
          category: string | null
          commission_amount: number | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          from_user_id: string | null
          id: string
          metadata: Json | null
          order_id: string | null
          product_id: string | null
          provider: string | null
          reference_type: string | null
          status: string
          to_user_id: string | null
          transaction_id: string | null
          type: string
          updated_at: string
          user_id: string
          user_name: string | null
          user_phone: string | null
          user_role: string | null
        }
        Insert: {
          admin_commission?: number | null
          amount: number
          cashback_amount?: number | null
          category?: string | null
          commission_amount?: number | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          from_user_id?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          product_id?: string | null
          provider?: string | null
          reference_type?: string | null
          status?: string
          to_user_id?: string | null
          transaction_id?: string | null
          type: string
          updated_at?: string
          user_id: string
          user_name?: string | null
          user_phone?: string | null
          user_role?: string | null
        }
        Update: {
          admin_commission?: number | null
          amount?: number
          cashback_amount?: number | null
          category?: string | null
          commission_amount?: number | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          from_user_id?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          product_id?: string | null
          provider?: string | null
          reference_type?: string | null
          status?: string
          to_user_id?: string | null
          transaction_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          user_name?: string | null
          user_phone?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_to_user_profile"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_to_user_profile"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          icon: string
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          is_popular: boolean | null
          name_ar: string
          name_en: string | null
          parent_id: string | null
          priority: number | null
          requires_approval: boolean | null
          service_fields: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          name_ar: string
          name_en?: string | null
          parent_id?: string | null
          priority?: number | null
          requires_approval?: boolean | null
          service_fields?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          name_ar?: string
          name_en?: string | null
          parent_id?: string | null
          priority?: number | null
          requires_approval?: boolean | null
          service_fields?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          order_index: number | null
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          order_index?: number | null
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          order_index?: number | null
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_verified_purchase: boolean
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_verified_purchase?: boolean
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_verified_purchase?: boolean
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_updates: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string | null
          notes: string | null
          price: number | null
          product_id: string
          quantity: number | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          seller_id: string
          status: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          notes?: string | null
          price?: number | null
          product_id: string
          quantity?: number | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          seller_id: string
          status?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          notes?: string | null
          price?: number | null
          product_id?: string
          quantity?: number | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          seller_id?: string
          status?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_updates_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          available_days: string[] | null
          average_rating: number | null
          category: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          discount_percent: number | null
          duration_hours: number | null
          end_time: string | null
          expire_at: string | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          is_featured: boolean | null
          is_new: boolean | null
          is_popular: boolean | null
          is_promoted: boolean | null
          is_service: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          price: number
          quantity: number | null
          review_count: number | null
          seller_id: string | null
          start_time: string | null
          status: string | null
          tags: string[] | null
          type: string | null
          updated_at: string | null
          video_url: string | null
          views_count: number | null
        }
        Insert: {
          available_days?: string[] | null
          average_rating?: number | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          duration_hours?: number | null
          end_time?: string | null
          expire_at?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          is_promoted?: boolean | null
          is_service?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          price: number
          quantity?: number | null
          review_count?: number | null
          seller_id?: string | null
          start_time?: string | null
          status?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          video_url?: string | null
          views_count?: number | null
        }
        Update: {
          available_days?: string[] | null
          average_rating?: number | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          duration_hours?: number | null
          end_time?: string | null
          expire_at?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          is_promoted?: boolean | null
          is_service?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          price?: number
          quantity?: number | null
          review_count?: number | null
          seller_id?: string | null
          start_time?: string | null
          status?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          video_url?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string | null
          id: string
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          id: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          promotion_id: string
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          promotion_id: string
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          promotion_id?: string
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          applicable_categories: string[] | null
          created_at: string
          created_by: string
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean
          max_discount_amount: number | null
          min_purchase_amount: number | null
          start_date: string
          title: string
          updated_at: string
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          applicable_categories?: string[] | null
          created_at?: string
          created_by: string
          description?: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          start_date: string
          title: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          applicable_categories?: string[] | null
          created_at?: string
          created_by?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          start_date?: string
          title?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          blocked_until: string | null
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
          requests_count: number | null
          window_start: string | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
          requests_count?: number | null
          window_start?: string | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
          requests_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string | null
          id: string
          query: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          query: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          query?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_audit_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_audit_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_locations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          seller_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          seller_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          seller_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_zones: {
        Row: {
          city: string
          created_at: string | null
          district: string | null
          id: string
          is_active: boolean | null
          product_id: string | null
          radius_km: number | null
          seller_id: string | null
          travel_fee: number | null
          updated_at: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          district?: string | null
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          radius_km?: number | null
          seller_id?: string | null
          travel_fee?: number | null
          updated_at?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          district?: string | null
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          radius_km?: number | null
          seller_id?: string | null
          travel_fee?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_zones_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_zones_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_zones_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          refresh_token: string | null
          session_token: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          refresh_token?: string | null
          session_token: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          refresh_token?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          push_notifications: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          push_notifications?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          push_notifications?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallet: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          last_transaction_id: string | null
          updated_at: string | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id: string
          last_transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          last_transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          last_transaction_id: string | null
          total_cashback: number | null
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          last_transaction_id?: string | null
          total_cashback?: number | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          last_transaction_id?: string | null
          total_cashback?: number | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_last_transaction_id_fkey"
            columns: ["last_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallets_last_transaction_id_fkey"
            columns: ["last_transaction_id"]
            isOneToOne: false
            referencedRelation: "wallet_audit_view"
            referencedColumns: ["last_transaction_id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          amount: number
          bank_details: Json | null
          created_at: string
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_details?: Json | null
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_details?: Json | null
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      orders_with_details: {
        Row: {
          buyer_email: string | null
          buyer_id: string | null
          created_at: string | null
          order_id: string | null
          payment_method: string | null
          product_name: string | null
          product_original_name: string | null
          product_price: number | null
          quantity: number | null
          seller_email: string | null
          seller_id: string | null
          status: string | null
          subtotal: number | null
          total_amount: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers_with_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers_with_locations: {
        Row: {
          address: string | null
          city: string | null
          id: string | null
          latitude: number | null
          longitude: number | null
          name: string | null
        }
        Relationships: []
      }
      wallet_audit_view: {
        Row: {
          balance: number | null
          last_transaction_amount: number | null
          last_transaction_date: string | null
          last_transaction_id: string | null
          last_transaction_type: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
          user_name: string | null
          version: number | null
          wallet_created: string | null
          wallet_id: string | null
          wallet_updated: string | null
        }
        Relationships: []
      }
      wallets_overview: {
        Row: {
          balance: number | null
          last_transaction_amount: number | null
          last_transaction_date: string | null
          last_transaction_id: string | null
          last_transaction_type: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          total_cashback: number | null
          total_earned: number | null
          total_spent: number | null
          user_id: string | null
          user_name: string | null
          version: number | null
          wallet_created: string | null
          wallet_id: string | null
          wallet_updated: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_last_transaction_id_fkey"
            columns: ["last_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallets_last_transaction_id_fkey"
            columns: ["last_transaction_id"]
            isOneToOne: false
            referencedRelation: "wallet_audit_view"
            referencedColumns: ["last_transaction_id"]
          },
        ]
      }
    }
    Functions: {
      calculate_order_financials: {
        Args: { cart_total: number }
        Returns: {
          subtotal: number
          admin_commission: number
          client_cashback: number
          total_amount: number
          commission_rate: number
          cashback_rate: number
        }[]
      }
      calculate_order_totals: {
        Args: {
          product_price: number
          quantity: number
          payment_method?: string
        }
        Returns: {
          subtotal: number
          commission: number
          cashback: number
          total_amount: number
        }[]
      }
      calculate_order_with_commission: {
        Args:
          | Record<PropertyKey, never>
          | {
              base_price: number
              commission_rate?: number
              cashback_rate?: number
            }
        Returns: {
          product_price: number
          commission: number
          total_price: number
          cashback: number
          admin_gain: number
        }[]
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_endpoint: string
          p_limit?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      confirm_order_and_transfer_funds: {
        Args: { p_order_id: string }
        Returns: Json
      }
      confirm_order_delivery: {
        Args: { p_order_id: string; p_buyer_id: string }
        Returns: Json
      }
      execute_sql: {
        Args: { sql: string }
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_financial_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_user_wallets: number
          total_admin_funds: number
          total_pending_funds: number
          total_transactions_count: number
          total_commissions: number
          total_cashbacks: number
          daily_transactions: Json
          monthly_revenue: Json
          admin_wallet_balance: number
          total_sellers_balance: number
          total_clients_balance: number
        }[]
      }
      get_nearby_products: {
        Args: { user_lat?: number; user_lng?: number; radius_km?: number }
        Returns: {
          id: string
          name: string
          description: string
          price: number
          image_url: string
          seller_city: string
          distance_km: number
        }[]
      }
      get_wallet_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_users_with_wallets: number
          total_balance: number
          total_transactions: number
          avg_balance: number
          total_admin_recharges: number
          total_telr_recharges: number
        }[]
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_action: string
          p_resource_type?: string
          p_resource_id?: string
          p_details?: Json
          p_severity?: string
        }
        Returns: undefined
      }
      process_admin_commission: {
        Args:
          | Record<PropertyKey, never>
          | { p_order_id: string; p_commission_amount: number }
        Returns: undefined
      }
      process_purchase_payment: {
        Args: {
          p_order_id: string
          p_buyer_id: string
          p_seller_id: string
          p_product_id: string
          p_quantity: number
          p_product_price: number
          p_payment_method?: string
        }
        Returns: Json
      }
      update_order_status: {
        Args: { p_order_id: string; p_new_status: string; p_user_id: string }
        Returns: Json
      }
      update_wallet_balance: {
        Args:
          | {
              p_user_id: string
              p_amount: number
              p_transaction_type: string
              p_description_ar?: string
              p_description_en?: string
              p_metadata?: Json
              p_reference_id?: string
            }
          | { user_id: number; amount: number }
          | { user_id: string; amount: number }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "seller" | "client" | "banned"
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
      app_role: ["admin", "seller", "client", "banned"],
    },
  },
} as const

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          role: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          role?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          role?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          sku: string | null;
          category_id: string | null;
          price_usd: number;
          price_syp: number;
          cost_usd: number;
          cost_syp: number;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sku?: string | null;
          category_id?: string | null;
          price_usd?: number;
          price_syp?: number;
          cost_usd?: number;
          cost_syp?: number;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sku?: string | null;
          category_id?: string | null;
          price_usd?: number;
          price_syp?: number;
          cost_usd?: number;
          cost_syp?: number;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          contact_info: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_info?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_info?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      purchase_orders: {
        Row: {
          id: string;
          supplier_id: string | null;
          order_date: string;
          total_usd: number;
          total_syp: number;
          status: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          supplier_id?: string | null;
          order_date?: string;
          total_usd?: number;
          total_syp?: number;
          status?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string | null;
          order_date?: string;
          total_usd?: number;
          total_syp?: number;
          status?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey";
            columns: ["supplier_id"];
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      purchase_order_items: {
        Row: {
          id: string;
          po_id: string;
          product_id: string | null;
          quantity: number;
          unit_price_usd: number;
          unit_price_syp: number;
          line_total_usd: number;
          line_total_syp: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          po_id: string;
          product_id?: string | null;
          quantity: number;
          unit_price_usd?: number;
          unit_price_syp?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          po_id?: string;
          product_id?: string | null;
          quantity?: number;
          unit_price_usd?: number;
          unit_price_syp?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      sales_orders: {
        Row: {
          id: string;
          order_date: string;
          total_usd: number;
          total_syp: number;
          payment_method: string;
          status: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_date?: string;
          total_usd?: number;
          total_syp?: number;
          payment_method?: string;
          status?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_date?: string;
          total_usd?: number;
          total_syp?: number;
          payment_method?: string;
          status?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sales_orders_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      sales_order_items: {
        Row: {
          id: string;
          so_id: string;
          product_id: string | null;
          quantity: number;
          unit_price_usd: number;
          unit_price_syp: number;
          line_total_usd: number;
          line_total_syp: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          so_id: string;
          product_id?: string | null;
          quantity: number;
          unit_price_usd?: number;
          unit_price_syp?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          so_id?: string;
          product_id?: string | null;
          quantity?: number;
          unit_price_usd?: number;
          unit_price_syp?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      returns: {
        Row: {
          id: string;
          so_id: string;
          product_id: string;
          quantity: number;
          unit_price_usd: number;
          unit_price_syp: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          so_id: string;
          product_id: string;
          quantity: number;
          unit_price_usd: number;
          unit_price_syp: number;
          reason: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          so_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price_usd?: number;
          unit_price_syp?: number;
          reason?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "returns_so_id_fkey";
            columns: ["so_id"];
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "returns_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      purchase_needs: {
        Row: {
          id: string;
          name: string;
          quantity: number;
          notes: string | null;
          status: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          quantity?: number;
          notes?: string | null;
          status?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          quantity?: number;
          notes?: string | null;
          status?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      purchase_returns: {
        Row: {
          id: string;
          product_id: string | null;
          po_id: string | null;
          quantity: number;
          unit_price_usd: number;
          unit_price_syp: number;
          reason: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          po_id?: string | null;
          quantity: number;
          unit_price_usd?: number;
          unit_price_syp?: number;
          reason?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          po_id?: string | null;
          quantity?: number;
          unit_price_usd?: number;
          unit_price_syp?: number;
          reason?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_returns_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_returns_po_id_fkey";
            columns: ["po_id"];
            referencedRelation: "purchase_orders";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      complete_sale: {
        Args: {
          p_total_usd: number;
          p_total_syp: number;
          p_items: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

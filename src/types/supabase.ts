export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      business_profiles: {
        Row: {
          address: string | null;
          business_name: string;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string | null;
          default_terms: string | null;
          id: string;
          logo_url: string | null;
          tax_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          address?: string | null;
          business_name: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string | null;
          default_terms?: string | null;
          id?: string;
          logo_url?: string | null;
          tax_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          address?: string | null;
          business_name?: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string | null;
          default_terms?: string | null;
          id?: string;
          logo_url?: string | null;
          tax_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          address: string | null;
          company: string | null;
          created_at: string | null;
          deleted_at: string | null;
          email: string;
          id: string;
          name: string;
          notes: string | null;
          phone: string | null;
          tax_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          address?: string | null;
          company?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email: string;
          id?: string;
          name: string;
          notes?: string | null;
          phone?: string | null;
          tax_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          address?: string | null;
          company?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          tax_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      invoice_events: {
        Row: {
          created_at: string | null;
          event_type: Database['public']['Enums']['invoice_event_type'];
          id: string;
          invoice_id: string;
          metadata: Json | null;
        };
        Insert: {
          created_at?: string | null;
          event_type: Database['public']['Enums']['invoice_event_type'];
          id?: string;
          invoice_id: string;
          metadata?: Json | null;
        };
        Update: {
          created_at?: string | null;
          event_type?: Database['public']['Enums']['invoice_event_type'];
          id?: string;
          invoice_id?: string;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'invoice_events_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
        ];
      };
      invoice_items: {
        Row: {
          description: string;
          id: string;
          invoice_id: string;
          quantity: number;
          sort_order: number | null;
          subtotal: number;
          unit_price: number;
        };
        Insert: {
          description: string;
          id?: string;
          invoice_id: string;
          quantity: number;
          sort_order?: number | null;
          subtotal: number;
          unit_price: number;
        };
        Update: {
          description?: string;
          id?: string;
          invoice_id?: string;
          quantity?: number;
          sort_order?: number | null;
          subtotal?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'invoice_items_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
        ];
      };
      invoices: {
        Row: {
          client_id: string;
          created_at: string | null;
          currency: string | null;
          deleted_at: string | null;
          discount_type: Database['public']['Enums']['discount_type'] | null;
          discount_value: number | null;
          due_date: string;
          id: string;
          invoice_number: string;
          issue_date: string;
          notes: string | null;
          paid_at: string | null;
          reminder_count: number | null;
          sent_at: string | null;
          status: Database['public']['Enums']['invoice_status'] | null;
          subtotal: number | null;
          tax_amount: number | null;
          tax_rate: number | null;
          terms: string | null;
          total: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          client_id: string;
          created_at?: string | null;
          currency?: string | null;
          deleted_at?: string | null;
          discount_type?: Database['public']['Enums']['discount_type'] | null;
          discount_value?: number | null;
          due_date: string;
          id?: string;
          invoice_number: string;
          issue_date?: string;
          notes?: string | null;
          paid_at?: string | null;
          reminder_count?: number | null;
          sent_at?: string | null;
          status?: Database['public']['Enums']['invoice_status'] | null;
          subtotal?: number | null;
          tax_amount?: number | null;
          tax_rate?: number | null;
          terms?: string | null;
          total?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          client_id?: string;
          created_at?: string | null;
          currency?: string | null;
          deleted_at?: string | null;
          discount_type?: Database['public']['Enums']['discount_type'] | null;
          discount_value?: number | null;
          due_date?: string;
          id?: string;
          invoice_number?: string;
          issue_date?: string;
          notes?: string | null;
          paid_at?: string | null;
          reminder_count?: number | null;
          sent_at?: string | null;
          status?: Database['public']['Enums']['invoice_status'] | null;
          subtotal?: number | null;
          tax_amount?: number | null;
          tax_rate?: number | null;
          terms?: string | null;
          total?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invoices_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
        ];
      };
      payment_methods: {
        Row: {
          created_at: string | null;
          id: string;
          is_default: boolean | null;
          label: string;
          sort_order: number | null;
          type: Database['public']['Enums']['payment_method_type'];
          user_id: string;
          value: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_default?: boolean | null;
          label: string;
          sort_order?: number | null;
          type: Database['public']['Enums']['payment_method_type'];
          user_id: string;
          value: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_default?: boolean | null;
          label?: string;
          sort_order?: number | null;
          type?: Database['public']['Enums']['payment_method_type'];
          user_id?: string;
          value?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount_received: number;
          created_at: string | null;
          deleted_at: string | null;
          id: string;
          invoice_id: string;
          notes: string | null;
          payment_date: string;
          payment_method: string;
          reference: string | null;
        };
        Insert: {
          amount_received: number;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          invoice_id: string;
          notes?: string | null;
          payment_date?: string;
          payment_method: string;
          reference?: string | null;
        };
        Update: {
          amount_received?: number;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          invoice_id?: string;
          notes?: string | null;
          payment_date?: string;
          payment_method?: string;
          reference?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string | null;
          email_verified_at: string | null;
          id: string;
          last_login_at: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          email_verified_at?: string | null;
          id?: string;
          last_login_at?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          email_verified_at?: string | null;
          id?: string;
          last_login_at?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      reminder_settings: {
        Row: {
          created_at: string | null;
          custom_message: string | null;
          custom_subject: string | null;
          enabled: boolean | null;
          frequency_days: number | null;
          id: string;
          max_reminders: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          custom_message?: string | null;
          custom_subject?: string | null;
          enabled?: boolean | null;
          frequency_days?: number | null;
          id?: string;
          max_reminders?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          custom_message?: string | null;
          custom_subject?: string | null;
          enabled?: boolean | null;
          frequency_days?: number | null;
          id?: string;
          max_reminders?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      subscription: {
        Row: {
          cancel_at_period_end: boolean | null;
          created_at: string | null;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          plan: Database['public']['Enums']['subscription_plan'] | null;
          status: Database['public']['Enums']['subscription_status'] | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan?: Database['public']['Enums']['subscription_plan'] | null;
          status?: Database['public']['Enums']['subscription_status'] | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan?: Database['public']['Enums']['subscription_plan'] | null;
          status?: Database['public']['Enums']['subscription_status'] | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      discount_type: 'percentage' | 'fixed';
      invoice_event_type:
        | 'created'
        | 'updated'
        | 'sent'
        | 'reminder_sent'
        | 'viewed'
        | 'paid'
        | 'cancelled';
      invoice_status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
      payment_method_type: 'bank_transfer' | 'paypal' | 'mercado_pago' | 'cash' | 'other';
      subscription_plan: 'free' | 'pro';
      subscription_status: 'active' | 'canceled' | 'past_due' | 'incomplete';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      discount_type: ['percentage', 'fixed'],
      invoice_event_type: [
        'created',
        'updated',
        'sent',
        'reminder_sent',
        'viewed',
        'paid',
        'cancelled',
      ],
      invoice_status: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      payment_method_type: ['bank_transfer', 'paypal', 'mercado_pago', 'cash', 'other'],
      subscription_plan: ['free', 'pro'],
      subscription_status: ['active', 'canceled', 'past_due', 'incomplete'],
    },
  },
} as const;

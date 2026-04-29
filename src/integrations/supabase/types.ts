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
      activity_log: {
        Row: {
          action: string
          bug_id: string
          created_at: string
          id: string
          new_value: string | null
          old_value: string | null
          user_id: string
        }
        Insert: {
          action: string
          bug_id: string
          created_at?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id: string
        }
        Update: {
          action?: string
          bug_id?: string
          created_at?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_bug_id_fkey"
            columns: ["bug_id"]
            isOneToOne: false
            referencedRelation: "bugs"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          bug_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          user_id: string
        }
        Insert: {
          bug_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          user_id: string
        }
        Update: {
          bug_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_bug_id_fkey"
            columns: ["bug_id"]
            isOneToOne: false
            referencedRelation: "bugs"
            referencedColumns: ["id"]
          },
        ]
      }
      bansos_blockchain: {
        Row: {
          block_index: number
          created_at: string
          data: Json
          distribution_id: string | null
          hash: string
          id: string
          previous_hash: string
        }
        Insert: {
          block_index?: number
          created_at?: string
          data: Json
          distribution_id?: string | null
          hash: string
          id?: string
          previous_hash: string
        }
        Update: {
          block_index?: number
          created_at?: string
          data?: Json
          distribution_id?: string | null
          hash?: string
          id?: string
          previous_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "bansos_blockchain_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "bansos_distributions"
            referencedColumns: ["id"]
          },
        ]
      }
      bansos_distributions: {
        Row: {
          amount: number
          created_at: string
          distributed_at: string | null
          id: string
          location: string | null
          notes: string | null
          officer_id: string | null
          program_id: string
          recipient_id: string
          status: Database["public"]["Enums"]["bansos_distribution_status"]
          tracking_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          distributed_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          officer_id?: string | null
          program_id: string
          recipient_id: string
          status?: Database["public"]["Enums"]["bansos_distribution_status"]
          tracking_id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          distributed_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          officer_id?: string | null
          program_id?: string
          recipient_id?: string
          status?: Database["public"]["Enums"]["bansos_distribution_status"]
          tracking_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bansos_distributions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "bansos_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bansos_distributions_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "bansos_recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      bansos_merchants: {
        Row: {
          address: string | null
          category: string
          created_at: string
          id: string
          is_verified: boolean
          name: string
          owner_user_id: string | null
          phone: string | null
          updated_at: string
          wallet_id: string | null
        }
        Insert: {
          address?: string | null
          category?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          name: string
          owner_user_id?: string | null
          phone?: string | null
          updated_at?: string
          wallet_id?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          name?: string
          owner_user_id?: string | null
          phone?: string | null
          updated_at?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bansos_merchants_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "bansos_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      bansos_programs: {
        Row: {
          amount_per_distribution: number
          budget_total: number
          category: Database["public"]["Enums"]["bansos_category"]
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string | null
          treasury_wallet_id: string | null
          updated_at: string
        }
        Insert: {
          amount_per_distribution?: number
          budget_total?: number
          category?: Database["public"]["Enums"]["bansos_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string | null
          treasury_wallet_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_per_distribution?: number
          budget_total?: number
          category?: Database["public"]["Enums"]["bansos_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string | null
          treasury_wallet_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bansos_programs_treasury_wallet_id_fkey"
            columns: ["treasury_wallet_id"]
            isOneToOne: false
            referencedRelation: "bansos_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      bansos_recipients: {
        Row: {
          address: string | null
          category: Database["public"]["Enums"]["bansos_category"]
          city: string | null
          created_at: string
          created_by: string | null
          full_name: string
          id: string
          nik: string
          notes: string | null
          phone: string | null
          province: string | null
          qr_token: string
          updated_at: string
          user_id: string | null
          verification_status: Database["public"]["Enums"]["bansos_verification_status"]
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address?: string | null
          category?: Database["public"]["Enums"]["bansos_category"]
          city?: string | null
          created_at?: string
          created_by?: string | null
          full_name: string
          id?: string
          nik: string
          notes?: string | null
          phone?: string | null
          province?: string | null
          qr_token?: string
          updated_at?: string
          user_id?: string | null
          verification_status?: Database["public"]["Enums"]["bansos_verification_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string | null
          category?: Database["public"]["Enums"]["bansos_category"]
          city?: string | null
          created_at?: string
          created_by?: string | null
          full_name?: string
          id?: string
          nik?: string
          notes?: string | null
          phone?: string | null
          province?: string | null
          qr_token?: string
          updated_at?: string
          user_id?: string | null
          verification_status?: Database["public"]["Enums"]["bansos_verification_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      bansos_user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["bansos_role"]
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["bansos_role"]
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["bansos_role"]
          user_id?: string
        }
        Relationships: []
      }
      bansos_wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          distribution_id: string | null
          from_wallet_id: string | null
          id: string
          merchant_id: string | null
          metadata: Json | null
          status: Database["public"]["Enums"]["bansos_tx_status"]
          to_wallet_id: string | null
          tx_hash: string
          tx_type: Database["public"]["Enums"]["bansos_tx_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          distribution_id?: string | null
          from_wallet_id?: string | null
          id?: string
          merchant_id?: string | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["bansos_tx_status"]
          to_wallet_id?: string | null
          tx_hash?: string
          tx_type: Database["public"]["Enums"]["bansos_tx_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          distribution_id?: string | null
          from_wallet_id?: string | null
          id?: string
          merchant_id?: string | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["bansos_tx_status"]
          to_wallet_id?: string | null
          tx_hash?: string
          tx_type?: Database["public"]["Enums"]["bansos_tx_type"]
        }
        Relationships: [
          {
            foreignKeyName: "bansos_wallet_transactions_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "bansos_distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bansos_wallet_transactions_from_wallet_id_fkey"
            columns: ["from_wallet_id"]
            isOneToOne: false
            referencedRelation: "bansos_wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bansos_wallet_transactions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "bansos_merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bansos_wallet_transactions_to_wallet_id_fkey"
            columns: ["to_wallet_id"]
            isOneToOne: false
            referencedRelation: "bansos_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      bansos_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          is_active: boolean
          label: string
          owner_program_id: string | null
          owner_recipient_id: string | null
          owner_user_id: string | null
          phantom_address: string | null
          phantom_linked_at: string | null
          updated_at: string
          wallet_address: string
          wallet_type: Database["public"]["Enums"]["bansos_wallet_type"]
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          owner_program_id?: string | null
          owner_recipient_id?: string | null
          owner_user_id?: string | null
          phantom_address?: string | null
          phantom_linked_at?: string | null
          updated_at?: string
          wallet_address?: string
          wallet_type: Database["public"]["Enums"]["bansos_wallet_type"]
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          owner_program_id?: string | null
          owner_recipient_id?: string | null
          owner_user_id?: string | null
          phantom_address?: string | null
          phantom_linked_at?: string | null
          updated_at?: string
          wallet_address?: string
          wallet_type?: Database["public"]["Enums"]["bansos_wallet_type"]
        }
        Relationships: [
          {
            foreignKeyName: "bansos_wallets_owner_program_id_fkey"
            columns: ["owner_program_id"]
            isOneToOne: false
            referencedRelation: "bansos_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bansos_wallets_owner_recipient_id_fkey"
            columns: ["owner_recipient_id"]
            isOneToOne: false
            referencedRelation: "bansos_recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      bugs: {
        Row: {
          actual_behavior: string | null
          assignee_id: string | null
          created_at: string
          description: string
          environment: string | null
          expected_behavior: string | null
          id: string
          project_id: string | null
          reporter_id: string
          severity: Database["public"]["Enums"]["bug_severity"]
          sla_deadline: string | null
          status: Database["public"]["Enums"]["bug_status"]
          steps_to_reproduce: string | null
          title: string
          tracking_id: string
          updated_at: string
        }
        Insert: {
          actual_behavior?: string | null
          assignee_id?: string | null
          created_at?: string
          description?: string
          environment?: string | null
          expected_behavior?: string | null
          id?: string
          project_id?: string | null
          reporter_id: string
          severity?: Database["public"]["Enums"]["bug_severity"]
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["bug_status"]
          steps_to_reproduce?: string | null
          title: string
          tracking_id?: string
          updated_at?: string
        }
        Update: {
          actual_behavior?: string | null
          assignee_id?: string | null
          created_at?: string
          description?: string
          environment?: string | null
          expected_behavior?: string | null
          id?: string
          project_id?: string | null
          reporter_id?: string
          severity?: Database["public"]["Enums"]["bug_severity"]
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["bug_status"]
          steps_to_reproduce?: string | null
          title?: string
          tracking_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bugs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          bug_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bug_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bug_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_bug_id_fkey"
            columns: ["bug_id"]
            isOneToOne: false
            referencedRelation: "bugs"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          address: string | null
          company_logo_url: string | null
          company_name: string
          company_size: string | null
          company_website: string | null
          created_at: string
          id: string
          industry: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company_logo_url?: string | null
          company_name?: string
          company_size?: string | null
          company_website?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company_logo_url?: string | null
          company_name?: string
          company_size?: string | null
          company_website?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          daily_digest: boolean
          email_on_assignment: boolean
          email_on_comment: boolean
          email_on_new_bug: boolean
          email_on_sla_breach: boolean
          email_on_status_change: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_digest?: boolean
          email_on_assignment?: boolean
          email_on_comment?: boolean
          email_on_new_bug?: boolean
          email_on_sla_breach?: boolean
          email_on_status_change?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_digest?: boolean
          email_on_assignment?: boolean
          email_on_comment?: boolean
          email_on_new_bug?: boolean
          email_on_sla_breach?: boolean
          email_on_status_change?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          job_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          job_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          job_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
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
      bansos_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["bansos_role"]
          _user_id: string
        }
        Returns: boolean
      }
      bansos_is_staff: { Args: { _user_id: string }; Returns: boolean }
      bansos_link_phantom: {
        Args: { _phantom_address: string }
        Returns: {
          balance: number
          created_at: string
          id: string
          is_active: boolean
          label: string
          owner_program_id: string | null
          owner_recipient_id: string | null
          owner_user_id: string | null
          phantom_address: string | null
          phantom_linked_at: string | null
          updated_at: string
          wallet_address: string
          wallet_type: Database["public"]["Enums"]["bansos_wallet_type"]
        }
        SetofOptions: {
          from: "*"
          to: "bansos_wallets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      bansos_merchant_purchase: {
        Args: { _amount: number; _description?: string; _merchant_id: string }
        Returns: string
      }
      bansos_public_track: {
        Args: { _query: string }
        Returns: {
          amount: number
          block_hash: string
          block_index: number
          category: string
          created_at: string
          distributed_at: string
          location: string
          program_name: string
          recipient_name: string
          status: string
          tracking_id: string
        }[]
      }
      bansos_stats: {
        Args: never
        Returns: {
          active_programs: number
          total_amount: number
          total_blocks: number
          total_distributions: number
          total_recipients: number
          verified_recipients: number
        }[]
      }
      bansos_treasury_topup: {
        Args: { _amount: number; _description?: string; _program_id: string }
        Returns: string
      }
      bansos_unlink_phantom: {
        Args: never
        Returns: {
          balance: number
          created_at: string
          id: string
          is_active: boolean
          label: string
          owner_program_id: string | null
          owner_recipient_id: string | null
          owner_user_id: string | null
          phantom_address: string | null
          phantom_linked_at: string | null
          updated_at: string
          wallet_address: string
          wallet_type: Database["public"]["Enums"]["bansos_wallet_type"]
        }
        SetofOptions: {
          from: "*"
          to: "bansos_wallets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      bansos_verify_chain: {
        Args: never
        Returns: {
          first_invalid_index: number
          total_blocks: number
          valid: boolean
        }[]
      }
      get_team_members: {
        Args: never
        Returns: {
          avatar_url: string
          full_name: string
          job_title: string
          role: string
          user_id: string
        }[]
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
      app_role: "admin" | "moderator" | "user"
      bansos_category: "PKH" | "BPNT" | "BLT" | "PIP" | "BST" | "Lainnya"
      bansos_distribution_status:
        | "scheduled"
        | "distributed"
        | "received"
        | "failed"
      bansos_role:
        | "admin_pemerintah"
        | "petugas_lapangan"
        | "penerima"
        | "merchant"
      bansos_tx_status: "pending" | "completed" | "failed"
      bansos_tx_type:
        | "topup"
        | "disbursement"
        | "purchase"
        | "transfer"
        | "withdraw"
        | "allocation"
      bansos_verification_status: "pending" | "verified" | "rejected"
      bansos_wallet_type: "recipient" | "merchant" | "treasury"
      bug_severity: "critical" | "high" | "medium" | "low"
      bug_status:
        | "new"
        | "assigned"
        | "in_progress"
        | "testing"
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
      app_role: ["admin", "moderator", "user"],
      bansos_category: ["PKH", "BPNT", "BLT", "PIP", "BST", "Lainnya"],
      bansos_distribution_status: [
        "scheduled",
        "distributed",
        "received",
        "failed",
      ],
      bansos_role: [
        "admin_pemerintah",
        "petugas_lapangan",
        "penerima",
        "merchant",
      ],
      bansos_tx_status: ["pending", "completed", "failed"],
      bansos_tx_type: [
        "topup",
        "disbursement",
        "purchase",
        "transfer",
        "withdraw",
        "allocation",
      ],
      bansos_verification_status: ["pending", "verified", "rejected"],
      bansos_wallet_type: ["recipient", "merchant", "treasury"],
      bug_severity: ["critical", "high", "medium", "low"],
      bug_status: [
        "new",
        "assigned",
        "in_progress",
        "testing",
        "resolved",
        "closed",
      ],
    },
  },
} as const

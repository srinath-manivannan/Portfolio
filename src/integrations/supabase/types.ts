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
      achievements: {
        Row: {
          created_at: string | null
          date: string
          description: string
          display_order: number | null
          icon: string | null
          id: string
          image_url: string | null
          institution: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description: string
          display_order?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          institution?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          institution?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          created_at: string
          default_model: string
          gemini_api_key: string | null
          id: string
          max_tokens: number | null
          ollama_base_url: string | null
          openai_api_key: string | null
          preferred_provider: string
          temperature: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_model?: string
          gemini_api_key?: string | null
          id?: string
          max_tokens?: number | null
          ollama_base_url?: string | null
          openai_api_key?: string | null
          preferred_provider?: string
          temperature?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_model?: string
          gemini_api_key?: string | null
          id?: string
          max_tokens?: number | null
          ollama_base_url?: string | null
          openai_api_key?: string | null
          preferred_provider?: string
          temperature?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          completion_tokens: number | null
          content_id: string | null
          content_type: string | null
          created_at: string
          estimated_cost: number | null
          id: string
          model: string
          operation: string
          prompt_tokens: number | null
          provider: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          completion_tokens?: number | null
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          model: string
          operation: string
          prompt_tokens?: number | null
          provider: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          completion_tokens?: number | null
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          model?: string
          operation?: string
          prompt_tokens?: number | null
          provider?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          page_url: string | null
          user_agent: string | null
          user_ip: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          user_agent?: string | null
          user_ip?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          user_agent?: string | null
          user_ip?: string | null
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          execution_time_ms: number | null
          id: string
          payload: Json | null
          response: Json | null
          status: string
          webhook_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          execution_time_ms?: number | null
          id?: string
          payload?: Json | null
          response?: Json | null
          status: string
          webhook_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          execution_time_ms?: number | null
          id?: string
          payload?: Json | null
          response?: Json | null
          status?: string
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "n8n_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published: boolean | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string | null
          credential_url: string | null
          display_order: number | null
          id: string
          image: string | null
          issue_date: string | null
          issuer: string
          pdf_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credential_url?: string | null
          display_order?: number | null
          id?: string
          image?: string | null
          issue_date?: string | null
          issuer: string
          pdf_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credential_url?: string | null
          display_order?: number | null
          id?: string
          image?: string | null
          issue_date?: string | null
          issuer?: string
          pdf_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          category: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          ai_model: string
          ai_provider: string
          content_id: string | null
          content_type: string
          created_at: string
          enhanced_content: string
          enhancement_type: string
          id: string
          original_content: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          ai_model: string
          ai_provider: string
          content_id?: string | null
          content_type: string
          created_at?: string
          enhanced_content: string
          enhancement_type: string
          id?: string
          original_content: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          ai_model?: string
          ai_provider?: string
          content_id?: string | null
          content_type?: string
          created_at?: string
          enhanced_content?: string
          enhancement_type?: string
          id?: string
          original_content?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      document_access_logs: {
        Row: {
          accessed_at: string | null
          accessed_by: string | null
          document_id: string
          id: string
          ip_address: string | null
        }
        Insert: {
          accessed_at?: string | null
          accessed_by?: string | null
          document_id: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          accessed_at?: string | null
          accessed_by?: string | null
          document_id?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string | null
          document_number: string | null
          expiry_date: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_encrypted: boolean | null
          issue_date: string | null
          issuing_authority: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          document_number?: string | null
          expiry_date?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_encrypted?: boolean | null
          issue_date?: string | null
          issuing_authority?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          document_number?: string | null
          expiry_date?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_encrypted?: boolean | null
          issue_date?: string | null
          issuing_authority?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          achievements: string[] | null
          cgpa: string | null
          created_at: string | null
          degree: string
          display_order: number | null
          duration: string
          grade: string | null
          id: string
          institution: string
          university: string | null
          updated_at: string | null
        }
        Insert: {
          achievements?: string[] | null
          cgpa?: string | null
          created_at?: string | null
          degree: string
          display_order?: number | null
          duration: string
          grade?: string | null
          id?: string
          institution: string
          university?: string | null
          updated_at?: string | null
        }
        Update: {
          achievements?: string[] | null
          cgpa?: string | null
          created_at?: string | null
          degree?: string
          display_order?: number | null
          duration?: string
          grade?: string | null
          id?: string
          institution?: string
          university?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      experiences: {
        Row: {
          appreciation_urls: string[] | null
          certificate_urls: string[] | null
          company: string
          company_logo: string | null
          created_at: string | null
          description: string[] | null
          display_order: number | null
          duration: string
          id: string
          location: string | null
          role: string
          technologies: string[] | null
          updated_at: string | null
          work_type: string | null
        }
        Insert: {
          appreciation_urls?: string[] | null
          certificate_urls?: string[] | null
          company: string
          company_logo?: string | null
          created_at?: string | null
          description?: string[] | null
          display_order?: number | null
          duration: string
          id?: string
          location?: string | null
          role: string
          technologies?: string[] | null
          updated_at?: string | null
          work_type?: string | null
        }
        Update: {
          appreciation_urls?: string[] | null
          certificate_urls?: string[] | null
          company?: string
          company_logo?: string | null
          created_at?: string | null
          description?: string[] | null
          display_order?: number | null
          duration?: string
          id?: string
          location?: string | null
          role?: string
          technologies?: string[] | null
          updated_at?: string | null
          work_type?: string | null
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          category: string
          created_at: string | null
          date: string | null
          description: string | null
          external_link: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string | null
          order_index: number | null
          source: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          date?: string | null
          description?: string | null
          external_link?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          order_index?: number | null
          source?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          date?: string | null
          description?: string | null
          external_link?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          order_index?: number | null
          source?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      n8n_webhooks: {
        Row: {
          created_at: string
          description: string | null
          event_type: string
          id: string
          is_active: boolean
          last_triggered_at: string | null
          name: string
          trigger_count: number
          updated_at: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name: string
          trigger_count?: number
          updated_at?: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          trigger_count?: number
          updated_at?: string
          webhook_url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability_status: boolean | null
          bio: string
          created_at: string | null
          current_theme: string | null
          email: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          name: string
          phone: string | null
          profile_image: string | null
          resume_url: string | null
          tagline: string
          title: string
          twitter_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability_status?: boolean | null
          bio?: string
          created_at?: string | null
          current_theme?: string | null
          email?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          profile_image?: string | null
          resume_url?: string | null
          tagline?: string
          title?: string
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability_status?: boolean | null
          bio?: string
          created_at?: string | null
          current_theme?: string | null
          email?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          profile_image?: string | null
          resume_url?: string | null
          tagline?: string
          title?: string
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string
          certificate_urls: string[] | null
          created_at: string | null
          description: string
          display_order: number | null
          featured: boolean | null
          github_url: string | null
          id: string
          images: string[] | null
          live_url: string | null
          short_description: string | null
          tech_stack: string[] | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category: string
          certificate_urls?: string[] | null
          created_at?: string | null
          description: string
          display_order?: number | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          images?: string[] | null
          live_url?: string | null
          short_description?: string | null
          tech_stack?: string[] | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string
          certificate_urls?: string[] | null
          created_at?: string | null
          description?: string
          display_order?: number | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          images?: string[] | null
          live_url?: string | null
          short_description?: string | null
          tech_stack?: string[] | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          company: string
          created_at: string | null
          display_order: number | null
          id: string
          linkedin_url: string | null
          name: string
          photo: string | null
          role: string
          testimonial: string
          updated_at: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          linkedin_url?: string | null
          name: string
          photo?: string | null
          role: string
          testimonial: string
          updated_at?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          linkedin_url?: string | null
          name?: string
          photo?: string | null
          role?: string
          testimonial?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      resume_templates: {
        Row: {
          category: string
          created_at: string | null
          html_template: string
          id: string
          is_active: boolean | null
          name: string
          thumbnail_url: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          html_template: string
          id?: string
          is_active?: boolean | null
          name: string
          thumbnail_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          html_template?: string
          id?: string
          is_active?: boolean | null
          name?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      resume_versions: {
        Row: {
          created_at: string | null
          generated_data: Json
          id: string
          pdf_url: string | null
          template_id: string | null
          user_id: string
          version_number: number | null
        }
        Insert: {
          created_at?: string | null
          generated_data: Json
          id?: string
          pdf_url?: string | null
          template_id?: string | null
          user_id: string
          version_number?: number | null
        }
        Update: {
          created_at?: string | null
          generated_data?: Json
          id?: string
          pdf_url?: string | null
          template_id?: string | null
          user_id?: string
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "resume_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          proficiency: number | null
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          proficiency?: number | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          proficiency?: number | null
          updated_at?: string | null
          years_experience?: number | null
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
      user_settings: {
        Row: {
          analytics_id: string | null
          created_at: string | null
          current_theme: string | null
          id: string
          seo_description: string | null
          seo_title: string | null
          updated_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          analytics_id?: string | null
          created_at?: string | null
          current_theme?: string | null
          id?: string
          seo_description?: string | null
          seo_title?: string | null
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          analytics_id?: string | null
          created_at?: string | null
          current_theme?: string | null
          id?: string
          seo_description?: string | null
          seo_title?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          availability_status: boolean | null
          bio: string | null
          created_at: string | null
          current_theme: string | null
          github_url: string | null
          id: string | null
          linkedin_url: string | null
          name: string | null
          profile_image: string | null
          resume_url: string | null
          tagline: string | null
          title: string | null
          twitter_url: string | null
          updated_at: string | null
        }
        Insert: {
          availability_status?: boolean | null
          bio?: string | null
          created_at?: string | null
          current_theme?: string | null
          github_url?: string | null
          id?: string | null
          linkedin_url?: string | null
          name?: string | null
          profile_image?: string | null
          resume_url?: string | null
          tagline?: string | null
          title?: string | null
          twitter_url?: string | null
          updated_at?: string | null
        }
        Update: {
          availability_status?: boolean | null
          bio?: string | null
          created_at?: string | null
          current_theme?: string | null
          github_url?: string | null
          id?: string | null
          linkedin_url?: string | null
          name?: string | null
          profile_image?: string | null
          resume_url?: string | null
          tagline?: string | null
          title?: string | null
          twitter_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_post_views: { Args: { post_slug: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
    },
  },
} as const

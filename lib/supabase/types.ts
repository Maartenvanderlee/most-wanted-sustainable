// Handmatig onderhouden types die de databasetabellen beschrijven.
// Houd dit gelijk aan de migraties in supabase/migrations/.
// De vorm (Relationships, Views, Functions, Enums, CompositeTypes) volgt
// wat @supabase/supabase-js verwacht; zonder deze sleutels vallen de
// client-methodes terug op het type 'never'.

export type ProductStatus = "pending" | "approved" | "rejected";
export type SourceName = "google_trends" | "reddit" | "youtube";
export type EventType = "page_view" | "click" | "outbound";

// Handige verkorting voor de "in te voegen rij"-vorm van een tabel.
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string;
          image_url: string | null;
          affiliate_url: string | null;
          sustainability_tags: string[];
          status: ProductStatus;
          rejection_reason: string | null;
          lifespan: string | null;
          end_of_life: string | null;
          description: string | null;
          description_en: string | null;
          why_sustainable: string | null;
          why_sustainable_en: string | null;
          co2_note: string | null;
          co2_note_en: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: string;
          image_url?: string | null;
          affiliate_url?: string | null;
          sustainability_tags?: string[];
          status?: ProductStatus;
          rejection_reason?: string | null;
          lifespan?: string | null;
          end_of_life?: string | null;
          description?: string | null;
          description_en?: string | null;
          why_sustainable?: string | null;
          why_sustainable_en?: string | null;
          co2_note?: string | null;
          co2_note_en?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      signals: {
        Row: {
          id: string;
          product_id: string;
          source: SourceName;
          value: number;
          measured_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          source: SourceName;
          value: number;
          measured_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["signals"]["Insert"]>;
        Relationships: [];
      };
      scores: {
        Row: {
          id: string;
          product_id: string;
          score: number;
          rank: number;
          formula_version: string;
          snapshot_date: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          score: number;
          rank: number;
          formula_version: string;
          snapshot_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["scores"]["Insert"]>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]
        >;
        Relationships: [];
      };
      admin_login_attempts: {
        Row: { id: string; ip: string; created_at: string };
        Insert: { id?: string; ip: string; created_at?: string };
        Update: Partial<
          Database["public"]["Tables"]["admin_login_attempts"]["Insert"]
        >;
        Relationships: [];
      };
      product_certifications: {
        Row: {
          id: string;
          product_id: string;
          certification: string;
          registration_number: string | null;
          evidence_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          certification: string;
          registration_number?: string | null;
          evidence_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_certifications"]["Insert"]
        >;
        Relationships: [];
      };
      product_offers: {
        Row: {
          id: string;
          product_id: string;
          position: number;
          retailer: string;
          url: string;
          price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          position: number;
          retailer: string;
          url: string;
          price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_offers"]["Insert"]
        >;
        Relationships: [];
      };
      site_content: {
        Row: {
          key: string;
          published: string | null;
          draft: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          published?: string | null;
          draft?: string | null;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["site_content"]["Insert"]
        >;
        Relationships: [];
      };
      curation_history: {
        Row: {
          id: string;
          product_slug: string;
          product_name: string;
          decision: "approved" | "rejected";
          reason: string | null;
          decided_at: string;
        };
        Insert: {
          id?: string;
          product_slug: string;
          product_name: string;
          decision: "approved" | "rejected";
          reason?: string | null;
          decided_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["curation_history"]["Insert"]
        >;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          type: EventType;
          path: string;
          label: string | null;
          visitor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: EventType;
          path: string;
          label?: string | null;
          visitor_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      product_status: ProductStatus;
      source_name: SourceName;
      event_type: EventType;
    };
    CompositeTypes: Record<string, never>;
  };
};

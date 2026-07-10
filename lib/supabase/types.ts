// Handmatig onderhouden types die de databasetabellen beschrijven.
// Houd dit gelijk aan de migraties in supabase/migrations/.

export type ProductStatus = "pending" | "approved" | "rejected";
export type SourceName = "google_trends" | "reddit" | "youtube";

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
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
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
      };
    };
  };
};

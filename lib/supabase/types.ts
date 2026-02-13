export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string | null;
          image_url: string | null;
          category: string;
          address: string | null;
          instagram_handle: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          category: string;
          address?: string | null;
          instagram_handle?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          category?: string;
          address?: string | null;
          instagram_handle?: string | null;
          user_id?: string | null;
        };
      };
      deals: {
        Row: {
          id: string;
          created_at: string;
          restaurant_id: string;
          title: string;
          description: string | null;
          permuta_reward: string | null;
          image_url: string | null;
          discount_percentage: number | null;
          min_followers: number | null;
          min_ig_feed_posts: number | null;
          min_ig_stories: number | null;
          min_tiktok_posts: number | null;
          max_people: number;
          available_spots: number;
          valid_from: string;
          valid_until: string;
          days_available: string[];
          active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          restaurant_id: string;
          title: string;
          description?: string | null;
          permuta_reward?: string | null;
          image_url?: string | null;
          discount_percentage?: number | null;
          min_followers?: number | null;
          min_ig_feed_posts?: number | null;
          min_ig_stories?: number | null;
          min_tiktok_posts?: number | null;
          max_people?: number;
          available_spots?: number;
          valid_from: string;
          valid_until: string;
          days_available?: string[];
          active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          restaurant_id?: string;
          title?: string;
          description?: string | null;
          permuta_reward?: string | null;
          image_url?: string | null;
          discount_percentage?: number | null;
          min_followers?: number | null;
          min_ig_feed_posts?: number | null;
          min_ig_stories?: number | null;
          min_tiktok_posts?: number | null;
          max_people?: number;
          available_spots?: number;
          valid_from?: string;
          valid_until?: string;
          days_available?: string[];
          active?: boolean;
        };
      };
      bookings: {
        Row: {
          id: string;
          created_at: string;
          deal_id: string;
          user_id: string | null;
          user_name: string;
          user_email: string;
          user_phone: string | null;
          num_people: number;
          booking_date: string;
          status: "pending" | "confirmed" | "cancelled";
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          deal_id: string;
          user_id?: string | null;
          user_name: string;
          user_email: string;
          user_phone?: string | null;
          num_people: number;
          booking_date: string;
          status?: "pending" | "confirmed" | "cancelled";
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          deal_id?: string;
          user_id?: string | null;
          user_name?: string;
          user_email?: string;
          user_phone?: string | null;
          num_people?: number;
          booking_date?: string;
          status?: "pending" | "confirmed" | "cancelled";
          notes?: string | null;
        };
      };
      creator_profiles: {
        Row: {
          user_id: string;
          created_at: string;
          updated_at: string;
          full_name: string | null;
          phone: string | null;
          niche: string | null;
          city: string | null;
          audience_range: string | null;
          bio: string | null;
          onboarding_step: number | null;
        };
        Insert: {
          user_id: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          phone?: string | null;
          niche?: string | null;
          city?: string | null;
          audience_range?: string | null;
          bio?: string | null;
          onboarding_step?: number | null;
        };
        Update: {
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          phone?: string | null;
          niche?: string | null;
          city?: string | null;
          audience_range?: string | null;
          bio?: string | null;
          onboarding_step?: number | null;
        };
      };
      creator_social_accounts: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          provider: "instagram" | "tiktok";
          provider_user_id: string | null;
          username: string | null;
          connected: boolean | null;
          last_sync_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          provider: "instagram" | "tiktok";
          provider_user_id?: string | null;
          username?: string | null;
          connected?: boolean | null;
          last_sync_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          provider?: "instagram" | "tiktok";
          provider_user_id?: string | null;
          username?: string | null;
          connected?: boolean | null;
          last_sync_at?: string;
        };
      };
    };
  };
}

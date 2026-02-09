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
          image_url: string | null;
          discount_percentage: number | null;
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
          image_url?: string | null;
          discount_percentage?: number | null;
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
          image_url?: string | null;
          discount_percentage?: number | null;
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
          user_id: string;
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
          user_id?: string;
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
          user_id?: string;
          user_name?: string;
          user_email?: string;
          user_phone?: string | null;
          num_people?: number;
          booking_date?: string;
          status?: "pending" | "confirmed" | "cancelled";
          notes?: string | null;
        };
      };
    };
  };
}

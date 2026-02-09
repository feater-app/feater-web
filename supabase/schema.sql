-- Feater Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Restaurants table
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  address TEXT,
  instagram_handle TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  discount_percentage INTEGER,
  max_people INTEGER NOT NULL DEFAULT 2,
  available_spots INTEGER NOT NULL DEFAULT 10,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  days_available TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  active BOOLEAN DEFAULT true
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  num_people INTEGER NOT NULL DEFAULT 2,
  booking_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_deals_restaurant_id ON deals(restaurant_id);
CREATE INDEX idx_deals_active ON deals(active);
CREATE INDEX idx_bookings_deal_id ON bookings(deal_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Row Level Security (RLS) Policies
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Restaurants: Everyone can read, only owners can modify
CREATE POLICY "Restaurants are viewable by everyone"
  ON restaurants FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own restaurants"
  ON restaurants FOR UPDATE
  USING (auth.uid() = user_id);

-- Deals: Everyone can read active deals
CREATE POLICY "Active deals are viewable by everyone"
  ON deals FOR SELECT
  USING (active = true);

CREATE POLICY "Restaurant owners can manage their deals"
  ON deals FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Bookings: Users can read their own bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Restaurant owners can view bookings for their deals"
  ON bookings FOR SELECT
  USING (
    deal_id IN (
      SELECT d.id FROM deals d
      JOIN restaurants r ON d.restaurant_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

-- Sample data for testing
INSERT INTO restaurants (name, description, category, address, instagram_handle, image_url) VALUES
  ('Bella Italia', 'Authentic Italian cuisine in the heart of the city', 'Italian', 'Rua Augusta, 123 - São Paulo', '@bellaitalia', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'),
  ('Sushi Master', 'Fresh sushi and Japanese delicacies', 'Japanese', 'Av. Paulista, 456 - São Paulo', '@sushimaster', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800'),
  ('Burger House', 'Gourmet burgers made with love', 'American', 'Rua Oscar Freire, 789 - São Paulo', '@burgerhouse', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'),
  ('Taco Loco', 'Mexican street food at its finest', 'Mexican', 'Vila Madalena, 321 - São Paulo', '@tacoloco', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800');

INSERT INTO deals (restaurant_id, title, description, discount_percentage, max_people, available_spots, valid_from, valid_until, days_available) VALUES
  ((SELECT id FROM restaurants WHERE name = 'Bella Italia'), '50% OFF Pizza Night', 'Get 50% off on all pizzas every Tuesday and Thursday', 50, 4, 20, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months', ARRAY['tuesday', 'thursday']),
  ((SELECT id FROM restaurants WHERE name = 'Sushi Master'), 'Sushi Combo for 2', 'Special combo with 40 pieces + 2 drinks', 30, 2, 15, CURRENT_DATE, CURRENT_DATE + INTERVAL '2 months', ARRAY['monday', 'wednesday', 'friday']),
  ((SELECT id FROM restaurants WHERE name = 'Burger House'), 'Buy 1 Get 1 Free', 'Buy one gourmet burger and get another free!', 50, 2, 30, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
  ((SELECT id FROM restaurants WHERE name = 'Taco Loco'), 'Taco Tuesday', '3 tacos + drink for a special price', 40, 4, 25, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months', ARRAY['tuesday']),
  ((SELECT id FROM restaurants WHERE name = 'Bella Italia'), 'Weekend Brunch Special', 'All-you-can-eat brunch on weekends', 35, 6, 12, CURRENT_DATE, CURRENT_DATE + INTERVAL '2 months', ARRAY['saturday', 'sunday']);

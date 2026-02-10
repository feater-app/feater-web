-- Esquema de banco de dados da Feater
-- Execute no Editor SQL do Supabase: https://supabase.com/dashboard/project/_/sql

-- Ativa a extensao UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reset completo (script unico)
DROP FUNCTION IF EXISTS create_booking_with_spot(UUID, TEXT, TEXT, TEXT, INTEGER, DATE, TEXT);
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;

-- Tabela de restaurantes
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

-- Tabela de ofertas
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  permuta_reward TEXT,
  image_url TEXT,
  discount_percentage INTEGER,
  min_followers INTEGER DEFAULT 0,
  min_ig_feed_posts INTEGER DEFAULT 0,
  min_ig_stories INTEGER DEFAULT 0,
  min_tiktok_posts INTEGER DEFAULT 0,
  max_people INTEGER NOT NULL DEFAULT 2,
  available_spots INTEGER NOT NULL DEFAULT 10,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  days_available TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  active BOOLEAN DEFAULT true
);

-- Tabela de reservas
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

-- Indices para melhorar performance de consultas
CREATE INDEX idx_deals_restaurant_id ON deals(restaurant_id);
CREATE INDEX idx_deals_active ON deals(active);
CREATE INDEX idx_bookings_deal_id ON bookings(deal_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Politicas de Row Level Security (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Restaurantes: todos podem ler, apenas donos podem modificar
CREATE POLICY "Restaurantes visiveis por todos"
  ON restaurants FOR SELECT
  USING (true);

CREATE POLICY "Usuarios inserem os proprios restaurantes"
  ON restaurants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios atualizam os proprios restaurantes"
  ON restaurants FOR UPDATE
  USING (auth.uid() = user_id);

-- Ofertas: todos podem ler ofertas ativas
CREATE POLICY "Ofertas ativas visiveis por todos"
  ON deals FOR SELECT
  USING (active = true);

CREATE POLICY "Donos de restaurante podem gerenciar ofertas"
  ON deals FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Reservas: usuarios podem ler as proprias reservas
CREATE POLICY "Usuarios visualizam as proprias reservas"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Qualquer pessoa pode criar reservas"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Donos de restaurante visualizam reservas das ofertas"
  ON bookings FOR SELECT
  USING (
    deal_id IN (
      SELECT d.id FROM deals d
      JOIN restaurants r ON d.restaurant_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

-- Criacao atomica de reserva (insere reserva + decrementa vagas)
CREATE OR REPLACE FUNCTION create_booking_with_spot(
  p_deal_id UUID,
  p_user_name TEXT,
  p_user_email TEXT,
  p_user_phone TEXT,
  p_num_people INTEGER,
  p_booking_date DATE,
  p_notes TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id UUID;
  v_max_people INTEGER;
BEGIN
  SELECT max_people INTO v_max_people
  FROM deals
  WHERE id = p_deal_id AND active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DEAL_NOT_FOUND';
  END IF;

  IF p_num_people < 1 OR p_num_people > v_max_people THEN
    RAISE EXCEPTION 'INVALID_PARTY_SIZE';
  END IF;

  UPDATE deals
  SET available_spots = available_spots - 1
  WHERE id = p_deal_id AND available_spots > 0;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NO_SPOTS';
  END IF;

  INSERT INTO bookings (
    deal_id,
    user_name,
    user_email,
    user_phone,
    num_people,
    booking_date,
    notes,
    status
  )
  VALUES (
    p_deal_id,
    p_user_name,
    p_user_email,
    p_user_phone,
    p_num_people,
    p_booking_date,
    p_notes,
    'pending'
  )
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

REVOKE ALL ON FUNCTION create_booking_with_spot(UUID, TEXT, TEXT, TEXT, INTEGER, DATE, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_booking_with_spot(UUID, TEXT, TEXT, TEXT, INTEGER, DATE, TEXT) TO anon, authenticated;

-- Dados de exemplo para testes
INSERT INTO restaurants (name, description, category, address, instagram_handle, image_url) VALUES
  ('Bella Italia', 'Culinária italiana autêntica no coração da cidade', 'Italiana', 'Rua Augusta, 123 - São Paulo', '@bellaitalia', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'),
  ('Sushi Master', 'Sushi fresco e delícias japonesas', 'Japonesa', 'Av. Paulista, 456 - São Paulo', '@sushimaster', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800'),
  ('Burger House', 'Hambúrgueres gourmets feitos com carinho', 'Americana', 'Rua Oscar Freire, 789 - São Paulo', '@burgerhouse', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'),
  ('Taco Loco', 'Comida de rua mexicana no seu melhor', 'Mexicana', 'Vila Madalena, 321 - São Paulo', '@tacoloco', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800');

INSERT INTO deals (
  restaurant_id,
  title,
  description,
  permuta_reward,
  discount_percentage,
  min_followers,
  min_ig_feed_posts,
  min_ig_stories,
  min_tiktok_posts,
  max_people,
  available_spots,
  valid_from,
  valid_until,
  days_available
) VALUES
  ((SELECT id FROM restaurants WHERE name = 'Bella Italia'), 'Noite da Pizza para creators', 'Experiencia de pizza + drinks para creators que topam produzir conteudo no local', '1 pizza premium + 2 drinks por creator', NULL, 10000, 1, 3, 1, 4, 20, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months', ARRAY['tuesday', 'thursday']),
  ((SELECT id FROM restaurants WHERE name = 'Sushi Master'), 'Sushi omakase em permuta', 'Sessao omakase para creators de gastronomia e lifestyle com entrega de conteudo', 'Omakase para 2 + 1 sobremesa da casa', NULL, 15000, 1, 4, 1, 2, 15, CURRENT_DATE, CURRENT_DATE + INTERVAL '2 months', ARRAY['monday', 'wednesday', 'friday']),
  ((SELECT id FROM restaurants WHERE name = 'Burger House'), 'Burger tasting creator night', 'Degustacao de burgers assinatura para creators com foco em reels de comida', 'Menu degustacao + 2 bebidas especiais', NULL, 8000, 1, 2, 0, 2, 30, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
  ((SELECT id FROM restaurants WHERE name = 'Taco Loco'), 'Taco experience para UGC creators', 'Combo de tacos com drink autoral para creators que entregam conteudo rapido e autentico', 'Trio de tacos + drink da casa', NULL, 5000, 0, 3, 1, 4, 25, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months', ARRAY['tuesday']),
  ((SELECT id FROM restaurants WHERE name = 'Bella Italia'), 'Brunch premium collab', 'Brunch completo com foco em creators de lifestyle, viagens e experiencias em casal', 'Brunch completo + 2 mimosas', NULL, 12000, 1, 3, 1, 6, 12, CURRENT_DATE, CURRENT_DATE + INTERVAL '2 months', ARRAY['saturday', 'sunday']);

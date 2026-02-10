-- Backfill de dados existentes para o modelo de permuta
-- Execute este script apos `supabase/migrate-permuta.sql`

UPDATE deals
SET
  title = 'Noite da Pizza para creators',
  description = 'Experiencia de pizza + drinks para creators que topam produzir conteudo no local',
  permuta_reward = '1 pizza premium + 2 drinks por creator',
  discount_percentage = NULL,
  min_followers = 10000,
  min_ig_feed_posts = 1,
  min_ig_stories = 3,
  min_tiktok_posts = 1
WHERE title IN ('Noite da Pizza com 50% OFF', 'Noite da Pizza para creators');

UPDATE deals
SET
  title = 'Sushi omakase em permuta',
  description = 'Sessao omakase para creators de gastronomia e lifestyle com entrega de conteudo',
  permuta_reward = 'Omakase para 2 + 1 sobremesa da casa',
  discount_percentage = NULL,
  min_followers = 15000,
  min_ig_feed_posts = 1,
  min_ig_stories = 4,
  min_tiktok_posts = 1
WHERE title IN ('Combo de Sushi para 2', 'Sushi omakase em permuta');

UPDATE deals
SET
  title = 'Burger tasting creator night',
  description = 'Degustacao de burgers assinatura para creators com foco em reels de comida',
  permuta_reward = 'Menu degustacao + 2 bebidas especiais',
  discount_percentage = NULL,
  min_followers = 8000,
  min_ig_feed_posts = 1,
  min_ig_stories = 2,
  min_tiktok_posts = 0
WHERE title IN ('Compre 1 e Leve 2 Hambúrgueres', 'Burger tasting creator night');

UPDATE deals
SET
  title = 'Taco experience para UGC creators',
  description = 'Combo de tacos com drink autoral para creators que entregam conteudo rapido e autentico',
  permuta_reward = 'Trio de tacos + drink da casa',
  discount_percentage = NULL,
  min_followers = 5000,
  min_ig_feed_posts = 0,
  min_ig_stories = 3,
  min_tiktok_posts = 1
WHERE title IN ('Especial de Taco na Terça', 'Taco experience para UGC creators');

UPDATE deals
SET
  title = 'Brunch premium collab',
  description = 'Brunch completo com foco em creators de lifestyle, viagens e experiencias em casal',
  permuta_reward = 'Brunch completo + 2 mimosas',
  discount_percentage = NULL,
  min_followers = 12000,
  min_ig_feed_posts = 1,
  min_ig_stories = 3,
  min_tiktok_posts = 1
WHERE title IN ('Brunch de Fim de Semana', 'Brunch premium collab');

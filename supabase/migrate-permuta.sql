-- Migração para modelo de permuta (executar em bancos já existentes)

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS permuta_reward TEXT,
  ADD COLUMN IF NOT EXISTS min_followers INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_ig_feed_posts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_ig_stories INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_tiktok_posts INTEGER DEFAULT 0;

-- Opcional: limpar valores legados de desconto quando o modelo for só permuta
-- UPDATE deals SET discount_percentage = NULL;

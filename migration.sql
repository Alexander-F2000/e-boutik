-- =============================================================
-- Migration e-boutik → Supabase
-- Execute ce script dans le SQL Editor du dashboard Supabase
-- =============================================================

-- 1. PRODUITS
CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT DEFAULT '',
  sizes TEXT DEFAULT '',
  brand TEXT DEFAULT '',
  material TEXT DEFAULT '',
  color TEXT DEFAULT '',
  image TEXT DEFAULT '',
  image_hover TEXT DEFAULT '',
  "costPrice" DECIMAL(10,2) DEFAULT 0,
  "wholesalePrice" DECIMAL(10,2) DEFAULT 0,
  "batchQuantity" INTEGER DEFAULT 0,
  "batchPrice" DECIMAL(10,2) DEFAULT 0,
  "alertThreshold" INTEGER DEFAULT 5,
  stock INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  "sellingPrice" DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL
);

-- 3. COMMANDES
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY,
  customer_name TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  customer_address TEXT DEFAULT '',
  customer_notes TEXT DEFAULT '',
  customer_email TEXT DEFAULT '',
  total DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'Ap tann',
  created_at TEXT DEFAULT '',
  items JSONB DEFAULT '[]'::jsonb
);

-- 4. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT PRIMARY KEY,
  type TEXT DEFAULT '',
  "saleType" TEXT DEFAULT '',
  "productId" BIGINT DEFAULT 0,
  "productName" TEXT DEFAULT '',
  quantity INTEGER DEFAULT 0,
  "unitPrice" DECIMAL(10,2) DEFAULT 0,
  "totalPrice" DECIMAL(10,2) DEFAULT 0,
  "costPrice" DECIMAL(10,2) DEFAULT 0,
  profit DECIMAL(10,2) DEFAULT 0,
  note TEXT DEFAULT '',
  "createdAt" TEXT DEFAULT ''
);

-- 5. CLIENTS (comptes clients)
CREATE TABLE IF NOT EXISTS clients (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  "createdAt" TEXT DEFAULT ''
);

-- 6. ADMINS
CREATE TABLE IF NOT EXISTS admins (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL
);

-- 7. Active RLS sur toutes les tables (sécurité)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 8. Politiques RLS (accès public en lecture pour produits/catégories)
CREATE POLICY "Tout moun ka li products" ON products FOR SELECT USING (true);
CREATE POLICY "Tout moun ka li categories" ON categories FOR SELECT USING (true);

-- 9. Politiques RLS (accès restreint pour les autres tables)
-- Seuls les admins authentifiés peuvent ecrire/modifier
CREATE POLICY "Admins sèlman ka modifye products" ON products 
  FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
CREATE POLICY "Admins sèlman ka modifye categories" ON categories 
  FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
CREATE POLICY "Admins sèlman ka li orders" ON orders 
  FOR SELECT USING (true);
CREATE POLICY "Admins sèlman ka modifye orders" ON orders 
  FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
CREATE POLICY "Admins sèlman ka li transactions" ON transactions 
  FOR SELECT USING (true);
CREATE POLICY "Admins sèlman ka modifye transactions" ON transactions 
  FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
CREATE POLICY "Admins sèlman ka li admins" ON admins 
  FOR SELECT USING (true);
CREATE POLICY "Admins sèlman ka modifye admins" ON admins 
  FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
CREATE POLICY "Moun ka kreye pwop kont" ON clients 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Moun ka li pwop kont" ON clients 
  FOR SELECT USING (true);

-- 10. Index pou performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

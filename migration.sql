-- =============================================================
-- Migration e-boutik → Supabase
-- Execute ce script dans le SQL Editor du dashboard Supabase
-- CORRIGÉ (audit 2026-08-01) : harmonisé avec rls-proper.sql
-- (fichier de référence). anon = SELECT products/categories
-- uniquement ; écritures réservées à authenticated ;
-- AUCUNE politique anon sur orders, transactions, clients,
-- admins, messages ; admins = service_role uniquement.
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

-- 6bis. MESSAGES (contact)
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT ''
);

-- 7. Supprimer les anciennes politiques (permissives ou obsolètes)
DROP POLICY IF EXISTS "Anon ka tout fe products" ON products;
DROP POLICY IF EXISTS "Anon ka tout fe categories" ON categories;
DROP POLICY IF EXISTS "Anon ka tout fe orders" ON orders;
DROP POLICY IF EXISTS "Anon ka tout fe transactions" ON transactions;
DROP POLICY IF EXISTS "Anon ka tout fe clients" ON clients;
DROP POLICY IF EXISTS "Anon ka tout fe admins" ON admins;
DROP POLICY IF EXISTS "products_select_all" ON products;
DROP POLICY IF EXISTS "products_insert_all" ON products;
DROP POLICY IF EXISTS "products_update_all" ON products;
DROP POLICY IF EXISTS "products_delete_all" ON products;
DROP POLICY IF EXISTS "categories_select_all" ON categories;
DROP POLICY IF EXISTS "categories_insert_all" ON categories;
DROP POLICY IF EXISTS "categories_update_all" ON categories;
DROP POLICY IF EXISTS "categories_delete_all" ON categories;
DROP POLICY IF EXISTS "orders_select_all" ON orders;
DROP POLICY IF EXISTS "orders_insert_all" ON orders;
DROP POLICY IF EXISTS "orders_update_all" ON orders;
DROP POLICY IF EXISTS "orders_delete_all" ON orders;
DROP POLICY IF EXISTS "transactions_select_all" ON transactions;
DROP POLICY IF EXISTS "transactions_insert_all" ON transactions;
DROP POLICY IF EXISTS "transactions_update_all" ON transactions;
DROP POLICY IF EXISTS "transactions_delete_all" ON transactions;
DROP POLICY IF EXISTS "clients_select_all" ON clients;
DROP POLICY IF EXISTS "clients_insert_all" ON clients;
DROP POLICY IF EXISTS "clients_update_all" ON clients;
DROP POLICY IF EXISTS "clients_delete_all" ON clients;
DROP POLICY IF EXISTS "admins_select_all" ON admins;
DROP POLICY IF EXISTS "admins_insert_all" ON admins;
DROP POLICY IF EXISTS "admins_update_all" ON admins;
DROP POLICY IF EXISTS "messages_select_all" ON messages;
DROP POLICY IF EXISTS "messages_insert_all" ON messages;
DROP POLICY IF EXISTS "Tout moun ka li products" ON products;
DROP POLICY IF EXISTS "Tout moun ka li categories" ON categories;
DROP POLICY IF EXISTS "Admins sèlman ka modifye products" ON products;
DROP POLICY IF EXISTS "Admins sèlman ka modifye categories" ON categories;
DROP POLICY IF EXISTS "Admins sèlman ka li orders" ON orders;
DROP POLICY IF EXISTS "Admins sèlman ka modifye orders" ON orders;
DROP POLICY IF EXISTS "Admins sèlman ka li transactions" ON transactions;
DROP POLICY IF EXISTS "Admins sèlman ka modifye transactions" ON transactions;
DROP POLICY IF EXISTS "Admins sèlman ka li admins" ON admins;
DROP POLICY IF EXISTS "Admins sèlman ka modifye admins" ON admins;
DROP POLICY IF EXISTS "Moun ka kreye pwop kont" ON clients;
DROP POLICY IF EXISTS "Moun ka li pwop kont" ON clients;
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_all" ON products;
DROP POLICY IF EXISTS "categories_select" ON categories;
DROP POLICY IF EXISTS "categories_all" ON categories;
DROP POLICY IF EXISTS "orders_all" ON orders;
DROP POLICY IF EXISTS "transactions_all" ON transactions;
DROP POLICY IF EXISTS "clients_insert" ON clients;
DROP POLICY IF EXISTS "clients_all" ON clients;
DROP POLICY IF EXISTS "admins_all" ON admins;

-- 8. Active RLS sur toutes les tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 9. Politiques RLS (restrictives — audit 2026-08-01)
-- anon : LECTURE PUBLIQUE uniquement (products + categories)
CREATE POLICY "anon_read_products" ON products FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_categories" ON categories FOR SELECT TO anon USING (true);

-- Écritures products/categories : réservées à authenticated
CREATE POLICY "auth_insert_products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_products" ON products FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE TO authenticated USING (true);

-- Tables sensibles : AUCUNE politique anon
CREATE POLICY "auth_all_orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_transactions" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_insert_clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_select_clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_update_clients" ON clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_insert_messages" ON messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_select_messages" ON messages FOR SELECT TO authenticated USING (true);

-- admins : AUCUNE politique anon ni authenticated — réservé au rôle
-- service_role (bypass RLS). Création du premier admin via
-- Supabase Dashboard → SQL Editor :
--   INSERT INTO admins (username, password)
--   VALUES ('admin', '<hash sha256 du mot de passe>')

-- ============================================================
-- SECTION 10 : INDEX POU PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category
  ON products(category);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email
  ON orders(customer_email);

CREATE INDEX IF NOT EXISTS idx_transactions_type
  ON transactions(type);

CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON messages(created_at);

-- ============================================================
-- FIN FICHIER
-- ============================================================
-- FICHIER DE RÉFÉRENCE : rls-proper.sql
-- Ce fichier (migration.sql) applique les MÊMES règles restrictives :
--   - anon : SELECT uniquement sur products / categories
--   - authenticated : écritures sur products, categories, orders,
--     transactions, clients, messages
--   - admins : AUCUNE politique (service_role only)
-- À exécuter dans Supabase Dashboard → SQL Editor.

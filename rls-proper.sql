-- =============================================================
-- RLS (Row Level Security) — configuration propre
-- 1. Supprime toutes les anciennes politiques
-- 2. Réactive RLS sur toutes les tables
-- 3. Crée les bonnes politiques pour la clé anon
-- =============================================================

-- === 1. Supprimer TOUTES les anciennes politiques ===
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
DROP POLICY IF EXISTS "Anon ka tout fe products" ON products;
DROP POLICY IF EXISTS "Anon ka tout fe categories" ON categories;
DROP POLICY IF EXISTS "Anon ka tout fe orders" ON orders;
DROP POLICY IF EXISTS "Anon ka tout fe transactions" ON transactions;
DROP POLICY IF EXISTS "Anon ka tout fe clients" ON clients;
DROP POLICY IF EXISTS "Anon ka tout fe admins" ON admins;

-- === 2. Activer RLS ===
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- === 3. Politiques pour la clé anon ===
-- Produits : tout le monde peut lire (public), anon peut tout modifier
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_all" ON products FOR ALL USING (true) WITH CHECK (true);

-- Catégories : pareil
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_all" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Commandes : anon peut tout faire (admin panel)
CREATE POLICY "orders_all" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Transactions : anon peut tout faire
CREATE POLICY "transactions_all" ON transactions FOR ALL USING (true) WITH CHECK (true);

-- Clients : n'importe qui peut s'inscrire (INSERT), anon peut tout lire/modifier
CREATE POLICY "clients_insert" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "clients_all" ON clients FOR ALL USING (true) WITH CHECK (true);

-- Admins : anon peut tout faire
CREATE POLICY "admins_all" ON admins FOR ALL USING (true) WITH CHECK (true);

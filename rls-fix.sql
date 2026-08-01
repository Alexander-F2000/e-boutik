-- =============================================================
-- CORRECTION RLS (audit 2026-08-01)
-- ⚠️ Ce script ANNULait l'ancienne "correction" qui ouvrait
--    l'accès anon à TOUTES les tables (INSERT/UPDATE/DELETE
--    compris, y compris admins). C'était une faille critique.
--
-- RÈGLES CORRIGÉES :
--   • anon : SELECT UNIQUEMENT sur products et categories
--   • toutes les écritures : réservées au rôle `authenticated`
--   • AUCUNE politique anon sur orders, transactions, clients,
--     admins, messages
--   • admins : réservé au rôle service_role (bypass RLS)
--
-- FICHIER DE RÉFÉRENCE : rls-proper.sql (mêmes règles).
-- =============================================================

-- === 1. Supprimer les anciennes politiques permissives ===
DROP POLICY IF EXISTS "Anon ka tout fe products" ON products;
DROP POLICY IF EXISTS "Anon ka tout fe categories" ON categories;
DROP POLICY IF EXISTS "Anon ka tout fe orders" ON orders;
DROP POLICY IF EXISTS "Anon ka tout fe transactions" ON transactions;
DROP POLICY IF EXISTS "Anon ka tout fe clients" ON clients;
DROP POLICY IF EXISTS "Anon ka tout fe admins" ON admins;
-- Anciennes politiques (rls-policies.sql / migration.sql / ancien rls-proper.sql)
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

-- === 2. Activer RLS ===
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- === 3. anon : lecture publique UNIQUEMENT (products + categories) ===
CREATE POLICY "anon_read_products" ON products FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_categories" ON categories FOR SELECT TO anon USING (true);

-- === 4. Écritures : uniquement authenticated ===
CREATE POLICY "auth_insert_products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_products" ON products FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE TO authenticated USING (true);

-- === 5. Tables sensibles : AUCUNE politique anon ===
CREATE POLICY "auth_all_orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_transactions" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_insert_clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_select_clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_update_clients" ON clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_insert_messages" ON messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_select_messages" ON messages FOR SELECT TO authenticated USING (true);

-- === 6. admins : AUCUNE politique (rôle service_role uniquement) ===
-- Création du premier admin via Supabase Dashboard → SQL Editor :
--   INSERT INTO admins (username, password)
--   VALUES ('admin', '<hash sha256 du mot de passe>');

-- ============================================================
-- FICHIER DE RÉFÉRENCE : rls-proper.sql (mêmes règles, plus commenté)
-- ============================================================

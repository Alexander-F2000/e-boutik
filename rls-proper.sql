-- =============================================================
-- RLS (Row Level Security) — configuration de RÉFÉRENCE (audit 2026-08-01)
--
-- RÈGLES APPLIQUÉES :
--   • anon (clé publique) : SELECT UNIQUEMENT sur products et categories
--   • toutes les écritures (INSERT/UPDATE/DELETE) : réservées au rôle
--     `authenticated` (utilisateur connecté via Supabase Auth)
--   • AUCUNE politique anon sur orders, transactions, clients, admins,
--     messages → refus par défaut pour la clé anon
--   • table admins : réservée au rôle service_role (bypass RLS) —
--     création du premier admin via Supabase Dashboard / SQL Editor
--
-- ⚠️ Avec RLS : si aucune politique ne s'applique à un rôle, ce rôle
--    n'a AUCUN accès (refus par défaut).
-- =============================================================

-- === 0. Table messages (création idempotente) ===
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT ''
);

-- === 1. Supprimer TOUTES les anciennes politiques (permissives) ===
-- Politiques "Anon ka tout fe" (rls-fix.sql)
DROP POLICY IF EXISTS "Anon ka tout fe products" ON products;
DROP POLICY IF EXISTS "Anon ka tout fe categories" ON categories;
DROP POLICY IF EXISTS "Anon ka tout fe orders" ON orders;
DROP POLICY IF EXISTS "Anon ka tout fe transactions" ON transactions;
DROP POLICY IF EXISTS "Anon ka tout fe clients" ON clients;
DROP POLICY IF EXISTS "Anon ka tout fe admins" ON admins;
-- Politiques "*_select_all / *_insert_all ..." (rls-policies.sql)
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
-- Politiques "Tout moun ka li / Admins sèlman ka ..." (migration.sql)
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
-- Politiques "products_select / *_all" (ancien rls-proper.sql)
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_all" ON products;
DROP POLICY IF EXISTS "categories_select" ON categories;
DROP POLICY IF EXISTS "categories_all" ON categories;
DROP POLICY IF EXISTS "orders_all" ON orders;
DROP POLICY IF EXISTS "transactions_all" ON transactions;
DROP POLICY IF EXISTS "clients_insert" ON clients;
DROP POLICY IF EXISTS "clients_all" ON clients;
DROP POLICY IF EXISTS "admins_all" ON admins;

-- === 2. Activer RLS sur toutes les tables ===
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- === 3. Politiques anon : LECTURE PUBLIQUE uniquement (products + categories) ===
CREATE POLICY "anon_read_products" ON products FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_categories" ON categories FOR SELECT TO anon USING (true);

-- === 4. Écritures products/categories : réservées à authenticated ===
CREATE POLICY "auth_insert_products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_products" ON products FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth_insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE TO authenticated USING (true);

-- === 5. Tables sensibles : AUCUNE politique anon ===
-- orders / transactions : opérations réservées à authenticated
CREATE POLICY "auth_all_orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_transactions" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- clients : inscription + lecture via authenticated uniquement
CREATE POLICY "auth_insert_clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_select_clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_update_clients" ON clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- messages : création + lecture via authenticated uniquement
CREATE POLICY "auth_insert_messages" ON messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_select_messages" ON messages FOR SELECT TO authenticated USING (true);

-- === 6. admins : AUCUNE politique anon ni authenticated ===
-- Réservé au rôle service_role (bypass RLS par défaut).
-- Création du premier admin via Supabase Dashboard → SQL Editor, ex. :
--   INSERT INTO admins (username, password)
--   VALUES ('admin', '<hash sha256 du mot de passe>');
-- ⚠️ La table admins ne doit JAMAIS être accessible avec la clé anon.

-- ============================================================
-- RAPPEL : le rôle service_role contourne RLS (BYPASSRLS) :
-- c'est LA voie pour les opérations d'administration côté serveur.
-- Le front statique actuel (clé anon) ne pourra plus écrire/lire
-- les tables sensibles — c'est le comportement voulu.
-- ============================================================

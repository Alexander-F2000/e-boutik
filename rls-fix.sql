-- =============================================================
-- CORRECTION RLS: Permet a la cle anon d'ecrire dans les tables
-- Execute ce script APRES le script de migration initial
-- =============================================================

-- Supprimer les anciennes politiques trop strictes
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

-- Nouvelles politiques: tout le monde peut lire/ecrire (site public avec cle anon)
CREATE POLICY "Anon ka tout fe products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon ka tout fe categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon ka tout fe orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon ka tout fe transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon ka tout fe clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon ka tout fe admins" ON admins FOR ALL USING (true) WITH CHECK (true);

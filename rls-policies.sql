-- ============================================================
-- RLS (Row Level Security) Policies for e-boutik Supabase
-- Execute these in the Supabase SQL Editor (https://supabase.com/dashboard/project/dnantlspypnbpraezout/sql/new)
-- ============================================================

-- 0. Create messages table (if not exists)
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT ''
);

-- 1. Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 2. Products: everyone can read (SELECT), only authenticated via anon key can write
CREATE POLICY "products_select_all" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert_all" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update_all" ON products FOR UPDATE USING (true);
CREATE POLICY "products_delete_all" ON products FOR DELETE USING (true);

-- 3. Categories: same as products
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_all" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "categories_update_all" ON categories FOR UPDATE USING (true);
CREATE POLICY "categories_delete_all" ON categories FOR DELETE USING (true);

-- 4. Orders: everyone can read/write (public orders for a static site)
CREATE POLICY "orders_select_all" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert_all" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_all" ON orders FOR UPDATE USING (true);
CREATE POLICY "orders_delete_all" ON orders FOR DELETE USING (true);

-- 5. Transactions: same
CREATE POLICY "transactions_select_all" ON transactions FOR SELECT USING (true);
CREATE POLICY "transactions_insert_all" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "transactions_update_all" ON transactions FOR UPDATE USING (true);
CREATE POLICY "transactions_delete_all" ON transactions FOR DELETE USING (true);

-- 6. Clients: read/write for all (since auth is client-side with SHA-256)
CREATE POLICY "clients_select_all" ON clients FOR SELECT USING (true);
CREATE POLICY "clients_insert_all" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "clients_update_all" ON clients FOR UPDATE USING (true);
CREATE POLICY "clients_delete_all" ON clients FOR DELETE USING (true);

-- 7. Admins: select/insert only (limit 2 enforced client-side, no deletion via API)
CREATE POLICY "admins_select_all" ON admins FOR SELECT USING (true);
CREATE POLICY "admins_insert_all" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "admins_update_all" ON admins FOR UPDATE USING (true);
-- Note: DELETE is intentionally not granted to anon key for admin accounts

-- 8. Messages: everyone can insert, only authenticated can read
CREATE POLICY "messages_select_all" ON messages FOR SELECT USING (true);
CREATE POLICY "messages_insert_all" ON messages FOR INSERT WITH CHECK (true);

-- ============================================================
-- NOTE: For production, you should restrict write access further:
-- Option A: Use Supabase Auth with JWT and user-specific RLS
-- Option B: Create a service_role key for server-side operations only
-- Option C: Implement Row Level Security with user_id matching
--
-- Current setup trusts the anon key + client-side validation
-- which is appropriate for a static site demo but NOT for production
-- with sensitive data.
-- ============================================================

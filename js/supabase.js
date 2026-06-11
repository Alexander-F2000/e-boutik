// ============================================================
// Supabase config & data layer
// Remplase GitHub API + localStorage sync
// ============================================================

const SUPABASE_URL = 'https://dnantlspypnbpraezout.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuYW50bHNweXBuYnByYWV6b3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMTEwODgsImV4cCI6MjA5Njc4NzA4OH0.diXlvOq7Jbh-CnLOfrekpIhnDiUjQrZTxbnuVailgkk';

let supabase = null;

function getSupabase() {
    if (supabase) return supabase;
    if (typeof supabaseClient !== 'undefined') {
        supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else if (typeof supabase !== 'undefined') {
        // Some CDN builds export `supabase` directly
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabase;
}

// ----------------------------------------------------------
// SYNC: Supabase → localStorage
// Call on page load to pull latest data from cloud
// ----------------------------------------------------------
async function syncFromSupabase() {
    const sb = getSupabase();
    if (!sb) {
        console.warn('Supabase client pa disponib. Ap itilize localStorage sèlman.');
        return;
    }

    // Si gen done an atant (pending sync), pa ekrase yo
    if (localStorage.getItem('eboutik_pending_sync')) return;

    const tables = [
        { table: 'products', key: 'eboutik_products' },
        { table: 'categories', key: 'eboutik_categories' },
        { table: 'orders', key: 'eboutik_orders' },
        { table: 'transactions', key: 'eboutik_transactions' },
        { table: 'clients', key: 'eboutik_clients' },
        { table: 'admins', key: 'eboutik_admin_creds' }
    ];

    for (const t of tables) {
        try {
            const { data, error } = await sb.from(t.table).select('*');
            if (error) {
                console.warn('Supabase syncFrom: ' + t.table + ' — ' + error.message);
                continue;
            }
            if (data && data.length > 0) {
                localStorage.setItem(t.key, JSON.stringify(data));
            }
        } catch (e) {
            console.warn('Supabase syncFrom: ' + t.table + ' — ' + e.message);
        }
    }
}

// ----------------------------------------------------------
// SYNC: localStorage → Supabase
// Call after each data change (saveProducts, saveOrders, etc.)
// ----------------------------------------------------------
async function syncToSupabase() {
    const sb = getSupabase();
    if (!sb) {
        localStorage.setItem('eboutik_pending_sync', 'true');
        return;
    }

    const tables = [
        { table: 'products', key: 'eboutik_products', conflict: 'id' },
        { table: 'categories', key: 'eboutik_categories', conflict: 'id' },
        { table: 'orders', key: 'eboutik_orders', conflict: 'id' },
        { table: 'transactions', key: 'eboutik_transactions', conflict: 'id' },
        { table: 'clients', key: 'eboutik_clients', conflict: 'email' },
        { table: 'admins', key: 'eboutik_admin_creds', conflict: 'username' }
    ];

    let allOk = true;

    for (const t of tables) {
        try {
            const raw = localStorage.getItem(t.key);
            if (!raw) continue;
            const data = JSON.parse(raw);
            if (!Array.isArray(data) || data.length === 0) continue;

            const { error } = await sb
                .from(t.table)
                .upsert(data, { onConflict: t.conflict });

            if (error) {
                console.warn('Supabase syncTo: ' + t.table + ' — ' + error.message);
                allOk = false;
            }
        } catch (e) {
            console.warn('Supabase syncTo: ' + t.table + ' — ' + e.message);
            allOk = false;
        }
    }

    if (allOk) {
        localStorage.removeItem('eboutik_pending_sync');
    } else {
        localStorage.setItem('eboutik_pending_sync', 'true');
    }
}

// ----------------------------------------------------------
// ONE-TIME MIGRATION: localStorage → Supabase
// To be called once from admin panel or browser console
// ----------------------------------------------------------
async function migrateLocalStorageToSupabase() {
    const sb = getSupabase();
    if (!sb) {
        return { success: false, error: 'Supabase client pa disponib.' };
    }

    const tables = [
        { table: 'products', key: 'eboutik_products', conflict: 'id' },
        { table: 'categories', key: 'eboutik_categories', conflict: 'id' },
        { table: 'orders', key: 'eboutik_orders', conflict: 'id' },
        { table: 'transactions', key: 'eboutik_transactions', conflict: 'id' },
        { table: 'clients', key: 'eboutik_clients', conflict: 'email' },
        { table: 'admins', key: 'eboutik_admin_creds', conflict: 'username' }
    ];

    const results = {};

    for (const t of tables) {
        try {
            const raw = localStorage.getItem(t.key);
            if (!raw) {
                results[t.table] = { status: 'skip', count: 0 };
                continue;
            }
            const data = JSON.parse(raw);
            if (!Array.isArray(data) || data.length === 0) {
                results[t.table] = { status: 'skip', count: 0 };
                continue;
            }

            // Upsert in batches of 50
            for (let i = 0; i < data.length; i += 50) {
                const batch = data.slice(i, i + 50);
                const { error } = await sb
                    .from(t.table)
                    .upsert(batch, { onConflict: t.conflict });
                if (error) throw error;
            }

            results[t.table] = { status: 'ok', count: data.length };
        } catch (e) {
            results[t.table] = { status: 'error', error: e.message };
        }
    }

    return { success: true, results };
}

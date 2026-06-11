// ============================================================
// Supabase data layer (REST API direct, san CDN)
// ============================================================

const SUPABASE_URL = 'https://dnantlspypnbpraezout.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuYW50bHNweXBuYnByYWV6b3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMTEwODgsImV4cCI6MjA5Njc4NzA4OH0.diXlvOq7Jbh-CnLOfrekpIhnDiUjQrZTxbnuVailgkk';

function supabaseHeaders() {
    return {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
}

// ----------------------------------------------------------
// SELECT * FROM table
// ----------------------------------------------------------
async function supabaseSelect(table) {
    const resp = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?select=*', {
        headers: supabaseHeaders()
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return await resp.json();
}

// ----------------------------------------------------------
// UPSERT data into table (INSERT or UPDATE on conflict)
// ----------------------------------------------------------
async function supabaseUpsert(table, data, conflictColumn) {
    if (!data || data.length === 0) return;
    const resp = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
        method: 'POST',
        headers: supabaseHeaders(),
        body: JSON.stringify(data)
    });
    if (!resp.ok) {
        const text = await resp.text().catch(function() { return ''; });
        throw new Error('HTTP ' + resp.status + ': ' + text);
    }
    return await resp.json().catch(function() { return null; });
}

// ============================================================
// SYNC: Supabase → localStorage
// Call on page load
// ============================================================
async function syncFromSupabase() {
    // Si gen done an atant, pa ekrase yo
    if (localStorage.getItem('eboutik_pending_sync')) return;

    var tables = [
        { table: 'products', key: 'eboutik_products' },
        { table: 'categories', key: 'eboutik_categories' },
        { table: 'orders', key: 'eboutik_orders' },
        { table: 'transactions', key: 'eboutik_transactions' },
        { table: 'clients', key: 'eboutik_clients' },
        { table: 'admins', key: 'eboutik_admin_creds' }
    ];

    for (var i = 0; i < tables.length; i++) {
        var t = tables[i];
        try {
            var data = await supabaseSelect(t.table);
            if (data && data.length > 0) {
                localStorage.setItem(t.key, JSON.stringify(data));
            }
        } catch (e) {
            console.warn('Supabase syncFrom: ' + t.table + ' — ' + e.message);
        }
    }
}

// ============================================================
// SYNC: localStorage → Supabase
// Call after each data change
// ============================================================
async function syncToSupabase() {
    var tables = [
        { table: 'products', key: 'eboutik_products' },
        { table: 'categories', key: 'eboutik_categories' },
        { table: 'orders', key: 'eboutik_orders' },
        { table: 'transactions', key: 'eboutik_transactions' },
        { table: 'clients', key: 'eboutik_clients' },
        { table: 'admins', key: 'eboutik_admin_creds' }
    ];

    var allOk = true;

    for (var i = 0; i < tables.length; i++) {
        var t = tables[i];
        try {
            var raw = localStorage.getItem(t.key);
            if (!raw) continue;
            var data = JSON.parse(raw);
            if (!Array.isArray(data) || data.length === 0) continue;

            await supabaseUpsert(t.table, data);
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

// ============================================================
// ONE-TIME MIGRATION: localStorage → Supabase
// ============================================================
async function migrateLocalStorageToSupabase() {
    var tables = [
        { table: 'products', key: 'eboutik_products' },
        { table: 'categories', key: 'eboutik_categories' },
        { table: 'orders', key: 'eboutik_orders' },
        { table: 'transactions', key: 'eboutik_transactions' },
        { table: 'clients', key: 'eboutik_clients' },
        { table: 'admins', key: 'eboutik_admin_creds' }
    ];

    var results = {};

    for (var i = 0; i < tables.length; i++) {
        var t = tables[i];
        try {
            var raw = localStorage.getItem(t.key);
            if (!raw) {
                results[t.table] = { status: 'skip', count: 0 };
                continue;
            }
            var data = JSON.parse(raw);
            if (!Array.isArray(data) || data.length === 0) {
                results[t.table] = { status: 'skip', count: 0 };
                continue;
            }

            // Batches of 50
            for (var j = 0; j < data.length; j += 50) {
                var batch = data.slice(j, j + 50);
                await supabaseUpsert(t.table, batch);
            }

            results[t.table] = { status: 'ok', count: data.length };
        } catch (e) {
            results[t.table] = { status: 'error', error: e.message };
        }
    }

    return { success: true, results };
}

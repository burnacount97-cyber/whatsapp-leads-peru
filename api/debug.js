import { getSupabaseClient } from './_supabase.js';

export default async function handler(req, res) {
    try {
        const supabase = getSupabaseClient();

        // 1. Check connection
        const { data: tables, error: tablesError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);

        if (tablesError) {
            return res.status(500).json({ error: 'Database connection failed', details: tablesError });
        }

        // 2. Check user roles table
        const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('*')
            .limit(5);

        return res.status(200).json({
            status: 'ok',
            profiles_count: tables,
            sample_roles: roles,
            env: {
                url: process.env.VITE_SUPABASE_URL ? 'set' : 'missing',
                key: process.env.VITE_SUPABASE_ANON_KEY ? 'set' : 'missing'
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

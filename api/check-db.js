import { getSupabaseClient } from './_supabase.js';

export default async function handler(req, res) {
    try {
        const supabase = getSupabaseClient();
        const { data: roles, error } = await supabase.from('user_roles').select('*');
        const { data: profiles, error: pError } = await supabase.from('profiles').select('*');

        return res.status(200).json({
            roles: roles || [],
            profiles_count: profiles?.length || 0,
            error: error?.message,
            pError: pError?.message
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

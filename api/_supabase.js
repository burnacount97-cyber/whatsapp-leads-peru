import { createClient } from '@supabase/supabase-js';
import fetchRetry from 'fetch-retry';

export const getSupabaseClient = () => {
    const fetchWithRetry = fetchRetry(fetch);

    return createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        {
            global: {
                fetch: (url, options) => {
                    return fetchWithRetry(url, {
                        ...options,
                        retries: 3,
                        retryDelay: (attempt) => Math.pow(2, attempt) * 1000,
                        retryOn: (attempt, error, response) => {
                            if (error !== null) return true;
                            if (response && [502, 503, 504, 408].includes(response.status)) {
                                return true;
                            }
                            return false;
                        }
                    });
                }
            }
        }
    );
};

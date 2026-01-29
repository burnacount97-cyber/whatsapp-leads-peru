-- Table to store blocked IP addresses
CREATE TABLE IF NOT EXISTS public.blocked_ips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_id UUID REFERENCES public.widget_configs(id) ON DELETE CASCADE,
    ip_address TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(widget_id, ip_address)
);

-- RLS for blocked_ips
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can view all blocked ips"
    ON public.blocked_ips FOR SELECT
    USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can view blocked ips for their widgets"
    ON public.blocked_ips FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.widget_configs wc
            WHERE wc.id = blocked_ips.widget_id AND wc.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can check if an IP is blocked"
    ON public.blocked_ips FOR SELECT
    USING (true); -- Publicly readable for the API check

CREATE POLICY "API can insert blocked ips"
    ON public.blocked_ips FOR INSERT
    WITH CHECK (true); -- Allow the anonymous API to block users

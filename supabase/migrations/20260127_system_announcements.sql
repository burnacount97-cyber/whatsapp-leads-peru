-- Create system_announcements table
CREATE TABLE IF NOT EXISTS public.system_announcements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    content text NOT NULL,
    type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active announcements
CREATE POLICY "Anyone can read active announcements"
    ON public.system_announcements
    FOR SELECT
    USING (true);

-- Policy: Superadmins can do anything
CREATE POLICY "Superadmins can manage announcements"
    ON public.system_announcements
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'superadmin'
        )
    );

-- Create a single default record if none exists
INSERT INTO public.system_announcements (content, type, is_active)
VALUES ('¡Bienvenido a Lead Widget! Estamos trabajando en nuevas mejoras para tu negocio.', 'info', true)
ON CONFLICT DO NOTHING;

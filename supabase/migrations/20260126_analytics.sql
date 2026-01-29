-- Create widget_analytics table
CREATE TABLE IF NOT EXISTS public.widget_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    widget_id UUID REFERENCES public.widget_configs(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL DEFAULT 'view', -- 'view', 'chat_open', 'whatsapp_click'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.widget_analytics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (from the widget)
CREATE POLICY "Allow anonymous inserts" ON public.widget_analytics
    FOR INSERT WITH CHECK (true);

-- Allow users to view analytics for their own widgets
CREATE POLICY "Users can view own widget analytics" ON public.widget_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.widget_configs
            WHERE widget_configs.id = widget_analytics.widget_id
            AND widget_configs.user_id = auth.uid()
        )
    );

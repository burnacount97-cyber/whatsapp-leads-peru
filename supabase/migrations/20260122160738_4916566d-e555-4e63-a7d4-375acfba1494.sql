-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- The "Anyone can insert leads" and "Anyone can insert analytics" policies are intentional
-- for widget functionality - leads come from anonymous website visitors
-- These are valid use cases for public INSERT access
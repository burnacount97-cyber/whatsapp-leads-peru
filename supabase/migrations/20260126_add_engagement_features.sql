-- Migration: Add engagement features to widget_configs
ALTER TABLE public.widget_configs 
ADD COLUMN IF NOT EXISTS chat_placeholder TEXT DEFAULT 'Escribe tu mensaje...',
ADD COLUMN IF NOT EXISTS vibration_intensity TEXT DEFAULT 'soft',
ADD COLUMN IF NOT EXISTS exit_intent_title TEXT DEFAULT '¡Espera!',
ADD COLUMN IF NOT EXISTS exit_intent_description TEXT DEFAULT '¡No te vayas! Prueba nuestro asistente IA gratis.',
ADD COLUMN IF NOT EXISTS exit_intent_cta TEXT DEFAULT 'Empezar ahora',
ADD COLUMN IF NOT EXISTS teaser_messages TEXT[] DEFAULT ARRAY['¿Cómo podemos ayudarte? 👋', '¿Tienes alguna duda sobre el servicio? ✨', '¡Hola! Estamos en línea para atenderte 🚀'];

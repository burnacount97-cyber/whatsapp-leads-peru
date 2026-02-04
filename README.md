# Lead Widget — SaaS de Captura de Leads Proactiva con IA

Lead Widget es una plataforma SaaS de vanguardia que transforma sitios web estáticos en máquinas de generación de prospectos. Utilizando Inteligencia Artificial multimodelo y disparadores de comportamiento humano, el sistema pre-cualifica visitantes y los conecta directamente con el equipo de ventas vía WhatsApp.

---

## 🚀 Características de Élite

### 1. Widget de Chat Proactivo e Inteligente
*   **IA de Próxima Generación:** Soporte nativo para OpenAI (GPT-4o), Anthropic (Claude 3.5) y Google (Gemini).
*   **Triggers de Conversión:**
    *   **Retraso Temporal:** Saludo automático tras X segundos.
    *   **Scroll Profundo:** Se activa cuando el usuario lee el contenido.
    *   **Intento de Salida (Exit Intent):** Captura al usuario antes de que cierre la pestaña con ofertas irresistibles.
*   **Personalización Visual:** Control total del color de marca, mensajes de bienvenida y placeholders de chat.
*   **Iconos de Nicho (NEW):** Lanzadores estáticos SVG de alta resolución optimizados para diversos sectores (Ecommerce, Dental/Salud, Talleres, Inmobiliaria, Restaurantes y Bots de IA).
*   **Social Proof Integrado (NEW):** Carrusel rotador de testimonios reales configurables para aumentar la tasa de conversión mediante prueba social.
*   **Vibración Háptica:** Intensidad de atención configurable (Desactivado/Soft/Strong).
*   **Mensajes "Teaser":** Burbujas dinámicas que rotan mensajes para atraer la atención sin ser intrusivos.
*   **Sistema de Avisos**: Posibilidad de publicar anuncios globales (mantenimiento, novedades) desde el panel de administración hacia todos los clientes.

### 2. Dashboard de Gestión (Panel del Cliente)
*   **Módulo de Leads:** Lista detallada de prospectos con datos extraídos automáticamente por la IA (Nombre, Teléfono, Interés, etc.).
*   **Exportación Inteligente:** Descarga de leads en formato CSV optimizado con sistema de escape para compatibilidad total con CRMs.
*   **Analytics Hub:** Visualización de tráfico (Visitas) vs. Conversiones (Leads) con cálculo automático de efectividad.
*   **Configuración de IA:** Panel para editar el "Prompt del Sistema", temperatura de respuesta y longitud de tokens para cada modelo.

### 3. Sistema de Seguridad y Ahorro de Créditos (NEW)
*   **Cortafuegos de IA:** Detección autónoma de intentos de jailbreak, spam o insultos. El bot finaliza la charla para proteger la integridad del sistema.
*   **Pestaña de Seguridad:** Módulo dedicado para gestionar IPs bloqueadas.
*   **Bloqueo Automático (Ban):** Si un usuario intenta abusar del sistema, su IP es baneada permanentemente, evitando consumos innecesarios de API de OpenAI/Anthropic.
*   **Control de Desbloqueo:** Los clientes pueden ver el motivo del bloqueo (ej: "Manipulación de IA") y rehabilitar IPs manualmente si lo desean.

### 4. Admin Master Panel (Panel de Control Global)
*   **Gestión de Clientes:** Vista global de todos los usuarios registrados.
*   **Control de Servicio:** Capacidad para pausar o activar cuentas instantáneamente (e.j. por falta de pago).
*   **Métricas Globales:** Control total de la salud de la plataforma SaaS.

### 5. Facturación y Suscripciones (Trial System)
*   **Trial Automático:** Sistema de 3 días de prueba gratuita activado al registro.
*   **Flujo de Pago Local:** Módulo para que los clientes suban capturas de pantalla de pagos por Yape/Plin/Transferencia.
*   **Validación Administrativa:** Los estados de suscripción (Trial, Activo, Suspendido) se actualizan tras la verificación del comprobante.

---

## 🛠️ Stack Tecnológico
*   **Frontend:** React 18, TypeScript, Tailwind CSS, Vite.
*   **Componentes:** shadcn/ui (Radix UI) para una estética premium.
*   **Backend:** Vercel Edge & Serverless Functions (Node.js).
*   **Base de Datos:** PostgreSQL con **Supabase**.
*   **Autenticación:** Supabase Auth (con hooks para roles).
*   **IA:** Integración vía SDK oficial de OpenAI y fetch optimizado para otros proveedores.

---

## 📦 Estructura de Archivos Clave

*   `api/chat.js`: Lógica central de la IA, seguridad y detección de leads.
*   `api/w/[widgetId].js`: Script dinámico que inyecta el widget en cualquier sitio web mediante una sola línea de código.
*   `src/pages/Dashboard.tsx`: El corazón de la gestión del cliente (Leads, Config, Seguridad).
*   `src/pages/SuperAdmin.tsx`: Panel exclusivo de administración de la plataforma.
*   `public/widget-embed.js`: Loader ultraligero que permite incrustar el sistema en sitios externos. Incluye lógica de limpieza de memoria (Memory Management) para evitar fugas de recursos y garantizar estabilidad.

---

## 🔒 Seguridad y Mejores Prácticas
*   **CORS Strict:** La API solo responde a dominios autorizados.
*   **IP Logging:** Rastreo de origen para prevención de spam.
*   **Database RLS:** Políticas de Row Level Security en Supabase para que ningún cliente pueda ver los datos de otro.
*   **Secret Management:** Claves de API gestionadas mediante variables de entorno en Vercel, nunca expuestas en el cliente.

---

### 🇵🇪 Diseñado para el mercado peruano y latinoamericano. 
*Eficiencia, IA y WhatsApp en una sola solución.*

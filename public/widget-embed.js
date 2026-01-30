(function () {
  'use strict';

  // Default Configuration
  const defaultConfig = {
    primaryColor: '#00C185',
    businessName: 'LeadWidget',
    welcomeMessage: '👋 ¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
    whatsappDestination: '',
    template: 'general',
    chatPlaceholder: 'Escribe tu consulta aquí...',
    quickReplies: ['¿Cómo funciona?', 'Quiero información', 'Ver precios'],
    teaserMessages: ['¿Cómo podemos ayudarte? 👋', '¿Tienes alguna duda? ✨', '¡Estamos en línea! 🚀'],
    vibrationIntensity: 'soft',
    triggerDelay: 5,
    exitIntentEnabled: true,
    exitIntentTitle: '¡Espera!',
    exitIntentDescription: '¿Tienes alguna pregunta antes de irte?',
    exitIntentCta: 'Chatear Ahora',
    projectId: 'whatsapp-leads-peru',
    apiKey: 'AIzaSyDoUHZtRvgEwhEUhZj6x4xEZvVmxliMCJo'
  };

  // State
  let config = { ...defaultConfig };
  let messages = [];
  let isLoading = false;
  let isOpen = false;
  let hasBeenClosedOnce = false;
  let activeTeaser = '';
  let teaserInterval = null;
  let exitIntentShown = false;
  let configRefreshInterval = null;
  let vibrationInterval = null;

  // Get widget config from Firestore
  async function getWidgetConfig(clientId) {
    if (!clientId) return null;

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${defaultConfig.projectId}/databases/(default)/documents:runQuery?key=${defaultConfig.apiKey}`;

      const query = {
        structuredQuery: {
          from: [{ collectionId: "widget_configs" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "user_id" },
              op: "EQUAL",
              value: { stringValue: clientId }
            }
          },
          limit: 1
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      });

      const data = await response.json();

      if (data && data[0] && data[0].document) {
        const fields = data[0].document.fields;

        // Parse quick replies (array or string)
        let quickReplies = defaultConfig.quickReplies;
        if (fields.quick_replies?.arrayValue?.values) {
          quickReplies = fields.quick_replies.arrayValue.values.map(v => v.stringValue);
        } else if (fields.quick_replies?.stringValue) {
          quickReplies = fields.quick_replies.stringValue.split('\n').filter(r => r.trim());
        }

        // Parse teaser messages
        let teaserMessages = defaultConfig.teaserMessages;
        if (fields.teaser_messages?.arrayValue?.values) {
          teaserMessages = fields.teaser_messages.arrayValue.values.map(v => v.stringValue);
        } else if (fields.teaser_messages?.stringValue) {
          teaserMessages = fields.teaser_messages.stringValue.split('\n').filter(r => r.trim());
        }

        // Extract AI configuration from widget_configs (since profiles has restricted access)
        const aiApiKey = fields.ai_api_key?.stringValue || '';
        console.log('LeadWidget: AI API Key found in widget_configs:', aiApiKey ? 'Yes (length: ' + aiApiKey.length + ')' : 'No');

        return {
          primaryColor: fields.primary_color?.stringValue || defaultConfig.primaryColor,
          businessName: fields.business_name?.stringValue || defaultConfig.businessName,
          welcomeMessage: fields.welcome_message?.stringValue || defaultConfig.welcomeMessage,
          whatsappDestination: fields.whatsapp_destination?.stringValue || '',
          template: fields.template?.stringValue || 'general',
          chatPlaceholder: fields.chat_placeholder?.stringValue || defaultConfig.chatPlaceholder,
          quickReplies: quickReplies,
          teaserMessages: teaserMessages,
          vibrationIntensity: fields.vibration_intensity?.stringValue || 'soft',
          triggerDelay: parseInt(fields.trigger_delay?.integerValue) || 5,
          exitIntentEnabled: fields.trigger_exit_intent?.booleanValue !== false,
          exitIntentTitle: fields.exit_intent_title?.stringValue || defaultConfig.exitIntentTitle,
          exitIntentDescription: fields.exit_intent_description?.stringValue || defaultConfig.exitIntentDescription,
          exitIntentCta: fields.exit_intent_cta?.stringValue || defaultConfig.exitIntentCta,
          clientId: clientId,
          // AI Configuration (now stored in widget_configs for public access)
          ai_enabled: fields.ai_enabled?.booleanValue === true,
          ai_provider: fields.ai_provider?.stringValue || 'openai',
          ai_api_key: aiApiKey,
          ai_model: fields.ai_model?.stringValue || 'gpt-4o-mini',
          ai_system_prompt: fields.ai_system_prompt?.stringValue || '',
          business_description: fields.business_description?.stringValue || '',
          ai_temperature: parseFloat(fields.ai_temperature?.doubleValue || fields.ai_temperature?.integerValue || 0.7),
          ai_max_tokens: parseInt(fields.ai_max_tokens?.integerValue || fields.ai_max_tokens?.stringValue) || 500
        };
      }
    } catch (e) {
      console.error('LeadWidget: Error fetching config', e);
    }
    return null;
  }

  // Send message to AI - now uses config object directly
  async function sendToAI(userMessage) {
    if (!config.ai_api_key) {
      console.log('LeadWidget: No AI API key available in config');
      return null; // Return null to indicate no AI
    }

    try {
      let apiUrl, headers, body;

      if (config.ai_provider === 'openai') {
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.ai_api_key}`
        };

        const conversationHistory = messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }));

        let systemContent = config.ai_system_prompt ||
          `Eres un asistente de ventas experto para ${config.businessName}. Tu objetivo es calificar al cliente y obtener sus datos clave para cerrar la venta.`;

        const dataCollectionRules = `
        REGLAS DE RECOLECCIÓN DE DATOS (CRÍTICO):
        1. Para cerrar una venta/cita, NECESITAS MÍNIMO: Nombre, Producto/Servicio Exacto, Fecha/Hora, y Dirección/Lugar (si aplica).
        2. Si diste un precio, asegúrate de que el cliente esté de acuerdo.
        3. NO TRANSFIERAS si faltan datos clave (especialmente dirección o fecha). Pregunta lo que falte amablemente.
        4. Solo cuando tengas TODO COMPLETO, haz el resumen y pide confirmación para ir a WhatsApp.
        `;

        const redirectInstruction = `
        IMPORTANTE - PROTOCOLO DE TRANSFERENCIA FINAL:
        SOLO cuando el cliente responda AFIRMATIVAMENTE (Sí, Ok, Claro) a tu pregunta de confirmación:
        1. Di algo breve como "Excelente, te estoy transfiriendo ahora...".
        2. EJECUTA OBLIGATORIAMENTE este comando al final, SUSTITUYENDO los datos:

        [WHATSAPP_REDIRECT: Hola, soy {NOMBRE_REAL} y deseo {RESUMEN_PEDIDO}]
        
        ADVERTENCIA: NO escribas "(Nombre)" ni "(tu nombre)". Debes poner el nombre REAL que te dio el cliente.
        
        MAL: [WHATSAPP_REDIRECT: Hola, soy (Nombre) y quiero torta]
        BIEN: [WHATSAPP_REDIRECT: Hola, soy Juan y quiero torta de chocolate]
        `;

        if (config.business_description) {
          systemContent = `CONTEXTO DEL NEGOCIO:\n${config.business_description}\n\nINSTRUCCIONES:\n${systemContent}\n\n${dataCollectionRules}\n\n${redirectInstruction}`;
        } else {
          systemContent = `${systemContent}\n\n${dataCollectionRules}\n\n${redirectInstruction}`;
        }

        body = JSON.stringify({
          model: config.ai_model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemContent },
            ...conversationHistory,
            { role: 'user', content: userMessage }
          ],
          temperature: config.ai_temperature || 0.7,
          max_tokens: parseInt(config.ai_max_tokens) || 500
        });
      } else if (config.ai_provider === 'anthropic') {
        apiUrl = 'https://api.anthropic.com/v1/messages';
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': config.ai_api_key,
          'anthropic-version': '2023-06-01'
        };
        body = JSON.stringify({
          model: config.ai_model || 'claude-3-haiku-20240307',
          max_tokens: parseInt(config.ai_max_tokens) || 500,

          system: (config.business_description
            ? `CONTEXTO DEL NEGOCIO:\n${config.business_description}\n\nINSTRUCCIONES:\n${config.ai_system_prompt || `Eres un asistente de ventas experto para ${config.businessName}.`}`
            : (config.ai_system_prompt || `Eres un asistente de ventas experto para ${config.businessName}.`))
            + `\n\nREGLAS: 1. Pide Nombre, Dirección, Fecha y Detalles. 2. Resume y PREGUNTA si quiere pasar a WhatsApp. 3. SOLO si dice SÍ, y tienes TODOS los datos, usa el comando: [WHATSAPP_REDIRECT: Hola, soy (Nombre) y quiero (Resumen Completo)].`,
          messages: [{ role: 'user', content: userMessage }]
        });
      } else {
        return "Proveedor de IA no soportado.";
      }

      console.log('LeadWidget: Sending to AI...');
      const response = await fetch(apiUrl, { method: 'POST', headers, body });
      const data = await response.json();
      console.log('LeadWidget: AI response received');

      if (data.error) {
        console.error('LeadWidget: AI API Error', data.error);
        return `Error: ${data.error.message || 'Error de la API'}`;
      }

      if (config.ai_provider === 'openai') {
        return data.choices?.[0]?.message?.content || "No pude procesar tu mensaje.";
      } else if (config.ai_provider === 'anthropic') {
        return data.content?.[0]?.text || "No pude procesar tu mensaje.";
      }
    } catch (error) {
      console.error('LeadWidget: AI Error', error);
      return "Hubo un error al procesar tu mensaje. ¿Te gustaría contactarnos por WhatsApp?";
    }
  }

  // Save lead to Firestore
  async function saveLeadToFirestore(name, phone, interest) {
    if (!config.clientId || config.clientId === 'demo_client_id') return;

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/leads?key=${config.apiKey}`;
      const payload = {
        fields: {
          client_id: { stringValue: config.clientId },
          name: { stringValue: name || 'Visitante' },
          phone: { stringValue: phone || 'Pendiente (Click WA)' },
          interest: { stringValue: interest },
          source: { stringValue: 'website_widget' },
          status: { stringValue: 'new' },
          created_at: { timestampValue: new Date().toISOString() }
        }
      };
      fetch(url, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
    } catch (error) { console.error('LeadWidget: Error saving lead', error); }
  }

  // Save Visit to Firestore (Lightweight)
  async function saveVisitToFirestore() {
    if (!config.clientId || config.clientId === 'demo_client_id') return;
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/visits?key=${config.apiKey}`;
      const payload = {
        fields: {
          client_id: { stringValue: config.clientId },
          source: { stringValue: 'website_widget' },
          timestamp: { timestampValue: new Date().toISOString() }
        }
      };
      fetch(url, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
    } catch (error) { console.error('LeadWidget: Error logging visit', error); }
  }

  // Adjust color brightness
  function adjustColor(color, amount) {
    if (!color) return '#000000';
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  // Render the widget
  function renderWidget() {
    // Remove existing if present
    const existing = document.getElementById('lw-root');
    if (existing) existing.remove();

    const styles = `
      #lw-root * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      
      /* Button */
      #lw-button { 
        position: fixed; bottom: 20px; right: 20px; z-index: 999998;
        width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer; 
        display: flex; align-items: center; justify-content: center; 
        transition: transform 0.2s, box-shadow 0.2s; 
        box-shadow: 0 4px 20px rgba(0,0,0,0.25); 
        background: linear-gradient(135deg, ${config.primaryColor} 0%, ${adjustColor(config.primaryColor, -30)} 100%);
      }
      #lw-button:hover { transform: scale(1.08); }
      
      /* Vibration animations */
      @keyframes lw-vibrate-soft { 
        0%, 100% { transform: scale(1); } 
        50% { transform: scale(1.08); } 
      }
      @keyframes lw-vibrate-strong { 
        0%, 100% { transform: translateX(0) scale(1); } 
        20% { transform: translateX(-3px) scale(1.02); } 
        40% { transform: translateX(3px) scale(1.02); }
        60% { transform: translateX(-3px) scale(1.02); }
        80% { transform: translateX(3px) scale(1.02); }
      }
      #lw-button.lw-vibrating-soft { animation: lw-vibrate-soft 1.5s ease-in-out infinite; }
      #lw-button.lw-vibrating-strong { animation: lw-vibrate-strong 0.6s ease-in-out infinite; }

      /* Teaser bubble */
      #lw-teaser {
        position: fixed; bottom: 90px; right: 20px; z-index: 999997;
        background: white; padding: 12px 16px; border-radius: 16px 16px 4px 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15); max-width: 250px;
        font-size: 14px; color: #1e293b; font-weight: 500;
        animation: lw-teaser-in 0.4s ease-out;
        cursor: pointer;
        display: none;
      }
      @keyframes lw-teaser-in { from { opacity: 0; transform: translateY(10px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
      #lw-teaser-close { position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; border-radius: 50%; background: #64748b; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }

      /* Panel */
      #lw-panel { 
        position: fixed; bottom: 16px; right: 16px; left: 16px; z-index: 999999;
        width: auto; max-width: 360px; height: 70vh; max-height: 550px;
        background: white; border-radius: 24px; 
        box-shadow: 0 8px 40px rgba(0,0,0,0.2); 
        display: none; flex-direction: column; overflow: hidden; 
        animation: lw-slideUp 0.3s ease-out;
      }
      @media (min-width: 640px) { 
        #lw-panel { left: auto; width: 360px; height: 500px; bottom: 20px; right: 20px; } 
      }
      @keyframes lw-slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

      /* Header */
      #lw-header { padding: 16px; display: flex; align-items: center; gap: 12px; color: white; background: ${config.primaryColor}; position: relative; }
      #lw-avatar { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; }
      #lw-avatar::after { content: ''; position: absolute; bottom: 2px; right: 2px; width: 10px; height: 10px; background: #22c55e; border-radius: 50%; border: 2px solid ${config.primaryColor}; }
      #lw-close-btn { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.2); border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; transition: background 0.2s; }
      #lw-close-btn:hover { background: rgba(255,255,255,0.3); }

      /* Messages */
      #lw-messages { flex: 1; overflow-y: auto; padding: 16px; background: #f8fafc; display: flex; flex-direction: column; gap: 12px; }
      .lw-msg { max-width: 85%; padding: 12px 16px; border-radius: 18px; font-size: 14px; line-height: 1.5; animation: lw-fadeIn 0.3s ease-out; word-wrap: break-word; white-space: pre-wrap; }
      @keyframes lw-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .lw-msg-assistant { background: white; color: #1e293b; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; align-self: flex-start; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
      .lw-msg-user { background: ${config.primaryColor}; color: white; border-bottom-right-radius: 4px; align-self: flex-end; }
      .lw-msg-system { background: #f1f5f9; color: #64748b; font-size: 12px; text-align: center; align-self: center; border-radius: 12px; padding: 8px 16px; }

      /* Typing indicator */
      #lw-typing { display: flex; gap: 4px; padding: 12px 16px; background: white; border-radius: 18px; border: 1px solid #e2e8f0; align-self: flex-start; }
      .lw-dot { width: 6px; height: 6px; border-radius: 50%; background: ${config.primaryColor}; animation: lw-bounce 1.4s infinite ease-in-out both; }
      .lw-dot:nth-child(1) { animation-delay: 0s; }
      .lw-dot:nth-child(2) { animation-delay: 0.16s; }
      .lw-dot:nth-child(3) { animation-delay: 0.32s; }
      @keyframes lw-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

      /* Input area */
      #lw-input-area { padding: 12px; background: white; border-top: 1px solid #e2e8f0; }
      #lw-quick-replies { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
      .lw-quick-btn { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 20px; font-size: 12px; cursor: pointer; transition: all 0.2s; color: #475569; }
      .lw-quick-btn:hover { background: ${config.primaryColor}15; color: ${config.primaryColor}; border-color: ${config.primaryColor}; }
      #lw-form { display: flex; gap: 8px; }
      #lw-input { flex: 1; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 14px; background: #f8fafc; outline: none; color: #1e293b; }
      #lw-input:focus { border-color: ${config.primaryColor}; box-shadow: 0 0 0 3px ${config.primaryColor}20; }
      #lw-send { width: 48px; height: 48px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; background: ${config.primaryColor}; transition: opacity 0.2s; flex-shrink: 0; }
      #lw-send:hover { opacity: 0.9; }
      #lw-send:disabled { opacity: 0.5; cursor: not-allowed; }
      #lw-footer { text-align: center; padding: 8px; font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

      /* WhatsApp button */
      #lw-wa-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; background: #25D366; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; margin-top: 8px; font-size: 14px; }
      #lw-wa-btn:hover { background: #128C7E; }

      /* Mobile close button - Only on small screens */
      #lw-close-mobile { 
        position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 1000000;
        width: 56px; height: 56px; border-radius: 50%; background: #dc2626; border: 4px solid white; 
        color: white; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.3); 
        display: none; align-items: center; justify-content: center;
      }
      @media (max-width: 639px) { 
        #lw-close-mobile.visible { display: flex; }
        #lw-panel.open { padding-bottom: 70px; }
      }
      @media (min-width: 640px) {
        #lw-close-mobile { display: none !important; }
      }

      /* Exit intent popup */
      #lw-exit-overlay { 
        position: fixed; inset: 0; 
        background: rgba(15, 23, 42, 0.4); 
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 1000001; 
        display: none; align-items: center; justify-content: center; padding: 24px;
        animation: lw-fadeMask 0.4s ease-out;
      }
      @keyframes lw-fadeMask { from { opacity: 0; } to { opacity: 1; } }
      
      #lw-exit-popup { 
        background: white; border-radius: 32px; padding: 40px 32px; max-width: 420px; width: 100%; 
        text-align: center; 
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(226, 232, 240, 0.8);
        animation: lw-popReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        overflow: hidden;
      }
      @keyframes lw-popReveal { 
        from { opacity: 0; transform: scale(0.9) translateY(20px); } 
        to { opacity: 1; transform: scale(1) translateY(0); } 
      }
      
      #lw-exit-icon { 
        width: 80px; height: 80px; 
        background: ${config.primaryColor}10; 
        color: ${config.primaryColor};
        border-radius: 24px; display: flex; align-items: center; justify-content: center; 
        margin: 0 auto 24px;
        transform: rotate(-10deg);
      }
      #lw-exit-title { 
        font-size: 28px; font-weight: 800; color: #0f172a; 
        margin-bottom: 12px; line-height: 1.2;
        letter-spacing: -0.02em;
      }
      #lw-exit-desc { 
        font-size: 16px; color: #475569; margin-bottom: 32px; 
        line-height: 1.6;
      }
      #lw-exit-cta { 
        width: 100%; padding: 16px; 
        background: ${config.primaryColor}; color: white; border: none; 
        border-radius: 16px; font-weight: 700; cursor: pointer; font-size: 16px;
        box-shadow: 0 10px 15px -3px ${config.primaryColor}40;
        transition: all 0.2s;
      }
      #lw-exit-cta:hover { transform: translateY(-2px); box-shadow: 0 20px 25px -5px ${config.primaryColor}40; }
      #lw-exit-close { 
        background: none; border: none; color: #94a3b8; font-size: 14px; 
        font-weight: 500; cursor: pointer; margin-top: 20px; transition: color 0.2s;
      }
      #lw-exit-close:hover { color: #64748b; }
    `;

    const html = `
      <div id="lw-root">
        <style>${styles}</style>
        
        <!-- Main Button -->
        <button id="lw-button">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>

        <!-- Teaser Bubble -->
        <div id="lw-teaser">
          <span id="lw-teaser-text"></span>
          <button id="lw-teaser-close">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Chat Panel -->
        <div id="lw-panel">
          <div id="lw-header">
            <div id="lw-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="3"></circle>
              </svg>
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px;">${config.businessName}</div>
              <div style="font-size: 11px; opacity: 0.9;">Responde al instante con IA</div>
            </div>
            <!-- Close button in header -->
            <button id="lw-close-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div id="lw-messages"></div>

          <div id="lw-input-area">
            <div id="lw-quick-replies"></div>
            <form id="lw-form">
              <input type="text" id="lw-input" placeholder="${config.chatPlaceholder}" autocomplete="off">
              <button type="submit" id="lw-send">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
            <div id="lw-footer">• Atención 24/7 con Inteligencia Artificial •</div>
          </div>
        </div>

        <!-- Mobile Close Button -->
        <button id="lw-close-mobile">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Exit Intent Popup -->
        <div id="lw-exit-overlay">
          <div id="lw-exit-popup">
            <div id="lw-exit-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${config.primaryColor}" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h2 id="lw-exit-title">${config.exitIntentTitle}</h2>
            <p id="lw-exit-desc">${config.exitIntentDescription}</p>
            <button id="lw-exit-cta">${config.exitIntentCta}</button>
            <button id="lw-exit-close">No, gracias</button>
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    // Get elements
    const button = document.getElementById('lw-button');
    const panel = document.getElementById('lw-panel');
    const messagesContainer = document.getElementById('lw-messages');
    const form = document.getElementById('lw-form');
    const input = document.getElementById('lw-input');
    const quickRepliesContainer = document.getElementById('lw-quick-replies');
    const closeBtn = document.getElementById('lw-close-btn');
    const closeMobile = document.getElementById('lw-close-mobile');
    const teaser = document.getElementById('lw-teaser');
    const teaserText = document.getElementById('lw-teaser-text');
    const teaserClose = document.getElementById('lw-teaser-close');
    const exitOverlay = document.getElementById('lw-exit-overlay');
    const exitCta = document.getElementById('lw-exit-cta');
    const exitClose = document.getElementById('lw-exit-close');

    // Start vibration animation
    function startVibration() {
      if (config.vibrationIntensity === 'none' || isOpen) return;

      const vibClass = config.vibrationIntensity === 'strong' ? 'lw-vibrating-strong' : 'lw-vibrating-soft';
      button.classList.add(vibClass);
    }

    function stopVibration() {
      button.classList.remove('lw-vibrating-soft', 'lw-vibrating-strong');
    }

    // Render quick replies
    function renderQuickReplies() {
      if (messages.length > 2) {
        quickRepliesContainer.style.display = 'none';
        return;
      }
      quickRepliesContainer.style.display = 'flex';
      quickRepliesContainer.innerHTML = config.quickReplies.map(text =>
        `<button type="button" class="lw-quick-btn">${text}</button>`
      ).join('');

      quickRepliesContainer.querySelectorAll('.lw-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => handleSendMessage(btn.textContent));
      });
    }

    // Render messages
    function renderMessages() {
      let html = messages.map(m => {
        if (m.role === 'system') {
          return `<div class="lw-msg lw-msg-system">${m.content}</div>`;
        }
        return `<div class="lw-msg lw-msg-${m.role}">${m.content}</div>`;
      }).join('');

      if (isLoading) {
        html += `
          <div id="lw-typing">
            <div class="lw-dot"></div>
            <div class="lw-dot"></div>
            <div class="lw-dot"></div>
          </div>
        `;
      }

      messagesContainer.innerHTML = html;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      renderQuickReplies();
    }

    // Handle send message
    async function handleSendMessage(text) {
      const userMessage = text || input.value.trim();
      if (!userMessage || isLoading) return;

      messages.push({ role: 'user', content: userMessage });
      input.value = '';
      isLoading = true;
      renderMessages();

      // Save visit (First interaction only) for Analytics
      if (messages.filter(m => m.role === 'user').length === 1) {
        saveVisitToFirestore();
      }

      // Get AI response
      let response;
      let showWhatsAppNow = false;

      response = await sendToAI(userMessage);

      let waRedirectData = null;

      if (response === null) {
        // No AI configured - show helpful message
        showWhatsAppNow = true;
        if (config.whatsappDestination) {
          response = `⚠️ El asistente de IA aún no está configurado por el administrador.\n\n¡Pero no te preocupes! Puedes contactarnos directamente por WhatsApp para una atención inmediata. 👇`;
        } else {
          response = `⚠️ El asistente de IA aún no está configurado.\n\nEl administrador debe configurar su API Key de OpenAI o Anthropic en el panel de control para activar las respuestas automáticas.`;
        }
      } else {
        // Check for WhatsApp redirect command from AI (Robust Regex)
        const redirectMatch = response.match(/\[\s*WHATSAPP_REDIRECT\s*:\s*([\s\S]*?)\]/i);

        if (redirectMatch) {
          waRedirectData = redirectMatch[1].trim().replace(/^["']|["']$/g, '');
          // Remove the command from the visible response
          response = response.replace(redirectMatch[0], '').trim();
          // If response became empty, provide a default text
          if (!response) response = "¡Excelente! Te paso con un asesor en WhatsApp para confirmar los detalles.";
        }
      }

      isLoading = false;
      messages.push({ role: 'assistant', content: response });

      // Handle Auto-Redirect & Save Lead
      if (waRedirectData && config.whatsappDestination) {
        console.log('LeadWidget: Auto-redirecting to WhatsApp with data:', waRedirectData);

        // Save Qualified Lead to Firestore
        let leadName = 'Lead Calificado';
        // Try to extract name from the summary text (e.g. "Soy Juan...")
        const nameMatch = waRedirectData.match(/soy\s+([A-Za-zÁ-Úá-úñÑ]+)/i) || waRedirectData.match(/nombre\s+es\s+([A-Za-zÁ-Úá-úñÑ]+)/i) || waRedirectData.match(/Cliente\s+([A-Za-zÁ-Úá-úñÑ]+)/i);
        if (nameMatch) {
          leadName = nameMatch[1];
        }

        // Save with extracted info
        // Use 'Clic en WhatsApp' as marker since we don't have user's phone yet (they are just going to WA)
        saveLeadToFirestore(leadName, 'Clic en WhatsApp', waRedirectData);

        setTimeout(() => {
          const cleanDest = config.whatsappDestination.replace(/\D/g, '');
          const encodedMsg = encodeURIComponent(waRedirectData);
          window.open(`https://wa.me/${cleanDest}?text=${encodedMsg}`, '_blank');
        }, 2000); // 2s delay for better UX
      }

      // Show WhatsApp button logic REMOVED as per user request (Auto-redirect only)
      // If AI is not configured, the user will see the error message set above.


      renderMessages();
    }

    // Toggle panel
    function togglePanel(show) {
      isOpen = show;
      panel.style.display = show ? 'flex' : 'none';
      panel.classList.toggle('open', show);
      closeMobile.classList.toggle('visible', show);
      button.style.display = show ? 'none' : 'flex';
      teaser.style.display = 'none';

      if (show) {
        stopVibration();
        stopTeaserCycle();
        if (messages.length === 0) {
          messages.push({ role: 'assistant', content: config.welcomeMessage });
          renderMessages();
        }
      } else {
        hasBeenClosedOnce = true;
        startVibration();
        // Start teaser cycle after a short delay
        setTimeout(() => {
          startTeaserCycle();
        }, 2000);
      }
    }

    // Teaser cycle
    function startTeaserCycle() {
      if (isOpen || !config.teaserMessages || config.teaserMessages.length === 0) {
        console.log('LeadWidget: Teaser cycle not started', { isOpen, teaserCount: config.teaserMessages?.length });
        return;
      }

      stopTeaserCycle();
      let index = Math.floor(Math.random() * config.teaserMessages.length);

      const showTeaser = () => {
        if (isOpen) return;
        activeTeaser = config.teaserMessages[index];
        teaserText.textContent = activeTeaser;
        teaser.style.display = 'block';
        console.log('LeadWidget: Showing teaser:', activeTeaser);
        index = (index + 1) % config.teaserMessages.length;
      };

      showTeaser();
      teaserInterval = setInterval(showTeaser, 8000);
    }

    function stopTeaserCycle() {
      if (teaserInterval) {
        clearInterval(teaserInterval);
        teaserInterval = null;
      }
      teaser.style.display = 'none';
    }

    // Exit intent handler
    function handleExitIntent(e) {
      // Robust check for exit intent (mouse leaving viewport at the top)
      const isExit = e.clientY <= 5 || (e.relatedTarget === null && e.clientY < 10);

      if (isExit && !exitIntentShown && !isOpen && config.exitIntentEnabled) {
        console.log('LeadWidget: Exit intent detected');
        exitIntentShown = true;
        exitOverlay.style.display = 'flex';
      }
    }

    // Event listeners
    button.addEventListener('click', () => togglePanel(true));
    closeBtn.addEventListener('click', () => togglePanel(false));
    closeMobile.addEventListener('click', () => togglePanel(false));
    teaser.addEventListener('click', () => togglePanel(true));
    teaserClose.addEventListener('click', (e) => { e.stopPropagation(); teaser.style.display = 'none'; });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSendMessage();
    });

    exitCta.addEventListener('click', () => {
      exitOverlay.style.display = 'none';
      togglePanel(true);
    });
    exitClose.addEventListener('click', () => { exitOverlay.style.display = 'none'; });
    exitOverlay.addEventListener('click', (e) => { if (e.target === exitOverlay) exitOverlay.style.display = 'none'; });

    // Exit intent (desktop only) - Use both mouseout and mouseleave for better coverage
    document.addEventListener('mouseout', handleExitIntent);
    document.addEventListener('mouseleave', handleExitIntent);

    // Start vibration immediately
    startVibration();

    // Auto-open after delay
    setTimeout(() => {
      if (!isOpen) togglePanel(true);
    }, (config.triggerDelay || 5) * 1000);

    // Render initial
    renderMessages();
  }

  // Refresh config periodically (every 30 seconds)
  async function refreshConfig() {
    const newConfig = await getWidgetConfig(config.clientId);
    if (newConfig) {
      // Check for visual changes that require re-render
      const visualKeys = [
        'primaryColor', 'businessName', 'welcomeMessage',
        'whatsappDestination', 'quickReplies', 'teaserMessages',
        'chatPlaceholder', 'exitIntentTitle', 'exitIntentDescription', 'exitIntentCta',
        'vibrationIntensity'
      ];

      let hasVisualChanges = false;
      for (const key of visualKeys) {
        if (JSON.stringify(newConfig[key]) !== JSON.stringify(config[key])) {
          hasVisualChanges = true;
          break;
        }
      }

      // Check for functional changes (AI, etc) to log them
      const hasFunctionalChanges = JSON.stringify(newConfig) !== JSON.stringify(config);

      // Always update config state (for AI parameters, logic, etc)
      if (hasFunctionalChanges) {
        Object.assign(config, newConfig);
        console.log('LeadWidget: Config updated in background');
      }

      // Only re-render if visual changes occurred AND widget is closed
      // If widget is open, we avoid re-rendering to not disrupt the user
      if (hasVisualChanges) {
        if (!isOpen) {
          console.log('LeadWidget: Visual changes detected, re-rendering...');
          renderWidget();
        } else {
          console.log('LeadWidget: Visual changes detected but widget is open. Skipping re-render.');
        }
      }
    }
  }

  // Main Initialization
  async function initialize() {
    const clientId = window.LEADWIDGET_CLIENT_ID || window.LEADWIDGET_CONFIG?.clientId;

    console.log('LeadWidget: Initializing with client ID:', clientId);

    if (clientId) {
      config.clientId = clientId;
      config.projectId = defaultConfig.projectId;
      config.apiKey = defaultConfig.apiKey;

      // Load widget config
      const remoteConfig = await getWidgetConfig(clientId);
      if (remoteConfig) {
        Object.assign(config, remoteConfig);
        console.log('LeadWidget: Loaded configuration for', config.businessName);
        console.log('LeadWidget: Teaser messages:', config.teaserMessages);
        console.log('LeadWidget: Vibration:', config.vibrationIntensity);
        console.log('LeadWidget: AI Config loaded from widget_configs, API key present:', !!config.ai_api_key);
      }
    }

    renderWidget();

    // Refresh config every 30 seconds for dynamic updates
    configRefreshInterval = setInterval(refreshConfig, 30000);
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();

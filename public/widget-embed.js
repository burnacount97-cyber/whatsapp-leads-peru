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
  let aiConfig = null;
  let messages = [];
  let isLoading = false;
  let isOpen = false;
  let hasBeenClosedOnce = false;
  let activeTeaser = '';
  let teaserInterval = null;
  let exitIntentShown = false;
  let configRefreshInterval = null;

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
          clientId: clientId
        };
      }
    } catch (e) {
      console.error('LeadWidget: Error fetching config', e);
    }
    return null;
  }

  // Get AI config from profile
  async function getAIConfig(clientId) {
    if (!clientId) return null;

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${defaultConfig.projectId}/databases/(default)/documents/profiles/${clientId}?key=${defaultConfig.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.fields) {
        return {
          ai_enabled: data.fields.ai_enabled?.booleanValue || false,
          ai_provider: data.fields.ai_provider?.stringValue || 'openai',
          ai_api_key: data.fields.ai_api_key?.stringValue || '',
          ai_model: data.fields.ai_model?.stringValue || 'gpt-4o-mini',
          ai_system_prompt: data.fields.ai_system_prompt?.stringValue || '',
          ai_temperature: data.fields.ai_temperature?.doubleValue || 0.7,
          ai_max_tokens: parseInt(data.fields.ai_max_tokens?.integerValue) || 500
        };
      }
    } catch (e) {
      console.error('LeadWidget: Error fetching AI config', e);
    }
    return null;
  }

  // Send message to AI
  async function sendToAI(userMessage) {
    if (!aiConfig || !aiConfig.ai_api_key) {
      return "Lo siento, el asistente no está configurado correctamente. Por favor, contacta por WhatsApp.";
    }

    try {
      let apiUrl, headers, body;

      if (aiConfig.ai_provider === 'openai') {
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.ai_api_key}`
        };

        const conversationHistory = messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }));

        body = JSON.stringify({
          model: aiConfig.ai_model || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: aiConfig.ai_system_prompt || `Eres un asistente de ventas amable para ${config.businessName}. Tu objetivo es ayudar a los clientes y capturar su información de contacto. Sé breve, amigable y útil. Si el cliente muestra interés, invítalo a continuar la conversación por WhatsApp.`
            },
            ...conversationHistory,
            { role: 'user', content: userMessage }
          ],
          temperature: aiConfig.ai_temperature || 0.7,
          max_tokens: parseInt(aiConfig.ai_max_tokens) || 500
        });
      } else if (aiConfig.ai_provider === 'anthropic') {
        apiUrl = 'https://api.anthropic.com/v1/messages';
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': aiConfig.ai_api_key,
          'anthropic-version': '2023-06-01'
        };
        body = JSON.stringify({
          model: aiConfig.ai_model || 'claude-3-haiku-20240307',
          max_tokens: parseInt(aiConfig.ai_max_tokens) || 500,
          system: aiConfig.ai_system_prompt || `Eres un asistente de ventas amable para ${config.businessName}.`,
          messages: [{ role: 'user', content: userMessage }]
        });
      } else {
        return "Proveedor de IA no soportado.";
      }

      const response = await fetch(apiUrl, { method: 'POST', headers, body });
      const data = await response.json();

      if (aiConfig.ai_provider === 'openai') {
        return data.choices?.[0]?.message?.content || "No pude procesar tu mensaje.";
      } else if (aiConfig.ai_provider === 'anthropic') {
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

  // Adjust color brightness
  function adjustColor(color, amount) {
    if (!color) return '#000000';
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  // Get vibration animation
  function getVibrationAnimation() {
    if (config.vibrationIntensity === 'none') return '';
    if (config.vibrationIntensity === 'strong') return 'lw-vibrate-strong';
    return 'lw-vibrate-soft';
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
      #lw-button.lw-vibrate-soft { animation: lw-vibrate-soft 2s ease-in-out infinite; }
      #lw-button.lw-vibrate-strong { animation: lw-vibrate-strong 0.5s ease-in-out infinite; }
      @keyframes lw-vibrate-soft { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      @keyframes lw-vibrate-strong { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }

      /* Teaser bubble */
      #lw-teaser {
        position: fixed; bottom: 90px; right: 20px; z-index: 999997;
        background: white; padding: 12px 16px; border-radius: 16px 16px 4px 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15); max-width: 250px;
        font-size: 14px; color: #1e293b; font-weight: 500;
        animation: lw-teaser-in 0.4s ease-out;
        cursor: pointer;
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
        #lw-close-mobile { display: none !important; }
      }
      @keyframes lw-slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

      /* Header */
      #lw-header { padding: 16px; display: flex; align-items: center; gap: 12px; color: white; background: ${config.primaryColor}; }
      #lw-avatar { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; }
      #lw-avatar::after { content: ''; position: absolute; bottom: 2px; right: 2px; width: 10px; height: 10px; background: #22c55e; border-radius: 50%; border: 2px solid ${config.primaryColor}; }

      /* Messages */
      #lw-messages { flex: 1; overflow-y: auto; padding: 16px; background: #f8fafc; display: flex; flex-direction: column; gap: 12px; }
      .lw-msg { max-width: 85%; padding: 12px 16px; border-radius: 18px; font-size: 14px; line-height: 1.5; animation: lw-fadeIn 0.3s ease-out; word-wrap: break-word; }
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
      #lw-send { width: 48px; height: 48px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; background: ${config.primaryColor}; transition: opacity 0.2s; }
      #lw-send:hover { opacity: 0.9; }
      #lw-send:disabled { opacity: 0.5; cursor: not-allowed; }
      #lw-footer { text-align: center; padding: 8px; font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

      /* WhatsApp button */
      #lw-wa-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; background: #25D366; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; margin-top: 8px; font-size: 14px; }
      #lw-wa-btn:hover { background: #128C7E; }

      /* Close button mobile */
      #lw-close-mobile { 
        position: fixed; bottom: calc(16px + 70vh + 16px); left: 50%; transform: translateX(-50%); z-index: 1000000;
        width: 56px; height: 56px; border-radius: 50%; background: #dc2626; border: 4px solid white; 
        color: white; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.3); 
        display: none; align-items: center; justify-content: center;
      }
      @media (max-width: 639px) { #lw-close-mobile.visible { display: flex; } }

      /* Exit intent popup */
      #lw-exit-overlay { 
        position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000001; 
        display: none; align-items: center; justify-content: center; padding: 20px;
        animation: lw-fadeIn 0.3s ease-out;
      }
      #lw-exit-popup { 
        background: white; border-radius: 24px; padding: 32px; max-width: 400px; width: 100%; 
        text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        animation: lw-popIn 0.4s ease-out;
      }
      @keyframes lw-popIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
      #lw-exit-icon { width: 64px; height: 64px; background: ${config.primaryColor}15; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
      #lw-exit-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
      #lw-exit-desc { font-size: 14px; color: #64748b; margin-bottom: 24px; line-height: 1.6; }
      #lw-exit-cta { width: 100%; padding: 14px; background: ${config.primaryColor}; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 16px; }
      #lw-exit-close { background: none; border: none; color: #94a3b8; font-size: 13px; cursor: pointer; margin-top: 16px; }
    `;

    const html = `
      <div id="lw-root">
        <style>${styles}</style>
        
        <!-- Main Button -->
        <button id="lw-button" class="${getVibrationAnimation()}">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>

        <!-- Teaser Bubble -->
        <div id="lw-teaser" style="display: none;">
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
            <div>
              <div style="font-weight: 600; font-size: 14px;">${config.businessName}</div>
              <div style="font-size: 11px; opacity: 0.9;">Responde al instante con IA</div>
            </div>
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
    const closeMobile = document.getElementById('lw-close-mobile');
    const teaser = document.getElementById('lw-teaser');
    const teaserText = document.getElementById('lw-teaser-text');
    const teaserClose = document.getElementById('lw-teaser-close');
    const exitOverlay = document.getElementById('lw-exit-overlay');
    const exitCta = document.getElementById('lw-exit-cta');
    const exitClose = document.getElementById('lw-exit-close');

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

      // Save first message as lead interest
      if (messages.filter(m => m.role === 'user').length === 1) {
        saveLeadToFirestore('Visitante', 'Pendiente', userMessage);
      }

      // Get AI response
      let response;
      let showWhatsAppNow = false;

      if (aiConfig && aiConfig.ai_api_key) {
        response = await sendToAI(userMessage);
      } else {
        // No AI configured - show helpful message
        showWhatsAppNow = true;
        if (config.whatsappDestination) {
          response = `⚠️ El asistente de IA aún no está configurado por el administrador.\n\n¡Pero no te preocupes! Puedes contactarnos directamente por WhatsApp para una atención inmediata. 👇`;
        } else {
          response = `⚠️ El asistente de IA aún no está configurado.\n\nEl administrador debe configurar su API Key de OpenAI o Anthropic en el panel de control para activar las respuestas automáticas.`;
        }
      }

      isLoading = false;
      messages.push({ role: 'assistant', content: response });

      // Show WhatsApp button immediately if no AI configured
      if (showWhatsAppNow && config.whatsappDestination && !document.getElementById('lw-wa-btn')) {
        renderMessages();
        setTimeout(() => {
          const inputArea = document.getElementById('lw-input-area');
          const waBtn = document.createElement('button');
          waBtn.id = 'lw-wa-btn';
          waBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contactar por WhatsApp
          `;
          waBtn.onclick = () => {
            const msg = encodeURIComponent(`Hola! Tengo una consulta: ${userMessage}`);
            window.open(`https://wa.me/${config.whatsappDestination.replace(/\D/g, '')}?text=${msg}`, '_blank');
          };
          inputArea.insertBefore(waBtn, document.getElementById('lw-footer'));
        }, 300);
        return;
      }

      // Show WhatsApp button after conversation
      if (messages.length >= 5 && config.whatsappDestination && !document.getElementById('lw-wa-btn')) {
        setTimeout(() => {
          messages.push({ role: 'system', content: '¿Te gustaría continuar esta conversación por WhatsApp?' });
          renderMessages();

          const inputArea = document.getElementById('lw-input-area');
          const waBtn = document.createElement('button');
          waBtn.id = 'lw-wa-btn';
          waBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Abrir WhatsApp Ahora
          `;
          waBtn.onclick = () => {
            const msg = encodeURIComponent(`Hola! Estuve chateando en su sitio web y me gustaría más información.`);
            window.open(`https://wa.me/${config.whatsappDestination.replace(/\D/g, '')}?text=${msg}`, '_blank');
          };
          inputArea.insertBefore(waBtn, document.getElementById('lw-footer'));
        }, 1000);
      }

      renderMessages();
    }

    // Toggle panel
    function togglePanel(show) {
      isOpen = show;
      panel.style.display = show ? 'flex' : 'none';
      closeMobile.classList.toggle('visible', show);
      button.style.display = show ? 'none' : 'flex';
      teaser.style.display = 'none';

      if (show && messages.length === 0) {
        messages.push({ role: 'assistant', content: config.welcomeMessage });
        renderMessages();
      }

      if (!show) {
        hasBeenClosedOnce = true;
        startTeaserCycle();
      } else {
        stopTeaserCycle();
      }
    }

    // Teaser cycle
    function startTeaserCycle() {
      if (!hasBeenClosedOnce || isOpen || config.teaserMessages.length === 0) return;

      stopTeaserCycle();
      let index = Math.floor(Math.random() * config.teaserMessages.length);

      const showTeaser = () => {
        if (isOpen) return;
        activeTeaser = config.teaserMessages[index];
        teaserText.textContent = activeTeaser;
        teaser.style.display = 'block';
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
      if (e.clientY <= 0 && !exitIntentShown && !isOpen && config.exitIntentEnabled) {
        exitIntentShown = true;
        exitOverlay.style.display = 'flex';
      }
    }

    // Event listeners
    button.addEventListener('click', () => togglePanel(true));
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

    // Exit intent (desktop only)
    document.addEventListener('mouseout', handleExitIntent);

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
      const hasChanged = JSON.stringify(newConfig) !== JSON.stringify({
        primaryColor: config.primaryColor,
        businessName: config.businessName,
        welcomeMessage: config.welcomeMessage,
        whatsappDestination: config.whatsappDestination,
        quickReplies: config.quickReplies,
        teaserMessages: config.teaserMessages
      });

      if (hasChanged) {
        Object.assign(config, newConfig);
        console.log('LeadWidget: Config refreshed');
        // Re-render widget with new config
        renderWidget();
      }
    }
  }

  // Main Initialization
  async function initialize() {
    const clientId = window.LEADWIDGET_CLIENT_ID || window.LEADWIDGET_CONFIG?.clientId;

    if (clientId) {
      config.clientId = clientId;
      config.projectId = defaultConfig.projectId;
      config.apiKey = defaultConfig.apiKey;

      // Load widget config
      const remoteConfig = await getWidgetConfig(clientId);
      if (remoteConfig) {
        Object.assign(config, remoteConfig);
        console.log('LeadWidget: Loaded configuration for', config.businessName);
      }

      // Load AI config
      aiConfig = await getAIConfig(clientId);
      if (aiConfig && aiConfig.ai_api_key) {
        console.log('LeadWidget: AI enabled with', aiConfig.ai_provider);
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

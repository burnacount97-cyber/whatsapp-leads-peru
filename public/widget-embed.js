(function () {
  'use strict';

  // Default Configuration (Fallback)
  const defaultConfig = {
    primaryColor: '#00C185',
    businessName: 'LeadWidget',
    welcomeMessage: '👋 ¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
    whatsappDestination: '',
    template: 'general',
    chatPlaceholder: 'Escribe tu consulta aquí...',
    quickReplies: ['¿Cómo funciona?', 'Quiero información', 'Ver precios'],
    projectId: 'whatsapp-leads-peru',
    apiKey: 'AIzaSyDoUHZtRvgEwhEUhZj6x4xEZvVmxliMCJo'
  };

  // State
  let messages = [];
  let isLoading = false;
  let isOpen = false;
  let config = { ...defaultConfig };

  // Helper to get configuration from Firestore
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
        return {
          primaryColor: fields.primary_color?.stringValue || defaultConfig.primaryColor,
          businessName: fields.business_name?.stringValue || defaultConfig.businessName,
          welcomeMessage: fields.welcome_message?.stringValue || defaultConfig.welcomeMessage,
          whatsappDestination: fields.whatsapp_destination?.stringValue || '',
          template: fields.template?.stringValue || 'general',
          chatPlaceholder: fields.chat_placeholder?.stringValue || defaultConfig.chatPlaceholder,
          quickReplies: fields.quick_replies?.stringValue?.split('\n').filter(r => r.trim()) || defaultConfig.quickReplies,
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
          ai_max_tokens: data.fields.ai_max_tokens?.integerValue || 500
        };
      }
    } catch (e) {
      console.error('LeadWidget: Error fetching AI config', e);
    }
    return null;
  }

  // Send message to AI
  async function sendToAI(userMessage, aiConfig) {
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

        // Build conversation history
        const conversationHistory = messages.map(m => ({
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
    if (!config.clientId || config.clientId === 'demo_client_id') {
      console.warn('LeadWidget: Lead not saved (Demo Mode or Missing Client ID)');
      return;
    }

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

  // Render the chat widget
  function renderWidget() {
    const styles = `
      #lw-container * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      #lw-button { width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
      #lw-button:hover { transform: scale(1.05); }
      #lw-panel { position: absolute; bottom: 80px; right: 0; width: 360px; max-width: calc(100vw - 32px); height: 500px; max-height: 70vh; background: white; border-radius: 24px; box-shadow: 0 8px 40px rgba(0,0,0,0.15); display: none; flex-direction: column; overflow: hidden; animation: lw-slideUp 0.3s ease-out; }
      @keyframes lw-slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      #lw-header { padding: 16px; display: flex; align-items: center; gap: 12px; color: white; }
      #lw-avatar { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; }
      #lw-avatar::after { content: ''; position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; background: #22c55e; border-radius: 50%; border: 2px solid; }
      #lw-messages { flex: 1; overflow-y: auto; padding: 16px; background: #f8fafc; display: flex; flex-direction: column; gap: 12px; }
      .lw-msg { max-width: 85%; padding: 12px 16px; border-radius: 18px; font-size: 14px; line-height: 1.5; animation: lw-fadeIn 0.3s ease-out; }
      @keyframes lw-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .lw-msg-assistant { background: white; color: #1e293b; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; align-self: flex-start; }
      .lw-msg-user { color: white; border-bottom-right-radius: 4px; align-self: flex-end; }
      .lw-msg-system { background: #f1f5f9; color: #64748b; font-size: 12px; text-align: center; align-self: center; border-radius: 12px; padding: 8px 16px; }
      #lw-input-area { padding: 12px; background: white; border-top: 1px solid #e2e8f0; }
      #lw-quick-replies { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
      .lw-quick-btn { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 20px; font-size: 12px; cursor: pointer; transition: all 0.2s; color: #475569; }
      .lw-quick-btn:hover { border-color: currentColor; }
      #lw-form { display: flex; gap: 8px; }
      #lw-input { flex: 1; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 14px; background: #f8fafc; outline: none; }
      #lw-input:focus { border-color: ${config.primaryColor}; box-shadow: 0 0 0 3px ${config.primaryColor}20; }
      #lw-send { width: 48px; height: 48px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; }
      #lw-send:disabled { opacity: 0.5; cursor: not-allowed; }
      #lw-typing { display: flex; gap: 4px; padding: 12px 16px; background: white; border-radius: 18px; border: 1px solid #e2e8f0; align-self: flex-start; }
      .lw-dot { width: 6px; height: 6px; border-radius: 50%; animation: lw-bounce 1.4s infinite ease-in-out both; }
      .lw-dot:nth-child(1) { animation-delay: 0s; }
      .lw-dot:nth-child(2) { animation-delay: 0.16s; }
      .lw-dot:nth-child(3) { animation-delay: 0.32s; }
      @keyframes lw-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
      #lw-wa-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; background: #25D366; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; margin-top: 8px; }
      #lw-close-mobile { display: none; position: absolute; bottom: -60px; left: 50%; transform: translateX(-50%); width: 50px; height: 50px; border-radius: 50%; background: #dc2626; border: 3px solid white; color: white; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
      @media (max-width: 640px) { 
        #lw-panel { width: calc(100vw - 32px); height: 70vh; max-height: 550px; bottom: 16px; right: 16px; left: 16px; } 
        #lw-close-mobile { display: flex; align-items: center; justify-content: center; }
        #lw-container { left: 0; right: 0; bottom: 0; padding: 16px; }
      }
    `;

    const html = `
      <div id="lw-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 999999;">
        <style>${styles}</style>
        
        <button id="lw-button" style="background: linear-gradient(135deg, ${config.primaryColor} 0%, ${adjustColor(config.primaryColor, -30)} 100%);">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>

        <div id="lw-panel">
          <div id="lw-header" style="background: ${config.primaryColor};">
            <div id="lw-avatar" style="border-color: ${config.primaryColor};">
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
              <button type="submit" id="lw-send" style="background: ${config.primaryColor};">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>

          <button id="lw-close-mobile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
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

    // Render quick replies
    function renderQuickReplies() {
      if (messages.length > 2) {
        quickRepliesContainer.style.display = 'none';
        return;
      }
      quickRepliesContainer.innerHTML = config.quickReplies.map(text =>
        `<button type="button" class="lw-quick-btn" style="--hover-color: ${config.primaryColor};">${text}</button>`
      ).join('');

      quickRepliesContainer.querySelectorAll('.lw-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => handleSendMessage(btn.textContent));
        btn.addEventListener('mouseenter', () => { btn.style.backgroundColor = config.primaryColor + '15'; btn.style.color = config.primaryColor; });
        btn.addEventListener('mouseleave', () => { btn.style.backgroundColor = '#f1f5f9'; btn.style.color = '#475569'; });
      });
    }

    // Render messages
    function renderMessages() {
      messagesContainer.innerHTML = messages.map(m => {
        if (m.role === 'system') {
          return `<div class="lw-msg lw-msg-system">${m.content}</div>`;
        }
        return `<div class="lw-msg lw-msg-${m.role}" style="${m.role === 'user' ? `background: ${config.primaryColor};` : ''}">${m.content}</div>`;
      }).join('');

      if (isLoading) {
        messagesContainer.innerHTML += `
          <div id="lw-typing">
            <div class="lw-dot" style="background: ${config.primaryColor};"></div>
            <div class="lw-dot" style="background: ${config.primaryColor};"></div>
            <div class="lw-dot" style="background: ${config.primaryColor};"></div>
          </div>
        `;
      }

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      renderQuickReplies();
    }

    // Handle send message
    async function handleSendMessage(text) {
      const userMessage = text || input.value.trim();
      if (!userMessage || isLoading) return;

      // Add user message
      messages.push({ role: 'user', content: userMessage });
      input.value = '';
      isLoading = true;
      renderMessages();

      // Save lead with first message as interest
      if (messages.filter(m => m.role === 'user').length === 1) {
        saveLeadToFirestore('Visitante', 'Pendiente', userMessage);
      }

      // Get AI response
      const aiConfig = await getAIConfig(config.clientId);
      let response;

      if (aiConfig && aiConfig.ai_api_key) {
        response = await sendToAI(userMessage, aiConfig);
      } else {
        // Fallback response if no AI configured
        response = `¡Gracias por tu mensaje! Para una atención más personalizada, te invito a contactarnos directamente por WhatsApp. 😊`;
      }

      isLoading = false;
      messages.push({ role: 'assistant', content: response });

      // After 3 messages, suggest WhatsApp
      if (messages.length >= 5 && config.whatsappDestination) {
        setTimeout(() => {
          messages.push({
            role: 'system',
            content: '¿Te gustaría continuar esta conversación por WhatsApp?'
          });
          renderMessages();

          // Add WhatsApp button
          const waBtn = document.createElement('button');
          waBtn.id = 'lw-wa-btn';
          waBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Abrir WhatsApp
          `;
          waBtn.onclick = () => {
            const msg = encodeURIComponent(`Hola! Estuve chateando en su sitio web y me gustaría más información.`);
            window.open(`https://wa.me/${config.whatsappDestination.replace(/\D/g, '')}?text=${msg}`, '_blank');
          };
          document.getElementById('lw-input-area').appendChild(waBtn);
        }, 1000);
      }

      renderMessages();
    }

    // Events
    button.addEventListener('click', () => {
      isOpen = !isOpen;
      panel.style.display = isOpen ? 'flex' : 'none';
      if (isOpen && messages.length === 0) {
        messages.push({ role: 'assistant', content: config.welcomeMessage });
        renderMessages();
      }
    });

    closeMobile.addEventListener('click', () => {
      isOpen = false;
      panel.style.display = 'none';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSendMessage();
    });

    // Auto-open after 5 seconds
    setTimeout(() => {
      if (!isOpen) {
        isOpen = true;
        panel.style.display = 'flex';
        if (messages.length === 0) {
          messages.push({ role: 'assistant', content: config.welcomeMessage });
          renderMessages();
        }
      }
    }, 5000);
  }

  // Helper: Adjust color brightness
  function adjustColor(color, amount) {
    if (!color) return '#000000';
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  // Main Initialization
  async function initialize() {
    const clientId = window.LEADWIDGET_CLIENT_ID || window.LEADWIDGET_CONFIG?.clientId;

    if (clientId) {
      config.clientId = clientId;
      config.projectId = defaultConfig.projectId;
      config.apiKey = defaultConfig.apiKey;

      const remoteConfig = await getWidgetConfig(clientId);
      if (remoteConfig) {
        Object.keys(remoteConfig).forEach(key => {
          if (remoteConfig[key] !== undefined && remoteConfig[key] !== null && remoteConfig[key] !== '') {
            config[key] = remoteConfig[key];
          }
        });
        console.log('LeadWidget: Loaded remote configuration');
      }
    }

    renderWidget();
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();

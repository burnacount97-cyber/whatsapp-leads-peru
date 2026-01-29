(function () {
  'use strict';

  // Default Configuration (Fallback)
  const defaultConfig = {
    primaryColor: '#00C185',
    businessName: 'LeadWidget',
    welcomeMessage: '¡Hola! ¿En qué podemos ayudarte?',
    nicheQuestion: '¿En qué distrito te encuentras?',
    whatsappDestination: '',
    template: 'general',
    projectId: 'whatsapp-leads-peru',
    apiKey: 'AIzaSyDoUHZtRvgEwhEUhZj6x4xEZvVmxliMCJo'
  };

  // Helper to get configuration
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
        // Map Firestore fields to our config format
        return {
          primaryColor: fields.primary_color?.stringValue,
          businessName: 'LeadWidget', // Maybe fetch from profile? Keeping simple for now
          welcomeMessage: fields.welcome_message?.stringValue,
          nicheQuestion: fields.niche_question?.stringValue,
          whatsappDestination: fields.whatsapp_destination?.stringValue,
          template: fields.template?.stringValue,
          clientId: clientId // Ensure ID is passed through
        };
      }
    } catch (e) {
      console.error('LeadWidget: Error fetching config', e);
    }
    return null;
  }

  // Main Initialization
  async function initialize() {
    // 1. Determine Identity
    // Check for new simple ID or legacy full config object
    const clientId = window.LEADWIDGET_CLIENT_ID || window.LEADWIDGET_CONFIG?.clientId;

    // 2. Resolve Configuration
    let finalConfig = { ...defaultConfig };

    if (clientId) {
      finalConfig.clientId = clientId;
      // Fetch fresh config from server
      const remoteConfig = await getWidgetConfig(clientId);
      if (remoteConfig) {
        // Merge remote config, filtering out undefined
        Object.keys(remoteConfig).forEach(key => {
          if (remoteConfig[key] !== undefined && remoteConfig[key] !== null && remoteConfig[key] !== '') {
            finalConfig[key] = remoteConfig[key];
          }
        });
        console.log('LeadWidget: Loaded remote configuration');
      } else if (window.LEADWIDGET_CONFIG) {
        // Fallback to local config if remote fails or not found
        finalConfig = { ...finalConfig, ...window.LEADWIDGET_CONFIG };
      }
    } else {
      // Fallback for demo without ID
      if (window.LEADWIDGET_CONFIG) {
        finalConfig = { ...finalConfig, ...window.LEADWIDGET_CONFIG };
      }
    }

    // 3. Render Widget
    renderWidget(finalConfig);
  }

  // Helper: Save to Firestore
  async function saveLeadToFirestore(config, name, phone, interest) {
    if (!config.clientId || config.clientId === 'demo_client_id') {
      console.warn('LeadWidget: Lead not saved (Demo Mode or Missing Client ID)');
      return;
    }

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/leads?key=${config.apiKey}`;
      const payload = {
        fields: {
          client_id: { stringValue: config.clientId },
          name: { stringValue: name },
          phone: { stringValue: phone },
          message: { stringValue: interest },
          source: { stringValue: 'website_widget' },
          status: { stringValue: 'new' },
          created_at: { timestampValue: new Date().toISOString() }
        }
      };
      fetch(url, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
    } catch (error) { console.error('LeadWidget: Error saving lead', error); }
  }

  // Helper: Color Adjust
  function adjustColor(color, amount) {
    if (!color) return '#000000';
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  // Render Logic
  function renderWidget(config) {
    const widgetHTML = `
        <div id="leadwidget-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <button id="leadwidget-button" style="
            width: 60px; height: 60px; border-radius: 50%;
            background: linear-gradient(135deg, ${config.primaryColor} 0%, ${adjustColor(config.primaryColor, -20)} 100%);
            border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex; align-items: center; justify-content: center;
            transition: transform 0.2s, box-shadow 0.2s;
          ">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>

          <div id="leadwidget-panel" style="
            position: absolute; bottom: 80px; right: 0; width: 360px; max-width: calc(100vw - 40px);
            background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            display: none; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease-out;
          ">
            <div style="background: ${config.primaryColor}; color: white; padding: 20px; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <div>
                  <div style="font-weight: 600; font-size: 16px;">${config.businessName}</div>
                  <div style="font-size: 12px; opacity: 0.9;">Responde en instantes</div>
                </div>
              </div>
              <button id="leadwidget-close" style="background: none; border: none; color: white; cursor: pointer; padding: 4px; opacity: 0.8;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div id="leadwidget-content" style="padding: 24px; flex: 1;">
              <div id="step-welcome" class="widget-step">
                <div style="margin-bottom: 20px;">
                  <div style="background: ${config.primaryColor}15; color: ${config.primaryColor}; padding: 12px 16px; border-radius: 12px; font-size: 14px; margin-bottom: 16px;">
                    ${config.welcomeMessage}
                  </div>
                </div>
                <input type="text" id="lead-name" placeholder="Tu nombre" style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; margin-bottom: 12px; box-sizing: border-box;">
                <input type="tel" id="lead-phone" placeholder="Tu teléfono" style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; margin-bottom: 16px; box-sizing: border-box;">
                <button id="btn-next-1" style="width: 100%; padding: 12px; background: ${config.primaryColor}; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">Continuar →</button>
              </div>

              <div id="step-interest" class="widget-step" style="display: none;">
                <div style="margin-bottom: 20px;">
                  <div style="background: ${config.primaryColor}15; color: ${config.primaryColor}; padding: 12px 16px; border-radius: 12px; font-size: 14px; margin-bottom: 16px;">
                    ${config.nicheQuestion}
                  </div>
                </div>
                <input type="text" id="lead-interest" placeholder="Tu respuesta" style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; margin-bottom: 16px; box-sizing: border-box;">
                <button id="btn-send" style="width: 100%; padding: 12px; background: ${config.primaryColor}; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">Enviar a WhatsApp</button>
              </div>

              <div id="step-success" class="widget-step" style="display: none; text-align: center;">
                <div style="width: 60px; height: 60px; background: ${config.primaryColor}15; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                   <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${config.primaryColor}" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 style="margin: 0 0 8px; font-size: 18px; color: #111;">¡Listo!</h3>
                <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px;">Te pasamos al WhatsApp del equipo</p>
              </div>
            </div>
          </div>
        </div>
        <style>
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          #leadwidget-button:hover { transform: scale(1.05); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2); }
          #leadwidget-close:hover { opacity: 1; }
          #btn-next-1:hover, #btn-send:hover { opacity: 0.9; }
          @media (max-width: 480px) { #leadwidget-panel { width: calc(100vw - 40px); bottom: 80px; right: 20px; } }
        </style>
        `;

    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);

    // Events
    const button = document.getElementById('leadwidget-button');
    const panel = document.getElementById('leadwidget-panel');
    const closeBtn = document.getElementById('leadwidget-close');

    button.addEventListener('click', () => {
      const isVisible = panel.style.display === 'flex';
      panel.style.display = isVisible ? 'none' : 'flex';
    });

    closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });

    document.getElementById('btn-next-1').addEventListener('click', () => {
      if (!document.getElementById('lead-name').value || !document.getElementById('lead-phone').value) return alert('Completa los campos');
      document.getElementById('step-welcome').style.display = 'none';
      document.getElementById('step-interest').style.display = 'block';
    });

    document.getElementById('btn-send').addEventListener('click', () => {
      const name = document.getElementById('lead-name').value;
      const phone = document.getElementById('lead-phone').value;
      const interest = document.getElementById('lead-interest').value;
      if (!interest) return alert('Completa la respuesta');

      document.getElementById('step-interest').style.display = 'none';
      document.getElementById('step-success').style.display = 'block';

      // Save
      saveLeadToFirestore(config, name, phone, interest);

      // WhatsApp
      const msg = `Hola! Soy ${name}%0A%0ATeléfono: ${phone}%0A${config.nicheQuestion} ${interest}`;
      const url = `https://wa.me/${config.whatsappDestination.replace(/\D/g, '')}?text=${msg}`;

      setTimeout(() => {
        window.open(url, '_blank');
        panel.style.display = 'none';
        // Reset
        setTimeout(() => {
          document.getElementById('lead-name').value = '';
          document.getElementById('lead-phone').value = '';
          document.getElementById('lead-interest').value = '';
          document.getElementById('step-success').style.display = 'none';
          document.getElementById('step-welcome').style.display = 'block';
        }, 3000);
      }, 1500);
    });

    setTimeout(() => { panel.style.display = 'flex'; }, 5000);
  }

  // Start
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();

})();

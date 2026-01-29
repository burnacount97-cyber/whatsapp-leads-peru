(function () {
    'use strict';

    // Widget configuration - will be replaced with actual config from server
    const config = {
        primaryColor: '#00C185',
        businessName: 'LeadWidget',
        welcomeMessage: '¡Hola! ¿En qué podemos ayudarte?',
        nicheQuestion: '¿En qué distrito te encuentras?',
        whatsappDestination: '+51987654321',
        template: 'general'
    };

    // Create widget HTML
    const widgetHTML = `
    <div id="leadwidget-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- Widget Button -->
      <button id="leadwidget-button" style="
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${config.primaryColor} 0%, ${adjustColor(config.primaryColor, -20)} 100%);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
      ">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      <!-- Widget Panel -->
      <div id="leadwidget-panel" style="
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 360px;
        max-width: calc(100vw - 40px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
      ">
        <!-- Header -->
        <div style="
          background: ${config.primaryColor};
          color: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
              width: 40px;
              height: 40px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <div style="font-weight: 600; font-size: 16px;">${config.businessName}</div>
              <div style="font-size: 12px; opacity: 0.9;">Responde en instantes</div>
            </div>
          </div>
          <button id="leadwidget-close" style="
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            opacity: 0.8;
            transition: opacity 0.2s;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div id="leadwidget-content" style="padding: 24px; flex: 1;">
          <!-- Step 1: Welcome -->
          <div id="step-welcome" class="widget-step">
            <div style="margin-bottom: 20px;">
              <div style="
                background: ${config.primaryColor}15;
                color: ${config.primaryColor};
                padding: 12px 16px;
                border-radius: 12px;
                font-size: 14px;
                margin-bottom: 16px;
              ">
                ${config.welcomeMessage}
              </div>
            </div>
            <input type="text" id="lead-name" placeholder="Tu nombre" style="
              width: 100%;
              padding: 12px 16px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              font-size: 14px;
              margin-bottom: 12px;
              box-sizing: border-box;
            ">
            <input type="tel" id="lead-phone" placeholder="Tu teléfono" style="
              width: 100%;
              padding: 12px 16px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              font-size: 14px;
              margin-bottom: 16px;
              box-sizing: border-box;
            ">
            <button id="btn-next-1" style="
              width: 100%;
              padding: 12px;
              background: ${config.primaryColor};
              color: white;
              border: none;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              font-size: 14px;
              transition: opacity 0.2s;
            ">
              Continuar →
            </button>
          </div>

          <!-- Step 2: Interest -->
          <div id="step-interest" class="widget-step" style="display: none;">
            <div style="margin-bottom: 20px;">
              <div style="
                background: ${config.primaryColor}15;
                color: ${config.primaryColor};
                padding: 12px 16px;
                border-radius: 12px;
                font-size: 14px;
                margin-bottom: 16px;
              ">
                ${config.nicheQuestion}
              </div>
            </div>
            <input type="text" id="lead-interest" placeholder="Tu respuesta" style="
              width: 100%;
              padding: 12px 16px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              font-size: 14px;
              margin-bottom: 16px;
              box-sizing: border-box;
            ">
            <button id="btn-send" style="
              width: 100%;
              padding: 12px;
              background: ${config.primaryColor};
              color: white;
              border: none;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              font-size: 14px;
              transition: opacity 0.2s;
            ">
              Enviar a WhatsApp
            </button>
          </div>

          <!-- Step 3: Success -->
          <div id="step-success" class="widget-step" style="display: none; text-align: center;">
            <div style="
              width: 60px;
              height: 60px;
              background: ${config.primaryColor}15;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 16px;
            ">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${config.primaryColor}" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 style="margin: 0 0 8px; font-size: 18px; color: #111;">¡Listo!</h3>
            <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px;">
              Te pasamos al WhatsApp del equipo
            </p>
          </div>
        </div>
      </div>
    </div>

    <style>
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      #leadwidget-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      #leadwidget-close:hover {
        opacity: 1;
      }

      #btn-next-1:hover, #btn-send:hover {
        opacity: 0.9;
      }

      @media (max-width: 480px) {
        #leadwidget-panel {
          width: calc(100vw - 40px);
          bottom: 80px;
          right: 20px;
        }
      }
    </style>
  `;

    // Helper function to adjust color brightness
    function adjustColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }

    // Initialize widget
    function initWidget() {
        // Insert widget HTML
        const container = document.createElement('div');
        container.innerHTML = widgetHTML;
        document.body.appendChild(container);

        // Get elements
        const button = document.getElementById('leadwidget-button');
        const panel = document.getElementById('leadwidget-panel');
        const closeBtn = document.getElementById('leadwidget-close');
        const btnNext1 = document.getElementById('btn-next-1');
        const btnSend = document.getElementById('btn-send');

        // Toggle panel
        button.addEventListener('click', () => {
            const isVisible = panel.style.display === 'flex';
            panel.style.display = isVisible ? 'none' : 'flex';
        });

        closeBtn.addEventListener('click', () => {
            panel.style.display = 'none';
        });

        // Step 1 -> Step 2
        btnNext1.addEventListener('click', () => {
            const name = document.getElementById('lead-name').value.trim();
            const phone = document.getElementById('lead-phone').value.trim();

            if (!name || !phone) {
                alert('Por favor completa todos los campos');
                return;
            }

            document.getElementById('step-welcome').style.display = 'none';
            document.getElementById('step-interest').style.display = 'block';
        });

        // Step 2 -> WhatsApp
        btnSend.addEventListener('click', () => {
            const name = document.getElementById('lead-name').value.trim();
            const phone = document.getElementById('lead-phone').value.trim();
            const interest = document.getElementById('lead-interest').value.trim();

            if (!interest) {
                alert('Por favor completa tu respuesta');
                return;
            }

            // Show success
            document.getElementById('step-interest').style.display = 'none';
            document.getElementById('step-success').style.display = 'block';

            // Build WhatsApp message
            const message = `Hola! Soy ${name}%0A%0ATeléfono: ${phone}%0A${config.nicheQuestion} ${interest}`;
            const whatsappUrl = `https://wa.me/${config.whatsappDestination.replace(/\D/g, '')}?text=${message}`;

            // Redirect to WhatsApp after 1.5 seconds
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
                panel.style.display = 'none';

                // Reset form
                setTimeout(() => {
                    document.getElementById('lead-name').value = '';
                    document.getElementById('lead-phone').value = '';
                    document.getElementById('lead-interest').value = '';
                    document.getElementById('step-success').style.display = 'none';
                    document.getElementById('step-welcome').style.display = 'block';
                }, 2000);
            }, 1500);
        });

        // Auto-show after delay (optional)
        setTimeout(() => {
            panel.style.display = 'flex';
        }, 5000);
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }
})();

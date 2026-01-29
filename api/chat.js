import { db } from './_firebase.js';
import OpenAI from 'openai';

export default async function handler(req, res) {
    // 1. Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, history, widgetId } = req.body;
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

    if (!message || !widgetId) {
        return res.status(400).json({ error: 'Message and widgetId are required' });
    }

    try {
        // RATE LIMITING: Check message count from this IP (Make it non-blocking to avoid index errors)
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            const recentMessages = await db.collection('analytics')
                .where('ip', '==', clientIp)
                .where('event_type', '==', 'message_sent')
                .where('created_at', '>', oneHourAgo)
                .get();

            const messageCount = recentMessages.size;
            const rateLimit = widgetId === 'demo-landing' ? 40 : 100;

            if (messageCount >= rateLimit) {
                return res.status(429).json({
                    response: 'Has alcanzado el límite de mensajes por ahora. Por favor, intenta de nuevo más tarde.',
                    rateLimited: true
                });
            }
        } catch (rateError) {
            console.error('Non-critical: Rate limit check failed (possibly missing index):', rateError.message);
        }

        // Track message attempt (non-blocking)
        db.collection('analytics').add({
            widget_id: widgetId,
            event_type: 'message_sent',
            ip: clientIp,
            created_at: new Date().toISOString()
        }).catch(e => console.error('Track error:', e.message));

        let aiConfig = {};
        let dbWidgetConfig = null;
        let actualInternalId = null;

        // 2. Fetch Widget Config
        if (widgetId === 'demo-landing') {
            aiConfig = {
                ai_enabled: true,
                ai_api_key: process.env.OPENAI_API_KEY,
                ai_model: 'gpt-4o-mini',
                ai_temperature: 0.7,
                ai_system_prompt: 'Eres un asistente amable de Lead Widget.',
                business_name: 'Lead Widget'
            };
        } else {
            // Widget lookup
            const q = await db.collection('widget_configs').where('widget_id', '==', widgetId).limit(1).get();
            if (q.empty) return res.status(404).json({ error: 'Widget not found' });

            const widgetData = { id: q.docs[0].id, ...q.docs[0].data() };
            const profileDoc = await db.collection('profiles').doc(widgetData.user_id).get();
            const profileData = profileDoc.exists ? profileDoc.data() : {};

            dbWidgetConfig = widgetData;
            aiConfig = {
                ...profileData,
                business_name: profileData.business_name || 'Negocio'
            };
            actualInternalId = widgetData.id;
        }

        if (!aiConfig.ai_enabled) {
            return res.status(200).json({ response: "El asistente virtual no está habilitado actualmente para este negocio." });
        }

        const apiKey = aiConfig.ai_api_key || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error('CRITICAL: No OpenAI API Key found for widget:', widgetId);
            return res.status(200).json({ response: "Lo siento, el servicio de IA no está configurado correctamente. Por favor, contacta al administrador." });
        }

        const openai = new OpenAI({ apiKey: apiKey });

        const messages = [
            { role: 'system', content: aiConfig.ai_system_prompt || 'Eres un asistente amable.' },
            ...(history || []).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: message }
        ];

        const completion = await openai.chat.completions.create({
            model: aiConfig.ai_model || 'gpt-4o-mini',
            messages: messages,
            temperature: aiConfig.ai_temperature || 0.7,
        });

        const aiResponse = completion.choices[0].message.content;

        // --- SAFE ENFORCEMENT ---
        // 1. Check for BLOCK action
        if (aiResponse.includes('block_user') && widgetId !== 'demo-landing' && dbWidgetConfig) {
            try {
                const blockMatch = aiResponse.match(/\{"action":\s*"block_user"[^}]*\}/);
                if (blockMatch) {
                    await db.collection('blocked_ips').add({
                        widget_id: dbWidgetConfig.id,
                        ip_address: clientIp,
                        reason: 'AI detected abuse',
                        created_at: new Date().toISOString()
                    });
                    return res.status(200).json({
                        response: "Esta conversación ha sido finalizada por seguridad.",
                        blocked: true
                    });
                }
            } catch (e) { console.error('Block enforcement error:', e.message); }
        }

        // 2. Save Lead (Safe parsing)
        if (aiResponse.includes('collect_lead') && widgetId !== 'demo-landing' && dbWidgetConfig) {
            try {
                const leadMatch = aiResponse.match(/\{"action":\s*"collect_lead"[^}]*\}/);
                if (leadMatch) {
                    const leadPayload = JSON.parse(leadMatch[0]);
                    await db.collection('leads').add({
                        client_id: dbWidgetConfig.user_id,
                        widget_id: dbWidgetConfig.id,
                        name: leadPayload.data?.name || 'Cliente Interesado',
                        interest: Object.entries(leadPayload.data || {}).map(([k, v]) => `${k}: ${v}`).join(' | '),
                        phone: 'Pendiente (Confirmar en WA)',
                        created_at: new Date().toISOString()
                    });
                }
            } catch (e) { console.error('Lead collection error:', e.message); }
        }

        return res.status(200).json({ response: aiResponse });

    } catch (error) {
        console.error('API Chat Error:', error);

        // Detailed error for common failures
        let userMessage = "Lo siento, tuve un error de conexión con mi cerebro artificial. ¿Puedes intentar de nuevo?";

        if (error.message?.includes('JSON at position')) {
            userMessage = "Error de configuración: El archivo de cuenta de servicio (service_account) en Vercel no es un JSON válido.";
        } else if (error.message?.includes('api_key')) {
            userMessage = "Configuración incompleta: La clave de API de OpenAI no es válida o ha expirado.";
        } else if (error.message?.includes('Widget not found')) {
            userMessage = `Error: No pude encontrar la configuración para el widget ID: ${widgetId}.`;
        } else if (error.message?.includes('quota')) {
            userMessage = "Aviso: He alcanzado mi límite de uso de OpenAI. Por favor, verifica el crédito de tu cuenta.";
        }

        return res.status(200).json({ response: userMessage });
    }
}

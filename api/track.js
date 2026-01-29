import { db } from './_firebase.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { widgetId, eventType } = req.body;

    if (!widgetId) return res.status(400).json({ error: 'widgetId is required' });

    try {
        await db.collection('widget_analytics').add({
            widget_id: widgetId,
            event_type: eventType || 'view',
            created_at: new Date().toISOString()
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Track error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

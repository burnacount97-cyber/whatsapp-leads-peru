import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, limit, getDocs } from 'firebase/firestore';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    actionUrl?: string;
}

export function SalesWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        primaryColor: '#00C185',
        businessName: 'IA LeadWidget',
        welcomeMessage: '👋 ¡Hola! Soy la IA de LeadWidget. Estoy aquí para ayudarte a convertir más visitas en clientes. ¿En qué te puedo ayudar hoy?',
        teaserMessages: [
            '¿Cómo puedo ayudarte con tu negocio? 👋',
            '¿Aún tienes dudas sobre cómo capturar leads? 👋',
            '¡Hola! Estamos en línea para atenderte 🚀',
            '¿Quieres ver cómo aumentamos tus ventas? ✨'
        ],
        quickReplies: [
            "¿Cómo funciona?",
            "Quiero una demo",
            "Ver precios"
        ]
    });

    // Dynamic Widget ID (defaults to demo-landing, overrides if system config found)
    const [activeWidgetId, setActiveWidgetId] = useState("demo-landing");

    const [messages, setMessages] = useState<Message[]>([]);
    // Init message logic handled in effect to sync with config

    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isIdle, setIsIdle] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

    // --- Configuration Loading Logic ---
    useEffect(() => {
        // 1. Listen for System Settings to find the "Owner" of the landing widget
        const unsubSystem = onSnapshot(doc(db, 'system_settings', 'demo'), async (sysSnap) => {
            if (sysSnap.exists()) {
                const data = sysSnap.data();
                if (data.owner_id) {
                    // 2. Find the widget configuration for this owner
                    const q = query(
                        collection(db, 'widget_configs'),
                        where('user_id', '==', data.owner_id),
                        limit(1)
                    );

                    const querySnap = await getDocs(q); // Use getDocs for query, could change to onSnapshot for realtime
                    if (!querySnap.empty) {
                        const widgetDoc = querySnap.docs[0];
                        const wData = widgetDoc.data();

                        // Update Config
                        setConfig({
                            primaryColor: wData.primary_color || '#00C185',
                            businessName: wData.business_name || 'IA LeadWidget',
                            welcomeMessage: wData.welcome_message || '👋 ¡Hola! ¿En qué podemos ayudarte?',
                            teaserMessages: wData.teaser_messages ? wData.teaser_messages.split('\n') : [
                                '¿Podemos ayudarte? 👋', '¡Hola! Estamos en línea 🚀'
                            ],
                            quickReplies: wData.quick_replies ? wData.quick_replies.split('\n') : [
                                "¿Cómo funciona?", "Quiero una demo"
                            ]
                        });

                        // Update ID for Chat API
                        setActiveWidgetId(widgetDoc.id);

                        console.log('Landing Widget connected to:', wData.business_name);
                    }
                }
            }
        });

        return () => unsubSystem();
    }, []);

    // Set initial message when config loads (only if empty)
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ role: 'assistant', content: config.welcomeMessage }]);
        }
    }, [config.welcomeMessage]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Attention grabbing logic
    useEffect(() => {
        if (!isOpen || inputText.trim() !== '' || isLoading || messages.length > 1) {
            setIsIdle(false);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            return;
        }

        const startIdleTimer = () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(() => {
                setIsIdle(true);
            }, 5000);
        };
        startIdleTimer();
        return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
    }, [isOpen, inputText, isLoading, messages]);

    const [hasBeenClosedOnce, setHasBeenClosedOnce] = useState(false);
    const [activeTeaser, setActiveTeaser] = useState('');

    // Auto-open
    useEffect(() => {
        const timer = setTimeout(() => setIsOpen(true), 5000);
        const handleOpen = () => { setIsOpen(true); setHasBeenClosedOnce(false); };
        window.addEventListener('open-lead-widget', handleOpen);
        return () => { clearTimeout(timer); window.removeEventListener('open-lead-widget', handleOpen); };
    }, []);

    const handleSendMessage = async (overrideText?: string) => {
        const textToSend = typeof overrideText === 'string' ? overrideText : inputText;
        if (!textToSend.trim()) return;

        const userMsg = textToSend.trim();
        if (!overrideText) {
            setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
            setInputText('');
        }
        setIsLoading(true);

        const currentHistory = messages.map(m => ({ role: m.role, content: m.content })).filter(m => m.role !== 'system');
        const historyToSend = [...currentHistory, { role: 'user', content: userMsg }];

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: historyToSend,
                    widgetId: activeWidgetId // Dynamic ID here!
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const jsonMatch = data.response.match(/\{"action":\s*"collect_lead"[^}]*\}/);

            if (jsonMatch) {
                let capturedData = { name: 'Cliente', interest: 'LeadWidget', budget: 'No mencionado' };
                try {
                    const leadPayload = JSON.parse(jsonMatch[0]);
                    if (leadPayload.data) capturedData = { ...capturedData, ...leadPayload.data };
                } catch (e) {
                    console.error('Data parse error:', e);
                }

                const cleanResponse = data.response.replace(jsonMatch[0], '').trim();

                // Construct WA Message
                let messageBody = `¡Hola! Vengo del chat de ${config.businessName}.\n\n`;
                const emojis = ["👤", "🎯", "💰", "🏠", "📍", "🩺", "🔧", "⏰"];
                let emojiIdx = 0;
                Object.entries(capturedData).forEach(([key, value]) => {
                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                    const emoji = emojis[emojiIdx % emojis.length];
                    messageBody += `${emoji} *${label}:* ${value}\n`;
                    emojiIdx++;
                });

                // Destination hardcoded fallback for Demo, but ideally from Config too if we want real routing
                // For demo landing, we often want leads to go to US. 
                // But if "Owner" is configured, maybe they want leads? 
                // Let's stick to the hardcoded number for the Landing Page Business, or...
                // Actually, if we are dogfooding, we want leads to go to the number in config!
                // But careful: If I set my ID, I shouldn't spam myself with demo messages unless I want to.
                // Let's keep the landing number static for safety, or read it if we are bold.
                // For now, static to Ken's number or '51924464410' (which was in code).
                const waUrl = `https://wa.me/51924464410?text=${encodeURIComponent(messageBody)}`;

                if (cleanResponse) {
                    setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
                }

                setMessages(prev => [...prev, {
                    role: 'system',
                    content: '✅ ¡Entendido! Te estamos conectando con WhatsApp...',
                    actionUrl: waUrl
                }]);

                setTimeout(() => { window.open(waUrl, '_blank'); }, 4000);

            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            }

        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, tuve un error de conexión. ¿Puedes intentar de nuevo?' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setHasBeenClosedOnce(true);
        const randomMsg = config.teaserMessages[Math.floor(Math.random() * config.teaserMessages.length)];
        setActiveTeaser(randomMsg);
    };

    // Helper for darker colors
    const adjustColor = (color: string, amount: number) => {
        return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 translate-y-0 animate-in slide-in-from-bottom-5 duration-500 font-sans">
                {hasBeenClosedOnce && (
                    <div onClick={() => setIsOpen(true)} className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 cursor-pointer animate-in fade-in slide-in-from-right-4 duration-300 relative group max-w-[220px]">
                        <p className="text-xs font-semibold text-slate-800 leading-tight">{activeTeaser}</p>
                        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-100"></div>
                        <div className="absolute top-1 -right-1 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: config.primaryColor }}></div>
                    </div>
                )}
                <button
                    onClick={() => { setIsOpen(true); setHasBeenClosedOnce(false); }}
                    className="w-16 h-16 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center relative group"
                    style={{ backgroundColor: config.primaryColor }}
                >
                    <Bot className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] text-white font-bold items-center justify-center">1</span>
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-24 sm:right-6 w-auto sm:w-[360px] h-[75vh] sm:h-[500px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-border flex flex-col font-sans animate-in slide-in-from-bottom-5 duration-300 ${isIdle ? 'animate-vibrate-subtle' : ''}`}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between text-white shadow-md transition-colors duration-300" style={{ backgroundColor: config.primaryColor }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
                        <Bot className="w-6 h-6" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 rounded-full" style={{ borderColor: config.primaryColor }}></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{config.businessName}</h3>
                        <p className="text-[10px] opacity-90 text-white/90">Responde al instante con IA</p>
                    </div>
                </div>
                <button onClick={handleClose} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {/* Chat */}
            <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'system' ? (
                            <div className="w-full text-center my-2 space-y-2 animate-in fade-in zoom-in-95 duration-300">
                                <p className="text-xs text-slate-500 bg-slate-100 py-1 px-3 rounded-full inline-block">{msg.content}</p>
                                {msg.actionUrl && (
                                    <Button onClick={() => window.open(msg.actionUrl, '_blank')} className="bg-[#25D366] hover:bg-[#128C7E] text-white w-full gap-2 shadow-sm font-semibold h-12">
                                        <MessageCircle className="w-4 h-4" /> Abrir WhatsApp Ahora
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'}`}
                                style={msg.role === 'user' ? { backgroundColor: config.primaryColor } : {}}>
                                {msg.content}
                            </div>
                        )}
                    </div>
                ))}
                {(isLoading || (isIdle && messages.length === 1)) && (
                    <div className="flex justify-start animate-pulse-subtle">
                        <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full animate-bounce delay-0" style={{ backgroundColor: config.primaryColor }}></span>
                                <span className="w-1.5 h-1.5 rounded-full animate-bounce delay-150" style={{ backgroundColor: config.primaryColor }}></span>
                                <span className="w-1.5 h-1.5 rounded-full animate-bounce delay-300" style={{ backgroundColor: config.primaryColor }}></span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">{isLoading ? 'Escribiendo...' : 'El asistente tiene algo para ti...'}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                {messages.length < 3 && config.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {config.quickReplies.map((text, i) => (
                            <button key={i} onClick={() => { setMessages(prev => [...prev, { role: 'user', content: text }]); setInputText(''); handleSendMessage(text); }}
                                className="text-[11px] bg-slate-100 hover:text-white text-slate-600 px-3 py-1.5 rounded-full transition-colors border border-slate-200"
                                style={{}}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = config.primaryColor; e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                            >
                                {text}
                            </button>
                        ))}
                    </div>
                )}
                {isIdle && messages.length === 1 && (
                    <div className="text-center animate-bounce-subtle">
                        <span className="text-[11px] px-3 py-1 rounded-full font-semibold border border-primary/20" style={{ backgroundColor: `${config.primaryColor}20`, color: config.primaryColor }}>
                            ¿Tienes alguna duda sobre el servicio? ✨
                        </span>
                    </div>
                )}
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className={`flex gap-2 transition-transform duration-500 ${isIdle ? 'scale-[1.02]' : ''}`}>
                    <Input value={inputText} onChange={(e) => setInputText(e.target.value)} onFocus={() => setIsIdle(false)} placeholder="Escribe tu consulta aquí..."
                        className={`flex-1 bg-slate-50 border-slate-200 h-12 shadow-inner transition-all ${isIdle ? 'ring-2 border-transparent' : ''}`}
                        style={isIdle ? { ringColor: `${config.primaryColor}50` } : {}}
                    />
                    <Button type="submit" size="icon" className="shrink-0 h-12 w-12 shadow-lg transition-all text-white"
                        style={{ backgroundColor: config.primaryColor }}
                        disabled={isLoading}
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
                <div className="text-center flex justify-center items-center gap-1">
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: config.primaryColor }}></div>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Atención 24/7 con Inteligencia Artificial</p>
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: config.primaryColor }}></div>
                </div>
            </div>
        </div>
    );
}

// Add simple CSS animation for subtle vibrate if not exists in global css
const style = document.createElement('style');
style.innerHTML = `
  @keyframes vibrate-subtle {
    0% { transform: translate(0); }
    20% { transform: translate(-1px, 1px); }
    40% { transform: translate(-1px, -1px); }
    60% { transform: translate(1px, 1px); }
    80% { transform: translate(1px, -1px); }
    100% { transform: translate(0); }
  }
  .animate-vibrate-subtle { animation: vibrate-subtle 0.3s linear infinite paused; }
  .animate-vibrate-subtle:hover { animation-play-state: running; }
`;
document.head.appendChild(style);

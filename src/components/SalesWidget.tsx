import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    actionUrl?: string;
}

export function SalesWidget() {
    const [isOpen, setIsOpen] = useState(false);

    // Configuration (Static / Simple)
    const config = {
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
    };

    // Static ID for Demo
    const MY_WIDGET_ID = "demo-landing";

    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: config.welcomeMessage }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isIdle, setIsIdle] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

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
            }, 5000); // Wait 5 seconds of total silence to start persistent vibration
        };

        startIdleTimer();

        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [isOpen, inputText, isLoading, messages]);

    const [hasBeenClosedOnce, setHasBeenClosedOnce] = useState(false);
    const [activeTeaser, setActiveTeaser] = useState('');

    // Auto-open
    useEffect(() => {
        const timer = setTimeout(() => setIsOpen(true), 5000);

        // Listen for external trigger (e.g. "Ver Demo" button)
        const handleOpen = () => {
            setIsOpen(true);
            setHasBeenClosedOnce(false); // Reset to hide teaser if opened manually
        };
        window.addEventListener('open-lead-widget', handleOpen);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('open-lead-widget', handleOpen);
        };
    }, []);

    const handleSendMessage = async (overrideText?: string) => {
        const textToSend = typeof overrideText === 'string' ? overrideText : inputText;
        if (!textToSend.trim()) return;

        const userMsg = textToSend.trim();

        // If manual send, we handle UI updates here.
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
                    widgetId: MY_WIDGET_ID
                })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            // Check for lead collection action in AI response
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

                // Construct dynamic message based on actual captured keys
                let messageBody = `¡Hola! Vengo del chat de demo.\n\n`;
                const emojis = ["👤", "🎯", "💰", "🏠", "📍", "🩺", "🔧", "⏰"];
                let emojiIdx = 0;

                Object.entries(capturedData).forEach(([key, value]) => {
                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                    const emoji = emojis[emojiIdx % emojis.length];
                    messageBody += `${emoji} *${label}:* ${value}\n`;
                    emojiIdx++;
                });

                const waUrl = `https://wa.me/51924464410?text=${encodeURIComponent(messageBody)}`;

                if (cleanResponse) {
                    setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
                }

                // Add System Message with Button
                setMessages(prev => [...prev, {
                    role: 'system',
                    content: '✅ ¡Entendido! Te estamos conectando con WhatsApp...',
                    actionUrl: waUrl
                }]);

                // Try auto-redirect
                setTimeout(() => {
                    window.open(waUrl, '_blank');
                }, 4000);

            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            }

        } catch (error) {
            console.error('Chat error:', error);
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

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 translate-y-0 animate-in slide-in-from-bottom-5 duration-500 font-sans">
                {hasBeenClosedOnce && (
                    <div
                        onClick={() => setIsOpen(true)}
                        className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 cursor-pointer animate-in fade-in slide-in-from-right-4 duration-300 relative group max-w-[220px]"
                    >
                        <p className="text-xs font-semibold text-slate-800 leading-tight">
                            {activeTeaser}
                        </p>
                        {/* Caret */}
                        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-100"></div>
                        <div className="absolute top-1 -right-1 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: config.primaryColor }}></div>
                    </div>
                )}

                <button
                    onClick={() => {
                        setIsOpen(true);
                        setHasBeenClosedOnce(false);
                    }}
                    className="w-16 h-16 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center relative group"
                    style={{ backgroundColor: config.primaryColor }}
                >
                    <Bot className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] text-white font-bold items-center justify-center">1</span>
                    </span>
                    {/* Hover tooltip */}
                    <div className="absolute right-20 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Chatea con nuestra IA
                    </div>
                </button>
            </div>
        );
    }

    return (
        <div className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-24 sm:right-6 w-auto sm:w-[360px] h-[75vh] sm:h-[500px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-border flex flex-col font-sans animate-in slide-in-from-bottom-5 duration-300 ${isIdle ? 'animate-vibrate-subtle' : ''}`}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between text-white shadow-md" style={{ backgroundColor: config.primaryColor }}>
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
                <button onClick={handleClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'system' ? (
                            <div className="w-full text-center my-2 space-y-2 animate-in fade-in zoom-in-95 duration-300">
                                <p className="text-xs text-slate-500 bg-slate-100 py-1 px-3 rounded-full inline-block">{msg.content}</p>
                                {msg.actionUrl && (
                                    <Button
                                        onClick={() => window.open(msg.actionUrl, '_blank')}
                                        className="bg-[#25D366] hover:bg-[#128C7E] text-white w-full gap-2 shadow-sm font-semibold h-12"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Abrir WhatsApp Ahora
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div
                                className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                                    ? 'text-white rounded-br-none'
                                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                                    }`}
                                style={msg.role === 'user' ? { backgroundColor: config.primaryColor } : {}}
                            >
                                {msg.content}
                            </div>
                        )}
                    </div>
                ))}

                {/* Fake interaction hint */}
                {(isLoading || (isIdle && messages.length === 1)) && (
                    <div className="flex justify-start animate-pulse-subtle">
                        <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full animate-bounce delay-0" style={{ backgroundColor: config.primaryColor }}></span>
                                <span className="w-1.5 h-1.5 rounded-full animate-bounce delay-150" style={{ backgroundColor: config.primaryColor }}></span>
                                <span className="w-1.5 h-1.5 rounded-full animate-bounce delay-300" style={{ backgroundColor: config.primaryColor }}></span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                                {isLoading ? 'Escribiendo...' : 'El asistente tiene algo para ti...'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 space-y-3">

                {/* Quick Actions */}
                {messages.length < 3 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {config.quickReplies.map((text, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setMessages(prev => [...prev, { role: 'user', content: text }]);
                                    setInputText('');
                                    handleSendMessage(text);
                                }}
                                className="text-[11px] bg-slate-100 hover:text-white text-slate-600 px-3 py-1.5 rounded-full transition-colors border border-slate-200"
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
                        <span className="text-[11px] bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold border border-primary/20"
                            style={{ backgroundColor: `${config.primaryColor}20`, color: config.primaryColor }}>
                            ¿Tienes alguna duda sobre el servicio? ✨
                        </span>
                    </div>
                )}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className={`flex gap-2 transition-transform duration-500 ${isIdle ? 'scale-[1.02]' : ''}`}
                >
                    <Input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onFocus={() => setIsIdle(false)}
                        placeholder="Escribe tu consulta aquí..."
                        className={`flex-1 bg-slate-50 border-slate-200 focus-visible:ring-[#00C185] h-12 shadow-inner transition-all ${isIdle ? 'ring-2 ring-primary/30 border-primary/50' : ''}`}
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className={`text-white shrink-0 h-12 w-12 shadow-lg transition-all ${isIdle ? 'animate-pulse' : ''}`}
                        style={{ backgroundColor: config.primaryColor }}
                        disabled={isLoading}
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
                <div className="text-center flex justify-center items-center gap-1">
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: config.primaryColor }}></div>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">
                        Atención 24/7 con Inteligencia Artificial
                    </p>
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

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Check, Zap, Sparkles, Crown } from 'lucide-react';

export default function CreateNow() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN');

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            localStorage.setItem('leadwidget_ref', ref);
        }

        // Detect language/region
        const lang = navigator.language || 'es';
        if (lang.startsWith('en') || lang.includes('US')) {
            setCurrency('USD');
        }
    }, [searchParams]);

    const pricing = {
        PEN: {
            standard: { price: 'S/ 30', period: '/mes' },
            plus: { price: 'S/ 60', period: '/mes' }
        },
        USD: {
            standard: { price: '$20', period: '/mo' },
            plus: { price: '$30', period: '/mo' }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white flex flex-col">
            <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    LeadWidget
                </div>
                <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => navigate('/login')}>
                    Ingresar
                </Button>
            </nav>

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Hero */}
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                            <Zap className="w-4 h-4" />
                            Instalación en 2 minutos
                        </div>

                        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
                            ¿Te gustó la <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">velocidad</span> del chat?
                        </h1>

                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Instala este mismo sistema de IA en tu negocio. Atiende 24/7, captura datos y vende más.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

                        {/* Plan Estándar */}
                        <Card className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-all">
                            <CardContent className="p-8 space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="w-5 h-5 text-emerald-400" />
                                        <h3 className="text-2xl font-bold text-white">Plan Estándar</h3>
                                    </div>
                                    <p className="text-slate-400 text-sm">Perfecto para empezar</p>
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-emerald-400">{pricing[currency].standard.price}</span>
                                    <span className="text-slate-500">{pricing[currency].standard.period}</span>
                                </div>

                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-sm">
                                        <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>IA entrenada para tu negocio</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>Funciona en cualquier web</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>Reportes y analíticas básicas</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-slate-400">
                                        <span className="w-5 h-5 shrink-0 flex items-center justify-center text-xs">⚡</span>
                                        <span>Incluye marca de agua "Tecnología LeadWidget"</span>
                                    </li>
                                </ul>

                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                    onClick={() => window.location.href = '/register?plan=standard'}
                                >
                                    Comenzar Ahora
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Plan PLUS */}
                        <Card className="bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 border-2 border-emerald-500 relative overflow-hidden">
                            <div className="absolute top-4 right-4">
                                <div className="bg-emerald-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    POPULAR
                                </div>
                            </div>

                            <CardContent className="p-8 space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Crown className="w-5 h-5 text-emerald-400" />
                                        <h3 className="text-2xl font-bold text-white">Plan PLUS</h3>
                                    </div>
                                    <p className="text-emerald-300 text-sm">100% personalizable</p>
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-white">{pricing[currency].plus.price}</span>
                                    <span className="text-slate-400">{pricing[currency].plus.period}</span>
                                </div>

                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-sm">
                                        <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                        <span className="font-semibold">Todo lo del Plan Estándar</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                        <span className="font-semibold">🎁 SIN marca de agua - Widget 100% tuyo</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>Soporte prioritario</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>Estadísticas avanzadas</span>
                                    </li>
                                </ul>

                                <Button
                                    className="w-full bg-white text-black hover:bg-emerald-50 font-bold"
                                    onClick={() => window.location.href = '/register?plan=plus'}
                                >
                                    Actualizar a PLUS
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Trust Signals */}
                    <div className="text-center space-y-4">
                        <p className="text-sm text-slate-500">
                            ✅ Prueba gratis 3 días • Sin tarjeta de crédito
                        </p>
                        <p className="text-xs text-slate-600">
                            Únete a cientos de negocios que ya están capturando más leads con LeadWidget
                        </p>
                    </div>
                </div>
            </main>

            <footer className="py-6 text-center text-slate-600 text-sm">
                © 2024 LeadWidget. Todos los derechos reservados.
            </footer>
        </div>
    );
}

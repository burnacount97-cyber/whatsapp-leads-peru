import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SalesWidget } from '@/components/SalesWidget';
import { SocialProofToast } from '@/components/SocialProofToast';
import {
  MessageCircle,
  Zap,
  BarChart3,
  Smartphone,
  Check,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Menu,
  X as CloseIcon,
  MousePointer2,
  Globe,
  Copy,
  ShieldCheck,
  ChevronRight,
  Play,
  Bot,
  Send,
  Sparkles
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const nicheTemplates = [
  { name: 'Inmobiliarias', emoji: '🏠', desc: 'Captura distrito y habitaciones' },
  { name: 'Clínicas', emoji: '🏥', desc: 'Especialidad y urgencia' },
  { name: 'Talleres', emoji: '🔧', desc: 'Tipo de vehículo y problema' },
  { name: 'Delivery', emoji: '🛵', desc: 'Dirección de entrega' },
  { name: 'Ecommerce', emoji: '🛍️', desc: 'Dudas de stock y cupones' },
  { name: 'General', emoji: '💼', desc: 'Personalizable para cualquier negocio' },
];

const stats = [
  { value: '22%', label: 'Tasa de conversión promedio' },
  { value: '+500', label: 'Leads capturados / mes' },
  { value: '2min', label: 'Tiempo de instalación' },
];

export default function Landing() {
  const [activeTemplate, setActiveTemplate] = useState('inmobiliaria');
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [hasShownExit, setHasShownExit] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShownExit) {
        setShowExitPopup(true);
        setHasShownExit(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShownExit]);

  const handleOpenDemoFromPopup = () => {
    setShowExitPopup(false);
    setTimeout(() => {
      window.dispatchEvent(new Event('open-lead-widget'));
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/20">

      {/* Background Mesh/Grid Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v2H20v-2h16zm0-8v2H20v-2h16zm-16-8v2h16v-2H20zM0 0h60v60H0V0zm1 1h58v58H1V1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
      </div>

      {/* --- SOCIAL PROOF TOAST --- */}
      <SocialProofToast />

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Lead Widget</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Iniciar Sesión
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Link to="/register">
                <Button className="font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all btn-iridescent text-white">
                  Probar Gratis <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/register">
              <Button size="sm" className="font-bold">
                Probar
              </Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 mt-10">
                  <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">Lead Widget</span>
                  </Link>
                  <div className="grid gap-3">
                    <Link to="/login"><Button variant="outline" className="w-full justify-start">Iniciar Sesión</Button></Link>
                    <Link to="/register"><Button className="w-full justify-start">Crear Cuenta Gratis</Button></Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-16 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background dark:from-primary/5 dark:via-background dark:to-background -z-10" />

        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left Content */}
            <div className="flex-1 space-y-6 lg:space-y-8 text-center lg:text-left z-10 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold border border-primary/20 animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Sistema IA 2026 • <span>124 usuarios online hoy</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-balance">
                Convierte visitas en <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600 dark:to-emerald-400">
                  Leads Reales
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 text-pretty">
                El widget inteligente que detecta interés, captura datos y envía clientes calificados
                <strong className="text-foreground"> directo a tu WhatsApp</strong>. Sin formularios aburridos.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start w-full sm:w-auto">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="xl" className="w-full sm:w-auto text-lg font-bold h-14 px-8 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all btn-iridescent text-white">
                    Empezar Gratis
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto h-14 px-8 border-2 group"
                  onClick={() => window.dispatchEvent(new Event('open-lead-widget'))}
                >
                  <Play className="w-4 h-4 mr-2 fill-current opacity-50 group-hover:opacity-100 transition-opacity" />
                  Ver Demo en Vivo
                </Button>
              </div>

              <div className="pt-4 lg:pt-8 flex flex-wrap justify-center lg:justify-start gap-8 lg:gap-12 opacity-80">
                {stats.map(s => (
                  <div key={s.label} className="text-center lg:text-left">
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image/Mockup */}
            <div className="flex-1 relative w-full max-w-[350px] sm:max-w-[500px] lg:max-w-none mx-auto lg:mx-0 mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-3xl opacity-30 animate-pulse-slow" />
              <div className="relative bg-card border border-border/50 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden p-2 transform hover:scale-[1.01] transition-transform duration-500">
                <img
                  src="/assets/hero-mockup.png"
                  alt="Dashboard Preview"
                  className="w-full rounded-[1.5rem] sm:rounded-[2rem] shadow-inner bg-muted/50"
                />
                {/* Floating elements - Hidden on very small screens */}
                <div className="hidden sm:flex absolute -right-4 top-10 bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl shadow-xl items-center gap-3 animate-float border border-border scale-90 sm:scale-100">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold opacity-60">Nuevo Lead</p>
                    <p className="font-bold text-xs sm:text-sm">+51 902 *** ***</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- TRUST BADGE SECTION --- */}
      <section className="py-12 lg:py-16 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 max-w-xs mx-auto md:max-w-none">
            <div className="h-px w-12 bg-primary mx-auto mb-4 opacity-50" />
            <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 px-6">
              Funciona con cualquier ecosistema
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 md:gap-24">
            {[
              { name: 'WordPress', icon: Globe },
              { name: 'Shopify', icon: Globe },
              { name: 'Wix', icon: Globe },
              { name: 'React', icon: Globe },
              { name: 'Webflow', icon: Globe },
              { name: 'Carrd', icon: Globe }
            ].map((p, i) => (
              <div
                key={p.name}
                className="flex items-center gap-2 group cursor-pointer transition-all hover:scale-110"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <p.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="font-bold text-sm sm:text-base text-muted-foreground group-hover:text-foreground tracking-tight transition-colors">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PAIN POINTS SECTION (Dark Style) --- */}
      <section className="py-16 lg:py-24 px-4 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight text-balance">
                ¿Tu web tiene visitas pero <span className="text-primary italic">pocas ventas</span>?
              </h2>
              <p className="text-slate-400 text-base sm:text-lg mb-8 leading-relaxed text-pretty">
                El problema no es tu tráfico, es la fricción. Los formularios largos matan la conversión.
                Lead Widget elimina esa barrera conectando al cliente instantáneamente contigo.
              </p>

              <div className="space-y-4">
                {[
                  "Pierdes clientes porque no respondes al instante.",
                  "Tus formularios de contacto terminan en SPAM.",
                  "No sabes qué producto le interesa a tu visitante.",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CloseIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-300 font-medium text-sm sm:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-3xl blur opacity-30"></div>
              <div className="relative bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
                <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">La Solución Lead Widget</h3>
                    <p className="text-slate-400 text-xs sm:text-sm">Automatización inteligente</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { t: "Detección de Interés", d: "El widget aparece justo cuando el cliente duda." },
                    { t: "Pre-calificación", d: "La IA hace las preguntas clave por ti." },
                    { t: "Conexión Directa", d: "Recibes el lead limpio y listo para cerrar en WhatsApp." },
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1 text-sm sm:text-base">{step.t}</h4>
                        <p className="text-slate-400 text-xs sm:text-sm">{step.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-16 lg:py-24 px-4 bg-background" id="features">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 lg:mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">Todo lo que necesitas para escalar</h2>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty px-4">Más que un botón de WhatsApp, es un sistema completo de captura y cualificación.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
            {[
              { icon: Zap, t: "Instalación Flash", d: "Copia y pega una línea de código. Funciona en WordPress, Shopify, Wix y plataformas propias.", color: "blue" },
              { icon: Smartphone, t: "Mobile First", d: "Diseñado para sentirse nativo en celulares, donde ocurre el 80% de las ventas en Latinoamérica.", color: "emerald" },
              { icon: BarChart3, t: "Analytics Pro", d: "Mide cuántas personas abren el chat y cuántas realmente te hablan para optimizar tu inversión.", color: "purple" },
              { icon: Users, t: "Multi-Agente", d: "La IA responde por ti 24/7, escalando cientos de conversaciones simultáneas sin despeinarse.", color: "orange" },
              { icon: Globe, t: "100% Personalizable", d: "Adapta colores, textos y personalidad de la IA para que coincida perfectamente con tu marca.", color: "pink" },
              { icon: ShieldCheck, t: "Filtro de Calidad", d: "Filtra curiosos automáticamente. Solo te llegarán notificaciones de clientes con intención real.", color: "cyan" },
            ].map((f, i) => (
              <div key={i} className="group p-6 sm:p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:shadow-[0_0_30px_-10px_rgba(0,193,133,0.2)] transition-all duration-500">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500`}>
                  <f.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors">{f.t}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TEMPLATES SHOWCASE --- */}
      <section className="py-16 lg:py-24 px-4 bg-slate-950 text-white relative border-y border-white/5" id="templates">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 md:mb-12">
            <div className="text-left mb-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2">Plantillas por Industria</h2>
              <p className="text-slate-400 text-sm sm:text-base">La IA ya está entrenada para tu nicho. Elige una para ver la demo.</p>
            </div>
            <div className="flex flex-wrap gap-3 w-full overflow-x-auto pb-2 no-scrollbar">
              {nicheTemplates.map(t => (
                <button
                  key={t.name}
                  onClick={() => setActiveTemplate(t.name.toLowerCase())}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${activeTemplate === t.name.toLowerCase()
                    ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                >
                  <span className="text-lg">{t.emoji}</span> {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 shadow-sm flex flex-col md:flex-row gap-8 items-center backdrop-blur-sm">
            <div className="flex-1 space-y-4 w-full">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {nicheTemplates.find(t => t.name.toLowerCase() === activeTemplate)?.name}
              </h3>
              <p className="text-base sm:text-lg text-slate-400">
                {nicheTemplates.find(t => t.name.toLowerCase() === activeTemplate)?.desc}
              </p>
              <ul className="space-y-3 pt-4">
                {["Preguntas pre-configuradas", "Tono de voz adaptado", "Campos de captura específicos"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 bg-slate-950 rounded-2xl p-4 sm:p-6 w-full flex flex-col min-h-[300px] border border-white/10 shadow-2xl overflow-hidden relative group">
              {/* Header Simulation */}
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-white">IA Asistente</p>
                    <p className="text-[8px] text-primary">En línea</p>
                  </div>
                </div>
              </div>

              {/* Messages Simulation */}
              <div className="space-y-3 mb-4 flex-1">
                <div className="bg-white/5 p-3 rounded-2xl rounded-bl-none max-w-[80%] text-left">
                  <p className="text-[11px] text-slate-300">
                    {activeTemplate === 'inmobiliarias' && "👋 ¡Hola! ¿Buscas comprar o alquilar? Tengo opciones en Miraflores y San Isidro."}
                    {activeTemplate === 'clínicas' && "👋 Hola, soy el asistente médico. ¿Qué especialidad necesitas consultar hoy?"}
                    {activeTemplate === 'talleres' && "👋 ¡Hola! ¿Qué problema tiene tu vehículo? Podemos agendar una revisión."}
                    {activeTemplate === 'delivery' && "👋 ¡Hola! ¿A qué dirección enviamos tu pedido hoy?"}
                    {activeTemplate === 'ecommerce' && "👋 ¡Hola! ¿Tienes dudas con algún producto o con tu cupón de descuento?"}
                    {activeTemplate === 'general' && "👋 ¡Hola! ¿En qué podemos ayudarte el día de hoy?"}
                  </p>
                </div>
                <div className="bg-primary/20 p-3 rounded-2xl rounded-br-none max-w-[80%] ml-auto text-right border border-primary/20">
                  <p className="text-[11px] text-primary-foreground font-medium italic">El cliente responde...</p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl rounded-bl-none max-w-[80%] text-left animate-pulse">
                  <p className="text-[11px] text-slate-400">Escribiendo...</p>
                </div>
              </div>

              {/* Input Area Simulation */}
              <div className="mt-auto flex gap-2">
                <div className="h-8 flex-1 bg-white/5 rounded-full border border-white/10 px-3 flex items-center">
                  <p className="text-[10px] text-slate-500">Escribe algo...</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Send className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section className="py-16 lg:py-24 px-4 bg-slate-950 text-white" id="pricing">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10 lg:mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Precio Justo y Simple</h2>
            <p className="text-lg sm:text-xl text-slate-400">Sin comisiones por venta. Sin contratos forzosos.</p>
          </div>

          <div className="relative max-w-md mx-auto md:max-w-none">
            {/* Gradient Outline Effect */}
            <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-b from-primary/50 to-transparent blur-sm opacity-50" />

            <div className="relative bg-card rounded-[2rem] border shadow-2xl overflow-hidden">
              {/* Badge */}
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary" />
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                  Oferta Lanzamiento
                </span>
              </div>

              <div className="p-6 sm:p-10 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12 items-center">

                {/* Left: Price & Features */}
                <div className="flex-1 w-full text-center md:text-left mt-6 md:mt-0">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">Plan Mensual</p>
                  <div className="flex items-baseline justify-center md:justify-start gap-1 mb-8">
                    <span className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground">S/30</span>
                    <span className="text-lg text-muted-foreground font-medium">/mes</span>
                  </div>

                  <div className="space-y-4 mb-8 text-left max-w-xs mx-auto md:mx-0">
                    {[
                      "Widget Proactivo Ilimitado",
                      "Captura de Leads Ilimitada",
                      "Acceso al Dashboard",
                      "Soporte Prioritario WhatsApp"
                    ].map((f, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="font-medium text-sm sm:text-base">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/register" className="block w-full">
                    <Button size="lg" className="w-full font-bold text-base sm:text-lg h-12 sm:h-14 btn-iridescent text-white shadow-lg sm:shadow-xl shadow-primary/20 rounded-xl hover:scale-[1.02] transition-transform">
                      Comenzar Prueba Gratis
                    </Button>
                  </Link>
                  <p className="text-center text-xs text-muted-foreground mt-3">No requiere tarjeta de crédito</p>
                </div>

                {/* Right: Payment Methods */}
                <div className="w-full md:w-80 bg-muted/30 rounded-3xl p-6 border border-border/50 text-center">
                  <h4 className="font-bold mb-4 text-sm text-muted-foreground uppercase tracking-wide">Pagos Locales Flexibles</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* YAPE */}
                    <div className="bg-background p-3 rounded-xl border shadow-sm flex flex-col items-center gap-2 hover:border-[#742284] transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-[#742284] flex items-center justify-center text-white font-black italic text-[10px] transform -rotate-3 group-hover:scale-110 transition-transform">
                        Yape
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">Yape</span>
                    </div>

                    {/* PLIN */}
                    <div className="bg-background p-3 rounded-xl border shadow-sm flex flex-col items-center gap-2 hover:border-[#00D1D1] transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-[#00D1D1] flex items-center justify-center text-white font-bold text-[10px] group-hover:scale-110 transition-transform">
                        Plin
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">Plin</span>
                    </div>

                    {/* BCP */}
                    <div className="col-span-2 bg-background p-3 rounded-xl border shadow-sm flex items-center justify-center gap-2 hover:border-primary/50 transition-colors">
                      <span className="text-[10px] font-semibold text-muted-foreground">Transferencias BCP / Interbank</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-16 lg:py-24 px-4 bg-slate-950 text-white border-t border-white/5">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Preguntas Frecuentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              {
                q: "¿Necesito saber programar?",
                a: "Para nada. Es tan simple como copiar y pegar. Te damos un video tutorial de 2 minutos."
              },
              {
                q: "¿Qué pasa si se acaban mis 3 días gratis?",
                a: "El widget se detiene automáticamente. No te cobraremos nada. Si te gustó, puedes activar tu plan por S/30."
              },
              {
                q: "¿Funciona en celulares?",
                a: "Sí, el 85% del tráfico web en Perú es móvil. Nuestro widget está 100% optimizado para celulares."
              },
              {
                q: "¿Puedo cancelar cuando quiera?",
                a: "Sí, no hay contratos forzosos. Pagas el mes y si no quieres renovar, simplemente no pagas el siguiente."
              }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-white/10">
                <AccordionTrigger className="text-base sm:text-lg font-medium text-left hover:text-primary transition-colors">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-slate-400 text-sm sm:text-base">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* --- CTA BOTTOM --- */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative rounded-[2rem] sm:rounded-[3rem] bg-slate-900 overflow-hidden px-6 py-12 sm:px-8 sm:py-16 md:p-20 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat animate-[shine_3s_infinite]" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />

            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10 text-balance">
              Deja de perder ventas hoy mismo
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto relative z-10 text-pretty">
              Tu competencia ya está automatizando. Adelántate y captura esos leads antes que ellos.
            </p>
            <Link to="/register" className="relative z-10 w-full sm:w-auto block sm:inline-block">
              <Button size="xl" className="btn-iridescent text-white hover:scale-105 font-bold h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all border-none w-full sm:w-auto">
                Crear Cuenta Gratis
              </Button>
            </Link>
            <p className="text-slate-500 text-xs sm:text-sm mt-6 relative z-10">Hecho en Lima, Perú 🇵🇪</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-16 border-t border-white/10 bg-slate-950 text-white relative overflow-hidden px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="font-black text-xl tracking-tight">Lead Widget</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                El widget inteligente que revoluciona la captura de leads en Perú y Latinoamérica.
                Convierte cada visita en una oportunidad real.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-white">Producto</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary transition-colors">Características</button></li>
                <li><button onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary transition-colors">Plantillas</button></li>
                <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary transition-colors">Integraciones</button></li>
                <li><button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary transition-colors">Precios</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-white">Compañía</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-primary transition-colors">Sobre Nosotros</button></li>
                <li><button className="hover:text-primary transition-colors opacity-50 cursor-not-allowed">Casos de Éxito</button></li>
                <li><button className="hover:text-primary transition-colors opacity-50 cursor-not-allowed">Blog</button></li>
                <li><button onClick={() => window.dispatchEvent(new Event('open-lead-widget'))} className="hover:text-primary transition-colors">Soporte</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-white">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="hover:text-primary transition-colors cursor-pointer">Privacidad</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Términos de servicio</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Libro de reclamaciones</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>&copy; 2026 Lead Widget. Todos los derechos reservados. Hecho con ❤️ en Lima, Perú.</p>
            <div className="flex gap-6">
              <span className="hover:text-primary transition-colors cursor-pointer">Instagram</span>
              <span className="hover:text-primary transition-colors cursor-pointer">LinkedIn</span>
              <span className="hover:text-primary transition-colors cursor-pointer">WhatsApp</span>
            </div>
          </div>
        </div>
      </footer>

      <SalesWidget />

      {/* Exit Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-card w-full max-w-lg p-1 sm:p-2 rounded-[2.5rem] border shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="bg-background rounded-[2rem] p-8 md:p-12 text-center space-y-6 relative overflow-hidden">
              {/* Decorative background circle */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

              <button
                onClick={() => setShowExitPopup(false)}
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-gradient-to-tr from-primary to-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-primary/20 rotate-6 transform transition-transform group-hover:rotate-0">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tight">¡Vaya, no te vayas!</h3>
                <p className="text-muted-foreground text-lg text-balance">
                  Estás a un click de ver cómo la IA puede <span className="text-primary font-bold">duplicar tus ventas</span>. Prueba la demo sin compromiso.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleOpenDemoFromPopup}
                  className="w-full font-bold h-14 text-lg btn-iridescent text-white shadow-xl shadow-primary/30 rounded-xl"
                  size="lg"
                >
                  Probar Demo Gratis Ahora
                </Button>
                <button
                  onClick={() => setShowExitPopup(false)}
                  className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                >
                  No, prefiero seguir perdiendo clientes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

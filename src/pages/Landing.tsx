import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SalesWidget } from '@/components/SalesWidget';
import { ModeToggle } from '@/components/mode-toggle';
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
  Play
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const nicheTemplates = [
  { name: 'Inmobiliarias', emoji: '🏠', desc: 'Captura distrito y habitaciones' },
  { name: 'Clínicas', emoji: '🏥', desc: 'Especialidad y urgencia' },
  { name: 'Talleres', emoji: '🔧', desc: 'Tipo de vehículo y problema' },
  { name: 'Delivery', emoji: '🛵', desc: 'Dirección de entrega' },
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">

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
              <ModeToggle />
              <Link to="/register">
                <Button className="font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  Probar Gratis <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center gap-2">
            <ModeToggle />
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
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background dark:from-primary/5 dark:via-background dark:to-background -z-10" />

        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left Content */}
            <div className="flex-1 space-y-8 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20 animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Nuevo Sistema 2026
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Convierte visitas en <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600 dark:to-emerald-400">
                  Leads Reales
                </span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                El widget inteligente que detecta interés, captura datos y envía clientes calificados
                <strong className="text-foreground"> directo a tu WhatsApp</strong>. Sin formularios aburridos.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="xl" className="w-full sm:w-auto text-lg font-bold h-14 px-8 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
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

              <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 opacity-80">
                {stats.map(s => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image/Mockup */}
            <div className="flex-1 relative w-full max-w-[500px] lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-3xl opacity-30 animate-pulse-slow" />
              <div className="relative bg-card border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden p-2 transform hover:scale-[1.01] transition-transform duration-500">
                <img
                  src="/assets/hero-mockup.png"
                  alt="Dashboard Preview"
                  className="w-full rounded-[2rem] shadow-inner bg-muted/50"
                />
                {/* Floating elements */}
                <div className="absolute -right-4 top-10 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-float border border-border">
                  <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold opacity-60">Nuevo Lead</p>
                    <p className="font-bold text-sm">+51 902 *** ***</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- TRUST BADGE SECTION --- */}
      <section className="py-10 border-y border-border/40 bg-muted/20">
        <div className="container mx-auto text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            Compatible con todas las plataformas
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['WordPress', 'Shopify', 'Wix', 'React', 'Webflow', 'Carrd'].map(p => (
              <div key={p} className="flex items-center gap-2 font-bold text-xl text-slate-500 hover:text-primary cursor-default">
                <Globe className="w-5 h-5" /> {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PAIN POINTS SECTION (Dark Style) --- */}
      <section className="py-24 px-4 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                ¿Tu web tiene visitas pero <span className="text-primary italic">pocas ventas</span>?
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
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
                      <CloseIcon className="w-4 h-4" />
                    </div>
                    <span className="text-slate-300 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-3xl blur opacity-30"></div>
              <div className="relative bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl">
                <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">La Solución Lead Widget</h3>
                    <p className="text-slate-400 text-sm">Automatización inteligente</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { t: "Detección de Interés", d: "El widget aparece justo cuando el cliente duda." },
                    { t: "Pre-calificación", d: "La IA hace las preguntas clave por ti." },
                    { t: "Conexión Directa", d: "Recibes el lead limpio y listo para cerrar en WhatsApp." },
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{step.t}</h4>
                        <p className="text-slate-400 text-sm">{step.d}</p>
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
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Todo lo que necesitas para escalar</h2>
            <p className="text-lg text-muted-foreground">Más que un botón de WhatsApp, es un sistema completo de captura y cualificación.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Zap, t: "Instalación Flash", d: "Copia y pega una línea de código. Funciona en WordPress, Shopify, Wix y código propio." },
              { icon: Smartphone, t: "Mobile First", d: "Diseñado para sentirse nativo en celulares, donde ocurre el 80% de las ventas." },
              { icon: BarChart3, t: "Analytics Pro", d: "Mide cuántas personas abren el chat y cuántas realmente te hablan." },
              { icon: Users, t: "Multi-Agente", d: "La IA responde por ti 24/7, escalando cientos de conversaciones simultáneas." },
              { icon: Globe, t: "100% Customizable", d: "Adapta los colores, textos y logo para que coincida perfectamente con tu marca." },
              { icon: ShieldCheck, t: "Anti-Spam", d: "Filtra curiosos. Solo te llegarán notificaciones de clientes reales." },
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{f.t}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TEMPLATES SHOWCASE --- */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Plantillas por Industria</h2>
              <p className="text-muted-foreground">La IA ya está entrenada para tu nicho.</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              {nicheTemplates.map(t => (
                <button
                  key={t.name}
                  onClick={() => setActiveTemplate(t.name.toLowerCase())}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTemplate === t.name.toLowerCase()
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-background hover:bg-muted-foreground/10 border'
                    }`}
                >
                  {t.emoji} {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-background rounded-3xl p-8 border shadow-sm flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold">
                {nicheTemplates.find(t => t.name.toLowerCase() === activeTemplate)?.name}
              </h3>
              <p className="text-lg text-muted-foreground">
                {nicheTemplates.find(t => t.name.toLowerCase() === activeTemplate)?.desc}
              </p>
              <ul className="space-y-3 pt-4">
                {["Preguntas pre-configuradas", "Tono de voz adaptado", "Campos de captura específicos"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 bg-muted/50 rounded-2xl p-6 w-full flex items-center justify-center min-h-[300px]">
              <div className="text-center opacity-60">
                <Smartphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p>Vista previa del template {activeTemplate}</p>
                <p className="text-xs">(Interactúa con el demo real para probarlo)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section className="py-24 px-4 bg-background" id="pricing">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4">Precio Justo y Simple</h2>
            <p className="text-xl text-muted-foreground">Sin comisiones por venta. Sin contratos forzosos.</p>
          </div>

          <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-b from-primary/50 to-transparent">
            <div className="bg-card rounded-[2.3rem] p-8 md:p-12 border shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-6 py-2 rounded-bl-3xl font-bold text-sm">
                OFERTA LANZAMIENTO
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">Plan Mensual</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-6xl font-black tracking-tighter">S/30</span>
                    <span className="text-xl text-muted-foreground font-medium">/mes</span>
                  </div>

                  <div className="space-y-4 mb-8">
                    {[
                      "Widget Proactivo Ilimitado",
                      "Captura de Leads Ilimitada",
                      "Acceso al Dashboard",
                      "Soporte Prioritario WhatsApp"
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-medium">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/register">
                    <Button size="xl" className="w-full font-bold text-lg h-14">
                      Comenzar Prueba Gratis
                    </Button>
                  </Link>
                  <p className="text-center text-xs text-muted-foreground mt-3">3 días de prueba sin tarjeta</p>
                </div>

                <div className="bg-muted/30 rounded-3xl p-8 border text-center">
                  <h4 className="font-bold mb-6">Métodos de Pago Locales</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                      <div className="w-8 h-8 rounded bg-[#742284]" />
                      <span className="font-bold text-xs">Yape</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                      <div className="w-8 h-8 rounded bg-[#00D1D1]" />
                      <span className="font-bold text-xs">Plin</span>
                    </div>
                    <div className="col-span-2 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                      <span className="font-bold text-xs">Transferencia BCP / Interbank</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-20 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
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
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-lg font-medium">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* --- CTA BOTTOM --- */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative rounded-[3rem] bg-slate-900 overflow-hidden px-8 py-16 md:p-20 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat animate-[shine_3s_infinite]" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />

            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">
              Deja de perder ventas hoy mismo
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              Tu competencia ya está automatizando. Adelántate y captura esos leads antes que ellos.
            </p>
            <Link to="/register" className="relative z-10">
              <Button size="xl" className="bg-white text-slate-900 hover:bg-slate-100 font-bold h-16 px-12 text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                Crear Cuenta Gratis
              </Button>
            </Link>
            <p className="text-slate-500 text-sm mt-6 relative z-10">Hecho en Lima, Perú 🇵🇪</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t bg-muted/10">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="font-bold text-foreground">Lead Widget</span>
          </div>
          <p>&copy; 2026 Lead Widget. Todos los derechos reservados.</p>
        </div>
      </footer>

      <SalesWidget />

      {/* Exit Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-lg p-8 rounded-3xl border shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setShowExitPopup(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><CloseIcon /></button>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold">¡Espera un segundo!</h3>
              <p className="text-muted-foreground">¿Te vas sin probar cómo funciona? La demo es gratis y toma 1 minuto.</p>
              <Button onClick={handleOpenDemoFromPopup} className="w-full font-bold" size="lg">Ver Demo Rápida</Button>
              <button onClick={() => setShowExitPopup(false)} className="text-sm text-muted-foreground underline">No gracias, prefiero perder leads</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

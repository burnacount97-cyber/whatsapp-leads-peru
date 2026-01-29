import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WidgetPreview } from '@/components/WidgetPreview';
import { SalesWidget } from '@/components/SalesWidget';
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
  Shield,
  Menu,
  X as CloseIcon,
  MousePointer2,
  HelpCircle,
  Layers,
  Monitor,
  Wrench,
  Globe,
  Copy
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const features = [
  {
    icon: MessageCircle,
    title: 'Widget Proactivo',
    description: 'Se activa automáticamente cuando detecta interés del visitante',
  },
  {
    icon: Smartphone,
    title: 'Directo a WhatsApp',
    description: 'Los leads te llegan al instante a tu WhatsApp Business',
  },
  {
    icon: BarChart3,
    title: 'Analytics en Tiempo Real',
    description: 'Mide visitas, conversiones y rendimiento de tu widget',
  },
  {
    icon: Zap,
    title: 'Instalación en 2 minutos',
    description: 'Solo copia y pega un código en tu web. Listo.',
  },
];

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
      // clientY <= 0 detects mouse leaving at the top (exit intent)
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
    // Give a small delay for the modal to close and then open the widget
    setTimeout(() => {
      window.dispatchEvent(new Event('open-lead-widget'));
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Lead Widget</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link to="/register">
              <Button variant="hero">
                Probar Gratis <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {/* Small CTA always visible */}
            <Link to="/register">
              <Button variant="hero" size="sm" className="h-9 px-3 text-xs">
                Probar Gratis
              </Button>
            </Link>

            {/* Hamburger Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-6 mt-10">
                  <Link to="/" className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">Lead Widget</span>
                  </Link>

                  <div className="flex flex-col gap-3">
                    <Link to="/login">
                      <Button variant="outline" className="w-full justify-start">
                        Iniciar Sesión
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="hero" className="w-full justify-start">
                        Probar Gratis 3 días
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-auto p-4 bg-muted/50 rounded-xl">
                    <p className="text-sm text-muted-foreground">
                      ¿Dudas? Escríbenos al WhatsApp
                    </p>
                    <Button variant="link" className="px-0 text-primary">
                      Contactar soporte
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Zap className="w-4 h-4" />
                Trial 3 días gratis • Sin tarjeta
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                Convierte visitas web en{' '}
                <span className="hero-text-gradient">leads de WhatsApp</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg">
                Widget inteligente que detecta interés y captura datos de contacto.
                Los leads te llegan directo al WhatsApp. <strong>Hecho para emprendedores peruanos.</strong>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto pulse-glow">
                    Empezar Gratis <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto"
                  onClick={() => window.dispatchEvent(new Event('open-lead-widget'))}
                >
                  Ver Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget Demo */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative animate-float">
                <img
                  src="/assets/hero-mockup.png"
                  alt="LeadWidget AI Mockup"
                  className="w-full max-w-[500px] drop-shadow-[0_20px_50px_rgba(0,193,133,0.3)] rounded-[2.5rem]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ideal For Section */}
      <section className="py-24 px-4 relative overflow-hidden bg-[#020617]">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-[#0f172a] rounded-[3rem] p-8 md:p-16 border border-white/5 relative overflow-hidden shadow-2xl">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 blur-[100px] -ml-32 -mb-32" />

            <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1]">
                    Este sistema es <br />
                    <span className="text-primary italic">para ti</span> si...
                  </h2>
                  <p className="text-slate-400 text-lg md:text-xl max-w-md leading-relaxed">
                    Diseñamos Lead Widget para resolver los problemas reales de conversión de los negocios digitales en Perú.
                  </p>
                </div>

                <div className="grid gap-4">
                  {[
                    "Inviertes en Facebook o Google Ads y sientes que estás 'quemando' dinero porque tu página actual no convierte.",
                    "Recibes tráfico diario de calidad, pero tu facturación está estancada porque no respondes al instante.",
                    "Buscas reducir drásticamente tu costo por lead (CPL) y aumentar el retorno de tu inversión publicitaria.",
                    "Quieres escalar tus ventas automatizando el 100% de la pre-calificación de prospectos los 365 días del año."
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-center p-6 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.05] hover:border-primary/30 transition-all duration-300 group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,193,133,0.4)] group-hover:scale-110 transition-transform">
                        <Check className="w-5 h-5 text-white stroke-[3]" />
                      </div>
                      <p className="text-slate-300 text-sm md:text-[15px] font-medium leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                {/* Decorative glows fixed behind image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 blur-3xl opacity-30 -rotate-6" />

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                  <div className="relative bg-[#1e293b] rounded-[2rem] p-3 overflow-hidden shadow-2xl border border-white/10">
                    <img
                      src="/assets/entrepreneur.png"
                      alt="Emprendedora exitosa con LeadWidget"
                      className="rounded-[1.5rem] w-full aspect-[4/5] object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    />

                    {/* Testimonial Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-8">
                      {/* Lead Notification Mockup Badge */}
                      <div className="absolute right-6 bottom-32 animate-bounce-slow">
                        <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-slate-200 flex items-center gap-3 scale-90 md:scale-100">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Lead Notification</p>
                            <p className="text-xs font-bold text-slate-900">¡Nuevo Lead de WhatsApp!</p>
                          </div>
                          <div className="ml-2 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                      </div>

                      <p className="text-white text-base md:text-lg font-medium italic leading-relaxed">
                        "Desde que instalé LeadWidget, no se me escapa ni un solo cliente por WhatsApp."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Instalación en <span className="text-primary italic">3 simples pasos</span></h2>
            <p className="text-lg text-muted-foreground">Estarás capturando nuevos leads en menos de lo que toma hacer un café.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-12" />

            {[
              {
                step: "01",
                title: "Regístrate y Configura",
                desc: "Crea tu cuenta, elige tus colores y define qué quieres que pregunte la IA según tu industria.",
                icon: Users
              },
              {
                step: "02",
                title: "Copia el Código",
                desc: "Te daremos una línea única de script. Solo cópiala y pégala en el head o body de tu sitio.",
                icon: Copy
              },
              {
                step: "03",
                title: "Recibe Leads",
                desc: "La IA empezará a trabajar 24/7. Recibirás cada consulta calificada directamente en tu WhatsApp.",
                icon: Zap
              }
            ].map((s, idx) => (
              <div key={idx} className="relative z-10 text-center space-y-6 group">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto group-hover:bg-primary group-hover:scale-110 transition-all duration-500 shadow-sm relative">
                  <s.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center border-4 border-background">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section - Industry switcher style */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Escalamos tu industria con <span className="hero-text-gradient">IA Estratégica</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cada negocio es diferente, por eso nuestra IA se adapta a tus necesidades específicas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Ecommerce & Tiendas",
                icon: "🛍️",
                points: ["Responde dudas de stock y tallas", "Explica métodos de envío", "Cierra la venta enviándolos al checkout"]
              },
              {
                title: "Inmobiliarias & Proyectos",
                icon: "🏢",
                points: ["Filtra por presupuesto y zona", "Recolecta datos de contacto", "Pre-agenda visitas a pilotos"]
              },
              {
                title: "Clínicas & Consultorios",
                icon: "🩺",
                points: ["Informa sobre especialidades", "Capta pacientes interesados", "Fácil gestión de consultas"]
              },
              {
                title: "Talleres & Servicios",
                icon: "🔧",
                points: ["Consulta marca y falla técnica", "Ofrece turnos de atención", "Aumenta la confianza del cliente"]
              },
              {
                title: "Educación & Cursos",
                icon: "🎓",
                points: ["Explica mallas curriculares", "Capta leads para asesores", "Envía brochures digitales"]
              },
              {
                title: "Asesoría & B2B",
                icon: "💼",
                points: ["Califica tamaño de empresa", "Agenda llamadas de demo", "Resume servicios corporativos"]
              }
            ].map((useCase, idx) => (
              <div key={idx} className="bg-background border border-border/50 p-8 rounded-3xl card-hover relative overflow-hidden group">
                <div className="text-4xl mb-6">{useCase.icon}</div>
                <h3 className="text-xl font-bold mb-4">{useCase.title}</h3>
                <ul className="space-y-3">
                  {useCase.points.map((point, pi) => (
                    <li key={pi} className="flex gap-2 text-sm text-muted-foreground items-center">
                      <TrendingUp className="w-4 h-4 text-primary opacity-50" />
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Templates listos para tu nicho
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Preguntas optimizadas para cada industria. <strong>Además, puedes personalizarlo 100%</strong>: colores, nombre de negocio, logo y el tono de voz de la IA para que encaje perfecto con tu marca.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {nicheTemplates.map((template) => (
              <button
                key={template.name}
                onClick={() => setActiveTemplate(template.name.toLowerCase())}
                className={`p-4 rounded-xl border-2 transition-all text-left ${activeTemplate === template.name.toLowerCase()
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
                  }`}
              >
                <span className="text-3xl mb-2 block">{template.emoji}</span>
                <p className="font-semibold">{template.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{template.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-16 px-4 bg-muted/20 border-y border-border/50 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-10">
            Compatible con cualquier plataforma web
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-60">
            {['WordPress', 'Shopify', 'Wix', 'WooCommerce', 'Prestashop', 'Carrd'].map((plat) => (
              <div key={plat} className="flex flex-col items-center gap-2 group cursor-default hover:opacity-100 transition-opacity">
                <Globe className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium text-slate-500 group-hover:text-foreground transition-colors">{plat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-muted/30" id="pricing">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Un precio simple. Sin sorpresas.
            </h2>
            <p className="text-lg text-muted-foreground">
              Paga con Yape, Plin o transferencia. 100% peruano.
            </p>
          </div>

          <div className="bg-card rounded-3xl border-2 border-primary shadow-glow p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Star className="w-4 h-4" /> Más popular
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-extrabold">S/30</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                <ul className="space-y-3">
                  {[
                    'Widget proactivo ilimitado',
                    'Leads ilimitados',
                    'Analytics en tiempo real',
                    'Soporte WhatsApp',
                    '5 templates de nicho',
                    'Export CSV de leads',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-5 h-5 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-muted/50 rounded-2xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">Paga con</p>
                <div className="flex justify-center gap-4 mb-6">
                  {/* YAPE - Morado */}
                  <div className="w-16 h-16 bg-[#742284] rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                    <span className="text-white font-bold text-xs">YAPE</span>
                  </div>
                  {/* PLIN - Turquesa */}
                  <div className="w-16 h-16 bg-[#00D1D1] rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                    <span className="text-white font-bold text-xs">PLIN</span>
                  </div>
                  {/* SCOTIABANK - Rojo */}
                  <div className="w-16 h-16 bg-[#EC111A] rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                    <span className="text-white font-bold text-[10px] text-center leading-tight">Scotia<br />bank</span>
                  </div>
                </div>
                <Link to="/register">
                  <Button variant="hero" size="lg" className="w-full">
                    Empezar 3 días gratis
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3">Sin tarjeta de crédito</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-background" id="faq">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Preguntas Frecuentes</h2>
            <p className="text-muted-foreground">Todo lo que necesitas saber antes de empezar.</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[
              {
                q: "¿Necesito saber programar para instalarlo?",
                a: "No. Solo debes copiar una línea de código que te entregamos y pegarla en tu sitio web. Es como poner un código de Google Analytics o Facebook Pixel."
              },
              {
                q: "¿Qué pasa si se acaban mis 3 días de trial?",
                a: "Tu widget se desactivará automáticamente. Para reactivarlo, podrás suscribirte por S/30 mes. No perderás tu configuración ni tus leads capturados."
              },
              {
                q: "¿La IA sabe responder cosas específicas de mi negocio?",
                a: "¡Sí! En el dashboard hay un campo de 'Descripción del Negocio'. Allí puedes poner tus horarios, precios, zonas de envío, etc. La IA usará eso para responder."
              },
              {
                q: "¿Funciona en móviles?",
                a: "Totalmente. El widget está optimizado para dispositivos móviles y es muy ligero, no afectará la velocidad de carga de tu página."
              },
              {
                q: "¿Aceptan pagos locales?",
                a: "Sí, aceptamos Yape, Plin y transferencias de bancos locales (BCP, Scotiabank, BBVA, Interbank)."
              }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/50">
                <AccordionTrigger className="text-left font-bold hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="hero-gradient rounded-[3rem] p-12 text-white text-center relative overflow-hidden shadow-glow">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl md:text-5xl font-extrabold">¿Listo para llenar tu WhatsApp de clientes?</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Únete a los negocios que ya están automatizando sus ventas con IA. Empieza hoy tus 3 días de prueba sin riesgos.
              </p>
              <div className="flex justify-center pt-4">
                <Link to="/register" className="w-full sm:w-auto px-4 sm:px-0">
                  <Button size="xl" variant="secondary" className="w-full bg-white text-primary hover:bg-slate-100 font-bold h-14 md:px-12 text-xs sm:text-sm md:text-lg whitespace-normal sm:whitespace-nowrap leading-tight sm:leading-normal">
                    REGISTRARME GRATIS AHORA
                  </Button>
                </Link>
              </div>
              <p className="text-xs opacity-75">Sin pagos ocultos • Soporte local • Hecho en Perú 🇵🇪</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Lead Widget</span>
            </div>

            <p className="text-muted-foreground text-sm flex items-center gap-2">
              Hecho con ❤️ en Perú para emprendedores 🇵🇪
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link to="/login" className="hover:text-foreground transition-colors">Iniciar Sesión</Link>
              <Link to="/register" className="hover:text-foreground transition-colors">Registrarse</Link>
            </div>
          </div>
        </div>
      </footer>
      <SalesWidget />

      {/* Exit Intent Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative bg-card border-2 border-primary/50 shadow-glow rounded-[2rem] max-w-lg w-full p-8 md:p-12 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
            {/* Decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />

            <button
              onClick={() => setShowExitPopup(false)}
              className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="relative space-y-6 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
                <MousePointer2 className="w-10 h-10 text-primary" />
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                ¡Espera! No te vayas sin <span className="text-primary italic">duplicar</span> tus ventas 🚀
              </h2>

              <p className="text-lg text-muted-foreground">
                Prueba **Lead Widget** gratis por 3 días y mira cómo tu WhatsApp se llena de clientes calificados automáticamente.
              </p>

              <div className="pt-4 flex flex-col gap-4">
                <Button
                  variant="hero"
                  size="xl"
                  className="w-full shadow-lg group"
                  onClick={handleOpenDemoFromPopup}
                >
                  Probar Demo Ahora
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <button
                  onClick={() => setShowExitPopup(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                >
                  No me interesa vender más, gracias.
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

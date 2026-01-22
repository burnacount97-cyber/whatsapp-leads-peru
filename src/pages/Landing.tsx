import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WidgetPreview } from '@/components/WidgetPreview';
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
  Shield
} from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">LeadWidget<span className="text-primary">.pe</span></span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link to="/register">
              <Button variant="hero">
                Probar Gratis <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
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
                Trial 7 días gratis • Sin tarjeta
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
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
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
              <div className="relative">
                {/* Phone mockup */}
                <div className="w-[320px] h-[640px] bg-foreground/5 rounded-[3rem] p-3 shadow-2xl">
                  <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden relative">
                    {/* Browser bar */}
                    <div className="bg-muted p-3 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-destructive/50" />
                        <div className="w-3 h-3 rounded-full bg-warning/50" />
                        <div className="w-3 h-3 rounded-full bg-success/50" />
                      </div>
                      <div className="flex-1 bg-background rounded-md px-3 py-1 text-xs text-muted-foreground">
                        tuempresa.pe
                      </div>
                    </div>
                    {/* Content placeholder */}
                    <div className="p-4 space-y-4">
                      <div className="h-32 bg-muted rounded-xl" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                      <div className="h-24 bg-muted rounded-xl" />
                    </div>
                    {/* Widget positioned inside phone */}
                    <div className="absolute bottom-0 right-0 p-4">
                      <WidgetPreview template={activeTemplate} />
                    </div>
                  </div>
                </div>
                
                {/* Floating badge */}
                <div className="absolute -left-20 top-20 bg-card shadow-lg rounded-xl p-4 animate-bounce-subtle hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="font-bold">+28 leads</p>
                      <p className="text-xs text-muted-foreground">esta semana</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Todo lo que necesitas para capturar más leads
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un widget inteligente que trabaja 24/7 para convertir visitantes en clientes potenciales
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="stat-card card-hover">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
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
              Preguntas optimizadas para cada industria. Solo personaliza y activa.
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-4">
            {nicheTemplates.map((template) => (
              <button
                key={template.name}
                onClick={() => setActiveTemplate(template.name.toLowerCase())}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  activeTemplate === template.name.toLowerCase()
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
                  <div className="w-16 h-16 bg-[#00C185] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xs">YAPE</span>
                  </div>
                  <div className="w-16 h-16 bg-[#7B2CBF] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xs">PLIN</span>
                  </div>
                  <div className="w-16 h-16 bg-[#005EB8] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xs">BCP</span>
                  </div>
                </div>
                <Link to="/register">
                  <Button variant="hero" size="lg" className="w-full">
                    Empezar 7 días gratis
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3">Sin tarjeta de crédito</p>
              </div>
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
              <span className="font-bold text-xl">LeadWidget<span className="text-primary">.pe</span></span>
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
    </div>
  );
}

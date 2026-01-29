import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { MessageCircle, Loader2, ArrowLeft, Check, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const benefits = [
  'Widget proactivo ilimitado',
  'Leads directo a WhatsApp',
  'Analytics en tiempo real',
  'Soporte por WhatsApp',
];

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error, data } = await signUp(email, password, businessName);

    if (error) {
      toast({
        title: 'Error al registrarse',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      // Firebase automatically logs in the user after registration
      if (data) {
        navigate('/app');
      } else {
        // Fallback or confirmation flow if needed (unlikely with default Firebase)
        setIsSubmitted(true);
        setLoading(false);
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">¡Casi listo!</h1>
            <p className="text-muted-foreground text-lg">
              Hemos enviado un enlace de confirmación a <span className="font-semibold text-foreground">{email}</span>.
            </p>
          </div>

          <div className="bg-muted/50 p-6 rounded-2xl text-left space-y-4">
            <p className="text-sm font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" /> Verifica tu bandeja de entrada
            </p>
            <p className="text-sm font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" /> Pulsa en el botón de confirmación
            </p>
            <p className="text-sm font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" /> Comienza a capturar leads
            </p>
          </div>

          <div className="space-y-4">
            <Button asChild variant="hero" className="w-full h-12">
              <Link to="/login">
                Ir al Inicio de Sesión
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>

            <p className="text-sm text-muted-foreground">
              ¿No recibiste el correo? Revisa tu carpeta de spam o{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-primary hover:underline font-medium"
              >
                intenta con otro correo
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decoration */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
            <MessageCircle className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">3 días de prueba gratis</h2>
          <p className="text-lg opacity-90 mb-8">
            Sin tarjeta de crédito. Cancela cuando quieras.
          </p>

          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                {benefit}
              </li>
            ))}
          </ul>

          <div className="mt-12 p-6 bg-white/10 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full" />
              <div>
                <p className="font-semibold">María Fernández</p>
                <p className="text-sm opacity-80">Inmobiliaria MF</p>
              </div>
            </div>
            <p className="text-sm opacity-90">
              "En el primer mes conseguimos 45 leads nuevos. El widget se paga solo."
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-2xl">Lead Widget</span>
            </div>
            <h1 className="text-3xl font-bold mt-6">Crea tu cuenta gratis</h1>
            <p className="text-muted-foreground mt-2">Empieza a capturar leads en minutos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nombre de tu negocio</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Mi Empresa SAC"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@empresa.pe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Empezar Trial Gratis'
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            Al registrarte aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </div>
      </div>
    </div>
  );
}

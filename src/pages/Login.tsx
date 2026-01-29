import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { MessageCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const { signIn, user, isSuperAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !authLoading) {
      // DEBUG LOGS
      console.log('Login useEffect:', { userEmail: user.email, isSuperAdmin });

      // Check role OR specific email hardcoded fallback (for instant feedback)
      if (isSuperAdmin || user.email === 'superadmin2@leadwidget.pe' || user.email === 'superadmin@leadwidget.pe') {
        console.log('Redirecting to SUPERADMIN');
        navigate('/superadmin');
      } else {
        console.log('Redirecting to APP');
        navigate('/app');
      }
    }
  }, [user, isSuperAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: 'Error al iniciar sesión',
          description: error.message,
          variant: 'destructive',
        });
        setLocalLoading(false);
      }
      // Redirect handled by useEffect
    } catch (err: any) {
      toast({
        title: 'Error inesperado',
        description: err.message,
        variant: 'destructive',
      });
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
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
              <span className="font-bold text-2xl">Lead <span className="text-primary">Widget</span></span>
            </div>
            <h1 className="text-3xl font-bold mt-6">Bienvenido de vuelta</h1>
            <p className="text-muted-foreground mt-2">Ingresa a tu dashboard para gestionar tus leads</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={localLoading || authLoading}
            >
              {localLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Decoration */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="text-center text-primary-foreground max-w-md">
          <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <MessageCircle className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Captura leads 24/7</h2>
          <p className="text-lg opacity-90">
            Tu widget trabaja mientras duermes. Cada visita es una oportunidad de negocio.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check session on mount
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        checkRoleAndRedirect(session.user.id);
      }
    });
  }, []);

  const checkRoleAndRedirect = async (userId: string) => {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 8000)
    );

    try {
      // Race the actual check against the timeout
      const { data: roles, error } = await Promise.race([
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'superadmin')
          .maybeSingle(),
        timeoutPromise
      ]) as any;

      if (error) {
        console.error("Error checking roles:", error);
        navigate('/app');
        return;
      }

      if (roles) {
        navigate('/superadmin');
      } else {
        navigate('/app');
      }
    } catch (err: any) {
      console.error("Critical error or timeout in role check:", err);
      // Fallback: Si falla el chequeo de roles o hay timeout, asumimos usuario normal
      navigate('/app');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 10000)
    );

    try {
      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        timeoutPromise
      ]) as any;

      if (error) {
        toast({
          title: 'Error al iniciar sesión',
          description: error.message,
          variant: 'destructive',
        });
        setLoading(false);
      } else if (data.user) {
        // Check roles before redirecting
        await checkRoleAndRedirect(data.user.id);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      const isTimeout = err.message === 'TIMEOUT';
      toast({
        title: isTimeout ? 'Servidor lento' : 'Error inesperado',
        description: isTimeout
          ? 'El servicio de Supabase está tardando demasiado. Por favor, intenta de nuevo en unos momentos.'
          : (err.message || 'Ocurrió un error al intentar ingresar.'),
        variant: 'destructive',
      });
      setLoading(false);
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
              disabled={loading}
            >
              {loading ? (
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

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WidgetPreview } from '@/components/WidgetPreview';
import { useToast } from '@/hooks/use-toast';
import {
  MessageCircle,
  Settings,
  BarChart3,
  Users,
  CreditCard,
  LogOut,
  Copy,
  Download,
  TrendingUp,
  Eye,
  Target,
  Loader2,
  Upload,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Lead = Tables<'leads'>;
type WidgetConfig = Tables<'widget_configs'>;
type Profile = Tables<'profiles'>;
type Payment = Tables<'payments'>;

const templates = [
  { value: 'general', label: 'General', question: '¿En qué podemos ayudarte?' },
  { value: 'inmobiliaria', label: 'Inmobiliaria', question: '¿Qué distrito y cuántas habitaciones buscas?' },
  { value: 'clinica', label: 'Clínica', question: '¿Qué especialidad necesitas?' },
  { value: 'taller', label: 'Taller', question: '¿Qué vehículo y qué problema tienes?' },
  { value: 'delivery', label: 'Delivery', question: '¿Cuál es tu dirección de entrega?' },
];

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Widget config form state
  const [formConfig, setFormConfig] = useState({
    template: 'general',
    primary_color: '#00C185',
    welcome_message: '¡Hola! ¿En qué podemos ayudarte?',
    whatsapp_destination: '',
    niche_question: '¿En qué distrito te encuentras?',
    trigger_delay: 15,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      loadData();
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      setProfile(profileData);

      // Load widget config
      const { data: configData } = await supabase
        .from('widget_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (configData) {
        setWidgetConfig(configData);
        setFormConfig({
          template: configData.template || 'general',
          primary_color: configData.primary_color || '#00C185',
          welcome_message: configData.welcome_message || '¡Hola! ¿En qué podemos ayudarte?',
          whatsapp_destination: configData.whatsapp_destination || '',
          niche_question: configData.niche_question || '¿En qué distrito te encuentras?',
          trigger_delay: configData.trigger_delay || 15,
        });
      }

      // Load leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      setLeads(leadsData || []);

      // Load payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setPayments(paymentsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWidgetConfig = async () => {
    if (!user || !widgetConfig) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('widget_configs')
        .update({
          template: formConfig.template,
          primary_color: formConfig.primary_color,
          welcome_message: formConfig.welcome_message,
          whatsapp_destination: formConfig.whatsapp_destination,
          niche_question: formConfig.niche_question,
          trigger_delay: formConfig.trigger_delay,
        })
        .eq('id', widgetConfig.id);

      if (error) throw error;

      toast({
        title: '¡Guardado!',
        description: 'Tu widget ha sido actualizado.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const copyEmbedCode = () => {
    const code = `<script src="https://leadwidget.pe/w/${widgetConfig?.widget_id}.js" async></script>`;
    navigator.clipboard.writeText(code);
    toast({
      title: 'Código copiado',
      description: 'Pega el código en tu sitio web antes de </body>',
    });
  };

  const exportLeadsCSV = () => {
    const csv = [
      ['Nombre', 'Teléfono', 'Interés', 'Página', 'Fecha'].join(','),
      ...leads.map(lead => [
        lead.name,
        lead.phone,
        lead.interest || '',
        lead.page_url || '',
        new Date(lead.created_at).toLocaleString('es-PE'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleTemplateChange = (value: string) => {
    const template = templates.find(t => t.value === value);
    setFormConfig({
      ...formConfig,
      template: value,
      niche_question: template?.question || formConfig.niche_question,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'trial':
        return <span className="badge-trial px-2 py-1 rounded-full text-xs font-medium">Trial</span>;
      case 'active':
        return <span className="badge-active px-2 py-1 rounded-full text-xs font-medium">Activo</span>;
      case 'suspended':
        return <span className="badge-suspended px-2 py-1 rounded-full text-xs font-medium">Suspendido</span>;
      default:
        return null;
    }
  };

  const getTrialDaysLeft = () => {
    if (!profile?.trial_ends_at) return 0;
    const diff = new Date(profile.trial_ends_at).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">LeadWidget<span className="text-primary">.pe</span></span>
          </Link>

          <div className="flex items-center gap-4">
            {getStatusBadge(profile?.status || 'trial')}
            {profile?.status === 'trial' && (
              <span className="text-sm text-muted-foreground">
                {getTrialDaysLeft()} días restantes
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="config" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="config" className="gap-2">
              <Settings className="w-4 h-4" />
              Widget
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-2">
              <Users className="w-4 h-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Pagos
            </TabsTrigger>
          </TabsList>

          {/* Widget Config Tab */}
          <TabsContent value="config" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Config Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurar Widget</CardTitle>
                  <CardDescription>Personaliza tu widget de captura de leads</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Template de nicho</Label>
                    <Select value={formConfig.template} onValueChange={handleTemplateChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Color principal</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formConfig.primary_color}
                        onChange={(e) => setFormConfig({ ...formConfig, primary_color: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formConfig.primary_color}
                        onChange={(e) => setFormConfig({ ...formConfig, primary_color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Mensaje de bienvenida</Label>
                    <Input
                      value={formConfig.welcome_message}
                      onChange={(e) => setFormConfig({ ...formConfig, welcome_message: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pregunta de interés</Label>
                    <Input
                      value={formConfig.niche_question}
                      onChange={(e) => setFormConfig({ ...formConfig, niche_question: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>WhatsApp destino (+51...)</Label>
                    <Input
                      value={formConfig.whatsapp_destination}
                      onChange={(e) => setFormConfig({ ...formConfig, whatsapp_destination: e.target.value })}
                      placeholder="+51 987 654 321"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Segundos antes de aparecer</Label>
                    <Input
                      type="number"
                      value={formConfig.trigger_delay}
                      onChange={(e) => setFormConfig({ ...formConfig, trigger_delay: parseInt(e.target.value) })}
                      min={5}
                      max={60}
                    />
                  </div>

                  <Button onClick={saveWidgetConfig} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vista Previa</CardTitle>
                    <CardDescription>Así se verá tu widget en tu sitio web</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-[400px] bg-muted/50 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 p-4 space-y-3">
                        <div className="h-20 bg-background rounded-lg" />
                        <div className="h-4 bg-background rounded w-3/4" />
                        <div className="h-4 bg-background rounded w-1/2" />
                        <div className="h-32 bg-background rounded-lg" />
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <WidgetPreview
                          primaryColor={formConfig.primary_color}
                          welcomeMessage={formConfig.welcome_message}
                          nicheQuestion={formConfig.niche_question}
                          template={formConfig.template}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Código de instalación</CardTitle>
                    <CardDescription>Copia y pega antes de {'</body>'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-4 font-mono text-sm break-all">
                      {`<script src="https://leadwidget.pe/w/${widgetConfig?.widget_id}.js" async></script>`}
                    </div>
                    <Button onClick={copyEmbedCode} variant="outline" className="w-full mt-4">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar código
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Leads Capturados</CardTitle>
                  <CardDescription>{leads.length} leads en total</CardDescription>
                </div>
                <Button variant="outline" onClick={exportLeadsCSV} disabled={leads.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </CardHeader>
              <CardContent>
                {leads.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aún no tienes leads</p>
                    <p className="text-sm mt-1">Instala el widget en tu web para empezar a capturar</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Nombre</th>
                          <th className="text-left py-3 px-4 font-medium">Teléfono</th>
                          <th className="text-left py-3 px-4 font-medium">Interés</th>
                          <th className="text-left py-3 px-4 font-medium">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead) => (
                          <tr key={lead.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{lead.name}</td>
                            <td className="py-3 px-4">
                              <a 
                                href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {lead.phone}
                              </a>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{lead.interest || '-'}</td>
                            <td className="py-3 px-4 text-muted-foreground text-sm">
                              {new Date(lead.created_at).toLocaleString('es-PE')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="stat-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Visitas</p>
                      <p className="text-3xl font-bold">125</p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Eye className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Leads</p>
                      <p className="text-3xl font-bold">{leads.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tasa conversión</p>
                      <p className="text-3xl font-bold">{leads.length > 0 ? '22%' : '0%'}</p>
                    </div>
                    <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Rendimiento semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="w-12 h-12 opacity-50" />
                  <span className="ml-4">Gráfica disponible próximamente</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de tu plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div>
                      <p className="font-semibold">Plan Mensual</p>
                      <p className="text-2xl font-bold">S/30<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
                    </div>
                    {getStatusBadge(profile?.status || 'trial')}
                  </div>

                  {profile?.status === 'trial' && (
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
                      <div className="flex items-center gap-2 text-warning mb-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">Trial activo</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Te quedan {getTrialDaysLeft()} días de prueba. Paga para mantener tu widget activo.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pagar con Yape/Plin</CardTitle>
                  <CardDescription>Envía S/30 y sube tu comprobante</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#00C185]/10 rounded-xl text-center">
                      <div className="w-12 h-12 bg-[#00C185] rounded-xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-xs">YAPE</span>
                      </div>
                      <p className="font-semibold">902 105 668</p>
                    </div>
                    <div className="p-4 bg-[#7B2CBF]/10 rounded-xl text-center">
                      <div className="w-12 h-12 bg-[#7B2CBF] rounded-xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-xs">PLIN</span>
                      </div>
                      <p className="font-semibold">902 105 668</p>
                    </div>
                  </div>

                  <div className="p-4 border border-dashed rounded-xl text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">Sube tu comprobante de pago</p>
                    <Button variant="outline" disabled={uploading}>
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subir comprobante'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Historial de pagos</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes pagos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-xl">
                        <div>
                          <p className="font-medium">S/{payment.amount}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString('es-PE')}
                          </p>
                        </div>
                        <div>
                          {payment.status === 'verified' && (
                            <span className="badge-active px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" /> Verificado
                            </span>
                          )}
                          {payment.status === 'pending' && (
                            <span className="badge-trial px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pendiente
                            </span>
                          )}
                          {payment.status === 'rejected' && (
                            <span className="badge-suspended px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Rechazado
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

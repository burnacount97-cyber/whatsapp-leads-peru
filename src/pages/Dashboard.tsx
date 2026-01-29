import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  addDoc,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
  Bot,
  Key,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Shield,
  X,
  Smartphone,
} from 'lucide-react';

interface Lead {
  id: string;
  client_id: string;
  widget_id: string;
  name: string;
  phone: string;
  interest: string;
  created_at: string;
  status: string;
}

interface WidgetConfig {
  id: string;
  user_id: string;
  widget_id: string;
  business_name: string;
  phone_number: string;
  welcome_message: string;
  position: 'right' | 'left';
  theme_color: string;
  template: string;
  niche_question: string;
  is_active: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  business_name: string;
  subscription_status: string;
  status?: string; // Used in UI
  created_at?: string;
  trial_ends_at?: string;
  plan_type?: string;
  ai_enabled: boolean;
  ai_api_key?: string;
  ai_provider?: string;
  ai_model?: string;
  ai_temperature?: number;
  ai_system_prompt?: string;
  ai_max_tokens?: number;
}

type Payment = any;

const templates = [
  {
    value: 'general',
    label: 'General / Servicios',
    question: 'Eres un asistente virtual de ventas. Tu objetivo es responder amablemente dudas sobre nuestros servicios y capturar el interés del cliente. Al final, pide su nombre y celular para que un asesor humano lo contacte.'
  },
  {
    value: 'inmobiliaria',
    label: 'Inmobiliaria',
    question: 'Eres un agente inmobiliario experto. Tu objetivo es perfilar al cliente. Pregunta: 1. ¿Busca comprar o alquilar? 2. ¿Qué distrito prefiere? 3. ¿Presupuesto aproximado? Sé profesional y persuasivo.'
  },
  {
    value: 'clinica',
    label: 'Clínica / Salud',
    question: 'Eres un asistente de salud empático. Tu trabajo es ayudar a agendar citas. Pregunta: 1. ¿Qué especialidad necesita? 2. ¿Preferencia de horario? Recuerda transmitir confianza y calma.'
  },
  {
    value: 'taller',
    label: 'Taller Mecánico',
    question: 'Eres un asesor de taller mecánico. Pregunta: 1. Marca y modelo del vehículo. 2. ¿Es mantenimiento preventivo o tiene una falla específica? Ofrece agendar una revisión técnica.'
  },
  {
    value: 'delivery',
    label: 'Restaurante / Delivery',
    question: 'Eres un asistente de pedidos. Atiende consultas sobre la carta. Para cerrar el pedido, pregunta: 1. Dirección exacta de entrega. 2. Método de pago. Sé rápido y cordial.'
  },
  {
    value: 'personalizado',
    label: 'Personalizado',
    question: ''
  },
];

export default function Dashboard() {
  const { user, signOut, loading: authLoading, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect SuperAdmin to their panel if they land here
  useEffect(() => {
    if (!authLoading && isSuperAdmin) {
      navigate('/superadmin');
    }
  }, [isSuperAdmin, authLoading, navigate]);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({ views: 0, interactions: 0 });
  const [payments, setPayments] = useState<any[]>([]);
  const [blockedIps, setBlockedIps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingAI, setSavingAI] = useState(false);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      console.log('App already installed');
      return;
    }

    const handler = (e: any) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For testing: show button after 2 seconds if in development
    if (import.meta.env.DEV) {
      setTimeout(() => {
        console.log('Dev mode: enabling install button for testing');
        setCanInstall(true);
      }, 2000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      toast({
        title: 'Instalación no disponible',
        description: 'Abre esta app en Chrome o Edge para instalarla.',
        variant: 'destructive'
      });
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast({ title: '¡App instalada!', description: 'Ahora puedes acceder desde tu pantalla de inicio.' });
    }
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  // AI config form state
  const [aiConfig, setAiConfig] = useState({
    ai_enabled: true,
    ai_provider: 'openai',
    ai_api_key: '',
    ai_model: 'gpt-4o-mini',
    ai_temperature: 0.7,
    ai_max_tokens: 500,
    ai_system_prompt: 'Eres un asistente virtual amable y profesional que ayuda a capturar leads para un negocio. Tu objetivo es obtener información del cliente de manera natural y amigable.',
  });

  // Widget config form state
  const [formConfig, setFormConfig] = useState({
    template: 'general',
    primary_color: '#00C185',
    business_name: 'Lead Widget',
    welcome_message: '¡Hola! ¿En qué podemos ayudarte?',
    whatsapp_destination: '',
    niche_question: '¿En qué distrito te encuentras?',
    trigger_delay: 15,
    // Campos exclusivos para modo personalizado
    custom_placeholder: 'Tu respuesta',
    custom_button_text: 'Continuar',
    custom_confirmation_message: '¡Listo! Te pasamos al WhatsApp del equipo',
    chat_placeholder: 'Escribe tu mensaje...',
    // New behavioral settings
    vibration_intensity: 'soft',
    exit_intent_enabled: true,
    exit_intent_title: '¡Espera!',
    exit_intent_description: 'Prueba Lead Widget gratis por 3 días y aumenta tus ventas.',
    exit_intent_cta: 'Probar Demo Ahora',
    teaser_messages: '¿Cómo podemos ayudarte? 👋\n¿Tienes alguna duda sobre el servicio? ✨\n¡Hola! Estamos en línea para atenderte 🚀',
    // Quick Replies
    quick_replies: '¿Cómo funciona?\nQuiero más información\nVer precios',
  });

  const [announcement, setAnnouncement] = useState<{
    id: string;
    content: string;
    type: 'info' | 'warning' | 'error' | 'success';
    updated_at: string;
  } | null>(null);
  const [dismissedAnnouncement, setDismissedAnnouncement] = useState<string | null>(
    localStorage.getItem('dismissed_announcement')
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      loadData();
    }
  }, [user, authLoading, navigate]);

  // Real-time listener for announcements
  useEffect(() => {
    if (!user) return;

    // Listen for active announcements
    // We cannot use orderBy with where('is_active', '==', true) without a composite index
    // So we just filter for active ones and sort client-side, or use a simple query if volume is low.
    // Given system announcements are few, fetching all active ones is fine.
    const q = query(collection(db, 'system_announcements'), where('is_active', '==', true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const anns = snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as any);
        // Sort by updated_at descending to show latest
        anns.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        setAnnouncement(anns[0]);
      } else {
        setAnnouncement(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const userId = user.uid;

      // Load profile
      const profileSnap = await getDoc(doc(db, 'profiles', userId));
      const profileData = profileSnap.exists() ? { id: profileSnap.id, ...profileSnap.data() } as Profile : null;
      setProfile(profileData);

      // Load AI config from profile
      if (profileData) {
        setAiConfig({
          ai_enabled: true,
          ai_provider: profileData.ai_provider || 'openai',
          ai_api_key: profileData.ai_api_key || '',
          ai_model: profileData.ai_model || 'gpt-4o-mini',
          ai_temperature: profileData.ai_temperature || 0.7,
          ai_max_tokens: 500,
          ai_system_prompt: profileData.ai_system_prompt || 'Eres un asistente virtual amable y profesional que ayuda a capturar leads para un negocio. Tu objetivo es obtener información del cliente de manera natural y amigable.',
        });
      }

      // Load widget config
      const qConfig = query(collection(db, 'widget_configs'), where('user_id', '==', userId));
      const configSnap = await getDocs(qConfig);

      let configData: any = null;

      if (configSnap.empty) {
        // AUTO-CREATE DEFAULT CONFIG FOR NEW USER
        const newWidgetRef = doc(collection(db, 'widget_configs'));
        const defaultConfig = {
          user_id: userId,
          widget_id: Math.random().toString(36).substring(2, 12),
          template: 'general',
          primary_color: '#00C165',
          welcome_message: '¡Hola! ¿En qué podemos ayudarte?',
          whatsapp_destination: '',
          niche_question: '¿En qué distrito te encuentras?',
          trigger_delay: 3,
          chat_placeholder: 'Escribe tu mensaje...',
          vibration_intensity: 'soft',
          trigger_exit_intent: true,
          exit_intent_title: '¡Espera!',
          exit_intent_description: 'Prueba Lead Widget gratis por 3 días y aumenta tus ventas.',
          exit_intent_cta: 'Probar Demo Ahora',
          teaser_messages: [
            '¿Cómo podemos ayudarte? 👋',
            '¿Tienes alguna duda sobre el servicio? ✨',
            '¡Hola! Estamos en línea para atenderte 🚀'
          ],
          quick_replies: [
            '¿Cómo funciona?',
            'Quiero más información',
            'Ver precios'
          ],
          created_at: new Date().toISOString()
        };
        await setDoc(newWidgetRef, defaultConfig);
        configData = { id: newWidgetRef.id, ...defaultConfig };
      } else {
        configData = { id: configSnap.docs[0].id, ...configSnap.docs[0].data() };
      }

      if (configData) {
        setWidgetConfig(configData);
        setFormConfig({
          template: configData.template || 'general',
          primary_color: configData.primary_color || '#00C185',
          business_name: profileData?.business_name || 'Lead Widget',
          welcome_message: configData.welcome_message || '¡Hola! ¿En qué podemos ayudarte?',
          whatsapp_destination: configData.whatsapp_destination || '',
          niche_question: configData.niche_question || '¿En qué distrito te encuentras?',
          trigger_delay: configData.trigger_delay ?? 3,
          chat_placeholder: configData.chat_placeholder || 'Escribe tu mensaje...',
          custom_placeholder: 'Tu respuesta',
          custom_button_text: 'Continuar',
          custom_confirmation_message: '¡Listo! Te pasamos al WhatsApp del equipo',
          vibration_intensity: configData.vibration_intensity || 'soft',
          exit_intent_enabled: configData.trigger_exit_intent ?? true,
          exit_intent_title: configData.exit_intent_title || '¡Espera!',
          exit_intent_description: configData.exit_intent_description || 'Prueba Lead Widget gratis por 3 días y aumenta tus ventas.',
          exit_intent_cta: configData.exit_intent_cta || 'Probar Demo Ahora',
          teaser_messages: Array.isArray(configData.teaser_messages)
            ? configData.teaser_messages.join('\n')
            : (configData.teaser_messages || [
              '¿Cómo podemos ayudarte? 👋',
              '¿Tienes alguna duda sobre el servicio? ✨',
              '¡Hola! Estamos en línea para atenderte 🚀'
            ]).join('\n'),
          quick_replies: Array.isArray(configData.quick_replies)
            ? configData.quick_replies.join('\n')
            : (configData.quick_replies || '¿Cómo funciona?\nQuiero más información\nVer precios'),
        });
      }

      // Load leads (remove orderBy)
      const qLeads = query(collection(db, 'leads'), where('client_id', '==', userId));
      const leadsSnap = await getDocs(qLeads);
      const leadsData = leadsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) as Lead[];

      setLeads(leadsData);

      // Load payments (remove orderBy)
      const qPayments = query(collection(db, 'payments'), where('user_id', '==', userId));
      const paymentSnap = await getDocs(qPayments);
      const paymentsData = paymentSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) as Payment[];

      setPayments(paymentsData);

      // Load analytics and blocked IPs if widget exists
      if (configData) {
        // Analytics - Views
        // Analytics - Views
        const qViews = query(collection(db, 'analytics'),
          where('widget_id', '==', configData.id),
          where('event_type', '==', 'view'));
        const viewsSnap = await getDocs(qViews);

        // Analytics - Interactions
        const qInteractions = query(collection(db, 'analytics'),
          where('widget_id', '==', configData.id),
          where('event_type', 'in', ['chat_open', 'message_sent']));
        const interactionsSnap = await getDocs(qInteractions);

        setAnalytics({
          views: viewsSnap.size,
          interactions: interactionsSnap.size
        });

        // Load blocked IPs
        const qBlocked = query(collection(db, 'blocked_ips'), where('widget_id', '==', configData.id));
        const blockedSnap = await getDocs(qBlocked);
        const blockedData = blockedSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setBlockedIps(blockedData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error al cargar datos',
        description: 'No se pudo cargar la información del dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveWidgetConfig = async () => {
    if (!user || !widgetConfig) return;

    setSaving(true);
    try {
      // Update widget config
      const widgetRef = doc(db, 'widget_configs', widgetConfig.id);
      await updateDoc(widgetRef, {
        template: formConfig.template,
        primary_color: formConfig.primary_color,
        welcome_message: formConfig.welcome_message,
        whatsapp_destination: formConfig.whatsapp_destination,
        niche_question: formConfig.niche_question,
        trigger_delay: formConfig.trigger_delay,
        chat_placeholder: formConfig.chat_placeholder,
        vibration_intensity: formConfig.vibration_intensity,
        trigger_exit_intent: formConfig.exit_intent_enabled,
        exit_intent_title: formConfig.exit_intent_title,
        exit_intent_description: formConfig.exit_intent_description,
        exit_intent_cta: formConfig.exit_intent_cta,
        teaser_messages: Array.isArray(formConfig.teaser_messages)
          ? formConfig.teaser_messages
          : (typeof formConfig.teaser_messages === 'string'
            ? formConfig.teaser_messages.split('\n').filter((m: string) => m.trim() !== '')
            : formConfig.teaser_messages),
        quick_replies: typeof formConfig.quick_replies === 'string'
          ? formConfig.quick_replies.split('\n').filter((m: string) => m.trim() !== '')
          : formConfig.quick_replies,
      });

      // Update business name in profile
      await updateDoc(doc(db, 'profiles', user.uid), {
        business_name: formConfig.business_name
      });

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.uid}-${Math.floor(Date.now() / 1000)}.${fileExt}`;
      const storageRef = ref(storage, `proofs/${fileName}`);

      // Upload to Firebase Storage
      await uploadBytes(storageRef, file);
      const publicUrl = await getDownloadURL(storageRef);

      // Add to payments collection
      await addDoc(collection(db, 'payments'), {
        user_id: user.uid,
        amount: 30,
        payment_method: 'Yape/Plin',
        proof_url: publicUrl,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      toast({
        title: '¡Comprobante enviado!',
        description: 'Revisaremos tu pago pronto para activar tu cuenta.',
      });

      loadData();
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error de subida',
        description: 'No se pudo subir el archivo. Verifica tu conexión.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const copyEmbedCode = () => {
    // Dynamically generate the widget URL based on current domain
    const currentDomain = window.location.origin;
    const widgetUrl = `${currentDomain}/api/w/${widgetConfig?.widget_id}.js`;
    const code = `<script src="${widgetUrl}" async></script>`;

    navigator.clipboard.writeText(code);
    toast({
      title: 'Código copiado',
      description: 'Pega el código en tu sitio web antes de </body>',
    });
  };

  const exportLeadsCSV = () => {
    // Helper to escape CSV values
    const escape = (val: any) => {
      const s = val?.toString() || '';
      return '"' + s.replace(/"/g, '""') + '"';
    };

    const headers = ['Nombre', 'Teléfono', 'Datos Capturados', 'URL de Origen', 'Trigger', 'Fecha'];

    const rows = leads.map(lead => [
      escape(lead.name),
      escape(lead.phone),
      escape(lead.interest),
      escape(lead.page_url),
      escape(lead.trigger_used || 'IA Chat'),
      escape(new Date(lead.created_at).toLocaleString('es-PE'))
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_lead_widget_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "✅ Exportación completada",
      description: "Se ha descargado el archivo con todos tus leads.",
    });
  };

  const unblockIp = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'blocked_ips', id));

      setBlockedIps(blockedIps.filter(ip => ip.id !== id));
      toast({
        title: "✅ IP Desbloqueada",
        description: "El usuario ahora puede volver a usar el chat.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTemplateChange = (value: string) => {
    const template = templates.find(t => t.value === value);
    // Don't overwrite description if switching TO personalizado, allowing user to keep custom text
    const newDescription = value === 'personalizado'
      ? formConfig.niche_question
      : (template?.question || formConfig.niche_question);

    setFormConfig({
      ...formConfig,
      template: value,
      niche_question: newDescription,
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
    let endDate: Date;

    if (profile?.trial_ends_at) {
      endDate = new Date(profile.trial_ends_at);
    } else if (profile?.created_at) {
      const created = new Date(profile.created_at);
      endDate = new Date(created);
      endDate.setDate(created.getDate() + 3);
    } else {
      return 0; // Fallback
    }

    const diff = endDate.getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getTrialEndDateString = () => {
    if (profile?.trial_ends_at) {
      return new Date(profile.trial_ends_at).toLocaleDateString('es-PE');
    }
    if (profile?.created_at) {
      const created = new Date(profile.created_at);
      const end = new Date(created);
      end.setDate(created.getDate() + 3);
      return end.toLocaleDateString('es-PE');
    }
    return '...';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback redirect
      window.location.href = '/login';
    }
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
      {/* System Announcement Banner */}
      {announcement && dismissedAnnouncement !== `${announcement.id}_${announcement.updated_at}` && (
        <div className={`p-2 flex items-center justify-center gap-3 relative transition-colors ${announcement.type === 'error' ? 'bg-red-600 text-white' :
          announcement.type === 'warning' ? 'bg-orange-500 text-white' :
            announcement.type === 'success' ? 'bg-emerald-600 text-white' :
              'bg-indigo-600 text-white'
          }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 animate-pulse" />
          <p className="text-sm font-medium pr-8">{announcement.content}</p>
          <button
            onClick={() => {
              const uniqueKey = `${announcement.id}_${announcement.updated_at}`;
              setDismissedAnnouncement(uniqueKey);
              localStorage.setItem('dismissed_announcement', uniqueKey);
            }}
            className="absolute right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Lead Widget</span>
          </div>

          <div className="flex items-center gap-4">
            {isSuperAdmin && (
              <Link to="/superadmin">
                <Button variant="outline" size="sm" className="hidden sm:flex border-primary text-primary hover:bg-primary/10">
                  <Shield className="w-4 h-4 mr-2" />
                  Panel SuperAdmin
                </Button>
              </Link>
            )}

            {getStatusBadge(profile?.subscription_status || 'trial')}
            {profile?.subscription_status === 'trial' && (
              <span className="text-sm text-muted-foreground hidden md:inline">
                {getTrialDaysLeft()} días restantes
              </span>
            )}
            {canInstall && (
              <Button variant="outline" size="sm" onClick={installApp} className="hidden sm:flex border-green-500 text-green-600 hover:bg-green-50">
                <Smartphone className="w-4 h-4 mr-2" />
                Instalar App
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Trial Alert Notice */}
        {profile?.subscription_status === 'trial' && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Estás en periodo de prueba</p>
                <p className="text-xs text-muted-foreground">Tu trial de 3 días finaliza el {getTrialEndDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{getTrialDaysLeft()} días</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Restantes</p>
            </div>
          </div>
        )}

        <Tabs defaultValue="config" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 max-w-3xl">
            <TabsTrigger value="config" className="gap-2">
              <Settings className="w-4 h-4" />
              Widget
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Bot className="w-4 h-4" />
              IA
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-2">
              <Users className="w-4 h-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analíticas
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <ShieldCheck className="w-4 h-4" />
              Seguridad
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
                    <Label>Industria / Nicho</Label>
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
                    {formConfig.template === 'personalizado' && (
                      <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                        <p className="text-sm text-primary font-medium flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Modo Personalizado Activado
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ahora puedes editar libremente todos los campos para adaptar el widget a tu negocio específico.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Nombre de tu negocio</Label>
                    <Input
                      value={formConfig.business_name}
                      onChange={(e) => setFormConfig({ ...formConfig, business_name: e.target.value })}
                      placeholder="Ej: Mi Empresa, Clínica San Juan, Taller Express"
                    />
                    <p className="text-xs text-muted-foreground">Este nombre aparecerá en el encabezado del widget</p>
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
                    <Label>Placeholder del chat (Sugerencia)</Label>
                    <Input
                      value={formConfig.chat_placeholder}
                      onChange={(e) => setFormConfig({ ...formConfig, chat_placeholder: e.target.value })}
                      placeholder="Ej: Escribe tu duda aquí..."
                    />
                    <p className="text-xs text-muted-foreground">Texto que invita al usuario a escribir en el chat.</p>
                  </div>

                  {/* Info box for Personalizado mode */}
                  {formConfig.template === 'personalizado' && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-1 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Modo Personalizado Activo
                      </h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        En este modo, la IA ignorará las plantillas predefinidas. Escribe abajo detalladamente qué vende tu negocio y cómo quieres que responda el asistente.
                      </p>
                    </div>
                  )}

                  {/* Replaced 'Pregunta de interés' with 'Descripción del Negocio' for AI */}
                  <div className="space-y-2">
                    <Label>
                      {formConfig.template === 'personalizado'
                        ? 'Instrucciones Personalizadas (Prompt)'
                        : 'Descripción del Negocio (Contexto para la IA)'}
                    </Label>
                    <textarea
                      value={formConfig.niche_question}
                      onChange={(e) => setFormConfig({ ...formConfig, niche_question: e.target.value })}
                      className="w-full p-3 text-sm border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:outline-none min-h-[100px]"
                      placeholder="Ej: Vendemos repuestos de autos Toyota y Nissan. Horario 9am-6pm. Hacemos delivery en Lima."
                    />
                    <p className="text-xs text-muted-foreground">Esta información ayudará a la IA a responder dudas básicas sobre tu negocio.</p>
                  </div>

                  {/* Campos exclusivos para modo personalizado - REMOVED LEGACY FIELDS */}

                  {/* Logic update for template change handled in function */}

                  <div className="space-y-2">
                    <Label>WhatsApp destino (+51...)</Label>
                    <Input
                      value={formConfig.whatsapp_destination}
                      onChange={(e) => setFormConfig({ ...formConfig, whatsapp_destination: e.target.value })}
                      placeholder="+51 987 654 321"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm">Comportamiento Avanzado</h4>

                    <div className="space-y-2">
                      <Label>Intensidad del movimiento (Atención)</Label>
                      <Select
                        value={formConfig.vibration_intensity}
                        onValueChange={(v) => setFormConfig({ ...formConfig, vibration_intensity: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Desactivado</SelectItem>
                          <SelectItem value="soft">Suave (Recomendado)</SelectItem>
                          <SelectItem value="strong">Fuerte</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Define qué tan fuerte vibrará el widget para llamar la atención del usuario.</p>
                    </div>

                    <div className="space-y-4 p-4 bg-muted/50 rounded-xl border">
                      <div className="flex items-center justify-between">
                        <Label className="cursor-pointer" htmlFor="exit-intent">Activar Pop-up de Salida</Label>
                        <Switch
                          id="exit-intent"
                          checked={formConfig.exit_intent_enabled}
                          onCheckedChange={(checked) => setFormConfig({ ...formConfig, exit_intent_enabled: checked })}
                        />
                      </div>

                      {formConfig.exit_intent_enabled && (
                        <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                          <div className="space-y-2">
                            <Label className="text-xs">Título del Pop-up</Label>
                            <Input
                              value={formConfig.exit_intent_title}
                              onChange={(e) => setFormConfig({ ...formConfig, exit_intent_title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Descripción</Label>
                            <textarea
                              value={formConfig.exit_intent_description}
                              onChange={(e) => setFormConfig({ ...formConfig, exit_intent_description: e.target.value })}
                              className="w-full p-2 text-xs border rounded-md bg-background min-h-[60px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Texto del Botón (CTA)</Label>
                            <Input
                              value={formConfig.exit_intent_cta}
                              onChange={(e) => setFormConfig({ ...formConfig, exit_intent_cta: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button onClick={saveWidgetConfig} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <div className="space-y-6 lg:sticky lg:top-24 h-fit">
                <Card>
                  <CardHeader>
                    <CardTitle>Vista Previa</CardTitle>
                    <CardDescription>Así se verá tu widget en tu sitio web</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Widget Preview Container */}
                    <div className="relative h-[500px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-6 flex justify-center items-center">
                      <div className="w-[320px] h-[480px] shadow-2xl rounded-2xl overflow-hidden border border-slate-200 bg-white">
                        <WidgetPreview
                          primaryColor={formConfig.primary_color}
                          welcomeMessage={formConfig.welcome_message}
                          template={formConfig.template}
                          businessName={formConfig.business_name}
                          customPlaceholder={formConfig.custom_placeholder}
                          customButtonText={formConfig.custom_button_text}
                          customConfirmationMessage={formConfig.custom_confirmation_message}
                          chatPlaceholder={formConfig.chat_placeholder}
                          vibrationIntensity={formConfig.vibration_intensity as any}
                          exitIntentEnabled={formConfig.exit_intent_enabled}
                          exitIntentTitle={formConfig.exit_intent_title}
                          exitIntentDescription={formConfig.exit_intent_description}
                          exitIntentCTA={formConfig.exit_intent_cta}
                          mode="dashboard"
                        />
                      </div>
                    </div>

                    {/* Teaser Messages Editor */}
                    <div className="space-y-3 p-4 bg-muted/50 rounded-xl border">
                      <div>
                        <Label>Mensajes de Recaptura (Teaser)</Label>
                        <p className="text-[10px] text-muted-foreground mt-1">Se mostrarán aleatoriamente si el usuario cierra el chat.</p>
                      </div>
                      <textarea
                        value={formConfig.teaser_messages}
                        onChange={(e) => setFormConfig({ ...formConfig, teaser_messages: e.target.value })}
                        className="w-full p-3 text-xs border rounded-md bg-background min-h-[80px]"
                        placeholder="Escribe un mensaje por línea..."
                      />
                      <p className="text-[10px] text-primary italic">💡 Pon un mensaje atractivo por cada línea.</p>
                    </div>

                    {/* Quick Replies Editor */}
                    <div className="space-y-3 p-4 bg-muted/50 rounded-xl border">
                      <div>
                        <Label>Atajos Rápidos (Quick Replies)</Label>
                        <p className="text-[10px] text-muted-foreground mt-1">Botones de respuesta rápida que aparecen al inicio del chat.</p>
                      </div>
                      <textarea
                        value={formConfig.quick_replies}
                        onChange={(e) => setFormConfig({ ...formConfig, quick_replies: e.target.value })}
                        className="w-full p-3 text-xs border rounded-md bg-background min-h-[80px]"
                        placeholder="Escribe un atajo por línea..."
                      />
                      <p className="text-[10px] text-primary italic">💡 Cada línea será un botón que el usuario puede pulsar para enviar automáticamente.</p>
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
                      {`<script src="${window.location.origin}/api/w/${widgetConfig?.widget_id}.js" async></script>`}
                    </div>
                    <Button onClick={copyEmbedCode} variant="outline" className="w-full mt-4">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar código
                    </Button>

                    {/* Dynamic Domain Info Removed */}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI Configuration Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Configuración de IA</CardTitle>
                    <CardDescription>Conecta tu chatbot con inteligencia artificial</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">


                {/* AI Provider */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Proveedor de IA
                  </Label>
                  <Select value={aiConfig.ai_provider} onValueChange={(value) => setAiConfig({ ...aiConfig, ai_provider: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiConfig.ai_provider === 'openai' && (
                        <>
                          <SelectItem value="openai">OpenAI (GPT-4, GPT-3.5)</SelectItem>
                          <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                          <SelectItem value="google">Google (Gemini)</SelectItem>
                        </>
                      )}
                      {aiConfig.ai_provider === 'anthropic' && (
                        <>
                          <SelectItem value="openai">OpenAI (GPT-4, GPT-3.5)</SelectItem>
                          <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                          <SelectItem value="google">Google (Gemini)</SelectItem>
                        </>
                      )}
                      {aiConfig.ai_provider === 'google' && (
                        <>
                          <SelectItem value="openai">OpenAI (GPT-4, GPT-3.5)</SelectItem>
                          <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                          <SelectItem value="google">Google (Gemini)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={aiConfig.ai_api_key}
                    onChange={(e) => setAiConfig({ ...aiConfig, ai_api_key: e.target.value })}
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-muted-foreground">
                    {aiConfig.ai_provider === 'openai' && 'Obtén tu API key en platform.openai.com'}
                    {aiConfig.ai_provider === 'anthropic' && 'Obtén tu API key en console.anthropic.com'}
                    {aiConfig.ai_provider === 'google' && 'Obtén tu API key en makersuite.google.com'}
                  </p>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Select value={aiConfig.ai_model} onValueChange={(value) => setAiConfig({ ...aiConfig, ai_model: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiConfig.ai_provider === 'openai' && (
                        <>
                          <SelectItem value="gpt-4o">GPT-4o (Más potente)</SelectItem>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini (Recomendado)</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Económico)</SelectItem>
                        </>
                      )}
                      {aiConfig.ai_provider === 'anthropic' && (
                        <>
                          <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                          <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                          <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                        </>
                      )}
                      {aiConfig.ai_provider === 'google' && (
                        <>
                          <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                          <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Temperatura ({aiConfig.ai_temperature})</Label>
                    <span className="text-xs text-muted-foreground">Creatividad de las respuestas</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiConfig.ai_temperature}
                    onChange={(e) => setAiConfig({ ...aiConfig, ai_temperature: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Preciso</span>
                    <span>Creativo</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <Label>Máximo de Tokens</Label>
                  <Input
                    type="number"
                    value={aiConfig.ai_max_tokens}
                    onChange={(e) => setAiConfig({ ...aiConfig, ai_max_tokens: parseInt(e.target.value) })}
                    min={100}
                    max={4000}
                  />
                  <p className="text-xs text-muted-foreground">Longitud máxima de las respuestas (100-4000)</p>
                </div>

                {/* System Prompt */}
                <div className="space-y-2">
                  <Label>Prompt del Sistema</Label>
                  <textarea
                    value={aiConfig.ai_system_prompt}
                    onChange={(e) => setAiConfig({ ...aiConfig, ai_system_prompt: e.target.value })}
                    rows={6}
                    className="w-full p-3 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Instrucciones para el comportamiento de la IA..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Define cómo debe comportarse tu asistente IA y qué información debe capturar
                  </p>
                </div>

                {/* Save Button */}
                <Button
                  onClick={async () => {
                    if (!user) return;
                    setSavingAI(true);
                    try {
                      await updateDoc(doc(db, 'profiles', user.uid), {
                        ai_enabled: true, // Force enabled on save
                        ai_provider: aiConfig.ai_provider,
                        ai_api_key: aiConfig.ai_api_key,
                        ai_model: aiConfig.ai_model,
                        ai_temperature: aiConfig.ai_temperature,
                        ai_max_tokens: aiConfig.ai_max_tokens,
                        ai_system_prompt: aiConfig.ai_system_prompt,
                      });

                      toast({
                        title: '✅ Configuración guardada',
                        description: 'Tu chatbot IA está listo para usar',
                      });
                    } catch (error: any) {
                      toast({
                        title: 'Error',
                        description: error.message,
                        variant: 'destructive',
                      });
                    } finally {
                      setSavingAI(false);
                    }
                  }}
                  disabled={savingAI}
                  className="w-full"
                >
                  {savingAI ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Guardar Configuración de IA
                </Button>

                {/* Info Card */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100">Cómo funciona el Chatbot IA</p>
                      <ul className="space-y-1 text-blue-700 dark:text-blue-300 list-disc list-inside">
                        <li>La IA responderá automáticamente a los visitantes de tu web</li>
                        <li>Capturará información relevante según tu prompt del sistema</li>
                        <li>Los leads se guardarán automáticamente en tu panel</li>
                        <li>Puedes personalizar el comportamiento editando el prompt</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p>Aún no tienes leads</p>
                    <p className="text-sm mt-1">Instala el widget en tu web para empezar a capturar</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="text-left py-3 px-4 font-medium">Nombre</th>
                          <th className="text-left py-3 px-4 font-medium">Teléfono</th>
                          <th className="text-left py-3 px-4 font-medium">Interés</th>
                          <th className="text-left py-3 px-4 font-medium">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {leads.map((lead) => (
                          <tr key={lead.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-4 px-4 font-medium">{lead.name}</td>
                            <td className="py-4 px-4 font-mono text-xs">
                              {lead.phone === 'Pendiente (Click WA)' ? (
                                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Pendiente WA</span>
                              ) : (
                                <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" className="text-primary hover:underline">{lead.phone}</a>
                              )}
                            </td>
                            <td className="py-4 px-4 text-muted-foreground truncate max-w-[200px]">{lead.interest || '-'}</td>
                            <td className="py-4 px-4 text-muted-foreground">
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
                      <p className="text-3xl font-bold">{analytics.views}</p>
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
                      <p className="text-3xl font-bold">
                        {analytics.views > 0 ? Math.round((leads.length / analytics.views) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Rendimiento semanal</CardTitle>
                <CardDescription>Tráfico y captación en los últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                  <BarChart3 className="w-12 h-12 opacity-10 mb-2" />
                  <span className="text-sm">Gráfica detallada disponible próximamente</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Seguridad y Bloqueos</CardTitle>
                    <CardDescription>Controla quién tiene acceso a tu chat widget</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    El sistema bloquea automáticamente IPs que intentan manipular la IA o realizan spam.
                    Si crees que un cliente fue bloqueado por error, puedes rehabilitarlo aquí.
                  </p>
                </div>

                {blockedIps.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p>No hay usuarios bloqueados actualmente</p>
                    <p className="text-sm">Tu escudo de seguridad está activo y vigilando.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="text-left py-3 px-4 font-medium">Dirección IP</th>
                          <th className="text-left py-3 px-4 font-medium">Motivo</th>
                          <th className="text-left py-3 px-4 font-medium">Fecha</th>
                          <th className="text-right py-3 px-4 font-medium">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {blockedIps.map((ip) => (
                          <tr key={ip.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-4 px-4 font-mono">{ip.ip_address}</td>
                            <td className="py-4 px-4">
                              <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-xs font-medium">
                                {ip.reason || 'Actividad inusual'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-muted-foreground">
                              {new Date(ip.created_at).toLocaleString('es-PE')}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => unblockIp(ip.id)}
                                className="text-primary border-primary/20 hover:bg-primary/10"
                              >
                                Desbloquear
                              </Button>
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

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Plan Status */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Mi Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 bg-slate-50 border rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Plan Actual</p>
                        <p className="text-2xl font-black text-primary capitalize">{profile?.plan_type || 'Trial'}</p>
                      </div>
                      {getStatusBadge(profile?.subscription_status || 'trial')}
                    </div>

                    <div className="space-y-3 py-4 border-t border-slate-200 mt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Precio:</span>
                        <span className="font-bold text-slate-900">S/ 30.00 / mes</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Siguiente Pago:</span>
                        <span className="font-bold text-slate-900">{getTrialEndDateString()}</span>
                      </div>
                    </div>

                    {profile?.subscription_status === 'trial' && (
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                          ⚠️ Te quedan {getTrialDaysLeft()} días de prueba. Paga S/ 30 hoy para mantener tu bot activo ilimitadamente.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Renovar o Activar Plan</CardTitle>
                  <CardDescription>Usa cualquiera de estos métodos y sube tu captura para activación inmediata</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl">
                      <h4 className="font-bold flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white text-[10px]">BCP</div>
                        Transferencia BCP
                      </h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span>Soles:</span> <span className="font-medium">193-XXXXXXXX-X-XX</span></div>
                        <div className="flex justify-between"><span>CCI:</span> <span className="font-medium">002-193-XXXXXXXX-X-XX</span></div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                      <h4 className="font-bold flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-lg flex items-center justify-center text-white text-[10px]">Y/P</div>
                        Yape o Plin
                      </h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span>Número:</span> <span className="font-medium text-lg">902 105 668</span></div>
                        <div className="flex justify-between"><span>Titular:</span> <span className="font-medium">Ken Ryzen</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 border-2 border-dashed rounded-2xl bg-slate-50 text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-2 border border-slate-100">
                      <Upload className="w-8 h-8 text-primary/40" />
                    </div>
                    <div>
                      <p className="font-bold mb-1">Subir Comprobante</p>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Selecciona una foto o captura de pantalla de tu transferencia para que nuestro equipo valide el pago.
                      </p>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleUploadProof}
                    />

                    <Button
                      className="gap-2 h-12 px-8 font-bold text-lg"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-5 h-5" />}
                      Seleccionar Archivo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historial de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p>No tienes pagos registrados aún</p>
                    <p className="text-sm mt-1">Tus suscripciones aparecerán aquí después de subir el primer comprobante.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="text-left py-4 px-6 font-bold">Concepto</th>
                          <th className="text-left py-4 px-6 font-bold">Monto</th>
                          <th className="text-left py-4 px-6 font-bold">Fecha</th>
                          <th className="text-left py-4 px-6 font-bold">Método</th>
                          <th className="text-right py-4 px-6 font-bold">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {payments.map((p) => (
                          <tr key={p.id} className="border-b group hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900">{p.description || 'Suscripción Lead Widget'}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">ID: {p.id.substring(0, 8)}</div>
                            </td>
                            <td className="py-4 px-6 font-bold text-slate-700">S/ {Number(p.amount).toFixed(2)}</td>
                            <td className="py-4 px-6 text-muted-foreground">{new Date(p.created_at).toLocaleDateString('es-PE')}</td>
                            <td className="py-4 px-6">
                              <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600 uppercase tracking-tighter">{p.payment_method || 'Varios'}</span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === 'completed' || p.status === 'active'
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : 'bg-amber-100 text-amber-700 border border-amber-200'
                                }`}>
                                {p.status === 'completed' || p.status === 'active' ? '✓ Pagado' : '⏳ Pendiente'}
                              </span>
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
        </Tabs>
      </div>
    </div>
  );
}



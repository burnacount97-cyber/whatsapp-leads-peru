import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, setDoc, where, limit } from 'firebase/firestore';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  MessageCircle,
  Users,
  CreditCard,
  BarChart3,
  LogOut,
  Check,
  X,
  Loader2,
  Search,
  Eye,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Shield,
  Plus,
  Pencil,
  Copy,
  ExternalLink,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Define simple interfaces for TS
interface Profile {
  id: string;
  email: string;
  business_name: string;
  whatsapp_number?: string;
  status?: string;
  created_at: string;
  trial_ends_at?: string;
}

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string;
  proof_url?: string;
  created_at: string;
}

interface ClientWithLeads extends Profile {
  leads_count: number;
}

export default function SuperAdmin() {
  const { user, isSuperAdmin, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [clients, setClients] = useState<ClientWithLeads[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingClient, setUpdatingClient] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState<string | null>(null);

  // New States for Management
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState({ business_name: '', phone: '', email: '' });

  // System Announcements State
  const [announcement, setAnnouncement] = useState({
    id: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'error' | 'success',
    is_active: false
  });

  // Stats
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    trialClients: 0,
    suspendedClients: 0,
    totalLeads: 0,
    pendingPayments: 0,
    totalViews: 0,
    mrr: 0,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (!isSuperAdmin) {
        // For demo, allow access if email matches superadmin
        if (user.email !== 'superadmin@leadwidget.pe') {
          navigate('/app');
        }
      }
    }
  }, [user, isSuperAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load all profiles
      const qProfiles = query(collection(db, 'profiles'), orderBy('created_at', 'desc'));
      const profilesSnap = await getDocs(qProfiles);
      // Map doc.id into the data
      const profilesData = profilesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Profile[];

      // Load leads (to count) - In production, maybe use aggregation or counter fields
      const leadsSnap = await getDocs(collection(db, 'leads'));
      const leadsData = leadsSnap.docs.map(d => d.data());

      const leadsCounts = leadsData.reduce((acc: Record<string, number>, lead: any) => {
        if (lead.client_id) acc[lead.client_id] = (acc[lead.client_id] || 0) + 1;
        return acc;
      }, {});

      const clientsWithLeads: ClientWithLeads[] = profilesData.map(profile => ({
        ...profile,
        leads_count: leadsCounts[profile.id] || 0,
      }));

      setClients(clientsWithLeads);

      // Load all payments
      const qPayments = query(collection(db, 'payments'), orderBy('created_at', 'desc'));
      const paymentsSnap = await getDocs(qPayments);
      const paymentsData = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Payment[];

      setPayments(paymentsData);

      // Calculate stats
      const activeCount = clientsWithLeads.filter(c => c.status === 'active').length;
      const trialCount = clientsWithLeads.filter(c => c.status === 'trial').length;
      const suspendedCount = clientsWithLeads.filter(c => c.status === 'suspended').length;
      const totalLeadsCount = Object.values(leadsCounts).reduce((a: number, b: number) => a + b, 0);
      const pendingPaymentsCount = paymentsData.filter(p => p.status === 'pending').length;

      // Load global analytics
      const analyticsSnap = await getDocs(collection(db, 'widget_analytics'));
      const totalViews = analyticsSnap.docs.filter(d => d.data().event_type === 'view').length;

      setStats({
        totalClients: clientsWithLeads.length,
        activeClients: activeCount,
        trialClients: trialCount,
        suspendedClients: suspendedCount,
        totalLeads: totalLeadsCount as number,
        pendingPayments: pendingPaymentsCount,
        totalViews,
        mrr: activeCount * 30,
      });

      // Load Announcement
      const qAnnounce = query(collection(db, 'system_announcements'), orderBy('updated_at', 'desc'), limit(1));
      const announceSnap = await getDocs(qAnnounce);

      if (!announceSnap.empty) {
        const d = announceSnap.docs[0].data();
        setAnnouncement({ id: announceSnap.docs[0].id, ...d } as any);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateClientStatus = async (clientId: string, newStatus: 'trial' | 'active' | 'suspended') => {
    setUpdatingClient(clientId);
    try {
      await updateDoc(doc(db, 'profiles', clientId), { status: newStatus });

      setClients(clients.map(c =>
        c.id === clientId ? { ...c, status: newStatus } : c
      ));

      toast({
        title: 'Estado actualizado',
        description: `Cliente marcado como ${newStatus}`,
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUpdatingClient(null);
    }
  };

  const verifyPayment = async (paymentId: string, status: 'verified' | 'rejected') => {
    setVerifyingPayment(paymentId);
    try {
      const payment = payments.find(p => p.id === paymentId);

      await updateDoc(doc(db, 'payments', paymentId), {
        status,
        verified_at: new Date().toISOString(),
        verified_by: user?.uid,
      });

      // If verified, activate client
      if (status === 'verified' && payment) {
        await updateDoc(doc(db, 'profiles', payment.user_id), { status: 'active' });
      }

      setPayments(payments.map(p =>
        p.id === paymentId ? { ...p, status } : p
      ));

      toast({
        title: status === 'verified' ? '✅ Pago verificado' : '❌ Pago rechazado',
        description: status === 'verified' ? 'Cliente activado automáticamente' : 'Se notificará al cliente',
      });

      loadData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setVerifyingPayment(null);
    }
  };

  const handleEditClick = (client: Profile) => {
    setEditingClient(client);
    setEditForm({
      business_name: client.business_name || '',
      phone: client.whatsapp_number || '',
      email: client.email || ''
    });
  };

  const handleUpdateProfile = async () => {
    if (!editingClient) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'profiles', editingClient.id), {
        business_name: editForm.business_name,
        whatsapp_number: editForm.phone
      });

      setClients(clients.map(c =>
        c.id === editingClient.id
          ? { ...c, business_name: editForm.business_name, whatsapp_number: editForm.phone }
          : c
      ));

      toast({ title: 'Cliente actualizado correctamente' });
      setEditingClient(null);
    } catch (error: any) {
      toast({
        title: 'Error al actualizar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/register`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado",
      description: "Envía este link al cliente para que se registre",
    });
    setIsCreateOpen(false);
  };

  const filteredClients = clients.filter(client =>
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const saveAnnouncement = async () => {
    setLoading(true);
    try {
      const data = {
        content: announcement.content,
        type: announcement.type,
        is_active: announcement.is_active,
        updated_at: new Date().toISOString()
      };

      if (announcement.id) {
        await updateDoc(doc(db, 'system_announcements', announcement.id), data);
      } else {
        const ref = doc(collection(db, 'system_announcements')); // auto-id
        await setDoc(ref, data);
      }

      toast({
        title: 'Aviso actualizado',
        description: 'Todos los clientes verán el nuevo mensaje en su dashboard.',
      });
      loadData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = '/login';
    }
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
      <header className="bg-foreground text-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Super Admin</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm opacity-80">{user?.email}</span>
            <Button variant="glass" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="stat-card">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Clientes</p>
              <p className="text-2xl font-bold">{stats.totalClients}</p>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Activos</p>
              <p className="text-2xl font-bold text-success">{stats.activeClients}</p>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Trial</p>
              <p className="text-2xl font-bold text-warning">{stats.trialClients}</p>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Suspendidos</p>
              <p className="text-2xl font-bold text-destructive">{stats.suspendedClients}</p>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Leads Total</p>
              <p className="text-2xl font-bold">{stats.totalLeads}</p>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Visitas Global</p>
              <p className="text-2xl font-bold">{stats.totalViews}</p>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Conv. Global</p>
              <p className="text-2xl font-bold text-success">
                {stats.totalViews > 0 ? Math.round((stats.totalLeads / stats.totalViews) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
          <Card className="stat-card bg-primary text-primary-foreground">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs opacity-80">MRR</p>
              <p className="text-2xl font-bold">S/{stats.mrr}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="clients" className="space-y-8">
          <TabsList>
            <TabsTrigger value="clients" className="gap-2">
              <Users className="w-4 h-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Pagos Pendientes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="avisos" className="gap-2">
              <AlertCircle className="w-4 h-4" />
              Avisos
            </TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Gestión de Clientes</CardTitle>
                    <CardDescription>{clients.length} clientes registrados</CardDescription>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por email o empresa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                      <Plus className="w-4 h-4" /> Nuevo Cliente
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Cliente</th>
                        <th className="text-left py-3 px-4 font-medium">Registro</th>
                        <th className="text-left py-3 px-4 font-medium">Estado</th>
                        <th className="text-left py-3 px-4 font-medium">Leads</th>
                        <th className="text-left py-3 px-4 font-medium">Trial Expira</th>
                        <th className="text-left py-3 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{client.business_name || 'Sin nombre'}</p>
                              <p className="text-sm text-muted-foreground">{client.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(client.created_at).toLocaleDateString('es-PE')}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(client.status || 'trial')}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold">{client.leads_count}</span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {client.trial_ends_at
                              ? new Date(client.trial_ends_at).toLocaleDateString('es-PE')
                              : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditClick(client)}
                              >
                                <Pencil className="w-4 h-4 text-muted-foreground" />
                              </Button>
                              {client.status !== 'active' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateClientStatus(client.id, 'active')}
                                  disabled={updatingClient === client.id}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                >
                                  {updatingClient === client.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                              {client.status !== 'suspended' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateClientStatus(client.id, 'suspended')}
                                  disabled={updatingClient === client.id}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Pagos Pendientes de Verificación</CardTitle>
                <CardDescription>Revisa los comprobantes y activa cuentas</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.filter(p => p.status === 'pending').length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Check className="w-12 h-12 mx-auto mb-4 opacity-50 text-success" />
                    <p>No hay pagos pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.filter(p => p.status === 'pending').map((payment) => {
                      const client = clients.find(c => c.id === payment.user_id);
                      return (
                        <div key={payment.id} className="flex items-center justify-between p-4 border rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                              <Clock className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                              <p className="font-medium">{client?.business_name || client?.email}</p>
                              <p className="text-sm text-muted-foreground">
                                S/{payment.amount} • {payment.payment_method || 'Yape/Plin'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(payment.created_at).toLocaleString('es-PE')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {payment.proof_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(payment.proof_url!, '_blank')}
                              >
                                <Eye className="w-4 h-4 mr-1" /> Ver
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => verifyPayment(payment.id, 'verified')}
                              disabled={verifyingPayment === payment.id}
                            >
                              {verifyingPayment === payment.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-1" /> Aprobar
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => verifyPayment(payment.id, 'rejected')}
                              disabled={verifyingPayment === payment.id}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* All Payments History */}
                <div className="mt-8">
                  <h3 className="font-semibold mb-4">Historial completo</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Cliente</th>
                          <th className="text-left py-3 px-4 font-medium">Monto</th>
                          <th className="text-left py-3 px-4 font-medium">Estado</th>
                          <th className="text-left py-3 px-4 font-medium">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => {
                          const client = clients.find(c => c.id === payment.user_id);
                          return (
                            <tr key={payment.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">{client?.email}</td>
                              <td className="py-3 px-4 font-medium">S/{payment.amount}</td>
                              <td className="py-3 px-4">
                                {payment.status === 'verified' && (
                                  <span className="badge-active px-2 py-1 rounded-full text-xs">Verificado</span>
                                )}
                                {payment.status === 'pending' && (
                                  <span className="badge-trial px-2 py-1 rounded-full text-xs">Pendiente</span>
                                )}
                                {payment.status === 'rejected' && (
                                  <span className="badge-suspended px-2 py-1 rounded-full text-xs">Rechazado</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground">
                                {new Date(payment.created_at).toLocaleDateString('es-PE')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leads por Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clients
                      .sort((a, b) => b.leads_count - a.leads_count)
                      .slice(0, 10)
                      .map((client, index) => (
                        <div key={client.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                            <span className="text-sm">{client.business_name || client.email}</span>
                          </div>
                          <span className="font-semibold">{client.leads_count}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Ingresos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">MRR Actual</p>
                        <p className="text-2xl font-bold">S/{stats.mrr}</p>
                      </div>
                    </div>
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-sm text-muted-foreground">Pagos este mes</p>
                      <p className="text-xl font-bold">
                        {payments.filter(p =>
                          p.status === 'verified' &&
                          new Date(p.created_at).getMonth() === new Date().getMonth()
                        ).length}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-sm text-muted-foreground">Ingresos mes</p>
                      <p className="text-xl font-bold">
                        S/{payments
                          .filter(p =>
                            p.status === 'verified' &&
                            new Date(p.created_at).getMonth() === new Date().getMonth()
                          )
                          .reduce((sum, p) => sum + Number(p.amount), 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Announcements Tab */}
          <TabsContent value="avisos">
            <Card>
              <CardHeader>
                <CardTitle>Avisos del Sistema</CardTitle>
                <CardDescription>Publica mensajes globales que aparecerán en el dashboard de todos los clientes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="announcement-content">Contenido del Mensaje</Label>
                    <textarea
                      id="announcement-content"
                      className="w-full min-h-[100px] p-4 rounded-xl border bg-background"
                      placeholder="Ej: Mantenimiento programado para las 10 PM. Toma tus precauciones."
                      value={announcement.content}
                      onChange={(e) => setAnnouncement({ ...announcement, content: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Tipo de Alerta</Label>
                      <div className="flex flex-wrap gap-2">
                        {['info', 'warning', 'error', 'success'].map((t) => (
                          <button
                            key={t}
                            onClick={() => setAnnouncement({ ...announcement, type: t as any })}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${announcement.type === t
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-muted'
                              }`}
                          >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAnnouncement({ ...announcement, is_active: !announcement.is_active })}
                          className={`w-12 h-6 rounded-full transition-colors relative ${announcement.is_active ? 'bg-primary' : 'bg-muted'}`}
                        >
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${announcement.is_active ? 'translate-x-6' : ''}`} />
                        </button>
                        <span className="text-sm font-medium">{announcement.is_active ? 'Activo (Visible)' : 'Inactivo (Oculto)'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-dashed rounded-xl bg-muted/20">
                    <p className="text-xs font-medium text-muted-foreground mb-3 underline">Vista previa en el Dashboard:</p>
                    {announcement.is_active && announcement.content ? (
                      <div className={`p-4 rounded-lg flex items-center gap-3 border shadow-sm ${announcement.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                        announcement.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                          announcement.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                            'bg-blue-50 border-blue-200 text-blue-800'
                        }`}>
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium leading-relaxed">{announcement.content}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic text-center py-2">No hay aviso activo para mostrar</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={saveAnnouncement}
                    disabled={loading || !announcement.content}
                    className="gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Guardar Cambios y Publicar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Client Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
              <DialogDescription>
                Opciones para dar de alta un nuevo usuario en la plataforma.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-xl space-y-3">
                <h4 className="font-medium text-sm">Opción 1: Enviar Invitación (Recomendado)</h4>
                <p className="text-xs text-muted-foreground">
                  Copia el link de registro y envíalo al cliente. Ellos configurarán su propia contraseña.
                </p>
                <div className="flex gap-2">
                  <Input value={`${window.location.origin}/register`} readOnly />
                  <Button variant="secondary" onClick={copyInviteLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">O</span>
                </div>
              </div>

              <div className="p-4 border rounded-xl space-y-3">
                <h4 className="font-medium text-sm">Opción 2: Registro Manual</h4>
                <p className="text-xs text-muted-foreground">
                  Cerrarás tu sesión actual para registrar al cliente. Necesitarás volver a entrar como Admin.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    signOut();
                    navigate('/register');
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión y Registrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Client Dialog */}
        <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email (No editable)</Label>
                <Input value={editForm.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Nombre de Empresa / Usuario</Label>
                <Input
                  value={editForm.business_name}
                  onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingClient(null)}>Cancelar</Button>
              <Button onClick={handleUpdateProfile}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

#!/usr/bin/env python3
"""
Script automático para agregar la sección de Seguridad al SuperAdmin
"""

import re

def add_security_section():
    file_path = "src/pages/SuperAdmin.tsx"
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add ShieldCheck to imports
    content = content.replace(
        "  Shield,\n  Plus,",
        "  Shield,\n  ShieldCheck,\n  Plus,"
    )
    
    # 2. Add unblockDemoIp function after updateClientStatus
    unblock_function = """
  const unblockDemoIp = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'blocked_ips', id));
      toast({
        title: "✅ IP Desbloqueada",
        description: "El usuario ahora puede volver a usar el chat del demo.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
"""
    
    # Find the end of updateClientStatus function and add our function
    pattern = r"(  const updateClientStatus = async[^}]+\}\s+\};)"
    content = re.sub(pattern, r"\1" + unblock_function, content, count=1)
    
    # 3. Add Security Tab Trigger
    security_tab_trigger = """            <TabsTrigger value="security" className="gap-2">
              <ShieldCheck className="w-4 h-4" />
              Seguridad
            </TabsTrigger>
"""
    
    # Find after Analytics tab
    content = content.replace(
        '            <TabsTrigger value="analytics" className="gap-2">\n              <BarChart3 className="w-4 h-4" />\n              Analytics\n            </TabsTrigger>\n\n          </TabsList>',
        '            <TabsTrigger value="analytics" className="gap-2">\n              <BarChart3 className="w-4 h-4" />\n              Analytics\n            </TabsTrigger>\n' + security_tab_trigger + '\n          </TabsList>'
    )
    
    # 4. Add Security TabsContent before closing Tabs
    security_content = """
          {/* Security Tab - Demo Widget Blocked IPs */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Seguridad - Widget Demo</CardTitle>
                    <CardDescription>IPs bloqueadas en el widget de la landing page</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Estas IPs fueron bloqueadas automáticamente por intentar manipular el chat demo de tu landing page. 
                    Si crees que algún bloqueo fue un error, puedes rehabilitar manualmente.
                  </p>
                </div>

                {blockedDemoIps.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p>No hay IPs bloqueadas en el widget demo actualmente</p>
                    <p className="text-sm mt-1">El sistema de seguridad está activo y vigilando.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="text-left py-3 px-4 font-medium">Dirección IP</th>
                          <th className="text-left py-3 px-4 font-medium">Motivo</th>
                          <th className="text-left py-3 px-4 font-medium">Fecha de Bloqueo</th>
                          <th className="text-right py-3 px-4 font-medium">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {blockedDemoIps.map((ip) => (
                          <tr key={ip.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-4 px-4 font-mono text-xs">{ip.ip_address}</td>
                            <td className="py-4 px-4">
                              <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-xs font-medium">
                                {ip.reason || 'AI detected abuse'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-muted-foreground">
                              {new Date(ip.created_at).toLocaleString('es-PE')}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => unblockDemoIp(ip.id)}
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
"""
    
    # Find the last </Tabs> and add content before it
    content = content.replace('        </Tabs>', security_content + '        </Tabs>')
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("[OK] Seccion de Seguridad agregada exitosamente al SuperAdmin")
    print("   - Import ShieldCheck agregado")
    print("   - Funcion unblockDemoIp agregada")
    print("   - Tab de Seguridad agregado")
    print("   - Contenido de la pestana agregado")

if __name__ == '__main__':
    try:
        add_security_section()
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        print("\nPor favor, usa las instrucciones manuales en MANUAL_SUPERADMIN_SECURITY.txt")

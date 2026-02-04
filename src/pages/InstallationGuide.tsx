import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Code, Globe, ShoppingBag, LayoutTemplate, HelpCircle, Check, Copy, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth'; // To get the user ID for the code example

export default function InstallationGuide() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('wordpress');

    // We can construct the script tag example. 
    // Note: ideally we'd pass the actual widget ID if possible, but user ID is often used or we can tell them to copy from dashboard.
    // The dashboard shows: <script src="${window.location.origin}/api/w/${widgetConfig?.widget_id}.js" async></script>
    // Since we might not have the widgetConfig here easily without fetching, we'll instruct them to copy the code from Dashboard first.
    // OR we can make this page helpful by explaining WHERE to paste it.

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <Link to="/app" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Guía de Instalación</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Sigue estos pasos simples para activar Lead Widget en tu sitio web.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
                    <CardHeader>
                        <CardTitle>¿Qué plataforma utilizas?</CardTitle>
                        <CardDescription>Selecciona tu proveedor para ver las instrucciones específicas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="wordpress" value={activeTab} onValueChange={setActiveTab} className="space-y-8">

                            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 justify-start">
                                <TabsTrigger value="wordpress" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl gap-2 h-auto hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <Globe className="w-5 h-5" /> WordPress
                                </TabsTrigger>
                                <TabsTrigger value="shopify" className="data-[state=active]:bg-green-600 data-[state=active]:text-white border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl gap-2 h-auto hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <ShoppingBag className="w-5 h-5" /> Shopify
                                </TabsTrigger>
                                <TabsTrigger value="wix" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl gap-2 h-auto hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <LayoutTemplate className="w-5 h-5" /> Wix
                                </TabsTrigger>
                                <TabsTrigger value="html" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl gap-2 h-auto hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <Code className="w-5 h-5" /> HTML / Otro
                                </TabsTrigger>
                            </TabsList>

                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">

                                {/* WordPress Instructions */}
                                <TabsContent value="wordpress" className="mt-0 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Instalación en WordPress</h3>
                                            <p className="text-sm text-muted-foreground">Compatible con Elementor, Divi y Gutenberg.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">1</div>
                                                <p className="text-sm">Ve a tu Dashboard de WordPress.</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">2</div>
                                                <p className="text-sm">Instala el plugin gratuito <strong>"WPCode"</strong> (o "Insert Headers and Footers").</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">3</div>
                                                <p className="text-sm">Ve a <strong>Code Snippets &gt; Header &amp; Footer</strong>.</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">4</div>
                                                <div className="space-y-2">
                                                    <p className="text-sm">Pega el código de instalación en la sección <strong>Footer</strong>.</p>
                                                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md text-xs text-yellow-800 dark:text-yellow-200">
                                                        <strong>Nota:</strong> Es importante pegarlo en el Footer (antes de cerrar body) para que no afecte la velocidad de tu web.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-950 rounded-xl border p-4 flex items-center justify-center">
                                            {/* You could add an image here using an img tag if you had one, for now text/icon placeholder */}
                                            <div className="text-center space-y-2 opacity-50">
                                                <LayoutTemplate className="w-16 h-16 mx-auto mb-2" />
                                                <p className="text-xs">Ejemplo visual del panel de WordPress</p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Shopify Instructions */}
                                <TabsContent value="shopify" className="mt-0 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                            <ShoppingBag className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Instalación en Shopify</h3>
                                            <p className="text-sm text-muted-foreground">Funciona en todos los temas.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">1</div>
                                            <p className="text-sm">En tu admin de Shopify, ve a <strong>Tienda Online &gt; Temas</strong>.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">2</div>
                                            <p className="text-sm">Haz clic en los 3 puntos (...) junto a tu tema actual y selecciona <strong>"Editar código"</strong>.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">3</div>
                                            <p className="text-sm">Busca el archivo <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">theme.liquid</code> en la barra lateral izquierda.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">4</div>
                                            <p className="text-sm">Desliza hasta el final del archivo y pega el código justo antes de la etiqueta <code className="text-red-500">&lt;/body&gt;</code>.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">5</div>
                                            <p className="text-sm">Haz clic en <strong>Guardar</strong>.</p>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Wix Instructions */}
                                <TabsContent value="wix" className="mt-0 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                            <LayoutTemplate className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Instalación en Wix</h3>
                                            <p className="text-sm text-muted-foreground">Requiere plan Premium para Custom Code.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">1</div>
                                            <p className="text-sm">Ve a <strong>Configuración &gt; Código personalizado</strong> en tu panel.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">2</div>
                                            <p className="text-sm">Haz clic en <strong>+ Agregar código personalizado</strong>.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">3</div>
                                            <p className="text-sm">Pega el código de instalación.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">4</div>
                                            <p className="text-sm">Selecciona <strong>"Body - fin"</strong> en la opción de ubicación.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">5</div>
                                            <p className="text-sm">Asegúrate de que esté habilitado para "Todas las páginas".</p>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* HTML / Other Instructions */}
                                <TabsContent value="html" className="mt-0 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                            <Code className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">HTML / Otro CMS</h3>
                                            <p className="text-sm text-muted-foreground">Sitios a medida, Webflow, TiendaNube, etc.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-sm">La regla general es simple: Debes pegar el código <strong>al final de tu página, justo antes de que se cierre la etiqueta <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono text-red-500">&lt;/body&gt;</code></strong>.</p>

                                        <div className="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-xs overflow-x-auto relative group">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] text-slate-400">Ejemplo de ubicación</span>
                                            </div>
                                            <pre>{`<html>
  <head>
    ...
  </head>
  <body>
    <!-- Tu contenido web aquí -->
    <h1>Mi Sitio Web</h1>
    ...

    <!-- PEGAR LEAD WIDGET AQUÍ -->
    <script src=".../widget.js"></script>
    
  </body>
</html>`}</pre>
                                        </div>

                                        <div className="flex gap-3 mt-4">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">?</div>
                                            <p className="text-sm">Si usas <strong>TiendaNube</strong>, ve a <strong>Configuraciones &gt; Códigos Externos</strong> y pégalo en el campo "Códigos de tracking (footer)".</p>
                                        </div>
                                    </div>
                                </TabsContent>

                            </div>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Support Section */}
                <div className="text-center">
                    <h3 className="font-semibold text-lg">¿Aún tienes problemas?</h3>
                    <p className="text-muted-foreground text-sm mb-4">Nuestro equipo de soporte puede ayudarte a instalarlo.</p>
                    <Button variant="outline" className="gap-2" asChild>
                        <a href="https://wa.me/51902105668" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                            Contactar Soporte
                        </a>
                    </Button>
                </div>

            </div>
        </div>
    );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Code, Globe, ShoppingBag, LayoutTemplate, HelpCircle, Check, Copy, ExternalLink, Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTranslation, Trans } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function InstallationGuide() {
    const { t } = useTranslation();
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
                            <ArrowLeft className="w-4 h-4 mr-1" /> {t('installation_guide.back_to_dashboard')}
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('installation_guide.title')}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            {t('installation_guide.subtitle')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-medium text-muted-foreground px-2 hidden sm:inline">Idioma:</span>
                        <LanguageSwitcher />
                    </div>
                </div>

                {/* Main Content */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
                    <CardHeader>
                        <CardTitle>{t('installation_guide.platform_question')}</CardTitle>
                        <CardDescription>{t('installation_guide.platform_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="wordpress" value={activeTab} onValueChange={setActiveTab} className="space-y-8">

                            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 justify-start">
                                <TabsTrigger value="wordpress" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl gap-2 h-auto hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <Globe className="w-5 h-5" /> {t('installation_guide.wordpress_tab')}
                                </TabsTrigger>
                                <TabsTrigger value="shopify" className="data-[state=active]:bg-green-600 data-[state=active]:text-white border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl gap-2 h-auto hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <ShoppingBag className="w-5 h-5" /> {t('installation_guide.shopify_tab')}
                                </TabsTrigger>
                                <TabsTrigger value="wix" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl gap-2 h-auto hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <LayoutTemplate className="w-5 h-5" /> {t('installation_guide.wix_tab')}
                                </TabsTrigger>
                                <TabsTrigger value="html" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl gap-2 h-auto hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <Code className="w-5 h-5" /> {t('installation_guide.html_tab')}
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
                                            <h3 className="text-xl font-bold">{t('installation_guide.wp_title')}</h3>
                                            <p className="text-sm text-muted-foreground">{t('installation_guide.wp_subtitle')}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">1</div>
                                                <p className="text-sm">{t('installation_guide.wp_step1')}</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">2</div>
                                                <p className="text-sm">
                                                    <Trans i18nKey="installation_guide.wp_step2">
                                                        Instala el plugin gratuito <strong>"WPCode"</strong> (o "Insert Headers and Footers").
                                                    </Trans>
                                                </p>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">3</div>
                                                <p className="text-sm">
                                                    <Trans i18nKey="installation_guide.wp_step3">
                                                        Ve a <strong>Code Snippets &gt; Header &amp; Footer</strong>.
                                                    </Trans>
                                                </p>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">4</div>
                                                <div className="space-y-2">
                                                    <p className="text-sm">
                                                        <Trans i18nKey="installation_guide.wp_step4">
                                                            Pega el código de instalación en la sección <strong>Footer</strong>.
                                                        </Trans>
                                                    </p>
                                                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md text-xs text-yellow-800 dark:text-yellow-200">
                                                        <strong>{t('installation_guide.wp_note')}</strong> {t('installation_guide.wp_note_text')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-950 rounded-xl border p-4 flex items-center justify-center">
                                            {/* You could add an image here using an img tag if you had one, for now text/icon placeholder */}
                                            <div className="text-center space-y-2 opacity-50">
                                                <LayoutTemplate className="w-16 h-16 mx-auto mb-2" />
                                                <p className="text-xs">{t('installation_guide.wp_visual')}</p>
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
                                            <h3 className="text-xl font-bold">{t('installation_guide.shopify_title')}</h3>
                                            <p className="text-sm text-muted-foreground">{t('installation_guide.shopify_subtitle')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">1</div>
                                            <p className="text-sm">
                                                <Trans i18nKey="installation_guide.shopify_step1">
                                                    En tu admin de Shopify, ve a <strong>Tienda Online &gt; Temas</strong>.
                                                </Trans>
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">2</div>
                                            <p className="text-sm">
                                                <Trans i18nKey="installation_guide.shopify_step2">
                                                    Haz clic en los 3 puntos (...) junto a tu tema actual y selecciona <strong>"Editar código"</strong>.
                                                </Trans>
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">3</div>
                                            <p className="text-sm">
                                                <Trans i18nKey="installation_guide.shopify_step3">
                                                    Busca el archivo <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">theme.liquid</code> en la barra lateral izquierda.
                                                </Trans>
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">4</div>
                                            <p className="text-sm">
                                                <Trans i18nKey="installation_guide.shopify_step4">
                                                    Desliza hasta el final del archivo y pega el código justo antes de la etiqueta <code className="text-red-500">&lt;/body&gt;</code>.
                                                </Trans>
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">5</div>
                                            <p className="text-sm">
                                                <Trans i18nKey="installation_guide.shopify_step5">
                                                    Haz clic en <strong>Guardar</strong>.
                                                </Trans>
                                            </p>
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
                                            <h3 className="text-xl font-bold">{t('installation_guide.wix_title')}</h3>
                                            <p className="text-sm text-muted-foreground">{t('installation_guide.wix_subtitle')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">1</div>
                                            <p className="text-sm">
                                                <Trans i18nKey="installation_guide.wix_step1">
                                                    Ve a <strong>Configuración &gt; Código personalizado</strong> en tu panel.
                                                </Trans>
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">2</div>
                                            <p className="text-sm">
                                                <Trans i18nKey="installation_guide.wix_step2">
                                                    Haz clic en <strong>+ Agregar código personalizado</strong>.
                                                </Trans>
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">3</div>
                                            <p className="text-sm">{t('installation_guide.wix_step3')}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">4</div>
                                            <p className="text-sm">
                                                <Trans i18nKey="installation_guide.wix_step4">
                                                    Selecciona <strong>"Body - fin"</strong> en la opción de ubicación.
                                                </Trans>
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">5</div>
                                            <p className="text-sm">{t('installation_guide.wix_step5')}</p>
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
                                            <h3 className="text-xl font-bold">{t('installation_guide.html_title')}</h3>
                                            <p className="text-sm text-muted-foreground">{t('installation_guide.html_subtitle')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-sm">
                                            <Trans i18nKey="installation_guide.html_text">
                                                La regla general es simple: Debes pegar el código <strong>al final de tu página, justo antes de que se cierre la etiqueta <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono text-red-500">&lt;/body&gt;</code></strong>.
                                            </Trans>
                                        </p>

                                        <div className="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-xs overflow-x-auto relative group">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] text-slate-400">{t('installation_guide.html_example_hint')}</span>
                                            </div>
                                            <pre>{`<html>
  <head>
    ...
  </head>
  <body>
    <!-- ${t('installation_guide.html_your_content')} -->
    <h1>${t('installation_guide.html_my_web')}</h1>
    ...

    <!-- ${t('installation_guide.html_comment')} -->
    <script src=".../widget.js"></script>
    
  </body>
</html>`}</pre>
                                        </div>

                                        <div className="flex gap-3 mt-4">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">?</div>
                                            <p className="text-sm">
                                                <Trans i18nKey="installation_guide.html_tiendanube">
                                                    Si usas <strong>TiendaNube</strong>, ve a <strong>Configuraciones &gt; Códigos Externos</strong> y pégalo en el campo "Códigos de tracking (footer)".
                                                </Trans>
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                            </div>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Support Section */}
                <div className="text-center">
                    <h3 className="font-semibold text-lg">{t('installation_guide.still_problems')}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{t('installation_guide.support_help')}</p>
                    <Button variant="outline" className="gap-2" asChild>
                        <a href="https://wa.me/51924464410" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                            {t('installation_guide.contact_support')}
                        </a>
                    </Button>
                </div>

            </div>
        </div>
    );
}

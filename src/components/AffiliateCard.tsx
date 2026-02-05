import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Copy, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils'; // Assuming you have utility for class merging or just use logic

interface AffiliateCardProps {
    dismissible?: boolean;
    className?: string;
}

export function AffiliateCard({ dismissible = false, className }: AffiliateCardProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (dismissible) {
            const isHidden = localStorage.getItem('hide_affiliate_card');
            if (isHidden) setIsVisible(false);
        }
    }, [dismissible]);

    if (!isVisible && dismissible) return null;

    const referralLink = `https://leadwidget.com/crear-ahora?ref=${user?.uid}`;

    return (
        <Card className={`bg-gradient-to-br from-emerald-600 to-teal-700 border-0 text-white overflow-hidden relative mb-6 ${className || ''}`}>
            {dismissible && (
                <button
                    onClick={() => {
                        localStorage.setItem('hide_affiliate_card', 'true');
                        setIsVisible(false);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/10 hover:bg-black/20 text-white/70 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
            <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">

                    <div className="p-4 bg-white/10 rounded-2xl shrink-0 text-emerald-100">
                        <Gift className="w-8 h-8" />
                    </div>

                    <div className="space-y-3 flex-1 w-full">
                        <div>
                            <h3 className="font-bold text-lg sm:text-xl text-white">
                                🎁 ¡Gana Meses Gratis!
                            </h3>
                            <p className="text-sm text-emerald-50 mt-1">
                                Por cada negocio que use tu enlace para crear su propio chat, te regalamos 1 mes gratis (o 20% de comisión).
                            </p>
                        </div>

                        <div className="flex items-center gap-1 p-1 bg-black/20 rounded-xl max-w-md mx-auto sm:mx-0">
                            <div className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-white truncate text-left rounded-lg select-all border border-white/5">
                                {referralLink}
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 hover:bg-white/20 text-white"
                                onClick={() => {
                                    navigator.clipboard.writeText(referralLink);
                                    toast({
                                        title: '¡Enlace Copiado!',
                                        description: 'Compártelo con tus amigos dueños de negocio.',
                                    });
                                }}
                            >
                                <Copy className="w-4 h-4 mr-1" />
                                <span className="text-xs font-semibold">COPIAR</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

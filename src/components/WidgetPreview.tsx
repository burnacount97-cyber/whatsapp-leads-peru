import { useState } from 'react';
import { MessageCircle, X, Send, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface WidgetPreviewProps {
  primaryColor?: string;
  welcomeMessage?: string;
  nicheQuestion?: string;
  template?: string;
}

export function WidgetPreview({ 
  primaryColor = '#00C185',
  welcomeMessage = '¡Hola! ¿En qué podemos ayudarte?',
  nicheQuestion = '¿En qué distrito te encuentras?',
  template = 'general'
}: WidgetPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    interest: '',
    name: '',
    phone: '',
  });

  const getTemplateLabels = () => {
    switch (template) {
      case 'inmobiliaria':
        return { interest: 'Distrito / Habitaciones', placeholder: 'Ej: Miraflores, 3 habitaciones' };
      case 'clinica':
        return { interest: 'Especialidad', placeholder: 'Ej: Dermatología' };
      case 'taller':
        return { interest: 'Tipo de vehículo / Problema', placeholder: 'Ej: Toyota Corolla, frenos' };
      case 'delivery':
        return { interest: 'Dirección de entrega', placeholder: 'Ej: Av. Javier Prado 123' };
      default:
        return { interest: nicheQuestion, placeholder: 'Tu respuesta' };
    }
  };

  const labels = getTemplateLabels();

  const handleSubmit = () => {
    setStep(3);
  };

  const resetWidget = () => {
    setStep(1);
    setFormData({ interest: '', name: '', phone: '' });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Widget Panel */}
      {isOpen && (
        <div 
          className="widget-panel"
          style={{ 
            '--widget-primary': primaryColor 
          } as React.CSSProperties}
        >
          {/* Header */}
          <div 
            className="p-4 text-primary-foreground"
            style={{ background: primaryColor }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">LeadWidget</p>
                  <p className="text-xs opacity-80">Respondemos al instante</p>
                </div>
              </div>
              <button 
                onClick={resetWidget}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 min-h-[280px] flex flex-col">
            {step === 1 && (
              <div className="animate-fade-in space-y-4">
                <div className="bg-muted rounded-2xl rounded-tl-sm p-3">
                  <p className="text-sm">{welcomeMessage}</p>
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm p-3">
                  <p className="text-sm">{labels.interest}</p>
                </div>
                <div className="mt-auto">
                  <Input
                    placeholder={labels.placeholder}
                    value={formData.interest}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    className="rounded-xl"
                  />
                  <Button 
                    className="w-full mt-3 rounded-xl"
                    style={{ background: primaryColor }}
                    onClick={() => formData.interest && setStep(2)}
                    disabled={!formData.interest}
                  >
                    Continuar <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-4">
                <div className="bg-muted rounded-2xl rounded-tl-sm p-3">
                  <p className="text-sm">¡Perfecto! Para contactarte, necesitamos:</p>
                </div>
                <div className="space-y-3 mt-auto">
                  <Input
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl"
                  />
                  <Input
                    placeholder="+51 987 654 321"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-xl"
                  />
                  <Button 
                    className="w-full rounded-xl"
                    style={{ background: primaryColor }}
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.phone}
                  >
                    <Send className="w-4 h-4 mr-1" /> Enviar
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in space-y-4 flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-lg">¡Listo, {formData.name}!</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Te pasamos al WhatsApp del equipo 👇
                  </p>
                </div>
                <Button 
                  variant="whatsapp"
                  className="w-full rounded-xl"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Abrir WhatsApp
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="widget-bubble"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}

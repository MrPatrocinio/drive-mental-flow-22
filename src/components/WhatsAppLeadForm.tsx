/**
 * WhatsAppLeadForm - Formulário de captura de leads via WhatsApp
 * Responsabilidade: UI do formulário de captura (princípio SRP)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Loader2, Check, ExternalLink } from "lucide-react";
import { useLeadCapture } from "@/hooks/useLeadCapture";
import { toast } from "sonner";

interface WhatsAppLeadFormProps {
  className?: string;
}

/**
 * Formata número de telefone para máscara brasileira
 */
const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

/**
 * Valida se o telefone tem formato válido (11 dígitos)
 */
const isValidPhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, "");
  return numbers.length === 11;
};

export const WhatsAppLeadForm = ({ className = "" }: WhatsAppLeadFormProps) => {
  const [phone, setPhone] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const { isLoading, isSuccess, error, submitLead, clearError } = useLeadCapture();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidPhone(phone)) {
      toast.error("Digite um WhatsApp válido com DDD");
      return;
    }

    const phoneNumber = phone.replace(/\D/g, "");
    
    const result = await submitLead({
      name: "Lead WhatsApp",
      email: `whatsapp_${phoneNumber}@lead.temp`,
      phone: phoneNumber,
      interest_field: "demo_gratuita",
    });

    if (result.success) {
      // Construir URL do WhatsApp com mensagem pré-preenchida
      const message = encodeURIComponent(
        "🎉 Aqui está seu acesso gratuito ao Drive Mental:\n\nhttps://www.drivemental.com.br/demo\n\n👆 Clique no link acima para começar!"
      );
      const url = `https://wa.me/55${phoneNumber}?text=${message}`;
      setWhatsappUrl(url);
      
      toast.success("Número cadastrado! Clique no botão verde para receber seu link.");
    }
  };

  // Estado de sucesso - mostra botão grande para abrir WhatsApp
  if (isSuccess && whatsappUrl) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center space-y-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Check className="w-6 h-6" />
            <span className="font-semibold text-lg">Número cadastrado!</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Clique no botão abaixo para receber o link de acesso no seu WhatsApp:
          </p>
        </div>
        
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="w-6 h-6" />
          📲 Receber link no WhatsApp
        </a>
        
        <p className="text-xs text-muted-foreground text-center">
          Ao clicar, o WhatsApp abrirá com uma mensagem pronta. Basta enviar!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="relative">
        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="tel"
          placeholder="(11) 99999-9999"
          value={phone}
          onChange={handlePhoneChange}
          className="pl-10 h-12 text-lg bg-background border-border"
          disabled={isLoading}
          maxLength={16}
        />
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      <Button 
        type="submit" 
        size="lg" 
        className="w-full h-12 text-lg font-semibold"
        disabled={isLoading || !isValidPhone(phone)}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <MessageCircle className="mr-2 h-5 w-5" />
            Quero testar grátis
          </>
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        📱 Você receberá o link de acesso diretamente no seu WhatsApp
      </p>
    </form>
  );
};

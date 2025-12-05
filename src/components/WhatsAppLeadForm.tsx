/**
 * WhatsAppLeadForm - Formulário de captura de leads via WhatsApp
 * Responsabilidade: UI do formulário de captura (princípio SRP)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Loader2, Check } from "lucide-react";
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
  const navigate = useNavigate();
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

    const result = await submitLead({
      name: "Lead WhatsApp",
      email: `whatsapp_${phone.replace(/\D/g, "")}@lead.temp`,
      phone: phone.replace(/\D/g, ""),
      interest_field: "demo_gratuita",
    });

    if (result.success) {
      toast.success("Pronto! Redirecionando para seu teste gratuito...");
      setTimeout(() => {
        navigate("/demo");
      }, 1500);
    }
  };

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
          disabled={isLoading || isSuccess}
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
        disabled={isLoading || isSuccess || !isValidPhone(phone)}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Enviando...
          </>
        ) : isSuccess ? (
          <>
            <Check className="mr-2 h-5 w-5" />
            Acesso liberado!
          </>
        ) : (
          <>
            <MessageCircle className="mr-2 h-5 w-5" />
            Quero testar grátis
          </>
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        🔒 Seus dados estão seguros. Não enviamos spam.
      </p>
    </form>
  );
};

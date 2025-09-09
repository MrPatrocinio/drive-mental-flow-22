/**
 * useLeadCapture - Hook para captura de leads
 * Responsabilidade: Gerenciar estado e ações do formulário de inscrição (princípio SRP)
 * Princípio SSOT: Estado centralizado para formulário de leads
 */

import { useState } from "react";
import { leadService, type CreateLeadData } from "@/services/leadService";
import { useAnalytics } from "@/hooks/useAnalytics";

interface UseLeadCaptureReturn {
  isLoading: boolean;
  isSuccess: boolean;
  error: string;
  submitLead: (leadData: CreateLeadData) => Promise<{ success: boolean }>;
  clearError: () => void;
  clearSuccess: () => void;
}

/**
 * Hook personalizado para captura de leads
 * Princípio SoC: Separa lógica de estado da lógica de negócio
 */
export const useLeadCapture = (): UseLeadCaptureReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const { trackEvent } = useAnalytics();

  const submitLead = async (leadData: CreateLeadData): Promise<{ success: boolean }> => {
    setIsLoading(true);
    setError("");
    setIsSuccess(false);

    try {
      // Verificar se email já existe
      const { exists, error: checkError } = await leadService.checkEmailExists(leadData.email);
      
      if (checkError) {
        setError("Erro ao verificar email. Tente novamente.");
        return { success: false };
      }

      if (exists) {
        setError("Este email já está cadastrado em nossa lista.");
        return { success: false };
      }

      // Capturar UTM parameters da URL
      const urlParams = new URLSearchParams(window.location.search);
      const leadWithUTM = {
        ...leadData,
        utm_source: urlParams.get('utm_source') || undefined,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
      };

      // Criar lead
      const { data, error: createError } = await leadService.createLead(leadWithUTM);
      
      if (createError) {
        setError(createError);
        return { success: false };
      }

      // Tracking de evento de conversão
      trackEvent('lead_capture', {
        name: leadData.name,
        email: leadData.email,
        interest_field: leadData.interest_field,
        utm_source: leadWithUTM.utm_source,
        utm_medium: leadWithUTM.utm_medium,
        utm_campaign: leadWithUTM.utm_campaign,
      });

      // GTM event para conversão
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'lead_submitted',
          lead_name: leadData.name,
          lead_email: leadData.email,
          lead_interest: leadData.interest_field,
          conversion_id: data?.id,
        });
      }

      setIsSuccess(true);
      return { success: true };
    } catch (err) {
      console.error('Erro interno na captura de lead:', err);
      setError("Erro interno. Tente novamente mais tarde.");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError("");
  };

  const clearSuccess = () => {
    setIsSuccess(false);
  };

  return {
    isLoading,
    isSuccess,
    error,
    submitLead,
    clearError,
    clearSuccess
  };
};
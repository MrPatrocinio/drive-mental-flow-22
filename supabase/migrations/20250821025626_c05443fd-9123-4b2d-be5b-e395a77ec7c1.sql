
-- Atualizar a tabela landing_content para suportar múltiplos planos de assinatura
-- Vamos usar uma seção específica para planos de assinatura
INSERT INTO public.landing_content (section, content) 
VALUES ('subscription_plans', '{
  "plans": [
    {
      "id": "quarterly",
      "name": "Trimestral",
      "price": 89.90,
      "original_price": 89.90,
      "currency": "R$",
      "interval": "month",
      "interval_count": 3,
      "description": "Renovação automática a cada 3 meses",
      "savings": "Economize R$ 0,80",
      "popular": false,
      "has_promotion": false,
      "discount_percentage": 0,
      "promotion_end_date": null,
      "promotion_label": ""
    },
    {
      "id": "semiannual", 
      "name": "Semestral",
      "price": 159.90,
      "original_price": 179.40,
      "currency": "R$",
      "interval": "month",
      "interval_count": 6,
      "description": "Renovação automática a cada 6 meses - Mais Popular",
      "savings": "Economize R$ 20,40",
      "popular": true,
      "has_promotion": true,
      "discount_percentage": 11,
      "promotion_end_date": "2025-01-31T23:59:59",
      "promotion_label": "OFERTA ESPECIAL"
    },
    {
      "id": "annual",
      "name": "Anual", 
      "price": 299.90,
      "original_price": 358.80,
      "currency": "R$",
      "interval": "year",
      "interval_count": 1,
      "description": "Renovação automática a cada 12 meses",
      "savings": "Economize R$ 59,80",
      "popular": false,
      "has_promotion": true,
      "discount_percentage": 17,
      "promotion_end_date": "2025-01-31T23:59:59",
      "promotion_label": "MELHOR OFERTA"
    }
  ],
  "global_benefits": [
    "Acesso completo a todos os áudios especializados",
    "Atualizações constantes de conteúdo",
    "Garantia de Resultados em menos de 30 Dias",
    "Analytics Avançados e Relatórios Personalizados",
    "Instale novos padrões mentais em apenas 21 dias de escuta",
    "Áudios com frequências cientificamente comprovadas",
    "De mindset limitante para mentalidade abundante"
  ],
  "button_text": "Começar Agora"
}'::jsonb)
ON CONFLICT (section) 
DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = now();

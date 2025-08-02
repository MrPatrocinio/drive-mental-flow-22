-- Inserir dados faltantes na tabela landing_content
INSERT INTO landing_content (section, content) VALUES 
('hero', '{
  "title": "Transforme Sua Mente com Drives Mentais",
  "subtitle": "Reprograme seus padrões mentais e alcance resultados extraordinários",
  "primaryButton": {
    "text": "Começar Agora",
    "action": "cta"
  },
  "secondaryButton": {
    "text": "Saber Mais", 
    "action": "demo"
  }
}'::jsonb),
('features', '{
  "title": "Funcionalidades Exclusivas",
  "items": [
    {
      "title": "Áudios de Alta Qualidade",
      "description": "Conteúdo profissional para reprogramação mental"
    },
    {
      "title": "Organização por Áreas",
      "description": "Drives mentais categorizados por área de vida"
    },
    {
      "title": "Acompanhamento Personalizado",
      "description": "Monitore seu progresso e evolução"
    }
  ]
}'::jsonb),
('footer', '{
  "company": "Drive Mental",
  "description": "Transformando mentes, criando resultados extraordinários",
  "links": [
    {
      "title": "Política de Privacidade",
      "url": "/privacy"
    },
    {
      "title": "Termos de Uso", 
      "url": "/terms"
    },
    {
      "title": "Contato",
      "url": "/contact"
    }
  ]
}'::jsonb)
ON CONFLICT (section) DO NOTHING;
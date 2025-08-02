-- Atualizar a estrutura dos dados para corresponder ao que a Landing Page espera
UPDATE landing_content 
SET content = '[
  {
    "id": "feature1",
    "title": "Áudios de Alta Qualidade",
    "description": "Conteúdo profissional para reprogramação mental",
    "icon": "Volume2"
  },
  {
    "id": "feature2", 
    "title": "Organização por Áreas",
    "description": "Drives mentais categorizados por área de vida",
    "icon": "FolderOpen"
  },
  {
    "id": "feature3",
    "title": "Acompanhamento Personalizado",
    "description": "Monitore seu progresso e evolução",
    "icon": "TrendingUp"
  }
]'::jsonb
WHERE section = 'features';

UPDATE landing_content
SET content = '{
  "title": "Transforme Sua Mente com Drives Mentais",
  "titleHighlight": "Drive Mental",
  "subtitle": "Reprograme seus padrões mentais e alcance resultados extraordinários",
  "ctaText": "Começar Agora",
  "demoText": "Ver Demonstração"
}'::jsonb
WHERE section = 'hero';

UPDATE landing_content
SET content = '{
  "copyright": "© 2025 Drive Mental. Todos os direitos reservados.",
  "lgpdText": "Conforme LGPD",
  "lgpdLink": "/lgpd",
  "privacyPolicyLink": "/privacy",
  "termsOfServiceLink": "/terms"
}'::jsonb
WHERE section = 'footer';
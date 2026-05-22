🎯 Diagnóstico Estratégico Refinado
Cliente: Ygor Santos — Treinador Pessoal, Ibicuí-BA Público: Geral premium + mulheres 35+ + high-ticket Objetivo: Conversão direta (WhatsApp) Decisão UX: 4 temas alternáveis (A/B/C/D) via toggle persistente

Insight crítico: O público 35+ feminino high-ticket NÃO quer ver "gritaria fitness". Quer ver sofisticação, resultado discreto, autoridade silenciosa. Pense em joalheria, spa de luxo, clínica estética premium — não em academia de bairro. Isso muda completamente a linguagem visual.

💡 Proposta — Referências reais que vou destilar
Linear.app → micro-interações com propósito, easing curves perfeitos
Rauno.me (Rauno Freiberg) → cursor sofisticado, hover states orquestrados
Emil Kowalski (emilkowal.ski) → typography editorial, espaço negativo
Equinox.com (gym premium NYC) → fotografia + tipografia editorial
Arc Browser → mood azul profundo + gradientes sutis
Stripe.com → hierarquia tipográfica modular, conversão limpa
🏗️ Arquitetura de Entrega
Vou montar tudo agora. Como é um projeto extenso (HTML semântico + CSS modular + JS modular + 4 temas + GSAP + acessibilidade), vou trabalhar no sandbox e te entregar:

Copyygor-premium/
├── index.html              # HTML semântico, zero estilos inline
├── assets/
│   ├── css/
│   │   ├── tokens.css      # Variáveis OKLCH dos 4 temas
│   │   ├── base.css        # Reset + tipografia + escala modular
│   │   ├── components.css  # Botões, cards, navbar, etc
│   │   ├── sections.css    # Hero, sobre, planos, FAQ, etc
│   │   └── animations.css  # Keyframes + utilitários motion
│   └── js/
│       ├── theme-switcher.js   # Toggle A/B/C/D + localStorage
│       ├── animations.js       # GSAP ScrollTrigger + SplitText
│       ├── cursor.js           # Spotlight cursor desktop
│       ├── magnetic.js         # Botões magnéticos
│       └── interactions.js     # FAQ, mobile menu, carrossel
└── README.md



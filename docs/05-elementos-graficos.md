# Elementos gráficos de apoio

Além de logo/cor/tipografia, quatro recursos visuais aparecem de forma consistente em quase todo material real analisado (decks, posts, one-pagers). Use-os para dar identidade a uma peça além do básico.

## 1. Crop do símbolo ("vibração")

O recurso mais usado e mais reconhecível: uma versão **gigante** do símbolo da marca — nunca o lockup com a palavra "dati", só a seta + os dois quadrados —, posicionada sangrando para fora da peça — quase sempre no canto direito.

- Confirmado em: capa de **todas as 4 apresentações reais** analisadas (fundo navy, símbolo sólido em roxo `#6838E8` sobre o navy do fundo).
- **Arquivo a usar: `assets/logo/dati-symbol-purple.png`** (o PNG do símbolo isolado, não recortado) — redimensione e posicione você mesmo conforme a especificação abaixo. Os arquivos `dati-symbol-crop-*.png` trazem o símbolo já reduzido dentro de uma tela larga com muita margem transparente; **não** os use para capas de apresentação, pois resultam num símbolo pequeno demais e fora do padrão confirmado — mantenha-os só para inserção rápida em ferramentas sem controle de escala/corte.
- **Quando usar**: capas e slides de fechamento de apresentação, capas de proposta comercial, banners de post de abertura/fechamento de carrossel.
- **Como usar, especificação exata (validada por amostragem de pixel na capa real "DataFrete Summit 2026"):**
  - Redimensione `dati-symbol-purple.png` para que sua altura ocupe **≈68% da altura da peça**, mantendo a proporção original (não distorcer).
  - Posicione pela borda esquerda do símbolo redimensionado a **≈61-62% da largura da peça**, centralizado verticalmente.
  - O símbolo deve tocar ou sangrar (extrapolar) levemente a borda direita da peça — nunca sobrar fundo visível entre o símbolo e a borda.
  - Cor sólida, sem opacidade reduzida e sem gradiente extra — o efeito "tom sobre tom" vem só do contraste natural entre o roxo do símbolo e o navy do fundo.
  - Nunca compete com o texto porque fica no lado oposto ao bloco de texto principal.

## 2. Biblioteca de ícones 3D "glossy" (só em redes sociais)

Nos posts reais de Instagram/LinkedIn (campanha "Série IA" e revisão de set/2026 com 14 posts adicionais), aparece um segundo recurso visual, mais ilustrativo: **ícones 3D renderizados** (vidro/cromo, com reflexos e profundidade real de render — não gradientes CSS planos simulando volume), um ícone por conceito do slide, sempre em tons de roxo/lavanda. Confirmados nos exemplos reais: cadeado (segurança), relógio (tempo/atraso), chama (urgência), cifrão/nota de dinheiro (custo), escudo riscado (vulnerabilidade), nuvem com coração (benefício), seta/triângulo de vidro (direção/decisão), moeda com brilho (valor/IA), argolas concêntricas + triângulo (escala/foco), cartão de crédito (cobrança), estrela/sparkle de 4 pontas (IA/destaque de marca). Ver `docs/materiais/posts-redes-sociais.md` para a tabela completa e regras de tamanho.

- **Quando usar**: exclusivamente em posts de redes sociais — não foi observado em apresentações, one-pagers, propostas ou documentos internos. É o recurso que diferencia "conteúdo de feed" do restante do material da marca.
- **Dois tamanhos**: grande (40-70% do quadro) em slides avulsos de capa/fechamento; pequeno, dentro de um selo com leve glow, no canto do "cartão de vidro" em slides de desenvolvimento de carrossel (ver item 4 abaixo).
- Tratar cada ícone como ilustração 1:1 do conceito do slide (não decorativo genérico) — escolha o ícone pelo assunto do texto, como uma pequena biblioteca de "um ícone por tema".
- Sempre em tons de roxo/lavanda/cromado — não usar em outras cores da paleta. Pode aparecer sozinho, em par com cópias desfocadas ao lado (sugerindo repetição/carrossel), ou empilhado (ex. moedas).
- Se precisar de um conceito fora da lista, mantenha a mesma linguagem visual (render 3D vítreo, reflexo de luz) — não substitua por um ícone de linha achatado, que é um recurso diferente (ver item 3).

## 3. Ícones de linha em selo arredondado

Terceiro recurso, usado em decks, one-pagers e posts: um ícone de traço fino (outline), dentro de um selo quadrado de cantos arredondados.

- **Sobre fundo escuro**: selo com fundo em gradiente roxo, ícone branco — funciona como "app icon" de um conceito (nuvem = infraestrutura, escudo/check = segurança, ampulheta = tempo/atraso, engrenagem = automação, cadeado = segurança).
- **Sobre fundo claro** (dentro de diagramas de etapas, ex. one-pager vertical): círculo com contorno colorido (uma cor por etapa, ciclando pela paleta: roxo → roxo → ciano → verde → navy/laranja) e ícone de traço fino no centro.
- Biblioteca de ícones de referência do guia: nuvem, nuvem+check, nuvem+engrenagem, escudo (camadas), chip/processador, engrenagem, arco/cúpula (três elementos), círculos concêntricos.
- **Se precisar de um ícone que não existe na biblioteca**: use um set de ícones de linha fina, cantos arredondados, peso de traço consistente (ex. Phosphor Icons ou Lucide, variante "regular"/"light") — nunca ícones preenchidos (fill) ou com estilo different (ex. Material filled, emoji).

## 4. Cartão de vidro (glassmorphism — posts, slides de desenvolvimento)

Confirmado nos posts reais de carrossel: os slides "do meio" (desenvolvimento) não pintam o conteúdo direto sobre o fundo do post — usam um cartão flutuante com efeito de vidro, inset em relação às bordas do quadro 1080×1440.

- **Fundo do cartão**: semitransparente com blur (glassmorphism), sobre o fundo cru do post (navy com glow radial roxo).
- **Cantos**: raio bem arredondado (bem mais fechado que um slide de deck — visualmente "pílula-retângulo").
- **Borda inferior**: brilho/glow roxo, como se o cartão flutuasse com luz vazando por baixo.
- **Conteúdo dentro do cartão**: selo pequeno com ícone 3D (ver item 2) no canto superior, título, linha de apoio opcional, e uma barra utilitária no rodapé (ícones de copiar/like/dislike/"..." à esquerda, contador `N/total` à direita) que simula a interface de um chat de IA.
- **O que fica fora do cartão**: os rótulos `@dati.cloud` e a instrução de navegação (`ARRASTE PARA O LADO`, `LEIA A LEGENDA`) ficam soltos sobre o fundo cru, acima do cartão — não dentro dele.
- **Quando usar**: só nos slides de desenvolvimento de um carrossel de post. Capa e fechamento são slides avulsos, full-bleed, sem esse cartão.

## Linhas e grades decorativas (uso leve, opcional)

Em posts de capa e algumas seções de deck, aparecem linhas tracejadas verticais finas com pontos marcadores, ou uma grade sutil de retângulos com cantos arredondados — sempre como textura de fundo em baixíssimo contraste, nunca competindo com o texto. Use com moderação; é um "tempero", não um elemento obrigatório.

## Gradientes

Dois gradientes cobrem praticamente todo o uso real:

- **`--dati-gradient-hero-dark`**: navy profundo diagonal, para capas e fundos escuros institucionais.
- **`--dati-gradient-cta`**: roxo, para banners de chamada à ação, headers de card de preço, **e também como fundo de slide inteiro em "divisores de seção" no meio de uma apresentação** (ver `docs/materiais/apresentacoes.md`) — não é só um recurso de banner pequeno.

Ver [`tokens/colors.css`](../tokens/colors.css) para os valores exatos.

# Elementos gráficos de apoio

Além de logo/cor/tipografia, três recursos visuais aparecem de forma consistente em quase todo material real analisado (decks, posts, one-pagers). Use-os para dar identidade a uma peça além do básico.

## 1. Crop do símbolo ("vibração")

O recurso mais usado e mais reconhecível: uma versão **gigante e recortada** do símbolo da marca (a seta bicolor + os dois quadrados), posicionada sangrando para fora da peça — quase sempre no canto direito, ocupando 30-45% da largura.

- Confirmado em: capa de **todas as 4 apresentações reais** analisadas (fundo navy, símbolo em tons de roxo sobre roxo mais escuro, com leve variação de opacidade para dar profundidade).
- Arquivos de referência: `assets/logo/dati-symbol-crop-purple.png`, `dati-symbol-crop-color.png`.
- **Quando usar**: capas de apresentação, capas de proposta comercial, banners de post de abertura/fechamento de carrossel.
- **Como usar**: símbolo ampliado várias vezes o tamanho do lockup normal, cortado pela borda da peça, em tom sobre tom (mesma cor de fundo, alguns tons mais clara/escura) — nunca compete com o texto porque fica no lado oposto ao bloco de texto principal.

## 2. Formas 3D "glossy" (só em redes sociais)

Nos posts reais de Instagram/LinkedIn (campanha "Série IA"), aparece um segundo recurso visual, mais ilustrativo: formas 3D vítreas/iridescentes (estrela de 4 pontas, losango, fragmentos da seta, nuvem, cadeado, argolas entrelaçadas) em tons de roxo/lavanda, com reflexos e brilho.

- **Quando usar**: exclusivamente em posts de redes sociais — não foi observado em apresentações, one-pagers ou propostas. É o recurso que diferencia "conteúdo de feed" do restante do material da marca.
- Tratar como ilustração de apoio a um conceito abstrato (ex.: uma estrela para "começar", um cadeado para "segurança", argolas entrelaçadas para "erro/ciclo").
- Sempre em tons de roxo/lavanda — não usar em outras cores da paleta.

## 3. Ícones de linha em selo arredondado

Terceiro recurso, usado em decks, one-pagers e posts: um ícone de traço fino (outline), dentro de um selo quadrado de cantos arredondados.

- **Sobre fundo escuro**: selo com fundo em gradiente roxo, ícone branco — funciona como "app icon" de um conceito (nuvem = infraestrutura, escudo/check = segurança, ampulheta = tempo/atraso, engrenagem = automação, cadeado = segurança).
- **Sobre fundo claro** (dentro de diagramas de etapas, ex. one-pager vertical): círculo com contorno colorido (uma cor por etapa, ciclando pela paleta: roxo → roxo → ciano → verde → navy/laranja) e ícone de traço fino no centro.
- Biblioteca de ícones de referência do guia: nuvem, nuvem+check, nuvem+engrenagem, escudo (camadas), chip/processador, engrenagem, arco/cúpula (três elementos), círculos concêntricos.
- **Se precisar de um ícone que não existe na biblioteca**: use um set de ícones de linha fina, cantos arredondados, peso de traço consistente (ex. Phosphor Icons ou Lucide, variante "regular"/"light") — nunca ícones preenchidos (fill) ou com estilo different (ex. Material filled, emoji).

## Linhas e grades decorativas (uso leve, opcional)

Em posts de capa e algumas seções de deck, aparecem linhas tracejadas verticais finas com pontos marcadores, ou uma grade sutil de retângulos com cantos arredondados — sempre como textura de fundo em baixíssimo contraste, nunca competindo com o texto. Use com moderação; é um "tempero", não um elemento obrigatório.

## Gradientes

Dois gradientes cobrem praticamente todo o uso real:

- **`--dati-gradient-hero-dark`**: navy profundo diagonal, para capas e fundos escuros institucionais.
- **`--dati-gradient-cta`**: roxo, para banners de chamada à ação e headers de card de preço.

Ver [`tokens/colors.css`](../tokens/colors.css) para os valores exatos.

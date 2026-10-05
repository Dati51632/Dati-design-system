# Frontend / HTML

Padrão do Dati Design System aplicado à geração de HTML: landing pages, apps, dashboards e telas de quiz. O sistema de fundos é inteiramente parametrizado em `recipe.js` (handoff `design_handoff_fundos_dati/`). Toda decisão de design deve responder: **este HTML está dentro dos tokens e regras do design system?** Se não, redesenhe.

---

## Pergunta obrigatória antes de gerar qualquer HTML

> **"Você quer a versão em modo claro ou modo escuro? ou os dois"**

Não gerar nada antes da resposta. Sem modo default. Se a resposta for "os dois", gerar o par claro/escuro no mesmo arquivo com toggle ou `prefers-color-scheme`.

---

## Identificação do contexto

Após o modo, identificar o tipo de tela antes de montar a receita:

| Contexto | Layout | Símbolo | Nível/estrutura |
|---|---|---|---|
| Capa / fechamento | `cover` | completo (68%) | 3–4 |
| Landing page — hero | `cover` | completo no hero, ausente no miolo | 2–3 hero |
| Landing page — miolo | plano | nenhum | 1 |
| Dashboard | plano | nenhum | 1 |
| Quiz / pergunta | `quiz` | nenhum | herda do nível |
| Onboarding / trilha | `cover` por etapa | em construção | acompanha a etapa |
| Certificado | `cover` | conforme nível | 2–4 |
| Post / card social | plano | nenhum | 1 |

Se o contexto for ambíguo, perguntar antes de gerar.

---

## Receita de fundos (`recipe.js`)

A engine de fundos é o arquivo `recipe.js` em `design_handoff_fundos_dati/`. **Não reescrever a lógica — usar o arquivo diretamente.**

### Parâmetros

| Parâmetro | Valores | Regra |
|---|---|---|
| `mode` | `light` · `dark` | Vem da resposta obrigatória do usuário |
| `family` | `navy` · `ciano` · `purplePale` · `roxo` | `roxo` por padrão; outras só com categorias/níveis a diferenciar |
| `level` | 1–4 | Profundidade/estrutura; no Labs = nível da certificação |
| `layout` | `cover` · `quiz` | `cover` para telas de entrada; `quiz` para telas de pergunta |
| `pieces` | 0–4 | Peças sólidas do símbolo; default por nível: 0/2/3/4; quiz sempre 0 |
| `viewport` | `{w, h}` px | Tamanho real do contêiner; recalcular com `ResizeObserver` |

### Mapeamento Labs (certificações AWS)

| Nível | Nome | Família | Peças | Símbolo web | Base escura |
|---|---|---|---|---|---|
| 1 | Foundational | `navy` | 0 (só contorno) | 40% | `#060115` |
| 2 | Associate | `ciano` | 2 (quadrados) | 50% | `#060115` |
| 3 | Professional | `purplePale` | 3 (+seta roxa) | 59% | `linear-gradient(135deg,#060115,#0D0824 50%,#1A0F3D)` |
| 4 | Specialty | `roxo` | 4 (símbolo completo) | 68% | `linear-gradient(135deg,#0D0824,#1A0F3D 55%,#2B1B5C)` |

A ideia central: **o símbolo da Dati se constrói ao longo da trilha**. No Specialty, chega ao contrato oficial de capa (68% de altura, família roxo).

### Famílias de cor

| Família | Cor ativa | Glow escuro (rgb) | Contorno escuro |
|---|---|---|---|
| `navy` | `#1A0F3D` / `#B7B0CB` | `183,176,203` | `#B7B0CB` |
| `ciano` | `#5BBEED` | `91,190,237` | `#5BBEED` |
| `purplePale` | `#8C7DFF` | `140,125,255` | `#8C7DFF` |
| `roxo` | `#6838E8` / `#8C7DFF` | `104,56,232` | `#8C7DFF` |

Verde (`#A4DF64`) nunca vai no símbolo — reservado para feedback positivo (badges, toasts). A família `purplePale` usa `#8C7DFF` como cor ativa, sem verde.

---

## Composição das camadas (de baixo para cima)

1. **Base** — claro: `radial-gradient(ellipse 70% 90% at 55% 45%, #FFFFFF 0%, #E3E3E3 100%)` (todos os níveis). Escuro: ver tabela Labs.
2. **Glow** — claro: canto inferior direito, `ellipse 34% 52% at 100% 100%`, alpha `min(.5, .22 + .06×nível)`. Escuro: atrás do símbolo, centrado nele, cresce com o nível. Quiz escuro: centrado em `50% 45%`.
3. **Textura pontual** — grade SVG (`grid-52` nos níveis 1–2, `grid-36` nos 3–4), canto inferior direito, opacidade .35 claro / .5 escuro, com máscara radial (web `30% 50%`, mobile `55% 30%`). **Não aparece no quiz.**
4. **Guias verticais** — 1px, nas frações `.047 .339 .561 .958` da caixa do símbolo. Peça construída = sólida na cor ativa; pendente = tracejada e fraca. Nunca cruzam o símbolo (dois segmentos). No mobile, começam em 40% da altura.
5. **Contornos** das peças pendentes (SVG 1px `vector-effect:non-scaling-stroke`, arquivo oficial).
6. **Peças sólidas** (PNGs de `symbol-build/pieces/`, sempre sobre os contornos).

---

## Geometria do símbolo

Caixa quadrada, `aspect-ratio:1`, `background-size:100% 100%`.

| | Web | Mobile |
|---|---|---|
| Altura / largura | altura = `WH[level]`% da tela | largura = `MW[level]`%, limitada a altura ≤ 50% |
| Posição horizontal | centro em **75%** (metade direita) | centralizado |
| Posição vertical | 50% (centro) | base a 6% do rodapé |
| `WH` por nível | 40 / 50 / 59 / 68 | — |
| `MW` por nível | — | 52 / 64 / 76 / 88 |

---

## Tipografia

Fonte única: **Manrope** (importar via Google Fonts). Nunca usar Arial, system-ui sem fallback, ou outra família.

| Elemento | Web | Mobile | Peso | Cor claro | Cor escuro |
|---|---|---|---|---|---|
| Título | 64px | 36px | 600 | `#1A0F3D` | `#FFFFFF` |
| Ênfase (cláusula bold) | mesma | mesma | 800 | `#6838E8` | `#8C7DFF` |
| Eyebrow | 15px | 12px | 700 | `#6838E8` | família ativa |
| Subtítulo | 21px | 16px | 400 | `#5B5570` | `#CFC9E6` |
| Rodapé / legenda | 13px | 13px | 400 | `#77718A` | `#9891AB` |

Título: `letter-spacing: -0.04em; line-height: 1.02`. Eyebrow: `letter-spacing: 0.1em; text-transform: uppercase`.

Corpo nunca abaixo de **16px em telas reais**. Usar `clamp()` ou `cqw` para tipografia fluida.

---

## Tokens de cor — valores literais

Sempre colocar valor literal inline; nunca `var()` se o token não estiver carregado no contexto.

```
Roxo primário         #6838E8      Roxo sobre escuro      #8C7DFF
Roxo eyebrow (claro)  #6838E8      Texto navy             #1A0F3D
Texto secundário      #5B5570      Texto muted escuro     #CFC9E6
Rodapé claro          #77718A      Rodapé escuro          #9891AB
Card claro fundo      #FFFFFF      Card claro borda       #DDD6EE
Card escuro fundo     rgba(255,255,255,.06)   Card escuro borda  #4521A8
Fundo neutro claro    #EDF0F2      Fundo claro base       radial-gradient(ellipse 70% 90% at 55% 45%,#FFFFFF 0%,#E3E3E3 100%)
Verde (só positivo)   #A4DF64      Ciano                  #5BBEED
```

---

## Área segura de texto

| | Web | Mobile |
|---|---|---|
| Left | 7% | 9% |
| Right | auto | 9% |
| Width máx | 46% | — |
| Top | 0 (centro vertical) | 7% |
| Alinhamento vertical | `justify-content: center` | `flex-start` |

Validar que **nenhum texto cruza a caixa do símbolo**. Em mobile, o texto vai ao topo e o símbolo fica na base.

---

## Responsivo — regra do braço de frontend

- **Um HTML, duas composições.** Mobile quando `largura < 768px` ou tela em retrato; web nos demais. Recalcular com `ResizeObserver` no contêiner.
- **Tipografia fluida**: `container-type: inline-size` + `cqw` / `clamp()`. Referência: título `clamp(36px, 6cqw, 64px)`; eyebrow `clamp(12px, 1.5cqw, 15px)`; subtítulo `clamp(16px, 2cqw, 21px)`.
- **Alvos de toque** ≥ 44px no mobile.
- **Cards** em 1 coluna abaixo de 768px.
- **Desempenho**: só gradiente CSS + SVG/PNG estático como `background-image`. A única `mask-image` permitida é a da textura — não empilhar máscaras.

---

## Tela de quiz

Mesma receita com `layout: 'quiz'`: sem símbolo, sem guias, sem textura.

**Card central:**
- Claro: `background: #FFFFFF; border: 1px solid #DDD6EE; border-radius: 12px`
- Escuro: `background: rgba(255,255,255,.06); border: 1px solid #4521A8; border-radius: 12px`

**Opção selecionada:** fundo `rgba(cor-ativa, .08)` claro / `rgba(cor-ativa, .16)` escuro; borda na cor ativa.

**Barra de progresso e botão primário:** cor ativa da família.

**Indicador de nível:** 4 quadrados de `7×7px`, `border-radius: 2px`. Preenchidos na cor ativa até o nível atual; os demais só com contorno (`border: 1.5px solid`).

---

## Landing pages

Para LPs, o hero usa `layout: 'cover'` com nível e família adequados ao contexto. O miolo é plano (sem símbolo, sem guias, sem textura) com fundo `#EDF0F2` (claro) ou `#060115` / `#0D0824` (escuro).

Estrutura recomendada de LP:
1. **Hero** — fundo de nível, área segura de texto, CTA primário (botão pill `border-radius: 999px`, gradiente `linear-gradient(135deg, #3B2A8C, #6838E8)`)
2. **Problema / contexto** — fundo neutro, sem símbolo
3. **Solução** — cards com glassmorphism (`backdrop-filter: blur(12px)`) ou cards brancos com borda `#DDD6EE`
4. **CTAs intermediários** — distribuídos ao longo da página
5. **Rodapé** — badge AWS Partner se aplicável

---

## Componentes de miolo

Componentes observados no site Dati (referência de implementação). Aplicam-se fora do hero/cover — sobre fundo neutro (`#EDF0F2`), branco ou escuro (`#1A0F3D`).

### Navbar

- Fundo fixo/sticky: escuro `#1A0F3D` no hero, branco ou neutro no scroll.
- Logo "dati+" à esquerda (branco sobre escuro, navy sobre claro).
- Links centrais em Manrope 500, cor `#1A0F3D` (claro) / `#FFFFFF` (escuro).
- CTA pill direita: `background: #5BBEED; border-radius: 999px; color: #1A0F3D; font-weight: 700; padding: 10px 20px; min-height: 44px`.

### Botões e CTAs

| Tipo | Background | Border | Cor do texto | Uso |
|---|---|---|---|---|
| Primário roxo | `linear-gradient(135deg,#3B2A8C,#6838E8)` | — | `#FFFFFF` | CTA principal no hero |
| Primário ciano | `#5BBEED` | — | `#1A0F3D` | CTA de ação no miolo e navbar |
| Secundário contorno | `transparent` | `1.5px solid #6838E8` | `#6838E8` | CTA de descoberta no miolo claro |
| Ghost escuro | `transparent` | `1.5px solid rgba(255,255,255,.3)` | `#FFFFFF` | CTA secundário no hero escuro |

Todos os botões: `border-radius: 999px; font-family: Manrope; font-weight: 700; padding: 12px 24px; min-height: 44px`.

### Cards de feature (miolo claro)

- Fundo da seção: `#EDF0F2` ou `#FFFFFF`.
- Card: `background: #FFFFFF; border: 1px solid #DDD6EE; border-radius: 16px; padding: 28px`.
- Ícone no topo: tamanho 24–32px, cor ciano `#5BBEED`.
- Título: 18–20px, weight 600, cor `#1A0F3D`.
- Descrição: 15px, weight 400, cor `#5B5570`.
- Grid: 3 colunas no desktop, 1 coluna no mobile.

### Pipeline / strip de etapas

Linha horizontal de ícone + rótulo com setas entre etapas. Fundo neutro.
- Ícone + label: 14px, weight 600, cor `#1A0F3D`.
- Seta separadora: `→` ou `›` em `#5BBEED`.
- Container: `display:flex; gap:24px; align-items:center; flex-wrap:wrap`.

### Cards de parceiros (logo squares)

- Card quadrado: `background: linear-gradient(135deg,#4521A8,#6838E8); border-radius: 12px; aspect-ratio:1`.
- Logo branco centralizado: `filter: brightness(0) invert(1)` ou arquivo PNG branco.
- Grid: 4 colunas desktop, 2 colunas mobile.
- CTA abaixo: botão secundário contorno.

### Stepper de jornada (vertical)

Cada fase tem: círculo colorido com ícone → linha vertical tracejada → card da fase.

- Círculo: `width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center`.
- Cor do círculo: específica por fase (definir por projeto; ex.: roxo, verde, laranja).
- Card da fase: `background: #FFFFFF; border: 1px solid #DDD6EE; border-radius: 16px; padding: 24px`.
- Título da fase: 18px, weight 700, cor do círculo da fase.
- Lista de bullets: 15px, weight 400, cor `#5B5570`.
- CTA da fase: pill na cor da fase.
- Conector vertical: `border-left: 1px dashed #DDD6EE; margin-left: 24px; height: 32px`.

### Seção de contato (fundo escuro)

- Fundo: `#1A0F3D` (ou `#0D0824` para contraste máximo).
- Layout 2 colunas: texto+contatos à esquerda, formulário à direita.
- Eyebrow: 12px, weight 700, uppercase, letter-spacing .1em, cor `#6838E8`.
- Título: `<span>` normal `#FFFFFF` + `<b>` em `#5BBEED` ou `#8C7DFF`.
- Itens de contato: ícone em círculo glass (`background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.1); border-radius:50%; width:40px; height:40px`) + label muted `#9891AB` + valor `#FFFFFF`.
- Card do formulário: `background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:16px; padding:28px`.
- Campo input: `background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); border-radius:8px; color:#FFFFFF; padding:12px 16px`; placeholder `#9891AB`.
- Botão enviar: CTA primário ciano full-width.

### Footer

- Fundo: mesmo que a seção de contato (`#1A0F3D`) ou `#060115`.
- Logo "dati+" branco à esquerda.
- Copyright à direita: 13px, cor `#9891AB`.
- `border-top: 1px solid rgba(255,255,255,.08)` separando do conteúdo acima.

---

## Regras do símbolo

1. **Nunca recolorido** — usar apenas os arquivos aprovados em `symbol-build/`.
2. **Nunca contorno sobre peça sólida** — contorno é só para peças pendentes.
3. **Nunca com sombra.**
4. **Nunca rotacionado.**
5. **Verde nunca no símbolo** — só em glow, guias e indicador.
6. **Sem logos ou ícones AWS** sem arquivos aprovados.

---

## Assets

```
design_handoff_fundos_dati/
  recipe.js                                   engine de fundos, fonte da verdade
  backgrounds/
    patterns/grid-{52,36}-{light,dark}.svg    textura de grade
    symbol-build/pieces/piece-{1..4}-*.png    peças sólidas 1200×1200
    symbol-build/outlines/outline-{1..4}-*.svg          contornos mono
    symbol-build/outlines/color/outline-{n}-{hex}-{l|d}.svg  contornos pré-coloridos
```

Logos, fontes e tokens vêm do Dati Design System (`assets/logo/`, `tokens/*.css`). **Não duplicar.**

---

## Lacunas — pendente aval do time de MKT

As regras abaixo estão em uso no sistema mas ainda precisam de validação formal da marca antes de serem tratadas como padrão oficial:

| ID | Ponto | Status |
|---|---|---|
| G10 | Contornos de peças pendentes removidos — guia de marca é referência primária | `[RESOLVIDO]` |
| G11 | Escala cravada: web 40/50/59/68% altura em 75%/50%; mobile 52/64/76/88% centralizado/base 6% | `[RESOLVIDO]` |
| G2 | Miolo sempre claro — modo escuro só afeta hero/cover | `[RESOLVIDO]` |
| G5 | Textura usa assets SVG do handoff (`grid-{36,52}-{light,dark}.svg`), opacidades .35/.5 | `[RESOLVIDO]` |
| — | Professional: `purplePale` (`#8C7DFF`, token `--dati-purple-light`) substitui `cianoVerde` | `[RESOLVIDO]` |

Todas as lacunas foram resolvidas internamente. Os valores estão cravados no `recipe.js` e neste documento. Ver fluxo de curadoria em `SKILL.md` se surgirem novas variações.

---

## Checklist de entrega

Renderizar em todos os tamanhos antes de entregar:

- [ ] `390×844` (iPhone) — modo pedido
- [ ] `768×1024` (tablet) — modo pedido
- [ ] `1280×800` (desktop) — modo pedido
- [ ] `1440×900` (desktop largo) — modo pedido

**Visual**
- [ ] Nenhuma cor fora da paleta oficial
- [ ] Contraste mínimo 4.5:1 em todo o texto (3:1 apenas em display ≥ 64px)
- [ ] Nenhum texto abaixo de 16px em telas reais
- [ ] Símbolo inteiro visível, sem corte involuntário
- [ ] Texto e símbolo não se sobrepõem

**Técnico**
- [ ] Sem scroll horizontal em nenhum breakpoint
- [ ] Fonte Manrope carregada (não system-ui puro)
- [ ] Assets carregados via caminho relativo ou base64 — sem URLs absolutas de terceiros além do Google Fonts
- [ ] Alvos de toque ≥ 44px no mobile

**Sistema**
- [ ] Modo perguntado ao usuário — nunca assumido
- [ ] Nenhum token inventado

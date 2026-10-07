# Handoff: Repositório de fundos HTML da Dati (claro/escuro, web/mobile)

## Overview
Sistema de fundos reutilizáveis para a skill de geração de HTML da Dati. Em vez de uma lista fechada de imagens, os fundos são gerados por uma **receita paramétrica** (`recipe.js`) que combina modo × família de cor × nível × layout × viewport, sempre dentro dos tokens oficiais do Dati Design System. Primeiro caso de validação: capas e telas de quiz do **app de certificações AWS do Labs** (Foundational, Associate, Professional, Specialty).

O objetivo aqui é **integrar isto à skill de design já existente** e servir de base para o braço de front-end.

## About the Design Files
Os arquivos em `reference/` são **referências de design em HTML** (Design Component com prévias e uma área de teste), não código de produção. A tarefa é **recriar o comportamento na skill existente**, usando os padrões dela. `recipe.js` e os assets em `backgrounds/` são a exceção: estão prontos para uso direto (JS sem dependências, SVG/PNG estáticos).

Para abrir a referência: `reference/Fundos - Inventario e Proposta.dc.html` depende de `support.js` e da pasta do design system (`_ds/…`) do projeto original. Leia como especificação; a lógica relevante está toda em `recipe.js`.

## Fidelity
**High-fidelity.** Cores, proporções, posições e opacidades em `recipe.js` são os valores finais aprovados.

---

## Regras obrigatórias da skill

1. **Pergunta de modo antes de gerar qualquer HTML** — texto exato:
   > "Você quer a versão em modo claro ou modo escuro? ou os dois"
   - Não gerar nada antes da resposta. **Sem modo default.** `recipe()` lança erro se `mode` vier vazio.
   - "Os dois" = gerar o par claro/escuro com os mesmos parâmetros (ex.: `prefers-color-scheme` ou toggle).
2. **Todo HTML sai responsivo para web e mobile** em um único arquivo (ver seção Responsivo).
3. **Só tokens oficiais.** Nenhuma cor fora de `tokens/colors.css`. Texto nunca recebe a cor da família.
4. **Símbolo:** nunca recolorido, nunca com contorno sobre peça sólida, nunca com sombra, nunca rotacionado. Verde nunca aplicado ao símbolo.
5. **Sem logos ou ícones AWS** sem arquivos aprovados.

---

## Parâmetros da receita

| Parâmetro | Valores | Origem |
|---|---|---|
| `mode` | `light` · `dark` | **Resposta obrigatória do usuário** |
| `family` | `navy` · `ciano` · `cianoVerde` · `roxo` | Pedido / mapeamento de categoria (default: `roxo`) |
| `level` | 1–4 | Profundidade/estrutura. No Labs = nível da certificação |
| `layout` | `cover` · `quiz` | Tipo de tela |
| `pieces` | 0–4 | Peças sólidas do símbolo. Default por nível: 0 / 2 / 3 / 4. Quiz sempre 0 |
| `viewport` | `{w,h}` px | Tamanho real do contêiner |

### Mapeamento Labs
| Nível | Família | Peças sólidas | Símbolo (web, % altura) | Base escura |
|---|---|---|---|---|
| 1 Foundational | navy | 0 (só contorno) | 40% | `#060115` |
| 2 Associate | ciano | 2 (quadrados) | 50% | `#060115` |
| 3 Professional | ciano + verde | 3 (+ seta roxa) | 59% | `linear-gradient(135deg,#060115,#0D0824 50%,#1A0F3D)` |
| 4 Specialty | roxo | 4 (símbolo completo) | 68% (= contrato de capa) | `--dati-gradient-hero-dark` |

A ideia central: **o símbolo da Dati se constrói ao longo da trilha** e, no Specialty, chega exatamente ao contrato oficial de capa.

### Famílias (r,g,b — todas da paleta)
| Família | Glow claro | Glow escuro | Contorno claro | Contorno escuro | Cor ativa |
|---|---|---|---|---|---|
| navy | 26,15,61 | 183,176,203 | #1A0F3D | #B7B0CB | navy / #B7B0CB |
| ciano | 91,190,237 | 91,190,237 | #5EA0E0 | #5BBEED | #5BBEED |
| cianoVerde | 161,223,108 | 161,223,108 | #5EA0E0 | #CFC9E6 | #A1DF6C (só guias, indicador, barra) |
| roxo | 104,56,232 | 104,56,232 | #6838E8 | #8C7DFF | #6838E8 |

---

## Composição das camadas (de baixo para cima)

1. **Base**
   - Claro: `radial-gradient(ellipse 70% 90% at 55% 45%, #FFFFFF 0%, #E3E3E3 100%)` (todos os níveis).
   - Escuro: ver tabela Labs.
2. **Glow**
   - Claro: um único gradiente pontual no **canto inferior direito** — `ellipse 34% 52% at 100% 100%`, alpha `min(.5, .22 + .06×nível)` na cor da família. Nada de tingir o fundo inteiro (testado e reprovado).
   - Escuro: atrás do símbolo, centrado nele; tamanho e alpha crescem com o nível (`k` = .5/.75/1/1.25).
   - Quiz escuro: centrado atrás do card (50% 45%).
3. **Textura pontual** — grade de retângulos arredondados do DS (`grid-52` níveis 1–2, `grid-36` níveis 3–4), no **canto inferior direito**, opacidade .35 claro / .5 escuro, dissolvida por uma máscara radial (web `30% 50%`, mobile `55% 30%`). Não aparece no quiz.
4. **Guias verticais** — 1px, alinhadas à borda esquerda de cada peça (fração da caixa: .047, .339, .561, .958). Peça construída = linha sólida na cor ativa; pendente = tracejada e fraca. **Nunca atravessam o símbolo**: dois segmentos (acima e abaixo da caixa). No mobile começam em 40% da altura para não cruzar o texto.
5. **Contornos** das peças pendentes (SVG 1px, `vector-effect: non-scaling-stroke`, traçados do arquivo oficial).
6. **Peças sólidas** (recortes PNG de `dati-symbol-color.png`, sempre por cima dos contornos).

### Geometria do símbolo (caixa quadrada, `aspect-ratio:1`, `background-size:100% 100%`)
- **Web**: altura = 40/50/59/68% da tela; centro horizontal em **75%** (centro da metade direita), centro vertical em 50%.
- **Mobile**: largura = 52/64/76/88% da tela (limitada para altura ≤ 50%); **centralizado na horizontal**; base a 6% do rodapé.

---

## Responsivo (regra do braço de front-end)
- **Um HTML, duas composições.** Composição mobile quando `largura < 768px` **ou** tela em retrato; web nos demais casos. Recalcular com `ResizeObserver` no contêiner.
- **Área segura de texto** — web: 7% à esquerda, largura 46%, centrado na vertical. Mobile: topo, 9% de margem lateral, até 40% da altura. Validar que nenhum texto cruza a caixa do símbolo.
- **Tipografia fluida**: usar `container-type:inline-size` no contêiner e `cqw`/`clamp()`. Referência: título web 7.4cqw / mobile 9cqw; eyebrow 2.7 / 4.4cqw; subtítulo 3 / 4.8cqw. Corpo nunca < 16px em telas reais.
- Alvos de toque ≥ 44px no mobile; cards em 1 coluna abaixo de 768px.
- **Desempenho**: só gradiente CSS + SVG/PNG estático como `background-image`. Evitar `mask-image` empilhada (travou a renderização na referência com 33 telas). A única máscara permitida é a da textura.
- **Checklist antes de entregar**: renderizar em 390×844, 768×1024, 1280×800, 1440×900, nos modos pedidos. Texto legível, símbolo inteiro, nada sobreposto, sem scroll horizontal.

## Texto (fixo por modo, independente da família)
| | Claro | Escuro |
|---|---|---|
| Título | #1A0F3D | #FFFFFF |
| Ênfase (cláusula de impacto, bold) | #6838E8 | #8C7DFF |
| Subtítulo | #5B5570 | #CFC9E6 |
| Rodapé/legenda | #77718A | #9891AB |

Manrope; título peso 600 + ênfase 800, tracking −0.04em, line-height 1.02. Eyebrow 700, tracking +0.1em, caixa alta.

## Tela de quiz
Mesma receita com `layout:'quiz'`: sem símbolo, sem guias, sem textura. Card central: claro `#FFFFFF` + contorno `#DDD6EE`; escuro `rgba(255,255,255,.06)` + contorno `#4521A8`; raio 12px. Barra de progresso e opção selecionada na **cor ativa** da família (fundo da opção: alpha .08 claro / .16 escuro).

## Indicador de nível
4 quadrados de 7px, raio 2px, ao lado do eyebrow: preenchidos na cor ativa até o nível atual; os demais só com contorno.

---

## Fluxo da skill (autonomia além do Labs)
1. Pergunta obrigatória de modo → aguarda.
2. Identifica o contexto do pedido → preset: capa, institucional, landing, dashboard, quiz, onboarding, certificado, slide, post. Se ambíguo, pergunta.
3. Família: `roxo` por padrão; outras só quando houver categorias/níveis a diferenciar.
4. Símbolo: completo em capa/fechamento; em construção só com progressão real (níveis, etapas); ausente em dashboard, quiz, formulário.
5. Aplica viewport (web + mobile) e área segura.
6. Valida as travas (tokens, símbolo, contraste ≥ 4.5:1 no texto).

| Contexto | Layout | Símbolo | Nível/estrutura |
|---|---|---|---|
| Capa / fechamento | cover | completo | 3–4 |
| Institucional | cover | completo | 2–3 |
| Landing | cover no hero, miolo plano | completo no hero | 2–3 hero / 1 miolo |
| Dashboard | plano (sem símbolo, sem guias) | nenhum | 1 |
| Quiz | quiz | nenhum | herda do nível |
| Onboarding / trilha | cover por etapa | em construção | acompanha a etapa |
| Certificado | cover | conforme nível | 2–4 |

### Exemplo de seleção
```js
import { recipe, toHTML } from './recipe.js';

// 1) a skill pergunta: "Você quer a versão em modo claro ou modo escuro? ou os dois"
// 2) resposta do usuário → modes
const modes = answer === 'os dois' ? ['light', 'dark'] : [answer === 'escuro' ? 'dark' : 'light'];

// 3) gera o fundo para o contêiner real
const el = document.querySelector('.cover');
const draw = mode => {
  const { width: w, height: h } = el.getBoundingClientRect();
  const rc = recipe({ mode, family: 'ciano', level: 2, layout: 'cover', viewport: { w, h } });
  el.querySelector('.bg').outerHTML = toHTML(rc).replace('<div ', '<div class="bg" ');
};
new ResizeObserver(() => draw(modes[0])).observe(el);
```

---

## Lacunas abertas (precisam de aval da marca)
- **G10 – símbolo em construção** (peças parciais nos níveis 1–3) e **contorno das peças pendentes**: o guia proíbe "adicionar contorno". O contorno nunca fica sobre peça sólida.
- **Escala do símbolo < 68%** nos níveis 1–3 e **geometria mobile**: só o 16:9 tem contrato oficial (G11).
- **G2 – modo escuro no miolo**: o guia diz "miolo sempre claro"; a skill exige páginas inteiras no modo escolhido.
- **G5 – grade/tracejado**: o DS cita o padrão sem valores; passo 36/52px, 1px, opacidade .35/.5 são proposta.
- **Professional ciano+verde**: aprovado com a regra "verde nunca no símbolo".

## Assets
```
backgrounds/
  patterns/grid-{52,36}-{light,dark}.svg        textura (stroke #1A0F3D claro / #CFC9E6 escuro)
  symbol-build/pieces/piece-{1..4}-*.png         peças sólidas, 1200×1200, recortes de dati-symbol-color.png
  symbol-build/outlines/outline-{1..4}-*.svg     contornos mono (stroke #000), viewBox 1200
  symbol-build/outlines/color/outline-{n}-{hex}-{l|d}.svg   contornos pré-coloridos por família/modo
```
Convenção de nomes: `{tipo}-{índice}-{descrição}[-{hex}][-{l|d|light|dark}].{ext}`. Todas as peças compartilham a mesma caixa 1200×1200 — sobrepostas na mesma posição, formam o símbolo oficial.

Logos, fontes e tokens vêm do Dati Design System já existente (`assets/logo/`, `tokens/*.css`). Não duplicar.

## Files
- `recipe.js` — receita completa + `toHTML()`; fonte da verdade.
- `backgrounds/` — assets prontos.
- `reference/Fundos - Inventario e Proposta.dc.html` — inventário, lacunas, capas Labs (web/mobile × claro/escuro), quiz por nível, fluxo de autonomia, regras de front-end e área de teste interativa.

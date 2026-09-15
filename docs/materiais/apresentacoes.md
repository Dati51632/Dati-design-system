# Apresentações / pitch decks

Padrão extraído da apresentação primária de referência **"Acelerando a Jornada de adoção da nuvem — MAP"** (18 slides, Google Slides exportado como PPTX), complementado pelas 4 apresentações anteriores (*DataFrete Summit*, *Vibe to Production*, *Proposta Comercial*, *Além do EIXO*). Em caso de conflito, o MAP prevalece.

---

## Dois registros visuais

Toda apresentação Dati alterna entre dois registros, nunca misturando os dois no mesmo slide:

| Registro | Quando usar | Fundo |
|---|---|---|
| **Escuro** | Capa, divisores de seção, slides de declaração de impacto, fechamento | Gradiente escuro (ver specs abaixo) |
| **Claro** | Todos os slides de conteúdo do miolo | `#EDF0F2` |

---

## Slide de capa (padrão MAP)

- **Fundo**: gradiente radial, centro superior → bordas — stops: `#371791` (0%) → `#170041` (33%) → `#050C1A` (67%) → `#18041B` (100%).
- **Logo** dati branco, área superior esquerda (~top: 14%, left: 9%).
- **Elemento decorativo — card arredondado**: shape com bordas arredondadas, preenchimento gradiente radial `#3629D1` (α 45%) → `#6F62FF` (α 18%), stroke `#C5DFFF` (α 32%), rotacionado ~25°, posicionado no canto superior direito, parcialmente fora da área do slide.
- **Elemento decorativo — símbolo crop**: imagem do símbolo Dati em tamanho grande, semi-transparente, sangrando pela lateral direita.
- **Badge de identificação** (opcional): círculo verde gradiente `#72E600` → `#28A30F` + texto "Consultoria em Cloud & AI", Manrope Regular, 15pt, branco. Posicionado abaixo do logo, alinhado à esquerda.
- **Título principal**: Manrope **Bold**, **36pt**, **branco** — 2 linhas, alinhado à esquerda. (Neste deck ambas as linhas são brancas bold; a variação roxo+branco do padrão de ênfase pode ser aplicada quando o tema da apresentação pedir destaque numa cláusula específica.)
- **Subtítulo**: Manrope Regular, **19pt**, `#C0C0C0`, 1 linha, alinhado à esquerda. Descreve o contexto/audiência da apresentação.
- **Rodapé**: não é usado na capa — o badge de identificação faz esse papel.

---

## Slide de divisor de seção (registro escuro)

Usado para marcar capítulos/blocos temáticos. Fundo escuro por imagem de background (gradiente navy/roxo profundo, mesmo tom da capa mas sem o elemento radial central).

- **Eyebrow**: Manrope Regular, **12pt**, `#8C7DFF`, caixa alta, canto superior esquerdo. Ex.: "O PROCESSO", "A ACELERAÇÃO".
- **Título**: Manrope Regular/Medium, **47pt**, **branco**, alinhado à esquerda, 1–2 linhas. Ex.: "Como funciona uma migração bem feita".
- **Rodapé esquerdo**: nome do deck em Manrope Regular 12pt, `#9891AB`. Ex.: "Dati | Migração e modernização na AWS".
- **Rodapé direito**: número do slide, Manrope Regular 12pt, `#9891AB`.
- Sem logotipo visível (já aparece na capa e os rodapés identificam a marca).

---

## Slide de conteúdo (registro claro)

Layout padrão para a maioria dos slides do miolo.

- **Fundo**: `#EDF0F2`.
- **Eyebrow**: Manrope Regular, **12pt**, `#8F65FE`, caixa alta, canto superior esquerdo. Ex.: "O CAMINHO ESTRUTURADO", "ATIVOS", "CONCEITO".
- **Título H1**: Manrope **Bold**, **31pt**, `#1A0F3D` (navy), 1–2 linhas. O padrão de ênfase se aplica aqui: 1ª cláusula em navy, 2ª cláusula de impacto em `#8F65FE`. Ex.: "A gente não começa do *zero* em cada projeto" (onde "zero" fica em roxo claro).
- **Subtítulo/descrição**: Manrope Regular, 17pt, `#5B5570`, 1–2 linhas abaixo do título.
- **Corpo**: Manrope Regular, ~12–14pt, `#5B5570`; palavras-chave inline podem ser em `#8F65FE` ou `#6838E8`.
- **Elemento de sidebar/lateral** (quando o layout tiver lista numerada ou destaque): shape vertical no lado esquerdo ou acento lateral, preenchimento gradiente `#3629D1` → `#6F62FF` ou sólido `#655CC6`/`#CFC9E6`. Números de item em `#655CC6` (no fundo claro) ou `#CFC9E6` (no fundo escuro).
- **Logo** dati navy, canto superior direito.
- **Rodapé**: padrão idêntico ao divisor de seção — deck name `#9891AB` esquerda, número `#9891AB` direita.

---

## Slide de declaração de impacto (registro escuro com painel esquerdo)

Variação do divisor — slide escuro com dado/frase de grande impacto, estrutura visual mais pesada que os divisores simples.

- Fundo escuro (mesmo padrão do divisor).
- Painel/pill colorido no lado esquerdo com gradiente `#6838E8` → `#3503BB` (vertical).
- Número ou palavra gigante dentro do pill, branco ou `#8C7DFF`.
- Texto explicativo à direita, Manrope Regular 12–14pt, branco ou `#CFC9E6`.
- Eyebrow `#8C7DFF` no topo esquerdo (mesmo padrão do divisor).

---

## Slide "Big word / número gigante" (registro misto)

Usado para conceito-chave ou estatística de impacto.

- Fundo: `#EDF0F2`.
- Barra vertical no lado esquerdo com gradiente roxo (`#6F62FF` → `#3629D1`).
- Palavra ou número em destaque **dentro** da barra: Manrope **ExtraBold**, **53pt**, branco.
- Título e corpo continuam à direita da barra, seguindo padrão do slide de conteúdo.

---

## Slide de CTA / próximo passo

- Registro claro (`#EDF0F2`).
- Eyebrow `#8F65FE`.
- Título H1 em navy com ênfase roxo na palavra-chave da ação.
- Instrução de ação (ex. QR code, link) com texto de suporte em `#5B5570`.
- Opcionalmente: pill/badge com contorno roxo resumindo o CTA.

---

## Slide de fechamento

- **Fundo**: gradiente linear diagonal (top-left → bottom-right) — stops: `#0D0824` → `#1A0F3D` → `#2B1B5C`. (Este é o gradiente `heroDark` do design system — diferente da capa.)
- **Título**: Manrope Regular, **66pt**, **branco**. Ex.: "Obrigado!".
- **Linha divisória**: gradiente horizontal `#6838E8` → `#6838E8` (roxo sólido ou mínimo degradê).
- **Rodapé**: nome completo do deck/empresa em caixa alta, `#9891AB`, 12pt, Manrope. Ex.: "DATI | MIGRAÇÃO E MODERNIZAÇÃO NA AWS".

---

## Paleta de cores efetiva em apresentações

| Token | Hex | Uso em apresentações |
|---|---|---|
| navy | `#1A0F3D` | Títulos H1 em fundos claros, painel lateral |
| purple | `#6838E8` | Ênfase inline, linha decorativa, sidebar |
| purple-medium | `#8F65FE` | Eyebrow em fundos claros, ênfase em títulos |
| purple-tint | `#8C7DFF` | Eyebrow em fundos escuros, números de item |
| purple-dark | `#3629D1` | Gradiente de sidebar/painel |
| purple-darker | `#3503BB` | Gradiente de sidebar/painel (ponto final) |
| purple-deep | `#240872` | Gradiente decorativo, fundo de element |
| purple-mid | `#6F62FF` | Gradiente de card arredondado |
| purple-subtle | `#655CC6` | Número de item no fundo claro |
| purple-pale | `#CFC9E6` | Texto secundário no fundo escuro, labels |
| neutralLight | `#EDF0F2` | Fundo de todos os slides de conteúdo |
| textMuted | `#5B5570` | Corpo de texto nos slides claros |
| muted-footer | `#9891AB` | Rodapé (deck name + número de slide) |
| cyan | `#5EBAE8` | Destaque especial (slide 14 da MAP), use com parcimônia |
| green | `#72E600` → `#28A30F` | Badge/selo de conquista/parceria |
| white | `#FFFFFF` | Todo texto sobre fundos escuros |
| cover-gray | `#C0C0C0` | Subtítulo da capa |

---

## Tipografia

Fonte única: **Manrope**. Nunca usar Arial, Calibri ou outra família.

| Elemento | Tamanho | Peso | Cor típica |
|---|---|---|---|
| Capa — título | 36pt | Bold | Branco |
| Capa — subtítulo | 19pt | Regular | `#C0C0C0` |
| Capa — badge tag | 15pt | Regular | Branco |
| Divisor — título | 47pt | Regular | Branco |
| Conteúdo — H1 | 31pt | Bold | `#1A0F3D` |
| Big word | 53pt | ExtraBold | Branco |
| Fechamento — título | 66pt | Regular | Branco |
| Eyebrow | 12pt | Regular | `#8F65FE` (claro) / `#8C7DFF` (escuro) |
| Corpo | 12–14pt | Regular | `#5B5570` |
| Rodapé | 12pt | Regular | `#9891AB` |

---

## Estrutura de slides recomendada

1. **Capa** — gradiente radial, logo, título bold + subtítulo gray.
2. **Quem somos / apresentação** — slide claro com foto, cargo, diferenciais.
3. **Diagnóstico / provocação** — 1–3 slides claros ou um divisor escuro + slide claro.
4. **Conteúdo / desenvolvimento** — slides claros com eyebrow + H1 + corpo.
5. **Divisores de seção** — um slide escuro antes de cada bloco temático novo.
6. **Prova / case** — slide claro ou declaração de impacto escura.
7. **Próximo passo / CTA** — slide claro com instrução concreta.
8. **Fechamento** — gradiente heroDark + "Obrigado!" + rodapé.

**Regras de alternância:**
- Fundo escuro apenas na capa, divisores, slides de declaração de impacto e fechamento.
- O miolo é quase todo em `#EDF0F2` — nunca empilhe mais de 2 slides escuros seguidos fora da capa.
- Logo aparece na capa (branco) e em todos os slides claros (navy, canto superior direito).

---

## Ao gerar uma apresentação nova

1. Defina a tese em uma frase de duas cláusulas — vira o título da capa e do fechamento.
2. Mapeie os blocos temáticos: cada bloco começa com um divisor de seção escuro.
3. Use o registro escuro só na capa, nos divisores e no fechamento — tudo mais em `#EDF0F2`.
4. Um dado ou prova concreta por slide de diagnóstico; máximo 5 pontos por slide.
5. Gere como `.pptx` (skill `pptx`) ou artefato **Slides** seguindo esta paleta e tipografia.

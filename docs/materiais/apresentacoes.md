# Apresentações / pitch decks

Padrão extraído da apresentação primária de referência **"Acelerando a Jornada de adoção da nuvem — MAP"** (18 slides, Google Slides exportado como PPTX), complementado pelas 4 apresentações anteriores (*DataFrete Summit*, *Vibe to Production*, *Proposta Comercial*, *Além do EIXO*). Em caso de conflito, o MAP prevalece.

---

## Referências obrigatórias

| Arquivo | Papel |
|---|---|
| **MAP** ("Acelerando a Jornada de adoção da nuvem") | Referência primária de identidade visual — cores, branding, tipografia, logo, cards, elementos gráficos, capas, divisórias |
| **SeniorTec 2026** | Referência primária de linguagem de apresentação — cards, timelines, fluxos, diagramas, comparações, blocos numerados, alternância de fundos, ritmo visual, storytelling |

Toda decisão de design deve responder: **este slide poderia existir em uma dessas duas referências?** Se não, redesenhe.

---

## Gradientes — Regra Primária

**Gradientes são elementos visuais primários da identidade Dati. Nunca substituir por cor sólida.**

Todo fundo escuro, sidebar, painel de impacto ou elemento de destaque deve usar o gradiente correspondente da tabela abaixo — não uma aproximação sólida.

| Elemento | Gradiente | Token / Referência |
|---|---|---|
| **Fundo capa** | `radial-gradient, #371791 (0%) → #170041 (33%) → #050C1A (67%) → #18041B (100%)` | Extraído do MAP.pptx |
| **Fundo seção / encerramento** | `linear-gradient(135deg, #0D0824 → #1A0F3D 55% → #2B1B5C 100%)` | `--dati-gradient-hero-dark` |
| **Sidebar / barra bigword** | `linear-gradient(180deg, #6F62FF → #3629D1)` | Extraído do MAP.pptx |
| **Painel de impacto** | `linear-gradient(180deg, #6838E8 → #3503BB)` | Extraído do MAP.pptx |
| **Card decorativo (capa)** | `radial-gradient, #3629D1 α45% → #6F62FF α18%` | Extraído do MAP.pptx |
| **CTA / botão primário** | `linear-gradient(135deg, #3B2A8C → #6838E8 100%)` | `--dati-gradient-cta` |
| **Badge / destaque verde** | `linear-gradient(#72E600 → #28A30F)` | Extraído do MAP.pptx |

**Regras de aplicação:**

- O motor **pptx-template-engine.mjs** copia os slides do MAP.pptx como XML — os gradientes são preservados automaticamente. **Este é o motor obrigatório.**
- O motor fallback `gerar-apresentacao.mjs` (pptxgenjs) aproxima gradientes com retângulos sólidos — **não garante fidelidade visual**. Usar apenas quando o template engine falhar e avisar o usuário.
- Qualquer slide gerado fora dos motores (ex.: Canva, Google Slides manual) deve usar os valores exatos da tabela acima — nunca "#1A0F3D puro" no lugar de um gradiente de fundo.

---

## REGRA ABSOLUTA — Bloco Institucional Fixo

**Toda apresentação Dati começa com os 6 primeiros slides do MAP, copiados exatamente do arquivo original.**

Esses seis slides formam o bloco institucional fixo da Dati. A geração do conteúdo novo começa **somente depois** deles.

**Nunca:**
- redesenhar ou reinterpretar esses slides
- resumir, reescrever ou adaptar os textos
- trocar imagens, ícones ou logos
- modificar posições, tamanhos, cores ou proporções

Eles permanecem visualmente idênticos aos originais. Esta regra tem prioridade sobre qualquer outra instrução de design.

---

## Princípio central — o slide não é uma página de documento

**Antes de criar cada slide, pergunte: qual é a melhor representação visual desta informação?**

O texto original é matéria-prima para design — não uma instrução de layout.

**Nunca usar como padrão:**
- título + parágrafo + lista de bullets ocupando o canto esquerdo
- quatro ou cinco linhas pequenas abaixo de um título
- conteúdo ocupando menos de 40% da área útil sem justificativa visual
- grandes espaços vazios resultantes de falta de diagramação

Sempre que houver mais de três informações relacionadas, avalie transformá-las em cards, etapas, colunas ou elementos conectados.

---

## Mapa de transformação — conteúdo → estrutura visual

Escolha automaticamente a estrutura mais adequada para cada tipo de informação.

| Natureza da informação | Estrutura visual adequada |
|---|---|
| **Processo / Etapas** | Timeline horizontal ou vertical, fluxo numerado, stepper, pipeline |
| **Comparação** | Duas colunas, before × after, Tradicional × Novo, Permitido × Proibido |
| **Componentes de solução** | Cards conectados, diagrama, ecossistema |
| **Arquitetura técnica** | Fluxograma visual, boxes com setas, camadas, inputs → processamento → outputs |
| **Indicadores / dados** | Números grandes, KPIs, estatística com destaque visual |
| **Benefícios** | Cards com ícone + título + microdescrição, grid de 3 ou 4 elementos |
| **Regras / Guardrails** | Comparação visual (permitido × bloqueado), checklist, matriz de decisão |
| **Papéis / Responsabilidades** | Cards por persona, swimlanes, fluxo entre atores |
| **Conclusão / Síntese** | 3–5 pilares, framework visual, afirmação principal com destaque |
| **Frase de impacto** | Slide de respiro — tipografia grande, fundo escuro, poucos elementos |

---

## Exemplos de transformação (antes × depois)

### Repositórios e PR

**Não apresentar como lista:**
- Repo de frontend — gerado pelo Lovable
- Repo de infraestrutura — gerenciado pela Dati
- PR obrigatório antes de deploy
- Nenhum modelo escreve direto em main

**Transformar em diagrama:**
```
[REPO FRONTEND]          [REPO INFRA]
       ↓                       ↓
      PR                      PR
       ↓                       ↓
[FRONTEIRA HUMANA]     [FRONTEIRA HUMANA]
       ↓
   PIPELINE → AWS

Destaque: "Nenhum modelo escreve direto em MAIN."
```

---

### Regras de IA (permitido × proibido)

**Não apresentar como lista mista.** Criar comparação visual em duas áreas distintas:

```
IA PODE ENTRAR              IA NÃO PODE ENTRAR
✓ geração de UI             × migration SQL
✓ sugestão de componentes   × configuração IAM
✓ rascunho de lógica        × escrita direta em main

Base: TESTES + CI/CD = VEREDITO
```

---

### Pipeline técnico (schema → merge)

**Não apresentar como lista vertical.** Criar pipeline horizontal:

```
SCHEMA → GERADOR → MIGRATION → TESTE → [BLOQUEIO] → MERGE
```

---

## Slides de arquitetura técnica

Slides técnicos **não são listas de componentes**. Transforme em arquitetura visual.

Mostre conexões, responsabilidades e fronteiras entre camadas. Use boxes, setas e separação visual clara entre:
- quem gera (ex.: Lovable, modelo)
- quem valida (ex.: PR, CI/CD, ferramenta de teste)
- quem executa (ex.: pipeline, AWS)

---

## Densidade de texto

Reduza significativamente o texto visível no slide. Priorize:

- títulos fortes e frases curtas
- labels, microdescrições, palavras-chave
- números e elementos visuais

Detalhes explicativos vão para as **notas do apresentador** — não elimine informação estratégica, reorganize onde ela aparece.

---

## Dois registros visuais

Toda apresentação Dati alterna entre dois registros, nunca misturando os dois no mesmo slide:

| Registro | Quando usar | Fundo |
|---|---|---|
| **Escuro** | Capa, divisores de seção, slides de declaração de impacto, fechamento | Gradiente escuro (ver specs abaixo) |
| **Claro** | Todos os slides de conteúdo do miolo | `#EDF0F2` |

---

## Ritmo de layout

Não reutilize o mesmo layout em slides consecutivos. Construa variação dentro do sistema:

- impacto → cards → fluxo → comparação → diagrama → estatística → frase → síntese

A apresentação deve parecer uma narrativa visual, não uma coleção de templates repetidos.

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
- **Elemento decorativo**: símbolo/seta da marca aparece aqui também, mas **numa escala bem menor que a da capa** (não os ≈68% de altura do símbolo de capa) — um lockup ou símbolo de tamanho médio, posicionado à direita, próximo ao título. Confirmado nos slides finais de "Obrigado!" do MAP e do SeniorTec 2026.

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

Cores secundárias (cyan, green, orange) apenas para diferenciação semântica, indicadores ou status — nunca decorativas. Nunca introduzir cor fora desta lista.

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

Destaque tipográfico: apenas a palavra ou expressão-chave recebe cor em roxo — nunca frases inteiras. Use pesos diferentes para construir hierarquia.

---

## Cards

Cards são usados com intenção — máximo de 2 a 4 por slide.

- Cantos suavemente arredondados
- Proporções consistentes entre todos os cards do slide
- Padding generoso
- Títulos curtos + microdescrição
- Ícones apenas quando agregarem significado semântico
- Sombra ou glow muito discretos, se necessário

---

## Elementos adicionais confirmados (releitura completa de MAP + SeniorTec 2026, set/2026)

Uma releitura integral dos dois decks de referência, slide a slide, confirma quatro recursos que ainda não estavam descritos neste guia — nenhum contradiz o que já existe acima, são complementos:

- **Trio de cards de estatística** (SeniorTec, slide 15): 3 cards lado a lado sobre fundo escuro, cada um com ícone em selo + número/dado grande + legenda curta abaixo — uma variação específica de "Indicadores / dados" no mapa de transformação, quando há exatamente 3 estatísticas para justificar urgência ou oportunidade (ex. "60% dos projetos de IA seriam abandonados até 2026").
- **Números-fantasma gigantes** (MAP, slide 13, "A gente não começa do zero em cada projeto"): numerais grandes em contorno/outline, num cinza muito claro sobre fundo `#EDF0F2` (quase invisíveis), um atrás de cada item de uma lista curta (3-5 itens) com ícone em selo — dão escala e ritmo sem competir com o texto. Use só com listas curtas, nunca mais que 5 números.
- **Faixa de parceiros/logos** (MAP, slide 6, "Parceiros"): logos de parceiros (ex. AWS, outros fornecedores) dentro de pills roxos sólidos, empilhados ou em linha, sobre fundo claro — usado em slides "quem somos"/parceiros/ecossistema.
- **Slide de equipe** (SeniorTec, slide 12, "O time do Dati Labs"): fundo escuro, grade de fotos (redondas ou em cards de cantos arredondados) com o primeiro nome de cada pessoa abaixo — usado para dar crédito ao time que entregou o projeto. Só inclua se houver fotos reais da equipe; nunca use avatares genéricos ou placeholders.

## Processo de criação — slide a slide

Para cada slide:

1. Entenda a mensagem principal
2. Identifique a natureza da informação (processo, comparação, arquitetura, dado, regra…)
3. Escolha a estrutura visual adequada (ver mapa de transformação acima)
4. Resuma o texto visível ao mínimo necessário
5. Construa a composição
6. Aplique a identidade Dati (cores, tipografia, logo)
7. Verifique legibilidade
8. Verifique equilíbrio e alinhamento
9. Verifique se existe narrativa visual
10. Finalize o slide

---

## Estrutura de slides recomendada

1. **6 slides do MAP** — bloco institucional fixo, copiados exatamente
2. **Capa** — gradiente radial, logo, título bold + subtítulo gray
3. **Quem somos / apresentação** — slide claro com foto, cargo, diferenciais
4. **Diagnóstico / provocação** — 1–3 slides claros ou um divisor escuro + slide claro
5. **Conteúdo / desenvolvimento** — slides claros com eyebrow + H1 + estrutura visual
6. **Divisores de seção** — um slide escuro antes de cada bloco temático novo
7. **Prova / case** — slide claro ou declaração de impacto escura
8. **Próximo passo / CTA** — slide claro com instrução concreta
9. **Fechamento** — gradiente heroDark + "Obrigado!" + rodapé

**Regras de alternância:**
- Fundo escuro apenas na capa, divisores, slides de declaração de impacto e fechamento
- O miolo é quase todo em `#EDF0F2` — nunca empilhe mais de 2 slides escuros seguidos fora da capa
- Logo aparece na capa (branco) e em todos os slides claros (navy, canto superior direito)

---

## Checklist final obrigatório

Antes de entregar qualquer apresentação:

- [ ] Os 6 primeiros slides do MAP foram copiados exatamente?
- [ ] Nenhum deles foi alterado?
- [ ] O conteúdo específico começou após o bloco institucional?
- [ ] Há slides excessivamente textuais? (Se sim, redesenhe)
- [ ] Algum conteúdo que deveria ser diagrama está como lista?
- [ ] Existem grandes espaços vazios sem intenção visual?
- [ ] Há alternância de ritmo entre os layouts?
- [ ] Os fundos claros e escuros estão equilibrados?
- [ ] Os cards estão com proporções consistentes?
- [ ] Os títulos possuem boa hierarquia (eyebrow + H1 + subtítulo)?
- [ ] As palavras-chave estão destacadas em roxo (só as palavras, não a frase inteira)?
- [ ] O conteúdo está legível em apresentação presencial?
- [ ] Cada slide possui uma ideia principal clara?
- [ ] A identidade visual está consistente com a Dati?
- [ ] Este slide poderia existir nas referências MAP ou SeniorTec 2026?

---

## Ao gerar uma apresentação nova

1. Defina a tese em uma frase de duas cláusulas — vira o título da capa e do fechamento.
2. Mapeie os blocos temáticos: cada bloco começa com um divisor de seção escuro.
3. Para cada slide, aplique o mapa de transformação antes de escolher o layout.
4. Use o registro escuro só na capa, nos divisores e no fechamento — tudo mais em `#EDF0F2`.
5. Um dado ou prova concreta por slide de diagnóstico; máximo 5 pontos por slide.
6. Gere como `.pptx` (skill `pptx`) ou artefato **Slides** seguindo esta paleta e tipografia.

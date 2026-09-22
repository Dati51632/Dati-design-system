---
name: dati-design-system
description: Aplica o design system e o posicionamento da Dati (cores, tipografia, logo, elementos gráficos e padrões de composição reais) ao criar apresentações, posts para redes sociais, one-pagers, propostas comerciais ou documentos internos. Use sempre que o pedido envolver criar ou revisar material visual/de marca da Dati.
---

# Design System Dati

Este skill ensina como aplicar a identidade visual e o posicionamento da Dati (consultoria de cloud, dados e IA, parceira AWS) na criação de qualquer material visual ou escrito da empresa. Ele foi construído a partir do guia de marca oficial **e** de exemplos reais já produzidos pelo time (apresentações, posts, one-pagers) — não é um sistema genérico ou inventado.

## Como usar este skill

1. **Identifique o tipo de material** que está sendo pedido: apresentação, post de rede social, one-pager/proposta, ou documento interno.
2. **Leia o guia de material correspondente** antes de gerar qualquer conteúdo:
   - Apresentações → `docs/materiais/apresentacoes.md`
   - Posts para redes sociais → `docs/materiais/posts-redes-sociais.md`
   - One-pagers e propostas comerciais → `docs/materiais/one-pagers-e-propostas.md`
   - Documentos internos/relatórios → `docs/materiais/documentos-internos.md`
3. **Aplique as regras de fundação** em paralelo — elas valem para qualquer material:
   - `docs/01-marca-e-posicionamento.md` — tese central, tom de voz, estrutura argumentativa (provocação → diagnóstico → solução → CTA).
   - `docs/02-cores.md` + `tokens/colors.json` / `tokens/colors.css` — paleta e regras de uso por cor.
   - `docs/03-tipografia.md` + `tokens/typography.json` — fonte Manrope, hierarquia, e o "padrão de ênfase" de título (cláusula neutra + cláusula bold roxo).
   - `docs/04-logo-e-simbolo.md` — como e onde usar o logo/símbolo, o que nunca fazer.
   - `docs/05-elementos-graficos.md` — crop do símbolo, formas 3D glossy (só redes sociais), ícones em selo, gradientes.
4. **Use os assets reais**, nunca recrie o logo ou substitua a fonte:
   - Logo/símbolo: `assets/logo/*.png`
   - Fonte: `assets/fonts/Manrope-*.ttf` (ou importe via Google Fonts — link em `tokens/typography.json`)

## Regra de ouro

Todo título de peça de marca segue o padrão: **cláusula neutra + cláusula de impacto em Bold + Roxo (`#6838E8`)**. Toda peça termina com um CTA de ação concreta, nunca vago. Toda cor usada vem de `tokens/colors.json` — nunca introduza uma cor nova.

## Ordem de trabalho

Um deck é construído em quatro passos, nesta ordem. Não pule o passo 2.

1. **Ler o material** por inteiro antes de escrever qualquer slide. Contar quantos slides o conteúdo pede.
2. **Declarar o sistema em voz alta**, em uma frase por classe de elemento: qual arquétipo para a capa, para a virada de seção, para os slides de lista, para os de diagrama, para o fechamento. Nomear as duas cores de fundo do deck. Este passo é escrito na resposta, não só pensado.
3. **Escrever todos os slides** obedecendo ao sistema declarado. Um slide que não couber em nenhum arquétipo é sinal de que o conteúdo precisa ser cortado, não de que o arquétipo precisa ser inventado.
4. **Revisar** contra o checklist da seção "Checklist de auto-verificação" antes de entregar.

Sem o passo 2, cada slide vira um projeto independente e o deck perde unidade.

## Apresentações PPTX — Fluxo obrigatório

Quando o pedido for gerar uma apresentação, siga os 4 passos abaixo na ordem.
Não pule etapas. Não gere JSON sem completar o Design Pass.

---

### Passo 1 — Receber conteúdo

Se o usuário não forneceu o conteúdo completo, solicitar:
- Tema geral do deck
- Nome do deck (vai no rodapé — ex.: "Dati | Proposta Comercial")
- Conteúdo de cada slide com os textos que devem aparecer

Não gere conteúdo por conta própria — apenas organize e mapeie o que foi fornecido.

#### Quando o usuário anexar uma apresentação de referência para converter

O objetivo é **trocar o acabamento visual, não o conteúdo**. Regras obrigatórias:

1. **Preservar o texto original verbatim.** Títulos, bullets, dados, citações, nomes e números devem aparecer exatamente como estão na fonte — sem parafrasear, sem resumir por iniciativa própria, sem reescrever para "soar melhor".
2. **Corte só em último caso de overflow.** Se um arquétipo não comporta todo o texto do slide original (ex.: `impacto` não tem espaço para bullet list), mover o excesso para o campo `notes` do JSON — ele vai para as notas do apresentador, não some. Só remover texto se, mesmo nas notas, o slide ficar ilegível por volume.
3. **Quando corte for inevitável**, fazer o menor corte possível que preserve o sentido: retirar redundâncias ou exemplos secundários, nunca a ideia central. Indicar no `notes` o trecho omitido para que o apresentador possa falar sobre ele.
4. **Não reescrever a mensagem.** Uma frase de impacto do apresentador — "Você cuida do estoque como cuida do caixa?" — deve ir exatamente assim. Não transformar em "A gestão de estoque exige atenção similar à do fluxo de caixa."

---

### Passo 2 — Design Pass (raciocínio interno antes do JSON)

Para **cada slide**, raciocinar em 7 pontos antes de escrever qualquer JSON:

1. **Mensagem principal** — qual é a ideia central deste conteúdo?
2. **Natureza da informação** — aplicar o mapa de transformação abaixo
3. **Layout** — qual tipo representa melhor essa natureza?
4. **Ícone** — se o tipo usa ícones, qual símbolo semântico melhor representa cada item?
5. **Densidade** — título ≤ 1 frase curta; card/item: título ≤ 4 palavras + descrição ≤ 2 linhas. Texto excedente → campo `notes`
6. **Variedade** — a sequência inteira tem tipos diferentes em slides consecutivos?
7. **Ritmo** — slides escuros apenas em `capa`, `secao`, `impacto`, `encerramento`?

Somente após verificar os 7 pontos: gerar o JSON completo.

#### Mapa de transformação conteúdo → layout

| Natureza do conteúdo | Layout |
|---|---|
| Sequência de etapas com gate/aprovação | `pipeline` |
| Processo com fases ou marcos temporais | `timeline` |
| Arquitetura com camadas e conexões | `diagrama-fluxo` |
| 2 caminhos opostos / permitido × proibido | `comparacao` |
| Exatamente 3 pilares, princípios ou dimensões | `tres-pilares` |
| 2–4 métricas com número grande | `kpi` |
| Exatamente 4 itens com título + descrição | `grid-icone` |
| 2–4 benefícios, problemas ou pilares | `cards` |
| 3–5 itens em lista homogênea | `lista-icone` |
| Conceito-chave ou estatística de impacto | `bigword` |
| Declaração forte / dado de mercado | `impacto` |
| Divisor de capítulo | `secao` |
| Instrução de ação concreta | `cta` |
| Demais casos | `conteudo` |

#### Mapa de ícones semânticos

| `icone` | Símbolo | Tema |
|---|---|---|
| `gear` | ⚙ | automação, processo, infra |
| `lightning` | ⚡ | velocidade, performance |
| `layers` | ▤ | camadas, stack, arquitetura |
| `loop` | ↻ | ciclo, iteração, regeneração |
| `code` | ⌨ | código, frontend |
| `database` | ◉ | dados, banco, storage |
| `shield` | ⛨ | segurança, guardrail |
| `diff` | ≠ | diff, mudança |
| `check` | ✓ | validação, aprovação |
| `audit` | ⊙ | auditoria, rastreabilidade |
| `arrow` | → | fluxo, deploy, pipeline |
| `star` | ★ | destaque, parceria |
| `diamond` | ◆ | pilar, fundamento |
| `cloud` | ☁ | cloud, AWS |
| `funnel` | ▽ | funil, priorização |
| `merge` | ⑂ | merge, PR |
| `branch` | ⑃ | branch, repositório |
| `lock` | ⊠ | lock, restrição |
| `chart` | ↗ | crescimento, escala |

Nunca repetir o mesmo ícone em dois cards do mesmo slide.

---

### Passo 3 — Render Pass

Escrever o JSON em:
```
C:\Users\Dati - 148\Downloads\slides-input.json
```

Executar:
```bash
node "C:\Users\Dati - 148\.claude\skills\dati-design-system\templates\pptx-template-engine.mjs" "C:\Users\Dati - 148\Downloads\slides-input.json"
```

O arquivo é salvo em `C:\Users\Dati - 148\Downloads\dati-apresentacao-gerada.pptx` por padrão.
Para outro caminho, adicionar `"outputPath"` no JSON.

Se houver erro: ler a mensagem, corrigir o JSON, executar novamente.
Nunca usar `gerar-apresentacao.mjs` sem avisar o usuário — ele não garante fidelidade visual.

---

### Passo 4 — Confirmar resultado

Informar:
> "Apresentação gerada em: `C:\Users\Dati - 148\Downloads\dati-apresentacao-gerada.pptx`
> X slides — capa, Y seções, Z de conteúdo, encerramento."

Se o usuário pedir para abrir: `start "" "C:\Users\Dati - 148\Downloads\dati-apresentacao-gerada.pptx"`

---

### Referência de tipos — JSON completo

**Tipos escuros** (fundo heroDark): `capa`, `secao`, `impacto`, `encerramento`
**Tipos claros** (fundo #EDF0F2): todos os outros

```json
{"tipo":"capa","titulo":"Linha 1","titulo2":"Linha 2","subtitulo":"Descrição","tag":"Consultoria em Cloud & AI"}
{"tipo":"secao","eyebrow":"O Contexto","titulo":"Título do divisor"}
{"tipo":"conteudo","eyebrow":"Rótulo","titulo":[{"text":"Normal "},{"text":"ênfase","emphasis":true}],"itens":["Item 1","Item 2"],"notes":"Texto para notas do apresentador"}
{"tipo":"bigword","bigword":"60%","eyebrow":"Dado","titulo":[{"text":"frase com "},{"text":"ênfase","emphasis":true}],"corpo":"Corpo explicativo"}
{"tipo":"impacto","eyebrow":"Mercado","titulo":"Frase de impacto","tituloDestaque":"parte em ciano"}
{"tipo":"cta","eyebrow":"Próximo Passo","titulo":"Título","tituloDestaque":"destaque","instrucao":"Instrução","ctaLabel":"Agendar →"}
{"tipo":"cards","eyebrow":"Benefícios","titulo":[{"text":"Título "},{"text":"destaque","emphasis":true}],"cards":[{"icone":"cloud","titulo":"Card 1","descricao":"Descrição."}]}
{"tipo":"lista-icone","eyebrow":"Desafios","titulo":[{"text":"O que precisa funcionar "},{"text":"ao vivo","emphasis":true}],"items":[{"icone":"code","titulo":"Item","descricao":"Descrição."}]}
{"tipo":"grid-icone","eyebrow":"Pilares","titulo":"Título","items":[{"icone":"loop","titulo":"Item 1","descricao":"Desc."},{"icone":"diff","titulo":"Item 2","descricao":"Desc."},{"icone":"check","titulo":"Item 3","descricao":"Desc."},{"icone":"audit","titulo":"Item 4","descricao":"Desc."}]}
{"tipo":"pipeline","eyebrow":"Esteira","titulo":"Título","steps":[{"label":"PASSO 1","descricao":"desc"},{"label":"GATE","descricao":"desc","gate":true},{"label":"FINAL","descricao":"desc"}]}
{"tipo":"timeline","eyebrow":"Fases","titulo":"Título","steps":[{"label":"FASE 1","descricao":"2 sem"},{"label":"FASE 2","descricao":"4 sem"}]}
{"tipo":"kpi","eyebrow":"Resultado","titulo":"Título","dark":true,"metricas":[{"valor":"40%","label":"Descrição"},{"valor":"3×","label":"Descrição"}]}
{"tipo":"tres-pilares","eyebrow":"Metodologia","titulo":"Título","pilares":[{"titulo":"Pilar 1","descricao":"Desc."},{"titulo":"Pilar 2","descricao":"Desc."},{"titulo":"Pilar 3","descricao":"Desc."}]}
{"tipo":"comparacao","eyebrow":"Estratégia","titulo":[{"text":"Velocidade "},{"text":"com controle","emphasis":true}],"esquerda":{"rotulo":"CAMINHO A","titulo":"Com estrutura","descricao":"Desc."},"direita":{"rotulo":"CAMINHO B","titulo":"Sem estrutura","descricao":"Desc."}}
{"tipo":"diagrama-fluxo","eyebrow":"Arquitetura","titulo":[{"text":"Uma "},{"text":"fronteira humana","emphasis":true}],"camadas":[{"nos":[{"label":"NÓ A","sublabel":"sub","cor":"cyan"},{"label":"NÓ B","sublabel":"sub","cor":"green"}]},{"nos":[{"label":"CONVERGÊNCIA","sublabel":"sub","cor":"purple","destaque":true}]}]}
{"tipo":"encerramento","titulo":"Obrigado!"}
```

## Grade fixa do slide 1920×1080

Estas constantes valem para todos os slides de conteúdo. São literais, não sugestões.

| Elemento | Valor |
|---|---|
| Margem lateral | `110px` dos dois lados |
| Barra de acento (acima do eyebrow) | `88×7px`, raio `999px`, `linear-gradient(90deg,#3503BB 0%,#6838E8 100%)` |
| Eyebrow | topo em `y=150`, Bold `24px`, `letter-spacing:0.1em`, caixa alta, `#8F65FE` (claro) / `#8C7DFF` (escuro) |
| Título | Bold `56–63px`, `line-height:1.1`, `letter-spacing:-0.03em`, largura máxima `1300px` |
| Subtítulo | Regular `30–32px`, `line-height:1.4`, `#5B5570` |
| Corpo dentro de card | Regular `24–28px`, `line-height:1.35–1.45` |
| Rodapé | `bottom:54px`, entre as margens, nome do evento à esquerda e número do slide à direita, ambos `24px`, `#77718A` (claro) / `#9891AB` (escuro) |
| Logo no miolo claro | `dati-logo-deck-light.png`, `left:1713 top:70`, altura `40px` |

Capa e fechamento seguem o contrato de capa do guia (símbolo a 68% da altura, borda esquerda a 61,5%), não esta grade.

## Tamanhos de fonte por arquétipo — obrigatório

Extraídos dos decks de referência primária **MAP** e **SeniorTec 2026**. Os valores em **px** são para o motor de templates (canvas 1920×1080). Os valores em **pt** são os equivalentes no PowerPoint (para edição manual ou verificação). Nunca use tamanhos fora desta tabela.

| Elemento | px (motor) | pt (PPTX) | Peso | Cor típica |
|---|---|---|---|---|
| Capa — título (linha 1 e 2) | 69px | 36pt | Bold | `#FFFFFF` |
| Capa — subtítulo | 37px | 19pt | Regular | `#C0C0C0` |
| Capa — badge/tag | 29px | 15pt | Regular | `#FFFFFF` |
| Divisor de seção — título | 90px | 47pt | Regular | `#FFFFFF` |
| Conteúdo — título H1 | 60px | 31pt | Bold | `#1A0F3D` |
| Bigword — número/palavra de impacto | 102px | 53pt | ExtraBold | `#FFFFFF` |
| Encerramento — título | 127px | 66pt | Regular | `#FFFFFF` |
| Eyebrow (todos os arquétipos) | 23px | 12pt | Regular/Bold | `#8F65FE` (claro) / `#8C7DFF` (escuro) |
| Corpo / descrição de card | 23–27px | 12–14pt | Regular | `#5B5570` |
| Rodapé (deck name + número) | 23px | 12pt | Regular | `#9891AB` |

**Regras de verificação:**
- O motor `pptx-template-engine.mjs` copia os slides 1–6 do MAP.pptx verbatim — os tamanhos de capa e institucional são preservados automaticamente.
- Para slides gerados via JSON (slides 7 em diante), o motor aplica os tamanhos da tabela acima. Se um slide abrir no PowerPoint com fonte diferente das colunas pt, o motor usou um template incorreto.
- Nunca ajustar tamanhos para "caber mais texto" — se o texto não couber, mova o excesso para `notes` ou divida em dois slides.
- O checklist de auto-verificação já inclui `24px` como mínimo absoluto — isso reflete o valor do corpo/rodapé: nenhum texto pode ser menor que o rodapé.

## Valores literais, nunca `var()`

Ao montar um slide, leia `tokens/colors.css` e `tokens/effects.css` e **cole o valor literal inline**. Variáveis CSS exigem que o modelo lembre o nome certo; literais estão na frente dele.

Os que mais aparecem:

```
Roxo de ênfase        #6838E8      Roxo claro (sobre escuro)  #8C7DFF
Roxo de eyebrow       #8F65FE      Navy de texto              #1A0F3D
Texto secundário      #5B5570      Texto de rodapé claro      #77718A
Card lavanda          #EBE4FF      Contorno do card lavanda   #A28CDC
Card branco           #FFFFFF      Contorno do card branco    #DDD6EE
Verde (só positivo)   #A4DF64      Ciano de selo              #5EBAE8 → #5EA0E0
Fundo claro           radial-gradient(701.142px 1245.695px at 50% 50%,#FFFFFF 0%,#E3E3E3 100%)
Fundo escuro          linear-gradient(135deg,#0D0824 0%,#1A0F3D 55%,#2B1B5C 100%)

Selo de ícone         64–74px, raio 10.412px,
                      background: radial-gradient(75.485px 75.485px at 50% 7.35%,#6838E8 0%,#3503BB 100%)
                      box-shadow: inset 0 0 0 1px #8F65FE,
                        0 69px 19px rgba(36,8,114,0), 0 45px 17px rgba(36,8,114,.02),
                        0 24px 16px rgba(36,8,114,.07), 0 10px 10px rgba(36,8,114,.12),
                        0 3px 7px rgba(36,8,114,.14)
```

Cor de selo cicla apenas na grade de quatro conceitos: roxo → ciano `#5EBAE8` → âmbar `#FAC030` → verde `#A1DF6C`. Nos demais slides, todos os selos são roxos.

## Diagramas

A causa mais comum de slide poluído. Regras duras:

- **Caixas em grade, setas ortogonais.** Organize em faixas horizontais (topo / meio / base) e ligue as faixas com setas verticais. SVG com coordenadas livres produz sobreposição que ninguém enxerga no código.
- **Máximo cinco rótulos de aresta no slide inteiro.** Se a legenda dentro da caixa já diz o que a seta transporta, o rótulo sai.
- **Um serviço aparece uma vez.** Ou como caixa própria, ou como chip dentro da caixa que o consome — nunca os dois.
- **Reserve altura.** Todo elemento posicionado com `position:absolute` recebe `width` e `height` explícitos, para que a colisão apareça no código e não só na tela.
- **Texto do diagrama obedece ao mínimo de 24px** como qualquer outro texto do slide. Se não couber a 24px, o diagrama tem peças demais.
- Ao reproduzir um diagrama que o usuário já tem, **mantenha a geometria original** e troque apenas o acabamento (raio 12px, contornos da marca, tipografia Manrope, paleta). Redesenhar a topologia destrói a compreensão que o usuário já validou.

## Quando o pedido não se encaixa perfeitamente

Se o material pedido não é nenhum dos quatro tipos cobertos (ex.: um e-mail, um vídeo, um site), aplique as regras de fundação (`docs/01` a `docs/05`) diretamente — elas são o "sistema", os guias de `docs/materiais/` são aplicações específicas já testadas.

Se faltar uma referência real para um tipo de material novo (como aconteceu com documentos internos — ver a nota em `docs/materiais/documentos-internos.md`), avise que a orientação é uma extrapolação cautelosa das regras confirmadas, e peça um exemplo real ao time para refinar o guia.

## Manter atualizado

Este skill vive em [github.com/Dati51632/Dati-design-system](https://github.com/Dati51632/Dati-design-system). Quando a marca evoluir (nova cor, novo padrão de material, novos exemplos reais), atualize os arquivos correspondentes e suba uma nova versão — ver `README.md` para o fluxo de atualização e `CHANGELOG.md` para o histórico.

### Fluxo de curadoria — toda alteração passa pelo time de MKT

**Nenhuma mudança de conteúdo, regra ou padrão visual deve ser aplicada à skill sem revisão do time de Marketing.** O fluxo é:

1. **Proposta** — qualquer membro do time (ou o próprio Claude, ao identificar inconsistência) registra a mudança sugerida: o que muda, por que muda e qual material real motivou a proposta.
2. **Curadoria MKT** — o time de Marketing revisa se a proposta está alinhada com o posicionamento da marca e os exemplos reais. Aprovação é obrigatória antes de qualquer commit.
3. **Aplicação** — somente após aprovação: editar o arquivo correspondente, commitar com mensagem descritiva e registrar em `CHANGELOG.md`.
4. **Distribuição** — avisar o time via Slack. O Claude usa a versão mais recente a partir do próximo `git pull`.

Propostas de alteração podem ser coletadas pelo formulário de feedback do guia de instalação (`docs/guia-instalacao-e-uso.html`) — o campo "Proposta de mudança na skill" foi criado exatamente para isso.

## Checklist de auto-verificação

Releia o deck contra esta lista antes de entregar. Cada item reprovado é correção obrigatória, não opcional.

**Legibilidade**
- [ ] Nenhum texto abaixo de `24px`.
- [ ] Nenhum texto em branco com alpha ou cinza fora da paleta; tinta sempre em opacidade cheia.
- [ ] Contraste mínimo 4.5:1 (3:1 apenas em título de tamanho display).

**Colisão e transbordo**
- [ ] Nenhum elemento absoluto sem `width` e `height` reservados.
- [ ] Nenhum bloco ultrapassa `bottom:54px` (a faixa do rodapé).
- [ ] Nenhum bloco ultrapassa a margem de `110px` dos dois lados.
- [ ] Nenhum glow ou forma decorativa por cima de texto (use `z-index` explícito: decoração `0`, conteúdo `1`).

**Sistema**
- [ ] No máximo duas cores de fundo no deck inteiro; escuro só em capa, viradas e fechamento.
- [ ] Todo slide de conteúdo tem barra de acento, eyebrow, rodapé com número — na grade da seção "Grade fixa do slide 1920×1080".
- [ ] Todo slide corresponde a um arquétipo declarado no passo 2; nenhum arquétipo inventado no meio do caminho.
- [ ] Nenhuma cor fora da paleta. Verde apenas em contexto positivo. Laranja no máximo um ponto por peça.

**Conteúdo**
- [ ] Nenhum slide com seção de preenchimento; espaço vazio é resolvido no layout, não com conteúdo.
- [ ] Nenhum emoji. Sinais gráficos permitidos: `→` `↓` `✓` `—`.
- [ ] Texto fornecido pelo usuário está verbatim, sem reescrita.
- [ ] Negrito roxo em no máximo 1–2 palavras por parágrafo.

## Sobre o loop de verificação

O checklist acima substitui parcialmente o que, no Claude Design, é um verificador que abre o deck, tira screenshot de cada slide e mede colisão e transbordo no DOM. Uma skill de texto não tem esse recurso, então o checklist é a compensação: transforma medições em perguntas que o modelo consegue responder relendo o próprio código.

Se a skill rodar em um ambiente com execução (Claude Code, por exemplo), vale adicionar um passo final que abra o HTML e rode uma checagem de `getBoundingClientRect()` por slide, procurando retângulos de texto que se intersectam e `scrollHeight > clientHeight`. É a checagem que pegou, neste projeto, o rótulo colidindo com o logo, a lista transbordando o rodapé e o glow por cima do texto.

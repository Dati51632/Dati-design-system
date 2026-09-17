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

## Quando o pedido não se encaixa perfeitamente

Se o material pedido não é nenhum dos quatro tipos cobertos (ex.: um e-mail, um vídeo, um site), aplique as regras de fundação (`docs/01` a `docs/05`) diretamente — elas são o "sistema", os guias de `docs/materiais/` são aplicações específicas já testadas.

Se faltar uma referência real para um tipo de material novo (como aconteceu com documentos internos — ver a nota em `docs/materiais/documentos-internos.md`), avise que a orientação é uma extrapolação cautelosa das regras confirmadas, e peça um exemplo real ao time para refinar o guia.

## Manter atualizado

Este skill vive em [github.com/Dati51632/Dati-design-system](https://github.com/Dati51632/Dati-design-system). Quando a marca evoluir (nova cor, novo padrão de material, novos exemplos reais), atualize os arquivos correspondentes e suba uma nova versão — ver `README.md` para o fluxo de atualização e `CHANGELOG.md` para o histórico.

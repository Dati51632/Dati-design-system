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

## Quando o pedido não se encaixa perfeitamente

Se o material pedido não é nenhum dos quatro tipos cobertos (ex.: um e-mail, um vídeo, um site), aplique as regras de fundação (`docs/01` a `docs/05`) diretamente — elas são o "sistema", os guias de `docs/materiais/` são aplicações específicas já testadas.

Se faltar uma referência real para um tipo de material novo (como aconteceu com documentos internos — ver a nota em `docs/materiais/documentos-internos.md`), avise que a orientação é uma extrapolação cautelosa das regras confirmadas, e peça um exemplo real ao time para refinar o guia.

## Manter atualizado

Este skill vive em [github.com/GabWagen/design-system-dati](https://github.com/GabWagen/design-system-dati). Quando a marca evoluir (nova cor, novo padrão de material, novos exemplos reais), atualize os arquivos correspondentes e suba uma nova versão — ver `README.md` para o fluxo de atualização e `CHANGELOG.md` para o histórico.

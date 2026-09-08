# Apresentações / pitch decks

Padrão extraído de 4 apresentações reais da Dati (*DataFrete Summit*, *Vibe to Production — First Call Deck*, *Proposta Comercial*, *Além do EIXO*), 16 a 27 slides cada, todas em formato widescreen (16:9).

## Estrutura de slides recorrente

1. **Capa** — ver padrão exato abaixo.
2. **Quem está falando / Quem somos** — nome, cargo, foto ou selo institucional (usado em palestras e propostas).
3. **Diagnóstico/provocação** — 1 a 3 slides com pergunta retórica ou dado de mercado que expõe o problema (ver `docs/01-marca-e-posicionamento.md`).
4. **Desenvolvimento** — slides de conteúdo: diagramas de etapas, comparação antes/depois, arquitetura de referência, gráfico de dados.
5. **Prova/case** — case de cliente real ou depoimento.
6. **Investimento/oferta** — valor, plano, o que está incluso.
7. **Fechamento** — repete a frase de capa (ou uma variação dela) + CTA claro.

## Slide de capa (padrão fixo, confirmado nas 4 apresentações)

**Referência exata (validada pelo time em 2026-09):** capa do "DataFrete Summit 2026". Todo slide de capa gerado deve reproduzir esta estrutura — não é livre-interpretação, é um contrato fixo. Valores abaixo são percentuais de um slide widescreen 1920×1080 (escale proporcionalmente para outros tamanhos).

| Elemento | Especificação |
|---|---|
| Fundo | Gradiente `--dati-gradient-hero-dark`, diagonal 135° (canto superior esquerdo → inferior direito). |
| Logo | `assets/logo/dati-logo-white.png` (lockup completo branco). Canto superior esquerdo, margem ~5,9% da largura / ~10% da altura a partir da borda. Altura do logo ≈ 7,8% da altura do slide. **Nunca** redesenhe o logo — use sempre o PNG. |
| Elemento gráfico grande | `assets/logo/dati-symbol-purple.png` — **o símbolo isolado**, nunca o lockup com a palavra "dati" (ver regra explícita abaixo). Redimensionar para altura ≈ 68% da altura do slide, mantendo a proporção original do PNG. Posicionar pela borda esquerda do símbolo em ≈ 61-62% da largura do slide, centralizado verticalmente (pode ficar levemente abaixo do centro). O lado direito do símbolo deve tocar ou sangrar levemente para fora da borda direita do slide — nunca deixar uma margem visível de fundo à direita do símbolo. |
| Rótulo eyebrow | Bold, caixa alta, cor `--dati-purple-light` (`#8C7DFF`), tamanho pequeno (~24px/1080). Ex.: "DATAFRETE SUMMIT 2026", "Vibe to Production", "FIRST CALL DECK". |
| Título | 2 linhas, Extrabold/Bold, ~66px/1080. 1ª linha branca (`#FFFFFF`), 2ª linha `--dati-purple-light` (`#8C7DFF`) — padrão de ênfase, ver `03-tipografia.md`. |
| Subtítulo | Uma frase, Regular, cor `--dati-text-on-dark-subtitle` (`#CFC9E6`) — **não** usar branco nem cinza genérico. |
| Rodapé esquerdo | Nome do apresentador + cargo + "Dati" (ou tag da oferta em pill outline), cor `--dati-text-on-dark-muted` (`#9891AB`). |

### Erros a nunca repetir (causas raiz de capas já geradas fora do padrão)

- ❌ Usar `dati-logo-color.png`, `dati-logo-navy.png` ou qualquer `dati-logo-*.png` (lockup completo, com a palavra "dati") como o elemento gráfico grande à direita. O lockup completo **só** aparece pequeno, no canto superior esquerdo. O elemento grande é **sempre** um arquivo `dati-symbol-*` (símbolo isolado, sem a palavra "dati").
- ❌ Centralizar o símbolo no meio do slide ou deixar espaço de fundo visível entre ele e a borda direita — ele sempre ocupa o canto direito e sangra/toca a borda.
- ❌ Redimensionar o símbolo para menos de ~50% ou mais de ~80% da altura do slide — a proporção confirmada é ~68%.
- ❌ Usar branco puro ou um cinza qualquer no subtítulo/rodapé sobre fundo escuro — usar exatamente os tokens `--dati-text-on-dark-subtitle` e `--dati-text-on-dark-muted`.
- ❌ Inventar um gradiente novo para o fundo — usar sempre `--dati-gradient-hero-dark`.

## Slide de conteúdo (padrão fixo)

- Fundo `#EDF0F2` ou branco.
- Eyebrow Bold roxo, canto superior esquerdo.
- Título H1 Bold navy, 1-2 linhas.
- Logo `dati` navy, canto superior direito.
- Rodapé: nome do evento/deck (esquerda) + número do slide (direita), cinza claro.
- Corpo: varia por tipo — diagrama de etapas com círculos coloridos (ciclando as 5 cores da paleta), card/mockup de navegador para prints de tela, gráfico de barras (barras em degradê roxo claro→escuro conforme o valor cresce, valor em destaque verde quando é o número-chave).

## Slide de investimento/preço

Dois padrões confirmados, conforme a oferta:

- **Preço único**: card navy à esquerda com o valor gigante em verde + badge "Pagamento único"/"Incluso" + lista de checkmarks verdes; painel claro à direita com gráfico ou justificativa.
- **Planos comparativos**: cards lado a lado, header em gradiente roxo com nome do plano, corpo navy escuro, lista com bullet, preço dentro de um pill roxo com ícone.

## Slide de fechamento

Fundo navy (mesmo gradiente da capa) e mesmo elemento gráfico grande (`dati-symbol-purple.png`, mesma escala/posição da capa — ver tabela acima). Título de 3 linhas repetindo/reforçando a tese da capa, com a mesma regra de ênfase (regular → bold roxo). Abaixo, 2-3 "chips" (pills com contorno) resumindo os pontos de ação, sem preencher o slide inteiro — bastante espaço negativo.

## Ao gerar uma apresentação nova

1. Pergunte (ou defina) a tese central em uma frase de duas cláusulas — vai virar o título da capa e do fechamento.
2. Siga a estrutura de 7 blocos acima; nem toda apresentação precisa de todos, mas a ordem não se inverte.
3. Use fundo escuro só na capa e no fechamento — o miolo é sempre claro.
4. Um dado/prova concreta por slide de diagnóstico — não empilhe mais de 5 pontos por slide.
5. Gere os arquivos como `.pptx` (skill `pptx`) ou, quando disponível neste ambiente, o tipo de artefato **Slides** — seguindo a paleta e tipografia definidas em `tokens/`.

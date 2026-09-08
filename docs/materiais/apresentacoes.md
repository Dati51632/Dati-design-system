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

- Fundo: gradiente navy diagonal (`--dati-gradient-hero-dark`).
- Logo `dati` branco, canto superior esquerdo.
- Símbolo da marca em "crop" gigante (ver `05-elementos-graficos.md`), sangrando pela lateral direita, tom sobre tom em roxo.
- Rótulo eyebrow pequeno, Bold, roxo claro (ex. "DATAFRETE SUMMIT 2026", "Vibe to Production", "FIRST CALL DECK").
- Título em 2 linhas: 1ª linha branca regular/bold, 2ª linha Bold Roxo (padrão de ênfase — ver `03-tipografia.md`).
- Subtítulo em cinza claro, uma frase.
- Rodapé esquerdo: nome do apresentador + cargo + "Dati", ou tag da oferta (pill outline).

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

Fundo navy (mesmo gradiente da capa). Título de 3 linhas repetindo/reforçando a tese da capa, com a mesma regra de ênfase (regular → bold roxo). Abaixo, 2-3 "chips" (pills com contorno) resumindo os pontos de ação, sem preencher o slide inteiro — bastante espaço negativo.

## Ao gerar uma apresentação nova

1. Pergunte (ou defina) a tese central em uma frase de duas cláusulas — vai virar o título da capa e do fechamento.
2. Siga a estrutura de 7 blocos acima; nem toda apresentação precisa de todos, mas a ordem não se inverte.
3. Use fundo escuro só na capa e no fechamento — o miolo é sempre claro.
4. Um dado/prova concreta por slide de diagnóstico — não empilhe mais de 5 pontos por slide.
5. Gere os arquivos como `.pptx` (skill `pptx`) ou, quando disponível neste ambiente, o tipo de artefato **Slides** — seguindo a paleta e tipografia definidas em `tokens/`.

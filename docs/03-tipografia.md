# Tipografia

Fonte única: **Manrope** (Google Font, gratuita) — arquivos em [`assets/fonts/`](../assets/fonts/), especificação completa em [`tokens/typography.json`](../tokens/typography.json).

## Pesos e uso

| Peso | Uso |
|---|---|
| ExtraBold / Bold | Títulos (display, H1), palavra-chave em destaque dentro de um título |
| SemiBold | Subtítulos, H2, texto de botão/CTA |
| Medium | Rótulo "eyebrow" (caixa alta, acima do título), legenda de apoio |
| Regular | Parágrafo corrido, corpo de texto |
| Light / ExtraLight | Uso decorativo raro (não observado como padrão dominante nos materiais reais — evite como escolha default) |

## O padrão de ênfase (use isso sempre que escrever um título)

Em praticamente todo material real analisado — posts, decks, one-pagers — o título principal segue este padrão:

```
[cláusula neutra, peso regular ou bold, cor de texto padrão]
[cláusula de impacto, peso bold, cor Roxo #6838E8 ou #8C7DFF]
```

Exemplos reais:
- *"Antes da IA, a"* (branco) + *"verdade operacional"* (roxo bold)
- *"Do protótipo em IA ao"* (branco) + *"site estático rodando na AWS"* (roxo bold)
- *"Além do"* (branco) + *"EIXO"* (roxo bold)

Ao gerar qualquer título — slide, post, one-pager — quebre a frase em duas cláusulas e aplique esse contraste de cor. É o elemento tipográfico mais reconhecível da marca, mais até que o logo em muitas peças.

## Hierarquia típica de uma peça

1. **Eyebrow** (opcional): rótulo curto em caixa alta, Bold, Roxo ou branco — ex. "DIAGNÓSTICO", "INVESTIMENTO", "SÉRIE IA".
2. **Título** (display/H1): 2 linhas, padrão de ênfase acima.
3. **Subtítulo**: uma frase Regular ou Medium, cor neutra (cinza claro sobre fundo escuro, `--dati-text-muted` sobre fundo claro), sem negrito.
4. **Corpo** (se houver): Regular, line-height generoso (1.5), com 1-2 palavras-chave em Bold + Roxo dentro do parágrafo (não frases inteiras).
5. **CTA/rótulo de botão**: SemiBold, dentro de um pill (cápsula) com fundo Roxo ou contorno Roxo.

## O que evitar

- Mais de uma família tipográfica — a marca é mono-tipográfica (só Manrope).
- Negrito indiscriminado — o negrito é reservado para a palavra/cláusula de ênfase, não para "chamar atenção" em geral.
- Texto todo em caixa alta fora do rótulo "eyebrow" — títulos e corpo usam capitalização normal.

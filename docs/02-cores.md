# Cores

Valores completos e machine-readable estão em [`tokens/colors.json`](../tokens/colors.json) e [`tokens/colors.css`](../tokens/colors.css). Este documento explica o *porquê* de cada cor.

## Paleta

| Cor | Hex | Pantone | Papel |
|---|---|---|---|
| Marinho (Navy) | `#1A0F3D` | 4147 CP | Base estrutural: fundo escuro institucional, texto sobre fundo claro |
| Roxo (Purple) | `#6838E8` | 2725 C — "ambientes digitais" | Ênfase primária: CTA, palavra-chave em destaque, símbolo |
| Ciano (Cyan) | `#5BBEED` | 2190 CP | Acento secundário: metade superior do símbolo, toques digitais |
| Verde (Green) | `#A4DF64` | 2283 C | Destaque positivo: preço, benefício, confirmação |
| Laranja (Orange) | `#F59D01` | 3588 CP | Atenção pontual: no máximo um destaque por peça |
| Branco (White) | `#FFFFFF` | — | Fundo claro, texto sobre fundo escuro |
| Neutro claro | `#EDF0F2` | — | Fundo alternativo para slides de conteúdo e one-pagers (menos "cru" que branco puro) |

Tons de roxo mais claros (`#8C7DFF`, `#8C52FF`) aparecem como variação de ênfase sobre fundo escuro (ex.: palavra em destaque dentro de um título branco) — não são cores novas, são tints do Roxo.

## Regras de uso (verificadas em material real)

1. **Navy + branco carregam a estrutura.** Praticamente toda peça é fundo escuro/texto claro ou fundo claro/texto escuro — a cor nunca é a maioria da área visível.
2. **Roxo é a única cor de ênfase "default".** Quando em dúvida sobre qual cor usar para destacar uma palavra, um ícone ou um CTA, use Roxo.
3. **Verde só em contexto positivo/numérico.** Presente em: valor de investimento, badge de "incluso"/"pagamento único", ícone de benefício. Nunca usado como cor decorativa neutra.
4. **Laranja é raro por design.** Nos materiais analisados, aparece no máximo uma vez por peça — reservado para o ponto de maior atenção ou decisão (ex.: o último passo de um diagrama de 5 etapas).
5. **Ciano é quase sempre parte do símbolo**, raramente um bloco de cor isolado no layout.
6. **Nunca introduzir cores fora desta lista.** Isso é uma regra explícita e repetida no guia de marca oficial — é a violação de identidade mais fácil de cometer e mais visível.

## Combinações confirmadas em uso real

- **Capa de apresentação / post escuro:** fundo em gradiente navy (`--dati-gradient-hero-dark`), logo branco, título branco + roxo bold, símbolo/"crop do símbolo" em roxo gigante sangrando pela lateral.
- **Slide/one-pager de conteúdo:** fundo `#EDF0F2` ou branco, título navy, ícones/badges em roxo (ou navy com contorno colorido ciclando pelas 5 cores da paleta em diagramas de etapas).
- **Card de preço/plano:** fundo navy com header em gradiente roxo, valor em verde dentro de um badge/pill.

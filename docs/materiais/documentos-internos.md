# Documentos internos / relatórios

Não há um exemplo real de relatório interno entre os materiais analisados até agora — as diretrizes abaixo extrapolam com cautela as regras confirmadas de marca (`docs/01` a `docs/05`) para um contexto interno. Se o time tiver um relatório, memo ou template interno real, envie para substituir esta seção por um padrão confirmado.

## Diretrizes por extrapolação

- **Fundo**: claro (`#EDF0F2` ou branco) — documentos internos priorizam legibilidade e impressão sobre impacto visual; reserve os fundos escuros dramáticos para material de capa/venda.
- **Título**: mesma regra de tipografia (`03-tipografia.md`), mas sem necessidade de aplicar o padrão de ênfase de duas cores em todo título — um H1 navy simples é aceitável para um relatório interno.
- **Rodapé**: logo `dati-logo-navy.png` pequeno + nome do documento + data + numeração de página, discreto, cinza.
- **Tabelas e dados**: use `--dati-navy` para cabeçalhos de tabela, `--dati-green` para variações positivas, `--dati-orange` para alertas pontuais — nunca as duas juntas na mesma célula.
- **Gráficos**: siga a paleta de `tokens/colors.json`; para série categórica, ordem sugerida é roxo → ciano → verde → laranja → navy.
- Evite os elementos decorativos de `05-elementos-graficos.md` (crop do símbolo, formas 3D glossy) em documentos internos de trabalho — são recursos de material voltado para fora da empresa (venda, marca, conteúdo).

## Quando isso deixa de ser extrapolação

Assim que o time compartilhar um memo, ata de reunião ou relatório real da Dati, atualize este arquivo com o padrão confirmado (estrutura de seções, uso de cor, uso de tabela) do mesmo jeito que os outros três guias de material foram construídos a partir de exemplos reais.

# Posts para redes sociais (Instagram / LinkedIn)

Padrão extraído de 16 posts reais da campanha "Série IA" (@dati.cloud) **e**, na revisão de setembro/2026, de 14 posts adicionais reais (campanhas de infraestrutura, segurança, custos AWS e produtividade com IA) usados para calibrar overview de output do skill. Formato confirmado nos dois lotes: **1080 × 1440 px**.

> ⚠️ Correção de versão anterior: este documento chegou a descrever o formato como "4:5". A proporção real de 1080×1440 é **3:4**, não 4:5 (que seria 1080×1350). Use sempre 1080×1440 como referência de canvas.

## Duas estruturas de slide — não confundir

Os posts reais não usam um único template: há dois esqueletos visuais diferentes, e cada um aparece num momento diferente do carrossel.

### A. Slide "avulso" (capa, fechamento, posts de imagem única)

Composição **full-bleed**: a arte ocupa o quadro 1080×1440 inteiro, sem cartão interno. É o formato de capa/hook, de fechamento, e de posts que não são carrossel (uma imagem só). Contém, em camadas:

1. Fundo decorativo (ver seção de fundos abaixo).
2. Um ícone 3D grande (ver "Biblioteca de ícones 3D") ou elemento gráfico de apoio, ocupando boa parte do quadro.
3. Rótulo de série, quando aplicável: pill pequena `dati | SÉRIE [TEMA]` (ícone do símbolo + texto), canto superior esquerdo.
4. Título, alinhado à esquerda ou centralizado dependendo do layout, na metade inferior do quadro.
5. CTA/instrução (pill com contorno: "ARRASTE PARA O LADO →", "FALE COM A GENTE.") e logo `dati`.

### B. Cartão de vidro (slides de desenvolvimento do carrossel)

Usado nos slides do meio do carrossel (o "miolo"). Aqui a composição tem **duas camadas separadas**, e é um erro comum (já cometido numa versão anterior deste guia) colocar tudo dentro do cartão:

1. **Fundo cru**, fora do cartão: navy escuro com glow radial roxo na base, ou textura pontilhada sutil.
2. **Rótulos de topo**, soltos sobre o fundo cru (não dentro do cartão): `@DATI.CLOUD` à esquerda, instrução de navegação à direita — `ARRASTE PARA O LADO →`, `LEIA A LEGENDA ↓`, `LEIA A DESCRIÇÃO` — em caixa alta, peso misto (regular + palavra final em bold).
3. **O cartão** ("cartão de vidro" — ver `05-elementos-graficos.md`): um retângulo de canto bem arredondado, inset com margem em relação às bordas do quadro, com efeito de vidro (fundo semitransparente + blur) e um brilho/glow roxo na borda inferior. Dentro dele:
   - Selo pequeno com o ícone 3D do conceito do slide (canto superior esquerdo do cartão).
   - Título do slide (2-4 linhas).
   - Linha de apoio/insight, opcional, em tom roxo-claro mais suave que o título.
   - Barra utilitária no rodapé do cartão: ícones pequenos de "copiar", "like", "dislike", "..." à esquerda, e contador `N/total` (ex. `2/5`) à direita — um recurso recorrente que simula a barra de uma interface de chat/IA. Use-o nos slides de desenvolvimento; não é obrigatório na capa nem no fechamento.

## Biblioteca de ícones 3D (não são formas CSS genéricas)

O recurso que a v1 deste guia chamava de "formas 3D glossy" é, nos exemplos reais mais recentes, uma **biblioteca de ícones 3D renderizados** (vidro/cromo, tons de roxo/lavanda, com reflexos e profundidade real de render — não gradientes CSS planos), um ícone por conceito do slide. Confirmados nos exemplos reais:

| Ícone | Conceito |
|---|---|
| Cadeado | Segurança, trava, dado preso |
| Relógio | Tempo, atraso, demora de aprovação |
| Chama | Urgência, "apagar incêndio" |
| Cifrão / nota de dinheiro | Custo, gasto, previsibilidade financeira |
| Escudo riscado | Vulnerabilidade, falta de proteção/compliance |
| Nuvem com coração | Benefício da nuvem, satisfação |
| Seta/triângulo de vidro | Direção, decisão, avanço |
| Moeda com brilho/sparkle | Valor, IA, investimento |
| Argolas concêntricas + triângulo | Escala, crescimento, foco |
| Cartão de crédito | Cobrança, modelo de pagamento |
| Estrela/sparkle de 4 pontas | IA, "mágica", destaque de marca |

Regras de uso:

- **Exclusivo de redes sociais** — segue valendo o que a v1 já dizia: não aparece em apresentações, one-pagers ou documentos internos.
- **Dois tamanhos, dois contextos**: grande (ocupando 40-70% do quadro) em slides avulsos (capa/fechamento); pequeno, dentro de um selo quadrado de canto arredondado com leve glow/sombra, no canto do cartão de vidro nos slides de desenvolvimento.
- **Sempre tom roxo/lavanda/cromado** — nunca em outra cor da paleta. Pode aparecer sozinho, em par (um nítido + cópias desfocadas ao lado, sugerindo repetição/carrossel) ou como parte de uma pilha de moedas/elementos.
- Se precisar de um conceito fora da lista acima, mantenha a mesma linguagem visual (render 3D vítreo, tom roxo, reflexo de luz) em vez de recriar como ícone de linha achatado — isso é o que diferencia este recurso do "ícone de linha em selo" (que é chapado e usado em decks/one-pagers).

## Fundos decorativos (catalogados nos exemplos reais)

Além dos três já descritos na v1 (escura com glow, clara, neutra com mockup), os exemplos mais recentes confirmam mais três variações — todas em tons de navy/roxo, nunca introduzindo cor fora da paleta:

- **Glow radial roxo sobre navy** — usado atrás do cartão de vidro; o brilho fica concentrado na base do quadro ou atrás do ícone.
- **Ribbon/onda fluida roxo-navy** — uma faixa de gradiente com aparência de tecido/vidro líquido atravessando o quadro na diagonal; usada em capas alternativas de tema financeiro/growth.
- **Grade tracejada + pontos marcadores** — linhas verticais finas tracejadas com um ponto/marcador redondo em alguns cruzamentos, baixíssimo contraste, sobre fundo claro. Já estava descrita em `05-elementos-graficos.md`; confirmado também como fundo pleno de slide de post, não só como textura leve.
- **"Nuvem de tags" desfocada** — pills com termos técnicos (ex. "orquestração de containers", "monitoramento de tokens") desfocados ao fundo, sugerindo um vocabulário/contexto sem ser literal — usada atrás de um título com 1-2 palavras em bold roxo. Pode vir acompanhada de um badge de status pequeno (chip escuro com ícone de alerta + texto curto, ex. "Falha na produção") como elemento de contexto.
- **Mockup de laptop/navegador** com captura de tela real de produto/UI — mantém o padrão já documentado, agora confirmado com overlay de um pequeno card de UI flutuante sobre a imagem (ex. um prompt de feedback "Esta conversa foi útil até agora?").

## Padrão de ênfase tipográfica — três variantes confirmadas

A v1 descrevia só "regular + bold roxo". Os exemplos reais mostram três variações; escolha pela intenção do slide, não aleatoriamente:

1. **Regular branco + bold branco** (sem cor) — usado quando o impacto é de volume/urgência, não de conceito-chave (ex. um título de 4 linhas onde as 2 últimas ficam em bold branco, não roxo).
2. **Regular branco + bold roxo-claro (`#8C7DFF`)** — o padrão "clássico" da marca, mais comum em capas e fechamentos.
3. **Frase quase inteira em peso regular + só 1-2 palavras/números em bold roxo** no meio ou fim do parágrafo — comum em slides de desenvolvimento com corpo de texto mais longo (ex. um número/percentual em destaque).

Em slides de desenvolvimento do cartão de vidro, é comum uma quarta variação: **título em uma linha (branco) + linha de apoio separada, mais curta, em roxo-claro** — funciona como "afirmação + porquê", em vez de duas cláusulas dentro do mesmo bloco de título.

## Estrutura de um carrossel completo

1. **Capa/hook** (slide avulso, fundo claro ou escuro conforme o tema): a frase-tese completa ou a pergunta-gancho, ícone 3D grande, rótulo de série se houver, sem CTA ainda.
2. **3 a 8 slides de desenvolvimento** (cartão de vidro sobre fundo escuro predominante): um problema, dado ou objeção por slide, ícone 3D diferente a cada slide, rótulo de navegação no topo do fundo cru, barra utilitária + contador no rodapé do cartão.
3. **Slide de virada** ("A alternativa:", "O resultado?"): normalmente volta a um slide avulso de fundo claro, reforça a solução.
4. **Fechamento** (slide avulso): repete a frase da capa ou uma síntese, com CTA claro (pill) e logo `dati` centralizado ou no rodapé.

## Ao gerar um post novo

1. Use sempre o canvas 1080×1440 (3:4) — não 1080×1350.
2. Defina o gancho (hook) em uma frase curta e provocativa — vira a capa, como slide avulso full-bleed.
3. Quebre o argumento em um problema/ideia por slide — não acumule; cada slide de desenvolvimento usa o cartão de vidro com seu próprio ícone 3D.
4. Escolha a variante de ênfase tipográfica pela intenção do slide (ver seção acima), não sempre a mesma.
5. Alterne fundo escuro (maioria) com 1-2 slides claros para dar respiro visual.
6. Sempre inclua o rótulo de navegação em todo slide de desenvolvimento que não seja o primeiro ou o último — e mantenha-o **fora** do cartão de vidro, sobre o fundo cru.
7. Termine com CTA + logo, em slide avulso.
8. Ícones 3D só em redes sociais (ver biblioteca acima) — os ícones de linha em selo (chapados) são para decks, one-pagers e documentos.

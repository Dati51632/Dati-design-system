# Changelog

## 2026-09-16 — v1.2.0

Revisão feita a partir de um teste de overview dos 4 formatos do skill, complementado por uma releitura completa dos dois decks de referência já usados em `apresentacoes.md` (MAP e SeniorTec 2026) e por 14 posts reais adicionais (infraestrutura, segurança, custos AWS, produtividade com IA), além dos 16 da campanha "Série IA" original.

- **`docs/materiais/posts-redes-sociais.md`** (reescrito): corrigida a dimensão do canvas — 1080×1440 é proporção **3:4**, não 4:5 como a versão anterior dizia; documentadas as duas estruturas de slide (avulso full-bleed vs. "cartão de vidro"); documentada a barra utilitária + contador do cartão de vidro; documentadas 3 variantes confirmadas do padrão de ênfase tipográfica (antes só havia uma descrita); catalogados novos fundos decorativos (ribbon fluido, nuvem de tags desfocada, badge de status).
- **`docs/05-elementos-graficos.md`**: item 2 ("formas 3D glossy") reescrito como "biblioteca de ícones 3D" com a lista de conceitos confirmados (cadeado, relógio, chama, cifrão, escudo riscado, nuvem+coração, seta de vidro, moeda, argolas, cartão de crédito, sparkle) e a regra de dois tamanhos; adicionado o item 4, "cartão de vidro (glassmorphism)", recurso que não estava documentado; anotado que `--dati-gradient-cta` também é usado como fundo de slide inteiro em divisores de seção de apresentação, não só em banners pequenos. **Item 1 (crop do símbolo) e item 3 (ícones de linha em selo) não foram tocados** — já estavam na versão precisa/validada por pixel da revisão anterior.
- **`docs/materiais/apresentacoes.md`** (edição pontual, não reescrita — a versão atual já é uma spec muito mais precisa que o material desta revisão e foi preservada): adicionada a seção "Elementos adicionais confirmados" com 4 recursos que uma releitura integral de MAP e SeniorTec 2026 revelou não estarem descritos ainda (trio de cards de estatística, números-fantasma gigantes atrás de lista curta, faixa de parceiros em pills roxos, slide de equipe com fotos reais); adicionada uma nota ao "Slide de fechamento" sobre a escala menor do símbolo nesse slide (confirmado nos dois "Obrigado!" de referência).
- `docs/materiais/one-pagers-e-propostas.md` e `docs/materiais/documentos-internos.md` **não foram alterados** — nenhuma referência real nova de one-pager ou documento interno foi recebida neste lote.

Pendências para a próxima revisão:
- Nenhuma referência real de one-pager foi recebida ainda — `one-pagers-e-propostas.md` segue no padrão da v1.0.0.
- Um terceiro arquivo de apresentação (*AI Assessment — First Call Deck Dati*) foi citado no pedido mas não chegou a ser anexado; reenviar se quiserem incorporá-lo.
- `tokens/colors.json`/`colors.css` ainda não têm os tokens `purple-medium`, `purple-tint`, `purple-dark`, `purple-mid`, `purple-subtle`, `purple-pale`, `muted-footer` e `cover-gray` que a tabela de paleta de `apresentacoes.md` já referencia desde a revisão do MAP — vale sincronizar numa próxima passada para os arquivos não ficarem dessincronizados (ver regra em `README.md`).

## 2026-09-08 — v1.1.0

Correção do padrão de capa de apresentação, a partir de um print de referência real confirmado pelo time (capa "DataFrete Summit 2026") que a skill não estava reproduzindo corretamente.

- **Causa raiz corrigida**: o elemento gráfico grande da capa estava usando o lockup completo (`dati-logo-*.png`, com a palavra "dati") em vez do símbolo isolado. `docs/04-logo-e-simbolo.md` e `docs/05-elementos-graficos.md` agora têm uma regra explícita distinguindo os dois usos e listando esse erro.
- `docs/materiais/apresentacoes.md`: seção "Slide de capa" reescrita como uma especificação exata (tabela de elementos + percentuais de posição/escala + lista "erros a nunca repetir"), amostrada pixel a pixel da capa de referência — deixa de ser uma descrição solta e passa a ser um contrato fixo.
- Novo asset: `assets/logo/dati-logo-white.png` (lockup completo branco, para fundo escuro) — preenche a lacuna citada anteriormente em `04-logo-e-simbolo.md` ("solicite ao time... ainda não está neste pacote").
- Novos tokens em `tokens/colors.json` / `tokens/colors.css`: `textOnDarkSubtitle` (`#CFC9E6`) e `textOnDarkMuted` (`#9891AB`), as cores reais de subtítulo/rodapé sobre fundo escuro, amostradas da capa de referência.
- Slide de fechamento (`apresentacoes.md`) agora referencia explicitamente a mesma escala/posição de símbolo da capa.

## 2026-09-08 — v1.0.0
Criação inicial do design system a partir de:
- Guia de marca oficial Dati (Firmorama, 21 páginas).
- Fontes Manrope (7 pesos).
- Assets de logo/símbolo em 8 variantes de cor.
- 4 apresentações reais (DataFrete Summit, Vibe to Production, Proposta Comercial RolePlay, Além do EIXO).
- 16 posts reais da campanha "Série IA".
- 2 one-pagers reais (vertical e horizontal).

Estrutura: `tokens/` (cores, tipografia), `assets/` (logo, fontes), `docs/` (marca, cores, tipografia, logo, elementos gráficos, guias de material), `SKILL.md`, `README.md`.

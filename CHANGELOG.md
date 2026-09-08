# Changelog

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

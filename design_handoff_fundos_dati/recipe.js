// Dati — receita de fundos HTML (referência de implementação).
// Gera as camadas de fundo para qualquer combinação de modo × família × nível × layout × formato.
// Sem dependências. Saída: descritores de camada + helper toHTML() para uso direto.

export const ASSET_BASE = 'backgrounds'; // ajuste para o caminho real no repositório da skill

// Famílias de cor. Valores "r,g,b" — todos da paleta oficial (tokens/colors.css).
// g1 = glow principal [rgb, alpha base]; line = contorno/guias pendentes; a = cor ativa (guias construídas, indicador, barra).
//
// G10 RESOLVIDO: contornos de peças pendentes removidos — o guia de marca é referência primária.
//   Peças não construídas simplesmente não aparecem. Guias verticais permanecem.
//
// G11 FIXADO: escala do símbolo cravada:
//   Web — altura: 40/50/59/68% da tela. Posição: centro horizontal em 75%, centro vertical em 50%.
//   Mobile — largura: 52/64/76/88% (limitada a altura ≤ 50%). Posição: centralizado, base a 6% do rodapé.
//
// cianoVerde SUBSTITUÍDO por purplePale:
//   Usa --dati-purple-light (#8C7DFF = 140,125,255), token DS nativo.
//   Progressão DS-nativa: navy → ciano → purplePale → roxo.
export const FAM = {
  navy:        { label: 'Navy',         light: { g1: ['26,15,61',   .14], line: '26,15,61',   a: '26,15,61'   }, dark: { g1: ['183,176,203', .22], line: '183,176,203', a: '183,176,203' } },
  ciano:       { label: 'Ciano',        light: { g1: ['91,190,237', .45], line: '94,160,224', a: '91,190,237' }, dark: { g1: ['91,190,237',  .34], line: '91,190,237',  a: '91,190,237'  } },
  purplePale:  { label: 'Purple Pale',  light: { g1: ['140,125,255',.35], line: '140,125,255',a: '140,125,255'}, dark: { g1: ['140,125,255', .55], line: '140,125,255', a: '140,125,255' } },
  roxo:        { label: 'Roxo',         light: { g1: ['104,56,232', .30], line: '104,56,232', a: '104,56,232' }, dark: { g1: ['104,56,232',  .62], line: '140,125,255', a: '104,56,232'  } },
};

// Mapeamento Labs (certificações AWS). Sem logos/ícones AWS.
export const LABS_LEVELS = [
  { n: 1, name: 'Foundational', fam: 'navy'       },
  { n: 2, name: 'Associate',    fam: 'ciano'      },
  { n: 3, name: 'Professional', fam: 'purplePale' },
  { n: 4, name: 'Specialty',    fam: 'roxo'       },
];

const PIECE_FILES = ['piece-1-quadrado-a', 'piece-2-quadrado-b', 'piece-3-seta-roxo', 'piece-4-seta-ciano'];
const GUIDE_X     = [.047, .339, .561, .958];        // borda esquerda de cada peça, em fração da caixa do símbolo
const GLOW_K      = { 1: .5, 2: .75, 3: 1, 4: 1.25 };
// G11 — padrão fixado:
const WEB_H       = { 1: 40, 2: 50, 3: 59, 4: 68 }; // altura do símbolo (% da altura da tela) na web
const MOB_W       = { 1: 52, 2: 64, 3: 76, 4: 88 }; // largura do símbolo (% da largura da tela) no mobile
const DEFAULT_PIECES = { 1: 0, 2: 2, 3: 3, 4: 4 };
// G5 — textura: assets SVG do handoff usados como padrão (strokes em cores DS: #1A0F3D claro / #CFC9E6 escuro)
const GRID = { 1: 52, 2: 52, 3: 36, 4: 36 };

const rgba = (rgb, a) => `rgba(${rgb},${a})`;
const f2   = n => +n.toFixed(2);

/**
 * @param {object} p
 * @param {'light'|'dark'} p.mode        OBRIGATÓRIO — vem da pergunta ao usuário. Sem default.
 * @param {keyof FAM} p.family
 * @param {1|2|3|4} p.level
 * @param {'cover'|'quiz'} [p.layout]
 * @param {number} [p.pieces]            0–4 peças sólidas (default por nível; quiz = 0)
 * @param {{w:number,h:number}} p.viewport
 */
export function recipe({ mode, family, level, layout = 'cover', pieces = null, viewport }) {
  if (mode !== 'light' && mode !== 'dark') throw new Error('mode é obrigatório: pergunte ao usuário antes de gerar.');
  const d = mode === 'dark', f = FAM[family][mode], quiz = layout === 'quiz';
  const r = viewport.w / viewport.h;
  const mobile = viewport.w < 768 || r < 1;
  const n = quiz ? 0 : (pieces ?? DEFAULT_PIECES[level]);

  // Geometria do símbolo — G11 fixado
  const sw = mobile ? Math.min(MOB_W[level], 50 / r) : 0;
  const h  = mobile ? sw * r : WEB_H[level];
  const w  = mobile ? sw : h / r;
  const l  = f2(mobile ? 50 - w / 2 : 75 - w / 2);
  const t  = f2(mobile ? 94 - h     : 50 - h / 2);
  const cx = f2(l + w / 2), cy = f2(t + h / 2);

  // Base
  const base = d
    ? (level === 4 ? 'linear-gradient(135deg,#0D0824 0%,#1A0F3D 55%,#2B1B5C 100%)'
      : level === 3 ? 'linear-gradient(135deg,#060115 0%,#0D0824 50%,#1A0F3D 100%)' : '#060115')
    : 'radial-gradient(ellipse 70% 90% at 55% 45%,#FFFFFF 0%,#E3E3E3 100%)';

  // Glow
  const k = GLOW_K[level];
  const glow = !d
    ? `radial-gradient(ellipse 34% 52% at 100% 100%,${rgba(f.g1[0], Math.min(.5, .22 + .06 * level))} 0%,${rgba(f.g1[0], 0)} 70%)`
    : quiz
      ? `radial-gradient(ellipse 48% 58% at 50% 45%,${rgba(f.g1[0], Math.min(.9, f.g1[1] * k))} 0%,${rgba(f.g1[0], 0)} 72%)`
      : `radial-gradient(ellipse ${mobile ? f2(w * .75) : 18 + level * 6}% ${mobile ? f2(h * .8) : 36 + level * 9}% at ${cx}% ${cy}%,${rgba(f.g1[0], Math.min(.9, f.g1[1] * k))} 0%,${rgba(f.g1[0], 0)} 70%)`;

  // Textura — G5: assets DS (grid-{36,52}-{light,dark}.svg)
  // G2 RESOLVIDO: textura usa sempre o modo 'light' no miolo — aqui é só fundo de hero/cover.
  const texture = quiz ? null : {
    image:    `url(${ASSET_BASE}/patterns/grid-${GRID[level]}-${mode}.svg)`,
    position: 'right bottom', opacity: d ? .5 : .35,
    mask:     `radial-gradient(ellipse ${mobile ? '55% 30%' : '30% 50%'} at 100% 100%,#000 0%,rgba(0,0,0,0) 100%)`,
  };

  const geo = { left: l, top: t, height: h };

  // G10 RESOLVIDO: apenas peças sólidas — sem contornos de peças pendentes.
  const symbolSolid = PIECE_FILES.slice(0, n).map(p => ({ ...geo, image: `url(${ASSET_BASE}/symbol-build/pieces/${p}.png)` }));

  // Guias verticais: dois segmentos (acima e abaixo do símbolo)
  const gTop = t - 2, gBot = t + h + 2, startY = mobile ? 40 : 0;
  const guides = quiz ? [] : GUIDE_X.map((x, i) => {
    const built = i < n;
    return {
      left: f2(l + w * x), style: built ? 'solid' : 'dashed',
      color: rgba(built ? f.a : f.line, built ? (d ? .55 : .6) : (d ? .16 : .22)),
      segments: [
        { top: startY,    height: Math.max(0, gTop - 2 - startY) },
        { top: gBot + 2,  height: Math.max(0, 98 - gBot) },
      ],
    };
  });

  return {
    mobile, mode, family, level, layout,
    background: [glow, base].join(','),
    texture, symbolSolid, guides,
    accent: { level: rgba(f.a, 1) },
    text: d
      ? { ink: '#FFFFFF', sub: '#CFC9E6', muted: '#9891AB', emphasis: '#8C7DFF' }
      : { ink: '#1A0F3D', sub: '#5B5570', muted: '#77718A', emphasis: '#6838E8' },
    safeArea: mobile
      ? { left: '9%', right: '9%', top: '7%', maxBottom: '40%' }
      : { left: '7%', width: '46%', align: 'center' },
  };
}

/** Helper: devolve o HTML das camadas de fundo. */
export function toHTML(rc) {
  const abs = 'position:absolute;';
  const sq  = s => `${abs}left:${s.left}%;top:${s.top}%;height:${s.height}%;aspect-ratio:1;background:${s.image} center/100% 100% no-repeat;`;
  let out = `<div aria-hidden="true" style="${abs}inset:0;background:${rc.background};overflow:hidden;pointer-events:none">`;
  if (rc.texture) out += `<div style="${abs}inset:0;background-image:${rc.texture.image};background-position:${rc.texture.position};opacity:${rc.texture.opacity};-webkit-mask-image:${rc.texture.mask};mask-image:${rc.texture.mask}"></div>`;
  for (const g of rc.guides) for (const s of g.segments) out += `<div style="${abs}left:${g.left}%;top:${s.top}%;height:${s.height}%;border-left:1px ${g.style} ${g.color}"></div>`;
  for (const s of rc.symbolSolid) out += `<div style="${sq(s)}"></div>`;
  return out + '</div>';
}

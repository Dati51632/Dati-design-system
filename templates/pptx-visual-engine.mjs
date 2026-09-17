/**
 * PPTX VISUAL ENGINE — DATI  (v2 — redesign completo)
 * ─────────────────────────────────────────────────────────────────────────────
 * Gera slides PPTX a partir de XML puro, sem depender do MAP.pptx.
 * Gradientes reais (nunca cores sólidas onde o design system pede gradiente).
 * Ícones semânticos via preset geometries PPTX.
 * Layouts variados — nunca repete o mesmo template em sequência.
 *
 * Tipos: cards, lista-icone, diagrama-fluxo, grid-icone,
 *        pipeline, comparacao, timeline, kpi, tres-pilares
 */

// ─── Constantes de layout (EMU — 1 inch = 914400) ────────────────────────────

const W          = 12192000;   // slide width
const H          = 6858000;    // slide height
const ML         = 457200;     // margin left/right
const CONTENT_W  = W - 2 * ML; // 11277600
const EYEBROW_Y  = 380000;
const TITLE_Y    = 820000;
const CONTENT_Y  = 1750000;    // content starts after header
const FOOTER_Y   = 6267450;

// ─── Paleta de cores ──────────────────────────────────────────────────────────

const C = {
  navy:           "1A0F3D",
  purple:         "6838E8",
  purpleEmphasis: "8F65FE",
  purpleMid:      "6F62FF",
  purpleDark:     "3629D1",
  purpleDarker:   "3503BB",
  purpleDeep:     "240872",
  purpleSubtle:   "655CC6",
  purplePale:     "E8E1FF",
  purpleBorder:   "D4CEF0",
  purpleGhost:    "6838E8",    // used with alpha for ghost elements
  cyan:           "5BBEED",
  green:          "A4DF64",
  orange:         "F59D01",
  white:          "FFFFFF",
  bgLight:        "EDF0F2",
  textMuted:      "5B5570",
  footerMuted:    "9891AB",
  darkCard:       "261752",
  darkNavy:       "0D0824",
  navyMid:        "2B1B5C",
};

// ─── Presets de gradiente (stops = [[pos0-100, hex], ...], ang = 60000ths/deg) ─
// ang=10800000 → 180° → top-to-bottom
// ang=8100000  → 135° → top-left to bottom-right
// ang=5400000  → 90°  → left-to-right

const GRAD = {
  sidebar:  { stops: [[0, "6F62FF"], [100, "3629D1"]], ang: 10800000 },
  purple:   { stops: [[0, "6F62FF"], [100, "3629D1"]], ang: 10800000 },
  impact:   { stops: [[0, "6838E8"], [100, "3503BB"]], ang: 10800000 },
  badge:    { stops: [[0, "8F65FE"], [100, "4B1FD4"]], ang: 8100000  },
  cyan:     { stops: [[0, "4AACED"], [100, "1E7AAD"]], ang: 10800000 },
  green:    { stops: [[0, "6DB038"], [100, "3A6E1A"]], ang: 10800000 },
  orange:   { stops: [[0, "D88800"], [100, "9B5500"]], ang: 10800000 },
  navy:     { stops: [[0, "261752"], [100, "0D0824"]], ang: 10800000 },
  heroDark: { stops: [[0, "0D0824"], [55, "1A0F3D"], [100, "2B1B5C"]], ang: 8100000 },
};

// cor semântica → preset de gradiente + cor de texto
const COLOR_NODE = {
  purple: { grad: GRAD.purple, text: C.white, sub: "D4CEF0" },
  cyan:   { grad: GRAD.cyan,   text: C.white, sub: "C8E8F5" },
  green:  { grad: GRAD.green,  text: C.white, sub: "C0E8A0" },
  orange: { grad: GRAD.orange, text: C.white, sub: "F5D5A0" },
  navy:   { grad: GRAD.navy,   text: C.white, sub: "9891AB" },
};

// ─── Mapa de ícones (nome → PPTX preset geometry) ────────────────────────────

const ICON_MAP = {
  gear:      "gear6",
  lightning: "lightningBolt",
  layers:    "cube",
  loop:      "uturnArrow",
  code:      "bracketPair",
  database:  "can",
  shield:    "pentagon",
  diff:      "mathNotEqual",
  check:     "flowChartPreparation",
  audit:     "ribbon",
  arrow:     "rightArrow",
  star:      "star5",
  diamond:   "flowChartDecision",
  cloud:     "cloud",
  funnel:    "funnel",
  merge:     "flowChartMerge",
  branch:    "curvedRightArrow",
  lock:      "flowChartProcess",
  chart:     "star4",
  default:   "star5",
};

// Cores de acento que ciclam (para cards e grids)
const ACCENT_GRADS = [GRAD.purple, GRAD.cyan, GRAD.green, GRAD.orange];

// ─── ID counter ────────────────────────────────────────────────────────────────

let _shapeId = 2;
function nextId()   { return _shapeId++; }
function resetIds() { _shapeId = 2; }

// ─── Escape XML ───────────────────────────────────────────────────────────────

function xe(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Construtores de forma ───────────────────────────────────────────────────

/**
 * Shape retangular/geométrico.
 * opts: { fill, noFill, gradStops, gradAngle, fillAlpha,
 *         border, geom, roundAdj, id, name }
 */
function sp(x, y, cx, cy, opts = {}) {
  const {
    fill = null, noFill = false, gradStops = null, gradAngle = 10800000, fillAlpha = null,
    border = null, geom = "rect", roundAdj = 20000, id = null, name = null,
  } = opts;
  const sid   = id   ?? nextId();
  const sname = name ?? `s${sid}`;

  // Fill XML
  let fillXml;
  if (noFill) {
    fillXml = "<a:noFill/>";
  } else if (gradStops) {
    const stopsXml = gradStops.map(([pos, color]) =>
      `<a:gs pos="${Math.round(pos * 1000)}"><a:srgbClr val="${color}"/></a:gs>`
    ).join("");
    fillXml = `<a:gradFill><a:gsLst>${stopsXml}</a:gsLst><a:lin ang="${gradAngle}" scaled="0"/></a:gradFill>`;
  } else if (fill) {
    if (fillAlpha !== null) {
      fillXml = `<a:solidFill><a:srgbClr val="${fill}"><a:alpha val="${fillAlpha}"/></a:srgbClr></a:solidFill>`;
    } else {
      fillXml = `<a:solidFill><a:srgbClr val="${fill}"/></a:solidFill>`;
    }
  } else {
    fillXml = "<a:noFill/>";
  }

  // Border XML
  const borderXml = border
    ? `<a:ln w="${border.w ?? 9525}"><a:solidFill><a:srgbClr val="${border.color}"/></a:solidFill></a:ln>`
    : "<a:ln><a:noFill/></a:ln>";

  // Geom XML
  let geomXml;
  if (geom === "roundRect") {
    geomXml = `<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val ${roundAdj}"/></a:avLst></a:prstGeom>`;
  } else if (geom === "ellipse") {
    geomXml = `<a:prstGeom prst="ellipse"><a:avLst/></a:prstGeom>`;
  } else if (geom === "rect") {
    geomXml = `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>`;
  } else {
    // Any other PPTX preset geometry name
    geomXml = `<a:prstGeom prst="${geom}"><a:avLst/></a:prstGeom>`;
  }

  return `<p:sp>
  <p:nvSpPr><p:cNvPr id="${sid}" name="${sname}"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
    ${geomXml}
    ${fillXml}
    ${borderXml}
  </p:spPr>
</p:sp>`;
}

/**
 * Text shape
 * runsOrXml: array de runs { text, bold, sz, color, alpha } ou XML string
 * multiPara: true → runsOrXml já é um conjunto de <a:p>
 */
function tsp(x, y, cx, cy, runsOrXml, opts = {}) {
  const {
    fill       = null,
    noFill     = true,
    anchor     = "t",
    algn       = "l",
    bold       = false,
    sz         = 1200,
    color      = C.navy,
    wrap       = "square",
    lIns       = 91440,
    rIns       = 91440,
    tIns       = 0,
    bIns       = 0,
    id         = null,
    name       = null,
    multiPara  = false,
  } = opts;

  const sid   = id   ?? nextId();
  const sname = name ?? `t${sid}`;
  const fillXml = fill ? `<a:solidFill><a:srgbClr val="${fill}"/></a:solidFill>` : "<a:noFill/>";

  let runsXml;
  if (typeof runsOrXml === "string") {
    runsXml = runsOrXml;
  } else if (Array.isArray(runsOrXml)) {
    runsXml = runsOrXml.map(r => run(r.text, {
      bold:  r.bold  ?? bold,
      sz:    r.sz    ?? sz,
      color: r.color ?? color,
      alpha: r.alpha ?? null,
    })).join("");
  } else {
    runsXml = "";
  }

  const paraXml = multiPara
    ? runsXml
    : `<a:p><a:pPr algn="${algn}"><a:buNone/></a:pPr>${runsXml}</a:p>`;

  return `<p:sp>
  <p:nvSpPr><p:cNvPr id="${sid}" name="${sname}"/><p:cNvSpPr txSp="1"><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
    ${fillXml}
    <a:ln><a:noFill/></a:ln>
  </p:spPr>
  <p:txBody>
    <a:bodyPr anchor="${anchor}" lIns="${lIns}" rIns="${rIns}" tIns="${tIns}" bIns="${bIns}" wrap="${wrap}"><a:normAutofit/></a:bodyPr>
    <a:lstStyle/>
    ${paraXml}
  </p:txBody>
</p:sp>`;
}

/**
 * Single text run com suporte a alpha.
 */
function run(text, { bold = false, sz = 1200, color = C.navy, italic = false, alpha = null } = {}) {
  const b = bold ? "1" : "0";
  const i = italic ? "1" : "0";
  const colorInner = alpha !== null
    ? `<a:srgbClr val="${color}"><a:alpha val="${alpha}"/></a:srgbClr>`
    : `<a:srgbClr val="${color}"/>`;
  return `<a:r><a:rPr b="${b}" i="${i}" lang="pt-BR" sz="${sz}" u="none" dirty="0"><a:solidFill>${colorInner}</a:solidFill><a:latin typeface="Manrope"/></a:rPr><a:t>${xe(text)}</a:t></a:r>`;
}

/**
 * Constrói runs de título a partir de string ou array [{text, emphasis}].
 */
function titleRuns(titulo, { sz = 3000, baseColor = C.navy, emphColor = C.purpleEmphasis, bold = true } = {}) {
  if (typeof titulo === "string") return run(titulo, { bold, sz, color: baseColor });
  if (Array.isArray(titulo)) {
    return titulo.map(t => run(t.text, { bold, sz, color: t.emphasis ? emphColor : baseColor })).join("");
  }
  return "";
}

// ─── Ícone badge: círculo gradiente + preset icon branco dentro ───────────────

/**
 * Retorna array de shapes XML formando um "badge com ícone".
 * gradKey: chave em GRAD
 */
function iconBadge(x, y, size, iconName, gradKey = "badge") {
  const shapes = [];
  const g      = GRAD[gradKey] || GRAD.badge;
  const preset = ICON_MAP[iconName] || ICON_MAP.default;
  const pad    = Math.round(size * 0.22);
  const iSize  = size - 2 * pad;

  // Fundo circular com gradiente
  shapes.push(sp(x, y, size, size, {
    gradStops: g.stops,
    gradAngle: g.ang,
    geom: "ellipse",
  }));

  // Ícone preset branco centrado
  shapes.push(sp(x + pad, y + pad, iSize, iSize, {
    fill: C.white,
    geom: preset,
  }));

  return shapes;
}

// ─── Cabeçalho padrão (eyebrow + título + rodapé) ────────────────────────────

function headerShapes(eyebrow, titulo, ctx, { dark = false } = {}) {
  const eyebrowColor = dark ? "8C7DFF" : C.purpleEmphasis;
  const titleColor   = dark ? C.white  : C.navy;
  const footerColor  = dark ? C.footerMuted : C.footerMuted;
  const shapes = [];

  if (eyebrow) {
    shapes.push(tsp(ML, EYEBROW_Y, CONTENT_W, 300000,
      run(String(eyebrow).toUpperCase(), { bold: true, sz: 1000, color: eyebrowColor }),
      { anchor: "t", algn: "l" }
    ));
  }
  if (titulo) {
    const baseCol  = dark ? C.white : C.navy;
    const emphCol  = dark ? "8C7DFF" : C.purpleEmphasis;
    const runsXml  = titleRuns(titulo, { sz: 3000, bold: true, baseColor: baseCol, emphColor: emphCol });
    shapes.push(tsp(ML, TITLE_Y, CONTENT_W, 750000, runsXml, { anchor: "t", algn: "l" }));
  }
  if (ctx.deckName) {
    shapes.push(tsp(ML, FOOTER_Y, CONTENT_W / 2, 220000,
      run(ctx.deckName, { sz: 900, color: footerColor }),
      { anchor: "t", algn: "l" }
    ));
  }
  if (ctx.pageNum) {
    shapes.push(tsp(ML + CONTENT_W / 2, FOOTER_Y, CONTENT_W / 2, 220000,
      run(String(ctx.pageNum).padStart(2, "0"), { sz: 900, color: footerColor }),
      { anchor: "t", algn: "r" }
    ));
  }
  return shapes.join("\n");
}

// ─── Wrapper do slide ─────────────────────────────────────────────────────────

function wrapSlide(shapesXml, { dark = false, bgFill = null } = {}) {
  let bg;
  if (bgFill) {
    bg = bgFill;
  } else if (dark) {
    // Gradiente heroDark: 3 stops, diagonal 135°
    bg = `<a:gradFill><a:gsLst>
      <a:gs pos="0"><a:srgbClr val="${C.darkNavy}"/></a:gs>
      <a:gs pos="55000"><a:srgbClr val="${C.navy}"/></a:gs>
      <a:gs pos="100000"><a:srgbClr val="${C.navyMid}"/></a:gs>
    </a:gsLst><a:lin ang="8100000" scaled="0"/></a:gradFill>`;
  } else {
    bg = `<a:solidFill><a:srgbClr val="${C.bgLight}"/></a:solidFill>`;
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr>${bg}<a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${W}" cy="${H}"/><a:chOff x="0" y="0"/><a:chExt cx="${W}" cy="${H}"/></a:xfrm></p:grpSpPr>
      ${shapesXml}
    </p:spTree>
  </p:cSld>
</p:sld>`;
}

// ─── Rels padrão ──────────────────────────────────────────────────────────────

const RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout3.xml"/>
</Relationships>`;

// ═══════════════════════════════════════════════════════════════════════════════
// RENDERERS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── CARDS ────────────────────────────────────────────────────────────────────
/**
 * 2–4 cards horizontais.
 * Cada card: badge gradiente + ícone preset + número ghost atrás + título + descrição.
 * NÃO usa barras coloridas sólidas na parte superior.
 */
function renderCards(s, ctx) {
  resetIds();
  const cards = Array.isArray(s.cards) ? s.cards : [];
  const n     = Math.max(2, Math.min(4, cards.length));
  const gap   = 220000;
  const cardW = Math.floor((CONTENT_W - (n - 1) * gap) / n);
  const cardH = FOOTER_Y - CONTENT_Y - 280000;
  const pad   = 180000;
  const badgeSz = 340000;

  const shapes = [headerShapes(s.eyebrow, s.titulo, ctx)];

  // Barra lateral esquerda gradiente (sidebar do slide)
  shapes.push(sp(0, 0, 380000, H, {
    gradStops: GRAD.sidebar.stops,
    gradAngle: GRAD.sidebar.ang,
  }));

  for (let i = 0; i < n; i++) {
    const card   = cards[i] || {};
    const x      = ML + i * (cardW + gap);
    const y      = CONTENT_Y;
    const aGrad  = ACCENT_GRADS[i % ACCENT_GRADS.length];

    // Ghost number no fundo do card (grande, 3% opacidade)
    shapes.push(tsp(x, y + cardH * 0.35, cardW, cardH * 0.6,
      run(String(i + 1), { bold: true, sz: 16000, color: C.purpleGhost, alpha: 3500 }),
      { anchor: "ctr", algn: "ctr" }
    ));

    // Fundo do card: branco com borda sutil
    shapes.push(sp(x, y, cardW, cardH, {
      fill: C.white,
      border: { color: C.purpleBorder, w: 9525 },
      geom: "roundRect",
      roundAdj: 10000,
    }));

    // Acento fino na esquerda do card (gradiente)
    shapes.push(sp(x, y, 120000, cardH, {
      gradStops: aGrad.stops,
      gradAngle: aGrad.ang,
      geom: "rect",
    }));

    // Badge com ícone
    const badgeX = x + 120000 + pad;
    const badgeY = y + pad;
    const iconKey = card.icone || "default";
    // Escolhe gradiente para o badge baseado na posição
    const badgeGradKey = ["badge", "cyan", "green", "orange"][i % 4];
    shapes.push(...iconBadge(badgeX, badgeY, badgeSz, iconKey, badgeGradKey));

    // Título do card
    const titleY = badgeY + badgeSz + 90000;
    const innerX = x + 120000 + pad;
    const innerW = cardW - 120000 - 2 * pad;
    shapes.push(tsp(innerX, titleY, innerW, 380000,
      run(card.titulo || "", { bold: true, sz: 1400, color: C.navy }),
      { anchor: "t", algn: "l", wrap: "square" }
    ));

    // Descrição
    const descY = titleY + 400000;
    const descH = cardH - (descY - y) - pad;
    shapes.push(tsp(innerX, descY, innerW, descH,
      run(card.descricao || "", { sz: 1100, color: C.textMuted }),
      { anchor: "t", algn: "l", wrap: "square" }
    ));
  }

  return wrapSlide(shapes.join("\n"));
}

// ─── LISTA-ICONE ──────────────────────────────────────────────────────────────
/**
 * Lista de 3–5 itens em linhas horizontais.
 * Sidebar gradiente completo à esquerda.
 * Cada item: ícone badge + título bold + descrição + ghost number atrás.
 */
function renderListaIcone(s, ctx) {
  resetIds();
  const items  = Array.isArray(s.items) ? s.items : [];
  const n      = Math.max(2, Math.min(5, items.length));
  const sideW  = 500000;
  const sideGap = 180000;
  const contentX = ML + sideW + sideGap;
  const contentAvail = W - contentX - ML;
  const badgeSz = 320000;
  const badgeGap = 180000;
  const textX  = contentX + badgeSz + badgeGap;
  const textW  = contentAvail - badgeSz - badgeGap;

  const totalH = FOOTER_Y - CONTENT_Y - 220000;
  const rowH   = Math.floor(totalH / n);

  const shapes = [headerShapes(s.eyebrow, s.titulo, ctx)];

  // Sidebar gradiente completo
  shapes.push(sp(0, 0, sideW, H, {
    gradStops: GRAD.sidebar.stops,
    gradAngle: GRAD.sidebar.ang,
  }));

  for (let i = 0; i < n; i++) {
    const item  = items[i] || {};
    const rowY  = CONTENT_Y + i * rowH;
    const midY  = rowY + Math.floor((rowH - badgeSz) / 2);

    // Ghost número atrás da linha (direita, muito transparente)
    shapes.push(tsp(W - ML - 900000, rowY, 900000, rowH,
      run(String(i + 1), { bold: true, sz: 14000, color: C.purpleGhost, alpha: 3000 }),
      { anchor: "ctr", algn: "r" }
    ));

    // Linha divisória sutil (exceto última)
    if (i > 0) {
      shapes.push(sp(contentX, rowY, contentAvail, 9525, {
        fill: C.purpleBorder, fillAlpha: 40000,
      }));
    }

    // Badge com ícone
    const gradKeys = ["badge", "cyan", "green", "orange", "badge"];
    shapes.push(...iconBadge(contentX, midY, badgeSz, item.icone || "default", gradKeys[i % gradKeys.length]));

    // Título
    shapes.push(tsp(textX, rowY + Math.floor(rowH * 0.12), textW, Math.floor(rowH * 0.4),
      run(item.titulo || "", { bold: true, sz: 1600, color: C.navy }),
      { anchor: "t", algn: "l" }
    ));

    // Descrição
    shapes.push(tsp(textX, rowY + Math.floor(rowH * 0.47), textW, Math.floor(rowH * 0.45),
      run(item.descricao || "", { sz: 1200, color: C.textMuted }),
      { anchor: "t", algn: "l", wrap: "square" }
    ));
  }

  return wrapSlide(shapes.join("\n"));
}

// ─── GRID-ICONE ───────────────────────────────────────────────────────────────
/**
 * Grade 2×2 de itens — diferente de "cards" horizontal.
 * Cada célula: área de ícone com gradiente (topo) + título + descrição (baixo).
 */
function renderGridIcone(s, ctx) {
  resetIds();
  const items = Array.isArray(s.items) ? s.items.slice(0, 4) : [];
  const cols  = 2;
  const rows  = 2;
  const gap   = 220000;
  const cellW = Math.floor((CONTENT_W - gap) / cols);
  const cellH = Math.floor((FOOTER_Y - CONTENT_Y - gap - 220000) / rows);
  const iconAreaH = Math.floor(cellH * 0.42);
  const pad   = 160000;

  const CELL_GRADS = [GRAD.purple, GRAD.cyan, GRAD.green, GRAD.orange];

  const shapes = [headerShapes(s.eyebrow, s.titulo, ctx)];

  for (let i = 0; i < 4; i++) {
    const item   = items[i] || {};
    const col    = i % cols;
    const row    = Math.floor(i / cols);
    const x      = ML + col * (cellW + gap);
    const y      = CONTENT_Y + row * (cellH + gap);
    const aGrad  = CELL_GRADS[i % CELL_GRADS.length];

    // Fundo da célula (branco com borda)
    shapes.push(sp(x, y, cellW, cellH, {
      fill: C.white,
      border: { color: C.purpleBorder, w: 9525 },
      geom: "roundRect",
      roundAdj: 10000,
    }));

    // Área de ícone (gradiente, canto superior arredondado – usamos rect; roundRect não afeta partes)
    shapes.push(sp(x, y, cellW, iconAreaH, {
      gradStops: aGrad.stops,
      gradAngle: aGrad.ang,
      geom: "rect",
    }));

    // Ícone centrado na área gradiente
    const iconSz  = Math.floor(iconAreaH * 0.55);
    const iconX   = x + Math.floor((cellW - iconSz) / 2);
    const iconY   = y + Math.floor((iconAreaH - iconSz) / 2);
    shapes.push(sp(iconX, iconY, iconSz, iconSz, {
      fill: C.white,
      geom: ICON_MAP[item.icone] || ICON_MAP.default,
    }));

    // Título
    shapes.push(tsp(x + pad, y + iconAreaH + pad, cellW - 2 * pad, 380000,
      run(item.titulo || "", { bold: true, sz: 1500, color: C.navy }),
      { anchor: "t", algn: "l", wrap: "square" }
    ));

    // Descrição
    const descY = y + iconAreaH + pad + 390000;
    const descH = cellH - iconAreaH - pad - 390000 - 80000;
    shapes.push(tsp(x + pad, descY, cellW - 2 * pad, descH,
      run(item.descricao || "", { sz: 1100, color: C.textMuted }),
      { anchor: "t", algn: "l", wrap: "square" }
    ));
  }

  return wrapSlide(shapes.join("\n"));
}

// ─── DIAGRAMA-FLUXO ───────────────────────────────────────────────────────────
/**
 * Diagrama em camadas verticais.
 * "camadas": array de { nos: [{ label, sublabel, cor, destaque }] }
 * Suporta convergência 2→1 com conector em Y.
 */
function renderDiagramaFluxo(s, ctx) {
  resetIds();
  const camadas = Array.isArray(s.camadas) ? s.camadas : [];
  const N       = camadas.length;
  if (N === 0) return wrapSlide(headerShapes(s.eyebrow, s.titulo, ctx));

  const shapes = [headerShapes(s.eyebrow, s.titulo, ctx)];

  // Layout vertical
  const totalH  = FOOTER_Y - CONTENT_Y - 300000;
  const wireGap = 260000;   // espaço entre camadas (para conectores)
  const nodeHTotal = totalH - (N - 1) * wireGap;
  const nodeH   = Math.floor(nodeHTotal / N);
  const nodeGap = 220000;   // gap horizontal entre nós da mesma camada
  const wireW   = 28000;
  const wireColor = C.purpleBorder;

  let currentY = CONTENT_Y;

  for (let i = 0; i < N; i++) {
    const camada  = camadas[i];
    const nos     = Array.isArray(camada.nos) ? camada.nos : [];
    const nNos    = nos.length;
    const boxW    = nNos === 1
      ? CONTENT_W
      : Math.floor((CONTENT_W - (nNos - 1) * nodeGap) / nNos);

    // Desenha cada nó da camada
    for (let j = 0; j < nNos; j++) {
      const no   = nos[j];
      const nodeX = ML + j * (boxW + nodeGap);
      const nodeY = currentY;
      const node  = COLOR_NODE[no.cor] || COLOR_NODE.purple;

      // Box com gradiente
      shapes.push(sp(nodeX, nodeY, boxW, nodeH, {
        gradStops: node.grad.stops,
        gradAngle: node.grad.ang,
        geom: "roundRect",
        roundAdj: 8000,
        border: no.destaque ? { color: "FFD700", w: 57150 } : null,
      }));

      // Etiqueta label
      const splitH = no.sublabel ? Math.floor(nodeH * 0.52) : nodeH;
      shapes.push(tsp(nodeX, nodeY, boxW, splitH,
        run(no.label || "", { bold: true, sz: 1600, color: node.text }),
        { anchor: "b", algn: "ctr", bIns: 60000 }
      ));

      // Sublabel
      if (no.sublabel) {
        shapes.push(tsp(nodeX, nodeY + splitH, boxW, nodeH - splitH,
          run(no.sublabel, { sz: 1000, color: node.sub }),
          { anchor: "t", algn: "ctr", tIns: 60000, lIns: 120000, rIns: 120000 }
        ));
      }
    }

    // Conector para próxima camada
    if (i < N - 1) {
      const nextCamada = camadas[i + 1];
      const nextNos    = Array.isArray(nextCamada.nos) ? nextCamada.nos : [];
      const nextNNos   = nextNos.length;
      const nextBoxW   = nextNNos === 1
        ? CONTENT_W
        : Math.floor((CONTENT_W - (nextNNos - 1) * nodeGap) / nextNNos);

      const wireStartY = currentY + nodeH;
      const wireEndY   = wireStartY + wireGap;

      if (nNos === 2 && nextNNos === 1) {
        // Convergência Y: dois fios verticais → horizontal → um fio central
        const lCenterX = ML + Math.floor(boxW / 2);
        const rCenterX = ML + boxW + nodeGap + Math.floor(boxW / 2);
        const midY     = Math.floor((wireStartY + wireEndY) / 2);
        const hLineX   = Math.min(lCenterX, rCenterX) - wireW;
        const hLineW   = Math.abs(rCenterX - lCenterX) + 2 * wireW;
        const centerX  = ML + Math.floor(CONTENT_W / 2);

        // Fio esq. vertical
        shapes.push(sp(lCenterX - wireW, wireStartY, wireW * 2, midY - wireStartY, { fill: wireColor }));
        // Fio dir. vertical
        shapes.push(sp(rCenterX - wireW, wireStartY, wireW * 2, midY - wireStartY, { fill: wireColor }));
        // Fio horizontal
        shapes.push(sp(hLineX, midY - wireW, hLineW, wireW * 2, { fill: wireColor }));
        // Fio central para baixo
        shapes.push(sp(centerX - wireW, midY, wireW * 2, wireEndY - midY, { fill: wireColor }));
        // Pontinha ▼
        shapes.push(tsp(centerX - 180000, wireEndY - 200000, 360000, 220000,
          run("▼", { sz: 900, color: wireColor }), { anchor: "ctr", algn: "ctr" }
        ));

      } else {
        // Fios simples de cada nó para baixo
        for (let j = 0; j < nNos; j++) {
          const cx = ML + j * (boxW + nodeGap) + Math.floor(boxW / 2);
          shapes.push(sp(cx - wireW, wireStartY, wireW * 2, wireGap, { fill: wireColor }));
          shapes.push(tsp(cx - 180000, wireStartY + wireGap - 200000, 360000, 220000,
            run("▼", { sz: 900, color: wireColor }), { anchor: "ctr", algn: "ctr" }
          ));
        }
      }
    }

    currentY += nodeH + wireGap;
  }

  return wrapSlide(shapes.join("\n"));
}

// ─── PIPELINE ─────────────────────────────────────────────────────────────────
/**
 * Etapas sequenciais com gradiente por tipo.
 * gate:true → destaque laranja. Última etapa → roxo escuro.
 */
function renderPipeline(s, ctx) {
  resetIds();
  const steps  = Array.isArray(s.steps) ? s.steps : [];
  const n      = Math.max(1, Math.min(6, steps.length));
  const arrowW = 220000;
  const boxH   = 420000;
  const boxW   = Math.floor((CONTENT_W - (n - 1) * arrowW) / n);
  const boxY   = CONTENT_Y + Math.floor((FOOTER_Y - CONTENT_Y - boxH - 600000) / 2);
  const descH  = 280000;
  const descGap = 80000;

  const shapes = [headerShapes(s.eyebrow, s.titulo, ctx)];

  // Barra lateral gradiente
  shapes.push(sp(0, 0, 380000, H, {
    gradStops: GRAD.sidebar.stops,
    gradAngle: GRAD.sidebar.ang,
  }));

  // Linha de progresso (fundo)
  shapes.push(sp(ML, boxY + Math.floor(boxH / 2) - 10000, CONTENT_W, 20000, {
    fill: C.purpleBorder, fillAlpha: 50000,
  }));

  for (let i = 0; i < n; i++) {
    const step  = steps[i] || {};
    const isGate = !!step.gate;
    const isLast = i === n - 1;
    const x     = ML + i * (boxW + arrowW);
    const y     = boxY;

    let grad, textCol;
    if (isLast) {
      grad    = GRAD.impact;
      textCol = C.white;
    } else if (isGate) {
      grad    = GRAD.orange;
      textCol = C.white;
    } else {
      grad    = GRAD.purple;
      textCol = C.white;
    }

    // Box com gradiente
    shapes.push(sp(x, y, boxW, boxH, {
      gradStops: grad.stops,
      gradAngle: grad.ang,
      geom: "roundRect",
      roundAdj: 10000,
    }));

    // Label no box
    shapes.push(tsp(x, y, boxW, boxH,
      run(step.label || "", { bold: true, sz: 1300, color: textCol }),
      { anchor: "ctr", algn: "ctr" }
    ));

    // Descrição abaixo do box
    if (step.descricao) {
      shapes.push(tsp(x, y + boxH + descGap, boxW, descH,
        run(step.descricao, { sz: 1000, color: C.textMuted }),
        { anchor: "t", algn: "ctr" }
      ));
    }

    // Seta entre boxes
    if (i < n - 1) {
      shapes.push(tsp(x + boxW, y, arrowW, boxH,
        run("›", { sz: 2000, color: C.purpleBorder }),
        { anchor: "ctr", algn: "ctr" }
      ));
    }
  }

  return wrapSlide(shapes.join("\n"));
}

// ─── COMPARACAO ───────────────────────────────────────────────────────────────
/**
 * Duas colunas lado a lado.
 * Cabeçalhos com gradiente (não sólido).
 * Símbolos ✓ e ✕ desenhados com shapes geométricos.
 */
function renderComparacao(s, ctx) {
  resetIds();
  const gap    = 220000;
  const colW   = Math.floor((CONTENT_W - gap) / 2);
  const colH   = FOOTER_Y - CONTENT_Y - 220000;
  const hdrH   = 340000;
  const pad    = 180000;
  const esq    = s.esquerda || {};
  const dir    = s.direita  || {};

  const shapes = [headerShapes(s.eyebrow, s.titulo, ctx)];

  if (s.subtitulo) {
    shapes.push(tsp(ML, TITLE_Y + 600000, CONTENT_W, 260000,
      run(s.subtitulo, { sz: 1200, color: C.textMuted }),
      { anchor: "t", algn: "l" }
    ));
  }

  const cols = [
    { data: esq, x: ML,              grad: GRAD.purple, symb: "✓" },
    { data: dir, x: ML + colW + gap, grad: GRAD.orange, symb: "✕" },
  ];

  for (const col of cols) {
    const { data, x, grad, symb } = col;
    const y = CONTENT_Y;

    // Fundo claro da coluna
    shapes.push(sp(x, y, colW, colH, {
      fill: C.white,
      border: { color: C.purpleBorder, w: 9525 },
      geom: "roundRect",
      roundAdj: 10000,
    }));

    // Header gradiente
    shapes.push(sp(x, y, colW, hdrH, {
      gradStops: grad.stops,
      gradAngle: grad.ang,
      geom: "rect",
    }));

    // Símbolo ✓/✕ no header (shape circular)
    const symX = x + pad;
    const symSz = hdrH - 80000;
    shapes.push(sp(symX, y + 40000, symSz, symSz, {
      fill: C.white, fillAlpha: 25000,
      geom: "ellipse",
    }));
    shapes.push(tsp(symX, y + 40000, symSz, symSz,
      run(symb, { bold: true, sz: 1600, color: C.white }),
      { anchor: "ctr", algn: "ctr" }
    ));

    // Rótulo do header
    shapes.push(tsp(x + symSz + pad + 60000, y, colW - symSz - 2 * pad - 60000, hdrH,
      run((data.rotulo || "").toUpperCase(), { bold: true, sz: 1100, color: C.white }),
      { anchor: "ctr", algn: "l" }
    ));

    // Título da coluna
    shapes.push(tsp(x + pad, y + hdrH + pad, colW - 2 * pad, 420000,
      run(data.titulo || "", { bold: true, sz: 1700, color: C.navy }),
      { anchor: "t", algn: "l" }
    ));

    // Descrição
    const descY = y + hdrH + pad + 440000;
    const descH = colH - hdrH - 2 * pad - 440000;
    shapes.push(tsp(x + pad, descY, colW - 2 * pad, descH,
      run(data.descricao || "", { sz: 1200, color: C.textMuted }),
      { anchor: "t", algn: "l", wrap: "square" }
    ));
  }

  return wrapSlide(shapes.join("\n"));
}

// ─── TIMELINE ─────────────────────────────────────────────────────────────────
/**
 * Linha do tempo horizontal com círculos numerados e gradiente.
 */
function renderTimeline(s, ctx) {
  resetIds();
  const steps  = Array.isArray(s.steps) ? s.steps : [];
  const n      = Math.max(1, Math.min(6, steps.length));
  const circD  = 420000;
  const circR  = Math.floor(circD / 2);
  const lineY  = CONTENT_Y + 800000;
  const lineH  = 19050;
  const stepW  = Math.floor(CONTENT_W / n);
  const labelPad = 70000;

  const shapes = [headerShapes(s.eyebrow, s.titulo, ctx)];

  // Linha horizontal de fundo
  shapes.push(sp(ML, lineY - lineH, CONTENT_W, lineH * 2, {
    fill: C.purpleBorder,
  }));

  for (let i = 0; i < n; i++) {
    const step  = steps[i] || {};
    const centerX = ML + i * stepW + Math.floor(stepW / 2);
    const circX   = centerX - circR;
    const circY   = lineY - circR;
    const isLast  = i === n - 1;
    const grad    = isLast ? GRAD.impact : GRAD.badge;

    // Sombra leve do círculo
    shapes.push(sp(circX + 15000, circY + 15000, circD, circD, {
      fill: C.navy, fillAlpha: 10000,
      geom: "ellipse",
    }));

    // Círculo com gradiente
    shapes.push(sp(circX, circY, circD, circD, {
      gradStops: grad.stops,
      gradAngle: grad.ang,
      geom: "ellipse",
    }));

    // Número
    shapes.push(tsp(circX, circY, circD, circD,
      run(String(i + 1), { bold: true, sz: 1400, color: C.white }),
      { anchor: "ctr", algn: "ctr" }
    ));

    // Label
    shapes.push(tsp(centerX - stepW / 2, circY + circD + labelPad, stepW, 340000,
      run(step.label || "", { bold: true, sz: 1300, color: C.navy }),
      { anchor: "t", algn: "ctr" }
    ));

    // Descrição
    if (step.descricao) {
      shapes.push(tsp(centerX - stepW / 2, circY + circD + labelPad + 360000, stepW, 500000,
        run(step.descricao, { sz: 1100, color: C.textMuted }),
        { anchor: "t", algn: "ctr" }
      ));
    }
  }

  return wrapSlide(shapes.join("\n"));
}

// ─── KPI ──────────────────────────────────────────────────────────────────────
/**
 * Cards de métricas com número grande.
 * dark:true → fundo heroDark, cards escuros.
 * Barras superiores com gradiente (não sólido).
 */
function renderKpi(s, ctx) {
  resetIds();
  const dark      = !!s.dark;
  const metricas  = Array.isArray(s.metricas) ? s.metricas : [];
  const n         = Math.max(2, Math.min(4, metricas.length));
  const gap       = 220000;
  const cardW     = Math.floor((CONTENT_W - (n - 1) * gap) / n);
  const cardH     = FOOTER_Y - CONTENT_Y - 280000;
  const barH      = 90000;
  const pad       = 160000;

  const headingCol = dark ? C.white      : C.navy;
  const mutedCol   = dark ? "CFC9E6"    : C.textMuted;
  const cardBgCol  = dark ? C.darkCard  : C.white;
  const numCol     = dark ? C.purpleEmphasis : C.purple;

  const shapes = [headerShapes(s.eyebrow, s.titulo, ctx, { dark })];

  for (let i = 0; i < n; i++) {
    const m     = metricas[i] || {};
    const x     = ML + i * (cardW + gap);
    const y     = CONTENT_Y;
    const aGrad = ACCENT_GRADS[i % ACCENT_GRADS.length];

    // Card bg
    shapes.push(sp(x, y, cardW, cardH, {
      fill: cardBgCol,
      geom: "roundRect",
      roundAdj: 10000,
    }));

    // Barra superior gradiente
    shapes.push(sp(x, y, cardW, barH, {
      gradStops: aGrad.stops,
      gradAngle: aGrad.ang,
      geom: "rect",
    }));

    // Valor grande
    shapes.push(tsp(x, y + barH + pad, cardW, 1100000,
      run(m.valor || "", { bold: true, sz: 6400, color: numCol }),
      { anchor: "t", algn: "ctr" }
    ));

    // Label
    shapes.push(tsp(x + pad, y + barH + pad + 1120000, cardW - 2 * pad, 500000,
      run(m.label || "", { sz: 1200, color: mutedCol }),
      { anchor: "t", algn: "ctr", wrap: "square" }
    ));
  }

  return wrapSlide(shapes.join("\n"), { dark });
}

// ─── TRES PILARES ─────────────────────────────────────────────────────────────
/**
 * Exatamente 3 colunas com cabeçalho gradiente.
 */
function renderTresPilares(s, ctx) {
  resetIds();
  const pilares = Array.isArray(s.pilares) ? s.pilares.slice(0, 3) : [];
  const gap     = 220000;
  const colW    = Math.floor((CONTENT_W - 2 * gap) / 3);
  const colH    = FOOTER_Y - CONTENT_Y - 280000;
  const hdrH    = 460000;
  const pad     = 180000;
  const PILAR_GRADS = [GRAD.purple, GRAD.cyan, GRAD.green];

  const shapes = [headerShapes(s.eyebrow, s.titulo, ctx)];

  for (let i = 0; i < 3; i++) {
    const pilar = pilares[i] || {};
    const x     = ML + i * (colW + gap);
    const y     = CONTENT_Y;
    const grad  = PILAR_GRADS[i];

    // Fundo coluna
    shapes.push(sp(x, y, colW, colH, {
      fill: C.white,
      border: { color: C.purpleBorder, w: 9525 },
      geom: "roundRect",
      roundAdj: 10000,
    }));

    // Header gradiente
    shapes.push(sp(x, y, colW, hdrH, {
      gradStops: grad.stops,
      gradAngle: grad.ang,
      geom: "rect",
    }));

    // Número grande no header
    shapes.push(tsp(x, y, colW, hdrH,
      run(String(i + 1).padStart(2, "0"), { bold: true, sz: 3200, color: C.white }),
      { anchor: "ctr", algn: "ctr" }
    ));

    // Título
    shapes.push(tsp(x + pad, y + hdrH + pad, colW - 2 * pad, 380000,
      run(pilar.titulo || "", { bold: true, sz: 1500, color: C.navy }),
      { anchor: "t", algn: "l" }
    ));

    // Descrição
    const descY = y + hdrH + pad + 400000;
    const descH = colH - hdrH - 2 * pad - 400000;
    shapes.push(tsp(x + pad, descY, colW - 2 * pad, descH,
      run(pilar.descricao || "", { sz: 1200, color: C.textMuted }),
      { anchor: "t", algn: "l", wrap: "square" }
    ));
  }

  return wrapSlide(shapes.join("\n"));
}

// ═══════════════════════════════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════════

export const VISUAL_TYPES = {
  cards:             true,
  "lista-icone":     true,
  "diagrama-fluxo":  true,
  "grid-icone":      true,
  pipeline:          true,
  comparacao:        true,
  timeline:          true,
  kpi:               true,
  "tres-pilares":    true,
};

/**
 * buildVisualSlide(tipo, slideData, ctx) → { xml, relsXml } | null
 * ctx = { deckName: string, pageNum: number }
 */
export function buildVisualSlide(tipo, slideData, ctx) {
  const s    = slideData || {};
  const safe = ctx || {};

  let xml;
  switch (tipo) {
    case "cards":            xml = renderCards(s, safe);           break;
    case "lista-icone":      xml = renderListaIcone(s, safe);      break;
    case "diagrama-fluxo":   xml = renderDiagramaFluxo(s, safe);   break;
    case "grid-icone":       xml = renderGridIcone(s, safe);       break;
    case "pipeline":         xml = renderPipeline(s, safe);        break;
    case "comparacao":       xml = renderComparacao(s, safe);      break;
    case "timeline":         xml = renderTimeline(s, safe);        break;
    case "kpi":              xml = renderKpi(s, safe);             break;
    case "tres-pilares":     xml = renderTresPilares(s, safe);     break;
    default: return null;
  }

  return { xml, relsXml: RELS_XML };
}

/**
 * PPTX VISUAL ENGINE — DATI
 * ─────────────────────────────────────────────────────────────────────────────
 * Gera slides PPTX a partir de XML puro, sem depender do MAP.pptx.
 * Exporta buildVisualSlide(tipo, slideData, ctx) → { xml, relsXml }
 * e VISUAL_TYPES (objeto de nomes dos tipos visuais).
 *
 * Tipos suportados: cards, pipeline, comparacao, timeline, kpi, tres-pilares
 */

// ─── Constantes de layout (EMU) ───────────────────────────────────────────────

const W = 12192000;
const H = 6858000;
const ML = 457200; // margin left/right
const CONTENT_W = W - 2 * ML; // 11277600
const EYEBROW_Y = 380000;
const TITLE_Y = 820000;
const CONTENT_Y = 1750000;
const FOOTER_Y = 6267450;

// ─── Brand colors ─────────────────────────────────────────────────────────────

const C = {
  navy: "1A0F3D",
  purple: "6838E8",
  purpleEmphasis: "8F65FE",
  purpleLight: "8C7DFF",
  purplePale: "E8E1FF",
  purpleBorder: "D4CEF0",
  cyan: "5BBEED",
  green: "A4DF64",
  orange: "F59D01",
  white: "FFFFFF",
  bgLight: "EDF0F2",
  textMuted: "5B5570",
  textDark: "CFC9E6",
  darkCard: "261752",
  darkNavy: "0D0824",
  navyMid: "2B1B5C",
  cardBg: "F5F2FF",
  orangeBg: "FFF8F0",
};

// Cycling accent colors for cards/bars
const ACCENT_COLORS = [C.purple, C.cyan, C.green, C.orange];

// ─── XML helpers ──────────────────────────────────────────────────────────────

function xmlEsc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Shape ID counter — reset per slide
let _shapeId = 2;
function nextId() {
  return _shapeId++;
}
function resetIds() {
  _shapeId = 2;
}

// ─── Shape builders ───────────────────────────────────────────────────────────

/**
 * Non-text rectangle/shape (background, bar, etc.)
 */
function sp(x, y, cx, cy, { fill = null, noFill = false, border = null, geom = "rect", roundAdj = 20000, id = null, name = null } = {}) {
  const sid = id ?? nextId();
  const sname = name ?? `s${sid}`;

  let fillXml;
  if (noFill) {
    fillXml = "<a:noFill/>";
  } else if (fill) {
    fillXml = `<a:solidFill><a:srgbClr val="${fill}"/></a:solidFill>`;
  } else {
    fillXml = "<a:noFill/>";
  }

  let borderXml;
  if (border) {
    borderXml = `<a:ln w="${border.w ?? 9525}"><a:solidFill><a:srgbClr val="${border.color}"/></a:solidFill></a:ln>`;
  } else {
    borderXml = "<a:ln><a:noFill/></a:ln>";
  }

  let geomXml;
  if (geom === "roundRect") {
    geomXml = `<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val ${roundAdj}"/></a:avLst></a:prstGeom>`;
  } else if (geom === "ellipse") {
    geomXml = `<a:prstGeom prst="ellipse"><a:avLst/></a:prstGeom>`;
  } else {
    geomXml = `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>`;
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
 * runs: array of { text, bold, sz, color, italic }
 * or a raw runs XML string
 */
function tsp(x, y, cx, cy, runsOrXml, {
  fill = null,
  noFill = true,
  anchor = "t",
  algn = "l",
  bold = false,
  sz = 1200,
  color = C.navy,
  wrap = "square",
  lIns = 91440,
  rIns = 91440,
  tIns = 0,
  bIns = 0,
  id = null,
  name = null,
  multiPara = false,
} = {}) {
  const sid = id ?? nextId();
  const sname = name ?? `t${sid}`;

  const fillXml = fill
    ? `<a:solidFill><a:srgbClr val="${fill}"/></a:solidFill>`
    : "<a:noFill/>";

  // Build runs XML
  let runsXml;
  if (typeof runsOrXml === "string") {
    runsXml = runsOrXml;
  } else if (Array.isArray(runsOrXml)) {
    runsXml = runsOrXml.map(r => run(r.text, {
      bold: r.bold ?? bold,
      sz: r.sz ?? sz,
      color: r.color ?? color,
      italic: r.italic ?? false,
    })).join("");
  } else {
    runsXml = "";
  }

  const paraXml = multiPara
    ? runsXml // already full paragraphs
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
 * Single text run
 */
function run(text, { bold = false, sz = 1200, color = C.navy, italic = false } = {}) {
  const b = bold ? "1" : "0";
  const i = italic ? "1" : "0";
  return `<a:r><a:rPr b="${b}" i="${i}" lang="pt-BR" sz="${sz}" u="none" dirty="0"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="Manrope"/></a:rPr><a:t>${xmlEsc(text)}</a:t></a:r>`;
}

/**
 * Build multiple runs from titulo array [{text, emphasis}] or string
 */
function titleRuns(titulo, { sz = 3000, baseColor = C.navy, emphColor = C.purpleEmphasis, bold = true } = {}) {
  if (typeof titulo === "string") {
    return run(titulo, { bold, sz, color: baseColor });
  }
  if (Array.isArray(titulo)) {
    return titulo.map(t =>
      run(t.text, { bold, sz, color: t.emphasis ? emphColor : baseColor })
    ).join("");
  }
  return "";
}

// ─── Common slide header (eyebrow + title + footer) ─────────────────────────

function headerShapes(eyebrow, titulo, { deckName, pageNum }) {
  const shapes = [];

  // Eyebrow
  if (eyebrow) {
    shapes.push(tsp(ML, EYEBROW_Y, CONTENT_W, 300000,
      run((eyebrow || "").toUpperCase(), { bold: true, sz: 1000, color: C.purpleLight }),
      { anchor: "t", algn: "l" }
    ));
  }

  // Title
  if (titulo) {
    const runsXml = titleRuns(titulo, { sz: 3000, bold: true });
    shapes.push(tsp(ML, TITLE_Y, CONTENT_W, 700000, runsXml, { anchor: "t", algn: "l" }));
  }

  // Footer left — deck name
  if (deckName) {
    shapes.push(tsp(ML, FOOTER_Y, CONTENT_W / 2, 200000,
      run(deckName, { sz: 900, color: C.textMuted }),
      { anchor: "t", algn: "l" }
    ));
  }

  // Footer right — page number
  if (pageNum) {
    shapes.push(tsp(ML + CONTENT_W / 2, FOOTER_Y, CONTENT_W / 2, 200000,
      run(String(pageNum).padStart(2, "0"), { sz: 900, color: C.textMuted }),
      { anchor: "t", algn: "r" }
    ));
  }

  return shapes.join("\n");
}

// ─── Slide wrapper ────────────────────────────────────────────────────────────

function wrapSlide(shapesXml, { dark = false } = {}) {
  const bgFill = dark
    ? `<a:gradFill><a:gsLst><a:gs pos="0"><a:srgbClr val="${C.darkNavy}"/></a:gs><a:gs pos="55000"><a:srgbClr val="${C.navy}"/></a:gs><a:gs pos="100000"><a:srgbClr val="${C.navyMid}"/></a:gs></a:gsLst><a:lin ang="8100000" scaled="0"/></a:gradFill>`
    : `<a:solidFill><a:srgbClr val="${C.bgLight}"/></a:solidFill>`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr>${bgFill}<a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${W}" cy="${H}"/><a:chOff x="0" y="0"/><a:chExt cx="${W}" cy="${H}"/></a:xfrm></p:grpSpPr>
      ${shapesXml}
    </p:spTree>
  </p:cSld>
</p:sld>`;
}

// ─── Standard rels XML ────────────────────────────────────────────────────────

const RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout3.xml"/>
</Relationships>`;

// ─── Slide type renderers ─────────────────────────────────────────────────────

/**
 * CARDS — 2–4 numbered cards with top bar, badge, title, description
 */
function renderCards(s, ctx) {
  resetIds();
  const cards = Array.isArray(s.cards) ? s.cards : [];
  const n = Math.max(2, Math.min(4, cards.length));
  const gap = 200000;
  const cardW = Math.floor((CONTENT_W - (n - 1) * gap) / n);
  const cardH = H - CONTENT_Y - 591000; // leave room for footer
  const topBarH = 100000;
  const badgeSize = 300000;
  const cardPad = 150000; // internal padding

  const shapes = [];

  // Header shapes
  shapes.push(headerShapes(s.eyebrow, s.titulo, ctx));

  for (let i = 0; i < n; i++) {
    const card = cards[i] || {};
    const x = ML + i * (cardW + gap);
    const y = CONTENT_Y;
    const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];

    // Card background (white, rounded)
    shapes.push(sp(x, y, cardW, cardH, {
      fill: C.white,
      border: { color: C.purpleBorder, w: 9525 },
      geom: "roundRect",
      roundAdj: 12000,
    }));

    // Top accent bar
    shapes.push(sp(x, y, cardW, topBarH, { fill: accent, geom: "rect" }));

    // Round top corners mask (cover the bar overlap on rounded card)
    // Badge (ellipse) — purple, top-left of card content
    const badgeX = x + cardPad;
    const badgeY = y + topBarH + cardPad;
    shapes.push(sp(badgeX, badgeY, badgeSize, badgeSize, { fill: C.purple, geom: "ellipse" }));

    // Badge number
    const numStr = String(i + 1).padStart(2, "0");
    shapes.push(tsp(
      badgeX, badgeY, badgeSize, badgeSize,
      run(numStr, { bold: true, sz: 800, color: C.white }),
      { anchor: "ctr", algn: "ctr" }
    ));

    // Card title
    const titleY = badgeY + badgeSize + 100000;
    const innerW = cardW - 2 * cardPad;
    shapes.push(tsp(
      x + cardPad, titleY, innerW, 350000,
      run(card.titulo || "", { bold: true, sz: 1400, color: C.navy }),
      { anchor: "t", algn: "l", wrap: "square" }
    ));

    // Card description
    const descY = titleY + 370000;
    const descH = cardH - (descY - y) - cardPad;
    shapes.push(tsp(
      x + cardPad, descY, innerW, descH,
      run(card.descricao || "", { sz: 1100, color: C.textMuted }),
      { anchor: "t", algn: "l", wrap: "square" }
    ));
  }

  return wrapSlide(shapes.join("\n"));
}

/**
 * PIPELINE — up to 6 steps with arrows between them
 */
function renderPipeline(s, ctx) {
  resetIds();
  const steps = Array.isArray(s.steps) ? s.steps : [];
  const n = Math.max(1, Math.min(6, steps.length));
  const arrowCount = n - 1;

  // Layout: boxes + arrow gaps
  const arrowW = 200000;
  const boxH = 350000;
  const totalArrowW = arrowCount * arrowW;
  const boxW = Math.floor((CONTENT_W - totalArrowW) / n);
  const boxY = CONTENT_Y + 400000; // vertically center in content area
  const descH = 280000;
  const descGap = 60000;

  const shapes = [];
  shapes.push(headerShapes(s.eyebrow, s.titulo, ctx));

  for (let i = 0; i < n; i++) {
    const step = steps[i] || {};
    const isGate = !!step.gate;
    const isLast = i === n - 1;

    const x = ML + i * (boxW + arrowW);
    const y = boxY;

    // Choose style
    let bgColor, textColor, borderColor, borderW;
    if (isLast) {
      bgColor = C.purple;
      textColor = C.white;
      borderColor = C.purple;
      borderW = 19050;
    } else if (isGate) {
      bgColor = C.orange;
      textColor = C.white;
      borderColor = C.orange;
      borderW = 19050;
    } else {
      bgColor = C.purplePale;
      textColor = C.navy;
      borderColor = C.purple;
      borderW = 9525;
    }

    // Box
    shapes.push(sp(x, y, boxW, boxH, {
      fill: bgColor,
      border: { color: borderColor, w: borderW },
      geom: "roundRect",
      roundAdj: 15000,
    }));

    // Label text in box
    shapes.push(tsp(x, y, boxW, boxH,
      run(step.label || "", { bold: true, sz: 1200, color: textColor }),
      { anchor: "ctr", algn: "ctr" }
    ));

    // Description below box
    if (step.descricao) {
      shapes.push(tsp(
        x, y + boxH + descGap, boxW, descH,
        run(step.descricao, { sz: 1000, color: C.textMuted }),
        { anchor: "t", algn: "ctr" }
      ));
    }

    // Arrow between boxes
    if (i < n - 1) {
      const arrowX = x + boxW;
      shapes.push(tsp(
        arrowX, y, arrowW, boxH,
        run("→", { sz: 1400, color: C.textMuted }),
        { anchor: "ctr", algn: "ctr" }
      ));
    }
  }

  return wrapSlide(shapes.join("\n"));
}

/**
 * COMPARACAO — two-column comparison
 */
function renderComparacao(s, ctx) {
  resetIds();
  const gap = 200000;
  const colW = Math.floor((CONTENT_W - gap) / 2);
  const colH = H - CONTENT_Y - 591000;
  const headerH = 300000;
  const pad = 150000;

  const esq = s.esquerda || {};
  const dir = s.direita || {};

  const shapes = [];
  shapes.push(headerShapes(s.eyebrow, s.titulo, ctx));

  // Subtitle
  if (s.subtitulo) {
    shapes.push(tsp(ML, TITLE_Y + 580000, CONTENT_W, 250000,
      run(s.subtitulo, { sz: 1200, color: C.textMuted }),
      { anchor: "t", algn: "l" }
    ));
  }

  const cols = [
    { data: esq, x: ML, accentColor: C.purple, bgColor: C.cardBg, borderColor: C.purple },
    { data: dir, x: ML + colW + gap, accentColor: C.orange, bgColor: C.orangeBg, borderColor: C.orange },
  ];

  for (const col of cols) {
    const { data, x, accentColor, bgColor, borderColor } = col;
    const y = CONTENT_Y;

    // Column background
    shapes.push(sp(x, y, colW, colH, {
      fill: bgColor,
      border: { color: borderColor, w: 19050 },
      geom: "roundRect",
      roundAdj: 10000,
    }));

    // Header bar
    shapes.push(sp(x, y, colW, headerH, { fill: accentColor, geom: "rect" }));

    // Header label
    shapes.push(tsp(x, y, colW, headerH,
      run((data.rotulo || "").toUpperCase(), { bold: true, sz: 1100, color: C.white }),
      { anchor: "ctr", algn: "ctr" }
    ));

    // Column title
    shapes.push(tsp(x + pad, y + headerH + pad, colW - 2 * pad, 350000,
      run(data.titulo || "", { bold: true, sz: 1600, color: C.navy }),
      { anchor: "t", algn: "l" }
    ));

    // Column description
    const descY = y + headerH + pad + 370000;
    const descH = colH - headerH - 2 * pad - 370000;
    shapes.push(tsp(x + pad, descY, colW - 2 * pad, descH,
      run(data.descricao || "", { sz: 1100, color: C.textMuted }),
      { anchor: "t", algn: "l", wrap: "square" }
    ));
  }

  return wrapSlide(shapes.join("\n"));
}

/**
 * TIMELINE — horizontal line with circles and labels
 */
function renderTimeline(s, ctx) {
  resetIds();
  const steps = Array.isArray(s.steps) ? s.steps : [];
  const n = Math.max(1, Math.min(6, steps.length));

  const circleD = 400000;
  const circleR = circleD / 2;
  const lineY = CONTENT_Y + 700000; // center of line
  const lineH = 19050;
  const stepW = Math.floor(CONTENT_W / n);
  const labelPad = 60000;

  const shapes = [];
  shapes.push(headerShapes(s.eyebrow, s.titulo, ctx));

  // Horizontal line
  shapes.push(sp(ML, lineY - lineH / 2, CONTENT_W, lineH, { fill: C.purpleBorder }));

  for (let i = 0; i < n; i++) {
    const step = steps[i] || {};
    const centerX = ML + i * stepW + Math.floor(stepW / 2);
    const circleX = centerX - circleR;
    const circleY = lineY - circleR;

    // Circle
    shapes.push(sp(circleX, circleY, circleD, circleD, { fill: C.purple, geom: "ellipse" }));

    // Number inside circle
    shapes.push(tsp(circleX, circleY, circleD, circleD,
      run(String(i + 1), { bold: true, sz: 1200, color: C.white }),
      { anchor: "ctr", algn: "ctr" }
    ));

    // Label below
    const labelY = circleY + circleD + labelPad;
    shapes.push(tsp(centerX - stepW / 2, labelY, stepW, 300000,
      run(step.label || "", { bold: true, sz: 1300, color: C.navy }),
      { anchor: "t", algn: "ctr" }
    ));

    // Description below label
    if (step.descricao) {
      shapes.push(tsp(centerX - stepW / 2, labelY + 320000, stepW, 400000,
        run(step.descricao, { sz: 1100, color: C.textMuted }),
        { anchor: "t", algn: "ctr" }
      ));
    }
  }

  return wrapSlide(shapes.join("\n"));
}

/**
 * KPI — big number metric cards
 */
function renderKpi(s, ctx) {
  resetIds();
  const dark = !!s.dark;
  const metricas = Array.isArray(s.metricas) ? s.metricas : [];
  const n = Math.max(2, Math.min(4, metricas.length));
  const gap = 200000;
  const cardW = Math.floor((CONTENT_W - (n - 1) * gap) / n);
  const cardH = H - CONTENT_Y - 591000;
  const topBarH = 80000;
  const pad = 150000;

  const headingColor = dark ? C.white : C.navy;
  const mutedColor = dark ? C.textDark : C.textMuted;
  const cardBg = dark ? C.darkCard : C.white;

  const shapes = [];

  // Header
  const eyebrowColor = dark ? C.textDark : C.purpleLight;
  if (s.eyebrow) {
    shapes.push(tsp(ML, EYEBROW_Y, CONTENT_W, 300000,
      run((s.eyebrow || "").toUpperCase(), { bold: true, sz: 1000, color: eyebrowColor }),
      { anchor: "t", algn: "l" }
    ));
  }
  if (s.titulo) {
    const runsXml = titleRuns(s.titulo, {
      sz: 3000,
      bold: true,
      baseColor: headingColor,
      emphColor: C.purpleEmphasis,
    });
    shapes.push(tsp(ML, TITLE_Y, CONTENT_W, 700000, runsXml, { anchor: "t", algn: "l" }));
  }

  // Footer
  if (ctx.deckName) {
    shapes.push(tsp(ML, FOOTER_Y, CONTENT_W / 2, 200000,
      run(ctx.deckName, { sz: 900, color: mutedColor }),
      { anchor: "t", algn: "l" }
    ));
  }
  if (ctx.pageNum) {
    shapes.push(tsp(ML + CONTENT_W / 2, FOOTER_Y, CONTENT_W / 2, 200000,
      run(String(ctx.pageNum).padStart(2, "0"), { sz: 900, color: mutedColor }),
      { anchor: "t", algn: "r" }
    ));
  }

  for (let i = 0; i < n; i++) {
    const m = metricas[i] || {};
    const x = ML + i * (cardW + gap);
    const y = CONTENT_Y;
    const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];

    // Card background
    shapes.push(sp(x, y, cardW, cardH, {
      fill: cardBg,
      geom: "roundRect",
      roundAdj: 12000,
    }));

    // Top accent bar
    shapes.push(sp(x, y, cardW, topBarH, { fill: accent, geom: "rect" }));

    // KPI value (big number)
    const valY = y + topBarH + pad;
    shapes.push(tsp(x, valY, cardW, 1000000,
      run(m.valor || "", { bold: true, sz: 5600, color: dark ? C.white : C.purple }),
      { anchor: "t", algn: "ctr" }
    ));

    // KPI label
    const labelY = valY + 1050000;
    shapes.push(tsp(x + pad, labelY, cardW - 2 * pad, 500000,
      run(m.label || "", { sz: 1200, color: mutedColor }),
      { anchor: "t", algn: "ctr", wrap: "square" }
    ));
  }

  return wrapSlide(shapes.join("\n"), { dark });
}

/**
 * TRES PILARES — exactly 3 equal white columns with colored headers
 */
function renderTresPilares(s, ctx) {
  resetIds();
  const pilares = Array.isArray(s.pilares) ? s.pilares.slice(0, 3) : [];
  const gap = 200000;
  const colW = Math.floor((CONTENT_W - 2 * gap) / 3);
  const colH = H - CONTENT_Y - 591000;
  const headerH = 420000;
  const pad = 150000;

  const PILAR_COLORS = [C.purple, C.cyan, C.green];

  const shapes = [];
  shapes.push(headerShapes(s.eyebrow, s.titulo, ctx));

  for (let i = 0; i < 3; i++) {
    const pilar = pilares[i] || {};
    const x = ML + i * (colW + gap);
    const y = CONTENT_Y;
    const accent = PILAR_COLORS[i % PILAR_COLORS.length];

    // Column background
    shapes.push(sp(x, y, colW, colH, {
      fill: C.white,
      border: { color: C.purpleBorder, w: 9525 },
      geom: "roundRect",
      roundAdj: 10000,
    }));

    // Header bar
    shapes.push(sp(x, y, colW, headerH, { fill: accent, geom: "rect" }));

    // Large number in header
    const numStr = String(i + 1).padStart(2, "0");
    shapes.push(tsp(x, y, colW, headerH,
      run(numStr, { bold: true, sz: 2800, color: C.white }),
      { anchor: "ctr", algn: "ctr" }
    ));

    // Pilar title
    shapes.push(tsp(x + pad, y + headerH + pad, colW - 2 * pad, 350000,
      run(pilar.titulo || "", { bold: true, sz: 1400, color: C.navy }),
      { anchor: "t", algn: "l" }
    ));

    // Pilar description
    const descY = y + headerH + pad + 370000;
    const descH = colH - headerH - 2 * pad - 370000;
    shapes.push(tsp(x + pad, descY, colW - 2 * pad, descH,
      run(pilar.descricao || "", { sz: 1100, color: C.textMuted }),
      { anchor: "t", algn: "l", wrap: "square" }
    ));
  }

  return wrapSlide(shapes.join("\n"));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const VISUAL_TYPES = {
  cards: true,
  pipeline: true,
  comparacao: true,
  timeline: true,
  kpi: true,
  "tres-pilares": true,
};

/**
 * buildVisualSlide(tipo, slideData, ctx) → { xml, relsXml }
 * ctx = { deckName: string, pageNum: number }
 */
export function buildVisualSlide(tipo, slideData, ctx) {
  const s = slideData || {};
  const safeCtx = ctx || {};

  let xml;
  switch (tipo) {
    case "cards":
      xml = renderCards(s, safeCtx);
      break;
    case "pipeline":
      xml = renderPipeline(s, safeCtx);
      break;
    case "comparacao":
      xml = renderComparacao(s, safeCtx);
      break;
    case "timeline":
      xml = renderTimeline(s, safeCtx);
      break;
    case "kpi":
      xml = renderKpi(s, safeCtx);
      break;
    case "tres-pilares":
      xml = renderTresPilares(s, safeCtx);
      break;
    default:
      return null;
  }

  return { xml, relsXml: RELS_XML };
}

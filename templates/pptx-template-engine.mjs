/**
 * MOTOR DE TEMPLATES PPTX — DATI
 * ─────────────────────────────────────────────────────────────────────────────
 * Gera apresentações PPTX com fidelidade 100% ao padrão visual da apresentação
 * "Acelerando a Jornada de adoção da nuvem — MAP", usando os próprios slides
 * originais como templates XML (gradientes, símbolos, fontes, layouts — tudo
 * preservado do arquivo de referência).
 *
 * USO:
 *   node pptx-template-engine.mjs <slides.json> [saida.pptx]
 *
 * DEPENDÊNCIA:
 *   npm install adm-zip  (instalar uma vez nesta pasta)
 *   O arquivo de referência MAP.pptx deve estar em:
 *   ../assets/template-source/MAP.pptx
 *
 * FORMATO DO JSON — ver README em docs/materiais/apresentacoes.md
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PPTX = path.resolve(__dirname, "../assets/template-source/MAP.pptx");
const LOGO_NAVY_PNG = path.resolve(__dirname, "../assets/logo/dati-logo-navy.png");
const LOGO_MEDIA_NAME = "dati-logo-navy.png";

// ─── XML helpers ────────────────────────────────────────────────────────────

function xmlEsc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Substitui todo o conteúdo de <a:t> de uma ocorrência exata */
function replaceText(xml, oldText, newText) {
  const escaped = oldText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return xml.replace(
    new RegExp(`(<a:t>)${escaped}(</a:t>)`),
    `$1${xmlEsc(newText)}$2`
  );
}

/** Constrói um run simples de texto com formatação específica */
function buildRun(text, { color, bold = false, sz = 1200, typeface = "Manrope" } = {}) {
  const boldAttr = bold ? 'b="1"' : 'b="0"';
  const fill = `<a:solidFill><a:srgbClr val="${color}"/></a:solidFill>`;
  return `<a:r><a:rPr ${boldAttr} i="0" lang="en-US" sz="${sz}" u="none" cap="none" strike="noStrike">${fill}<a:latin typeface="${typeface}"/><a:ea typeface="${typeface}"/><a:cs typeface="${typeface}"/><a:sym typeface="${typeface}"/></a:rPr><a:t>${xmlEsc(text)}</a:t></a:r>`;
}

/** Constrói um parágrafo completo de texto */
function buildParagraph(runs, { algn = "l", lnSpc = "100000" } = {}) {
  return `<a:p><a:pPr indent="0" lvl="0" marL="0" marR="0" rtl="0" algn="${algn}"><a:lnSpc><a:spcPct val="${lnSpc}"/></a:lnSpc><a:spcBef><a:spcPts val="0"/></a:spcBef><a:spcAft><a:spcPts val="0"/></a:spcAft><a:buNone/></a:pPr>${runs}</a:p>`;
}

/**
 * Rebuilds a specific text box identified by its y-offset.
 * Replaces the entire <p:txBody> content of the first shape at the given y.
 */
function rebuildTextBox(xml, yOffset, newTxBody) {
  // Match a <p:sp> containing an <a:off> at the given y
  const re = new RegExp(
    `(<p:sp>[\\s\\S]*?<a:off[^>]*y="${yOffset}"[^>]*/>[\\s\\S]*?)<p:txBody>[\\s\\S]*?</p:txBody>`,
  );
  return xml.replace(re, `$1${newTxBody}`);
}

/**
 * Removes all <p:sp> and <p:pic> shapes whose position y matches any value in yOffsets.
 * Uses string search to avoid cross-shape regex ambiguity.
 */
function removeShapesByY(xml, yOffsets) {
  for (const y of yOffsets) {
    const marker = ` y="${y}"`;
    while (true) {
      const idx = xml.indexOf(marker);
      if (idx === -1) break;

      // Walk back to find the opening shape tag
      const openSp  = xml.lastIndexOf("<p:sp>",  idx);
      const openPic = xml.lastIndexOf("<p:pic>", idx);
      const openIdx = Math.max(openSp, openPic);
      if (openIdx === -1) break;

      const tag      = openIdx === openSp ? "p:sp" : "p:pic";
      const closeTag = `</${tag}>`;
      const closeIdx = xml.indexOf(closeTag, idx);
      if (closeIdx === -1) break;

      xml = xml.slice(0, openIdx) + xml.slice(closeIdx + closeTag.length);
    }
  }
  return xml;
}

// ─── Scratch-build constants ─────────────────────────────────────────────────
// Todas as medidas validadas contra o SeniorTec 2026.pptx (fonte oficial)
// Conversão: 1px = 6350 EMU (slide 12192000×6858000 = 1920×1080px)

const W          = 12192000; // largura do slide EMU
const H          = 6858000;  // altura do slide EMU
const MARGIN     = 698500;   // 110px margem lateral (SeniorTec spec)
const EYEBROW_Y  = 444500;   // 70px topo do eyebrow
const TITLE_Y    = 762000;   // 120px topo do título
const FOOTER_Y   = 6305550;  // 993px topo do rodapé
const PAGE_NUM_X = 11328400; // 1784px início do número de página
const CONTENT_Y  = 2286000;  // 360px início da área de conteúdo

// Logo — dimensões validadas contra SeniorTec 2026: 97×40px, x=1713px
const LOGO_W = 615950;  // 97px
const LOGO_H = 254000;  // 40px
const LOGO_X = W - MARGIN - LOGO_W; // 1713px (margem direita = MARGIN)
const LOGO_Y = 444500;              // 70px (alinhado ao eyebrow)

// Paleta Dati (hex sem #)
const C = {
  navy:        "1A0F3D",
  purple:      "6838E8",
  purpleMed:   "8F65FE",
  purpleTint:  "8C7DFF",
  purpleDark:  "3629D1",
  purpleDarker:"3503BB",
  purpleMid:   "6F62FF",
  purpleSubtle:"655CC6",
  neutralLight:"EDF0F2",
  textMuted:   "5B5570",
  footerDark:  "9891AB",  // rodapé sobre fundo escuro
  footerLight: "77718A",  // rodapé sobre fundo claro (SeniorTec spec)
  cyan:        "5EBAE8",
  white:       "FFFFFF",
  orange:      "F59D01",
  green:       "72E600",
};

// Mapa icone → Unicode (Segoe UI Symbol)
const ICON_MAP = {
  gear:     "⚙",
  lightning:"⚡",
  layers:   "▤",
  loop:     "↻",
  code:     "⌨",
  database: "◉",
  shield:   "⛨",
  diff:     "≠",
  check:    "✓",
  audit:    "⊙",
  arrow:    "→",
  star:     "★",
  diamond:  "◆",
  cloud:    "☁",
  funnel:   "▽",
  merge:    "⑂",
  branch:   "⑃",
  lock:     "⊠",
  chart:    "↗",
};

function buildGradientFill(stops, angleDeg = 90) {
  const ang = Math.round(angleDeg * 60000);
  const gsLst = stops.map(s =>
    `<a:gs pos="${s.pos}"><a:srgbClr val="${s.hex}"/></a:gs>`
  ).join("");
  return `<a:gradFill><a:gsLst>${gsLst}</a:gsLst><a:lin ang="${ang}" scaled="0"/></a:gradFill>`;
}

function buildSolidFill(hex) {
  return `<a:solidFill><a:srgbClr val="${hex}"/></a:solidFill>`;
}

function buildBackground(mode) {
  const fill = mode === "dark"
    ? buildGradientFill([
        { pos: 0,      hex: "0D0824" },
        { pos: 55000,  hex: "1A0F3D" },
        { pos: 100000, hex: "2B1B5C" },
      ], 135)
    : buildSolidFill(C.neutralLight);
  return `<p:bg><p:bgPr>${fill}<a:effectLst/></p:bgPr></p:bg>`;
}

function buildPlainRect(id, x, y, w, h, fillXml, strokeHex = null) {
  const ln = strokeHex
    ? `<a:ln w="25400"><a:solidFill><a:srgbClr val="${strokeHex}"/></a:solidFill></a:ln>`
    : `<a:ln><a:noFill/></a:ln>`;
  return `<p:sp>
    <p:nvSpPr><p:cNvPr id="${id}" name="Rect${id}"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
    <p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm>
      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>${fillXml}${ln}</p:spPr>
    <p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody>
  </p:sp>`;
}

function buildRoundedRect(id, x, y, w, h, adj, fillXml, strokeHex = null) {
  const ln = strokeHex
    ? `<a:ln w="38100"><a:solidFill><a:srgbClr val="${strokeHex}"/></a:solidFill></a:ln>`
    : `<a:ln><a:noFill/></a:ln>`;
  return `<p:sp>
    <p:nvSpPr><p:cNvPr id="${id}" name="RRect${id}"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
    <p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm>
      <a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val ${adj}"/></a:avLst></a:prstGeom>
      ${fillXml}${ln}</p:spPr>
    <p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody>
  </p:sp>`;
}

function buildTextShape(id, x, y, w, h, paragraphs, bodyAttrs = "") {
  const paras = paragraphs.map(p =>
    buildParagraph(p.runs, { algn: p.algn || "l", lnSpc: p.lnSpc || "100000" })
  ).join("");
  return `<p:sp>
    <p:nvSpPr><p:cNvPr id="${id}" name="Txt${id}"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
    <p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm>
      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln w="0"><a:noFill/></a:ln></p:spPr>
    <p:txBody><a:bodyPr wrap="square" lIns="0" rIns="0" tIns="0" bIns="0" ${bodyAttrs}><a:normAutofit/></a:bodyPr>
      <a:lstStyle/>${paras}</p:txBody>
  </p:sp>`;
}

function buildArrowText(id, x, y, char, color, sz = 2000) {
  const run = buildRun(char, { color, sz, typeface: "Segoe UI Symbol" });
  return buildTextShape(id, x, y, 400000, 400000,
    [{ runs: run, algn: "ctr" }], 'anchor="ctr"');
}

/** Barra de acento gradiente (88×7px) acima do eyebrow */
function buildAccentBar(id, x, y) {
  const fill = buildGradientFill([
    { pos: 0,      hex: C.purpleDarker },
    { pos: 100000, hex: C.purple },
  ], 90);
  return buildRoundedRect(id, x, y, 558800, 44450, 50000, fill);  // 88×7px, raio arredondado
}

/**
 * Monta o "chrome" de um slide claro scratch-built:
 * barra de acento + eyebrow + título + logo
 * Retorna XML concatenado. idBase: ID inicial (usa 10, 11, 12, 13, 22).
 */
function buildSlideChrome(eyebrow, titulo, dark = false) {
  const ACCENT_Y = EYEBROW_Y - 95250;  // ~15px acima do eyebrow
  return [
    buildAccentBar(10, MARGIN, ACCENT_Y),
    buildEyebrowShape(11, eyebrow || "", MARGIN, EYEBROW_Y, dark),
    buildTitleShape(12, titulo || "", MARGIN, TITLE_Y, W - 2 * MARGIN, dark),
    buildLogoShape(22, "rId1", LOGO_X, LOGO_Y, LOGO_W, LOGO_H),
  ].join("");
}

function buildEyebrowShape(id, text, x, y, dark = false) {
  const run = buildRun(text.toUpperCase(), {
    color: dark ? C.purpleTint : C.purpleMed, sz: 1800, typeface: "Manrope"
  });
  return buildTextShape(id, x, y, W - x - MARGIN, 450000, [{ runs: run }]);
}

function buildTitleShape(id, titulo, x, y, w, dark = false) {
  let runs;
  if (typeof titulo === "string") {
    runs = buildRun(titulo, {
      color: dark ? C.white : C.navy,
      sz: 4700, bold: true, typeface: "Manrope"
    });
  } else {
    runs = titulo.map(t => buildRun(t.text, {
      color: t.emphasis ? (dark ? C.purpleTint : C.purpleMed) : (dark ? C.white : C.navy),
      sz: 4700, bold: true, typeface: "Manrope"
    })).join("");
  }
  return buildTextShape(id, x, y, w, 1200000, [{ runs, lnSpc: "90000" }]);
}

function buildFooterShapes(deckName, pageNum, dark = false) {
  const color = dark ? C.footerDark : C.footerLight;
  const y = FOOTER_Y;
  const leftRun  = buildRun(deckName, { color, sz: 1800, typeface: "Manrope" });
  const rightRun = buildRun(String(pageNum).padStart(2, "0"), { color, sz: 1800, bold: true, typeface: "Manrope" });
  return [
    buildTextShape(900, MARGIN, y, 9000000, 350000, [{ runs: leftRun }]),
    buildTextShape(901, PAGE_NUM_X, y, W - PAGE_NUM_X - MARGIN, 350000,
      [{ runs: rightRun, algn: "r" }]),
  ].join("");
}

function buildIconBadge(icone, x, y, id) {
  const SIZE = 670000;
  const char = ICON_MAP[icone] || "◆";
  const fill = buildGradientFill([
    { pos: 0,      hex: C.purpleMid },
    { pos: 100000, hex: C.purpleDark },
  ], 90);
  const badge = buildRoundedRect(id, x, y, SIZE, SIZE, 25000, fill);
  const iconRun = buildRun(char, { color: C.white, sz: 2000, typeface: "Segoe UI Symbol" });
  const iconTxt = buildTextShape(id + 1, x, y, SIZE, SIZE,
    [{ runs: iconRun, algn: "ctr" }], 'anchor="ctr"');
  return badge + iconTxt;
}

/**
 * Injeta badges de ícone no XML de um slide cards MAP-based.
 * Localiza o fim de </p:spTree> e insere os badges antes dele.
 * cards: [{icone, ...}] — usa índice 0-3 para posição
 */
function appendIconBadgesToSlideXml(xml, cards) {
  if (!Array.isArray(cards) || cards.length === 0) return xml;

  // Coordenadas X dos 4 cards no slide8 do MAP (medidas pelo pixel da ref)
  const CARD_X = [533400, 3200400, 5867400, 8534400];
  // Y superior dos cards no slide8
  const CARD_Y = 2133600;
  const BADGE_OFFSET_X = 200000;
  const BADGE_OFFSET_Y = 200000;

  let badgesXml = "";
  let idBase = 2000;
  cards.forEach((card, i) => {
    if (!card.icone || !CARD_X[i]) return;
    badgesXml += buildIconBadge(
      card.icone,
      CARD_X[i] + BADGE_OFFSET_X,
      CARD_Y + BADGE_OFFSET_Y,
      idBase + i * 2
    );
  });

  return xml.replace("</p:spTree>", badgesXml + "</p:spTree>");
}

function buildScratchSlide(bgXml, shapesXml) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    ${bgXml}
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>
        <a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      ${shapesXml}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
}

function buildScratchRels(mediaRefs = []) {
  const imageRels = mediaRefs.map(r =>
    `<Relationship Id="${r.rId}" ` +
    `Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" ` +
    `Target="${r.target}"/>`
  ).join("\n  ");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdLayout" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout3.xml"/>
  ${imageRels}
</Relationships>`;
}

/**
 * Gera <p:pic> para o logo navy.
 * rId: relationship ID (ex: "rId1") definido no _rels do slide
 */
function buildLogoShape(id, rId, x, y, w, h) {
  return `<p:pic>
    <p:nvPicPr>
      <p:cNvPr id="${id}" name="Logo"/>
      <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>
      <p:nvPr/>
    </p:nvPicPr>
    <p:blipFill>
      <a:blip r:embed="${rId}"/>
      <a:stretch><a:fillRect/></a:stretch>
    </p:blipFill>
    <p:spPr>
      <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm>
      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
    </p:spPr>
  </p:pic>`;
}

/**
 * Gera o XML de notesSlide para um slide.
 * text: string com o conteúdo das notas.
 */
function buildNotesSlide(text) {
  const escaped = xmlEsc(text || "");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
         xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
         xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree>
    <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
    <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>
      <a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    <p:sp>
      <p:nvSpPr><p:cNvPr id="2" name="Notes"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
        <p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr>
      <p:spPr/>
      <p:txBody><a:bodyPr/><a:lstStyle/>
        <a:p><a:r><a:rPr lang="pt-BR" sz="1200"/><a:t>${escaped}</a:t></a:r></a:p>
      </p:txBody>
    </p:sp>
  </p:spTree></p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:notes>`;
}

function buildNotesRels(slideNum) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide"
    Target="../slides/slide${slideNum}.xml"/>
</Relationships>`;
}

// ─── Template definitions ────────────────────────────────────────────────────
// Maps slide types to source slide numbers from the MAP PPTX.
// Text slots = { "exact XML text to find" => "slot name in input JSON" }

const TEMPLATE_MAP = {

  // ── CAPA (slide1) ──────────────────────────────────────────────────────────
  capa: {
    sourceSlide: 1,
    render(xml, s) {
      if (s.tag !== undefined)
        xml = replaceText(xml, "Consultoria em Cloud &amp; AI", s.tag || "Consultoria em Cloud &amp; AI");
      if (s.titulo !== undefined)
        xml = replaceText(xml, "Acelerando a Jornada", s.titulo);
      if (s.titulo2 !== undefined)
        xml = replaceText(xml, "de adoção da nuvem", s.titulo2);
      if (s.subtitulo !== undefined)
        xml = replaceText(
          xml,
          "Como a experiência da Dati pode ajudar empresas a migrar e modernizar seus ambientes na nuvem AWS",
          s.subtitulo
        );
      return xml;
    },
  },

  // ── SEÇÃO (slide12 — mais simples: só eyebrow + título + footer) ───────────
  secao: {
    sourceSlide: 12,
    render(xml, s, { deckName, pageNum }) {
      if (s.eyebrow !== undefined)
        xml = replaceText(xml, "A ACELERAÇÃO", s.eyebrow.toUpperCase());

      // Title at y=3014663 — handle multi-line titles (split by \n)
      if (s.titulo !== undefined) {
        const lines = String(s.titulo).split("\n").filter(Boolean);
        if (lines.length <= 1) {
          xml = replaceText(xml, "Onde a Dati encurta o caminho", lines[0] || "");
        } else {
          // Rebuild text box with one paragraph per line
          const paragraphs = lines.map(line => {
            const run = buildRun(line, { color: "FFFFFF", sz: 4700 });
            return buildParagraph(run, { lnSpc: "90000" });
          }).join("");
          const newTxBody = `<p:txBody><a:bodyPr anchorCtr="0" anchor="t" bIns="16925" lIns="16925" spcFirstLastPara="1" rIns="16925" wrap="square" tIns="16925"><a:normAutofit/></a:bodyPr><a:lstStyle/>${paragraphs}</p:txBody>`;
          xml = rebuildTextBox(xml, "3014663", newTxBody);
        }
      }

      xml = replaceText(xml, "Dati | Migração e modernização na AWS", deckName);
      xml = replaceText(xml, "12", String(pageNum).padStart(2, "0"));
      return xml;
    },
  },

  // ── CONTEÚDO (scratch) ────────────────────────────────────────────────────
  conteudo: {
    build(s, { deckName, pageNum }) {
      const bg     = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const items = s.itens
        ? (Array.isArray(s.itens) ? s.itens : [s.itens])
        : (s.corpo !== undefined ? [s.corpo] : []);

      let bodyXml = "";
      if (items.length > 0) {
        const BODY_W = W - 2 * MARGIN;
        const paras = items.map(item => {
          if (typeof item === "string") {
            return { runs: buildRun(item, { color: C.textMuted, sz: 2300 }), lnSpc: "120000" };
          }
          const runs = item.map(t =>
            buildRun(t.text, { color: t.emphasis ? C.purpleMed : C.textMuted, sz: 2300 })
          ).join("");
          return { runs, lnSpc: "120000" };
        });
        bodyXml = buildTextShape(30, MARGIN, CONTENT_Y, BODY_W, FOOTER_Y - CONTENT_Y - 250000, paras);
      }

      const footer = buildFooterShapes(deckName, pageNum, false);
      const xml = buildScratchSlide(bg, chrome + bodyXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── IMPACTO (slide14 — fundo escuro, título grande com destaque ciano) ─────
  impacto: {
    sourceSlide: 14,
    render(xml, s, { deckName, pageNum }) {
      if (s.eyebrow !== undefined)
        xml = replaceText(xml, "OU SEJA", s.eyebrow.toUpperCase());

      // O título do slide14 tem múltiplos runs numa só caixa (y=2357733)
      // Estrutura original: texto branco + destaque em ciano
      const titulo = s.titulo || "";
      const destaque = s.tituloDestaque || "";

      // Rebuilt title paragraph
      const runs = [
        titulo && buildRun(titulo, { color: "FFFFFF", sz: 2800 }),
        destaque && buildRun(" " + destaque, { color: "5EBAE8", bold: true, sz: 2800 }),
      ].filter(Boolean).join("");

      const newTxBody = `<p:txBody><a:bodyPr anchorCtr="0" anchor="t" bIns="16925" lIns="16925" spcFirstLastPara="1" rIns="16925" wrap="square" tIns="16925"><a:normAutofit/></a:bodyPr><a:lstStyle/>${buildParagraph(runs, { lnSpc: "99927" })}</p:txBody>`;
      xml = rebuildTextBox(xml, "2357733", newTxBody);

      xml = replaceText(xml, "Dati | Migração e modernização na AWS", deckName);
      xml = replaceText(xml, "14", String(pageNum).padStart(2, "0"));
      return xml;
    },
  },

  // ── CTA / PRÓXIMO PASSO (scratch) ─────────────────────────────────────────
  cta: {
    build(s, { deckName, pageNum }) {
      const bg = buildBackground("light");

      // Chrome manual — título suporta tituloDestaque como campo separado
      const ACCENT_Y = EYEBROW_Y - 95250;
      let tituloRuns;
      if (Array.isArray(s.titulo)) {
        tituloRuns = s.titulo.map(t => buildRun(t.text, {
          color: t.emphasis ? C.purpleMed : C.navy, sz: 4700, bold: true, typeface: "Manrope",
        })).join("");
      } else {
        const plain    = (s.titulo || "") + (s.tituloDestaque ? " " : "");
        tituloRuns     = buildRun(plain, { color: C.navy, sz: 4700, bold: true, typeface: "Manrope" });
        if (s.tituloDestaque)
          tituloRuns  += buildRun(s.tituloDestaque, { color: C.purpleMed, sz: 4700, bold: true, typeface: "Manrope" });
      }
      const chrome = [
        buildAccentBar(10, MARGIN, ACCENT_Y),
        buildEyebrowShape(11, s.eyebrow || "", MARGIN, EYEBROW_Y, false),
        buildTextShape(12, MARGIN, TITLE_Y, W - 2 * MARGIN, 1200000,
          [{ runs: tituloRuns, lnSpc: "90000" }]),
        buildLogoShape(22, "rId1", LOGO_X, LOGO_Y, LOGO_W, LOGO_H),
      ].join("");

      let idCounter = 30;
      let bodyXml   = "";

      // instrucao — corpo de texto
      if (s.instrucao !== undefined) {
        const run = buildRun(s.instrucao, { color: C.textMuted, sz: 2300, typeface: "Manrope" });
        bodyXml += buildTextShape(idCounter++, MARGIN, CONTENT_Y,
          W - 2 * MARGIN - 2000000, FOOTER_Y - CONTENT_Y - 1500000,
          [{ runs: run, lnSpc: "140000" }]);
      }

      // ctaLabel — pílula/botão de ação
      if (s.ctaLabel !== undefined) {
        const BTN_W = 3500000;
        const BTN_H = 475000;
        const BTN_Y = FOOTER_Y - 1200000;
        const btnFill = buildGradientFill([
          { pos: 0,      hex: C.purpleDarker },
          { pos: 100000, hex: C.purple },
        ], 90);
        bodyXml += buildRoundedRect(idCounter++, MARGIN, BTN_Y, BTN_W, BTN_H, 50000, btnFill);
        const btnRun = buildRun(s.ctaLabel, { color: C.white, sz: 2000, bold: true, typeface: "Manrope" });
        bodyXml += buildTextShape(idCounter++, MARGIN, BTN_Y, BTN_W, BTN_H,
          [{ runs: btnRun, algn: "ctr" }], 'anchor="ctr"');
      }

      const footer = buildFooterShapes(deckName, pageNum, false);
      const xml    = buildScratchSlide(bg, chrome + bodyXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── BIGWORD (scratch — fundo escuro, número/palavra de impacto) ──────────────
  bigword: {
    build(s, { deckName, pageNum }) {
      const bg = buildBackground("dark");

      // Chrome manual — bigword ocupa a posição do título; eyebrow e logo ficam no topo
      const ACCENT_Y = EYEBROW_Y - 95250;
      const chrome = [
        buildAccentBar(10, MARGIN, ACCENT_Y),
        buildEyebrowShape(11, s.eyebrow || "", MARGIN, EYEBROW_Y, true),
        buildLogoShape(22, "rId1", LOGO_X, LOGO_Y, LOGO_W, LOGO_H),
      ].join("");

      // Bigword — impacto visual principal (sz 5300 ≈ 53pt ≈ 102px spec)
      const bigRun = buildRun(s.bigword || "", {
        color: C.white, sz: 5300, bold: true, typeface: "Manrope",
      });
      const bigwordShape = buildTextShape(13, MARGIN, TITLE_Y, W - 2 * MARGIN, 900000,
        [{ runs: bigRun, lnSpc: "90000" }]);

      // Titulo — subtítulo imediatamente abaixo do bigword
      let tituloShape = "";
      if (s.titulo !== undefined) {
        let runs;
        if (typeof s.titulo === "string") {
          runs = buildRun(s.titulo, { color: C.white, sz: 2800, typeface: "Manrope" });
        } else {
          runs = s.titulo.map(t => buildRun(t.text, {
            color: t.emphasis ? C.purpleTint : C.white, sz: 2800, typeface: "Manrope",
          })).join("");
        }
        tituloShape = buildTextShape(14, MARGIN, TITLE_Y + 950000, W - 2 * MARGIN, 600000,
          [{ runs, lnSpc: "120000" }]);
      }

      // Corpo — texto de apoio na área de conteúdo
      let corpoShape = "";
      if (s.corpo !== undefined) {
        const run = buildRun(s.corpo, { color: C.purpleTint, sz: 2000, typeface: "Manrope" });
        corpoShape = buildTextShape(15, MARGIN, CONTENT_Y, W - 2 * MARGIN,
          FOOTER_Y - CONTENT_Y - 300000, [{ runs: run, lnSpc: "130000" }]);
      }

      const footer  = buildFooterShapes(deckName, pageNum, true);
      const xml     = buildScratchSlide(bg, chrome + bigwordShape + tituloShape + corpoShape + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── CARDS (scratch — dark background, 4 colunas, sem overlap de badges) ─────
  cards: {
    build(s, { deckName, pageNum }) {
      const cardItems = Array.isArray(s.cards) ? s.cards.slice(0, 4) : [];
      const n = Math.max(cardItems.length, 1);
      const bg     = buildBackground("dark");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, true);

      const CARD_Y   = CONTENT_Y;
      const CARD_H   = 4000000;
      const GAP      = 200000;
      const USABLE_W = W - 2 * MARGIN;
      const CARD_W   = Math.floor((USABLE_W - (n - 1) * GAP) / n);

      const cardFill = buildGradientFill([
        { pos: 0,      hex: "201453" },
        { pos: 100000, hex: "2D1D69" },
      ], 180);

      let idCounter = 30;
      let cardsXml = "";

      cardItems.forEach((card, i) => {
        const cx = MARGIN + i * (CARD_W + GAP);

        // Card background
        cardsXml += buildRoundedRect(idCounter++, cx, CARD_Y, CARD_W, CARD_H, 8000, cardFill);

        // Número (01, 02, 03, 04) — pequeno, topo do card
        const numRun = buildRun(String(i + 1).padStart(2, "0"), {
          color: C.purpleTint, sz: 1000, bold: true, typeface: "Manrope",
        });
        cardsXml += buildTextShape(idCounter++, cx + 220000, CARD_Y + 220000,
          CARD_W - 440000, 350000, [{ runs: numRun }]);

        // Icon badge abaixo do número
        cardsXml += buildIconBadge(card.icone || "diamond", cx + 220000, CARD_Y + 580000, idCounter);
        idCounter += 2;

        // Título do card
        const tRun = buildRun(card.titulo || "", {
          color: C.white, sz: 3200, bold: true, typeface: "Manrope",
        });
        cardsXml += buildTextShape(idCounter++, cx + 220000, CARD_Y + 1400000,
          CARD_W - 440000, 650000, [{ runs: tRun }]);

        // Descrição
        const dRun = buildRun(card.descricao || "", {
          color: C.purpleTint, sz: 2300, typeface: "Manrope",
        });
        cardsXml += buildTextShape(idCounter++, cx + 220000, CARD_Y + 2100000,
          CARD_W - 440000, 1700000, [{ runs: dRun, lnSpc: "130000" }]);
      });

      const footer = buildFooterShapes(deckName, pageNum, true);
      const xml = buildScratchSlide(bg, chrome + cardsXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── COMPARAÇÃO (scratch — 2 colunas: esquerda neutra, direita roxo) ──────────
  comparacao: {
    build(s, { deckName, pageNum }) {
      const bg     = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const GAP     = 300000;
      const COL_W   = Math.floor((W - 2 * MARGIN - GAP) / 2);
      const PANEL_H = FOOTER_Y - CONTENT_Y - 200000;
      const PAD     = 250000;

      const esq = s.esquerda || {};
      const dir = s.direita  || {};
      let idCounter = 30;
      let panelsXml = "";

      // Left panel — branco com borda lavanda
      panelsXml += buildRoundedRect(idCounter++, MARGIN, CONTENT_Y, COL_W, PANEL_H, 8000,
        buildSolidFill("FFFFFF"), "DDD6EE");
      if (esq.rotulo) {
        const run = buildRun(String(esq.rotulo).toUpperCase(), { color: C.purpleMed, sz: 1600, bold: true, typeface: "Manrope" });
        panelsXml += buildTextShape(idCounter++, MARGIN + PAD, CONTENT_Y + PAD, COL_W - 2 * PAD, 350000,
          [{ runs: run }]);
      }
      if (esq.titulo) {
        const run = buildRun(esq.titulo, { color: C.navy, sz: 3200, bold: true, typeface: "Manrope" });
        panelsXml += buildTextShape(idCounter++, MARGIN + PAD, CONTENT_Y + PAD + 400000, COL_W - 2 * PAD, 800000,
          [{ runs: run, lnSpc: "110000" }]);
      }
      if (esq.descricao) {
        const run = buildRun(esq.descricao, { color: C.textMuted, sz: 2000, typeface: "Manrope" });
        panelsXml += buildTextShape(idCounter++, MARGIN + PAD, CONTENT_Y + PAD + 1300000, COL_W - 2 * PAD,
          PANEL_H - 1300000 - 2 * PAD, [{ runs: run, lnSpc: "130000" }]);
      }

      // Right panel — gradiente roxo
      const rightX = MARGIN + COL_W + GAP;
      const rightFill = buildGradientFill([
        { pos: 0,      hex: C.purpleDarker },
        { pos: 100000, hex: C.purple },
      ], 135);
      panelsXml += buildRoundedRect(idCounter++, rightX, CONTENT_Y, COL_W, PANEL_H, 8000, rightFill);
      if (dir.rotulo) {
        const run = buildRun(String(dir.rotulo).toUpperCase(), { color: C.purpleTint, sz: 1600, bold: true, typeface: "Manrope" });
        panelsXml += buildTextShape(idCounter++, rightX + PAD, CONTENT_Y + PAD, COL_W - 2 * PAD, 350000,
          [{ runs: run }]);
      }
      if (dir.titulo) {
        const run = buildRun(dir.titulo, { color: C.white, sz: 3200, bold: true, typeface: "Manrope" });
        panelsXml += buildTextShape(idCounter++, rightX + PAD, CONTENT_Y + PAD + 400000, COL_W - 2 * PAD, 800000,
          [{ runs: run, lnSpc: "110000" }]);
      }
      if (dir.descricao) {
        const run = buildRun(dir.descricao, { color: C.purpleTint, sz: 2000, typeface: "Manrope" });
        panelsXml += buildTextShape(idCounter++, rightX + PAD, CONTENT_Y + PAD + 1300000, COL_W - 2 * PAD,
          PANEL_H - 1300000 - 2 * PAD, [{ runs: run, lnSpc: "130000" }]);
      }

      const footer  = buildFooterShapes(deckName, pageNum, false);
      const xml     = buildScratchSlide(bg, chrome + panelsXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── LISTA-ÍCONE (scratch) ─────────────────────────────────────────────────────
  "lista-icone": {
    build(s, { deckName, pageNum }) {
      const items = Array.isArray(s.items) ? s.items.slice(0, 5) : [];
      const bg = buildBackground("light");

      // Eyebrow e título — sem sidebar, alinhados à margem padrão
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      // Itens
      const ITEM_Y_START = CONTENT_Y;
      const ITEM_SPACING = 950000;
      const BADGE_SIZE   = 670000;
      const TEXT_X       = MARGIN + BADGE_SIZE + 200000; // badge + gap
      const TEXT_W       = W - TEXT_X - MARGIN;

      let idCounter = 30;
      let itemsXml = "";
      items.forEach((item, i) => {
        const y = ITEM_Y_START + i * ITEM_SPACING;
        // Badge
        itemsXml += buildIconBadge(item.icone || "diamond", MARGIN, y, idCounter);
        idCounter += 2;
        // Título do item
        const titleRun = buildRun(item.titulo || "", { color: C.navy, sz: 3200, bold: true, typeface: "Manrope" });
        itemsXml += buildTextShape(idCounter++, TEXT_X, y, TEXT_W, 560000, [{ runs: titleRun }]);
        // Descrição
        const descRun = buildRun(item.descricao || "", { color: C.textMuted, sz: 2300, typeface: "Manrope" });
        itemsXml += buildTextShape(idCounter++, TEXT_X, y + 520000, TEXT_W, 400000, [{ runs: descRun }]);
      });

      const footer = buildFooterShapes(deckName, pageNum, false);
      const xml = buildScratchSlide(bg, chrome + itemsXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── GRID-ÍCONE (scratch) ──────────────────────────────────────────────────────
  "grid-icone": {
    build(s, { deckName, pageNum }) {
      const items = (Array.isArray(s.items) ? s.items : []).slice(0, 4);
      const bg = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const CARD_W = 5400000;
      const CARD_H = 2200000;
      const GAP    = 292800;
      const COL_X  = [MARGIN, MARGIN + CARD_W + GAP];
      const ROW_Y  = [1828800, 1828800 + CARD_H + GAP];

      const cardFill = buildSolidFill("FFFFFF");
      let idCounter = 30;
      let cardsXml = "";

      items.forEach((item, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx = COL_X[col];
        const cy = ROW_Y[row];

        // Card background
        cardsXml += buildRoundedRect(idCounter++, cx, cy, CARD_W, CARD_H, 8000, cardFill);

        // Badge no topo esquerdo do card
        cardsXml += buildIconBadge(item.icone || "diamond", cx + 200000, cy + 200000, idCounter);
        idCounter += 2;

        // Título do item
        const tRun = buildRun(item.titulo || "", { color: C.navy, sz: 3200, bold: true, typeface: "Manrope" });
        cardsXml += buildTextShape(idCounter++, cx + 200000, cy + 1000000, CARD_W - 400000, 500000, [{ runs: tRun }]);

        // Descrição
        const dRun = buildRun(item.descricao || "", { color: C.textMuted, sz: 2300, typeface: "Manrope" });
        cardsXml += buildTextShape(idCounter++, cx + 200000, cy + 1500000, CARD_W - 400000, 600000, [{ runs: dRun, lnSpc: "110000" }]);
      });

      const footer = buildFooterShapes(deckName, pageNum, false);
      const xml = buildScratchSlide(bg, chrome + cardsXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── PIPELINE (scratch) ────────────────────────────────────────────────────────
  pipeline: {
    build(s, { deckName, pageNum }) {
      const steps = Array.isArray(s.steps) ? s.steps.slice(0, 6) : [];
      const n = steps.length;
      if (n === 0) {
        const bg = buildBackground("light");
        const eyebrow = buildEyebrowShape(20, s.eyebrow || "", MARGIN, EYEBROW_Y, false);
        const title   = buildTitleShape(21, s.titulo || "", MARGIN, TITLE_Y, W - 2 * MARGIN, false);
        const logo    = buildLogoShape(22, "rId1", LOGO_X, LOGO_Y, LOGO_W, LOGO_H);
        const footer  = buildFooterShapes(deckName, pageNum, false);
        const xml = buildScratchSlide(bg, chrome + footer);
        const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
        return { xml, relsXml };
      }
      const bg = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const PIPE_Y   = 2700000;
      const STEP_H   = 1400000;
      const ARROW_W  = 300000;
      const TOTAL_W  = W - 2 * MARGIN;
      const STEP_W   = Math.floor((TOTAL_W - (n - 1) * ARROW_W) / n);

      let idCounter = 30;
      let stepsXml = "";

      steps.forEach((step, i) => {
        const x = MARGIN + i * (STEP_W + ARROW_W);

        // Cor do step
        let fill;
        if (i === n - 1) {
          fill = buildSolidFill(C.navy);
        } else if (step.gate) {
          fill = buildSolidFill(C.orange);
        } else {
          fill = buildGradientFill([
            { pos: 0,      hex: C.purpleMid },
            { pos: 100000, hex: C.purpleDark },
          ], 135);
        }

        stepsXml += buildRoundedRect(idCounter++, x, PIPE_Y, STEP_W, STEP_H, 8000, fill);

        // Label
        const lRun = buildRun(step.label || "", { color: C.white, sz: 1800, bold: true, typeface: "Manrope" });
        stepsXml += buildTextShape(idCounter++, x, PIPE_Y + 350000, STEP_W, 550000,
          [{ runs: lRun, algn: "ctr" }]);

        // Descrição
        const dRun = buildRun(step.descricao || "", { color: "FFFFFFBB", sz: 1600, typeface: "Manrope" });
        stepsXml += buildTextShape(idCounter++, x, PIPE_Y + 900000, STEP_W, 400000,
          [{ runs: dRun, algn: "ctr" }]);

        // Seta (não após o último)
        if (i < n - 1) {
          stepsXml += buildArrowText(idCounter++,
            x + STEP_W, PIPE_Y + STEP_H / 2 - 200000,
            "›", C.footerLight, 2800);
        }
      });

      const footer = buildFooterShapes(deckName, pageNum, false);
      const xml = buildScratchSlide(bg, chrome + stepsXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── TIMELINE (scratch) ────────────────────────────────────────────────────────
  timeline: {
    build(s, { deckName, pageNum }) {
      const steps = Array.isArray(s.steps) ? s.steps.slice(0, 5) : [];
      const n = steps.length;
      const bg = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const LINE_Y   = 2950000; // raised from 3600000 for better vertical balance
      const CIRCLE_D = 500000;  // reduced from 800000 — proportional to reference
      const CIRCLE_R = CIRCLE_D / 2;
      const USABLE_W = W - 2 * MARGIN;
      const STEP_GAP = Math.floor(USABLE_W / (n - 1 || 1));
      // Column width per step (for centered text boxes)
      const COL_W    = n > 1 ? STEP_GAP : USABLE_W;
      const HALF_COL = Math.floor(COL_W / 2);

      // Linha horizontal de fundo
      const lineFill = buildSolidFill(C.purpleSubtle);
      let timelineXml = buildPlainRect(10, MARGIN, LINE_Y - 12500, USABLE_W, 25000, lineFill);

      let idCounter = 30;
      steps.forEach((step, i) => {
        const cx = MARGIN + (n > 1 ? i * STEP_GAP : USABLE_W / 2);
        const cy = LINE_Y - CIRCLE_R;

        // Círculo gradiente — menor e mais proporcional
        const circleFill = buildGradientFill([
          { pos: 0,      hex: C.purpleMid },
          { pos: 100000, hex: C.purpleDark },
        ], 135);
        timelineXml += buildRoundedRect(idCounter++, cx - CIRCLE_R, cy, CIRCLE_D, CIRCLE_D, 50000, circleFill);

        // Número
        const numRun = buildRun(String(i + 1), { color: C.white, sz: 1600, bold: true, typeface: "Manrope" });
        timelineXml += buildTextShape(idCounter++, cx - CIRCLE_R, cy, CIRCLE_D, CIRCLE_D,
          [{ runs: numRun, algn: "ctr" }], 'anchor="ctr"');

        // Label — centered in column width for uniform alignment
        const lRun = buildRun(step.label || "", { color: C.navy, sz: 1800, bold: true, typeface: "Manrope" });
        timelineXml += buildTextShape(idCounter++,
          cx - Math.min(HALF_COL, 900000), LINE_Y + CIRCLE_R + 120000,
          Math.min(COL_W, 1800000), 430000,
          [{ runs: lRun, algn: "ctr" }]);

        // Descrição — wider box, smaller text
        const dRun = buildRun(step.descricao || "", { color: C.textMuted, sz: 1600, typeface: "Manrope" });
        timelineXml += buildTextShape(idCounter++,
          cx - Math.min(HALF_COL, 900000), LINE_Y + CIRCLE_R + 560000,
          Math.min(COL_W, 1800000), 600000,
          [{ runs: dRun, algn: "ctr", lnSpc: "115000" }]);
      });

      const footer = buildFooterShapes(deckName, pageNum, false);
      const xml = buildScratchSlide(bg, chrome + timelineXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── KPI (scratch) ─────────────────────────────────────────────────────────────
  kpi: {
    build(s, { deckName, pageNum }) {
      const metricas = Array.isArray(s.metricas) ? s.metricas.slice(0, 4) : [];
      const dark = !!s.dark;
      const n = metricas.length || 1;
      const bg = buildBackground(dark ? "dark" : "light");

      const chrome = buildSlideChrome(s.eyebrow, s.titulo, dark);

      const CARD_H   = 2400000;
      const CARD_Y   = 2600000;
      const GAP      = 300000;
      const USABLE_W = W - 2 * MARGIN;
      const CARD_W   = Math.floor((USABLE_W - (n - 1) * GAP) / n);
      const BAR_H    = 200000;

      const cardBodyFill = dark
        ? buildGradientFill([{ pos: 0, hex: "1A0F3D" }, { pos: 100000, hex: "2B1B5C" }], 180)
        : buildSolidFill("FFFFFF");

      let idCounter = 30;
      let cardsXml = "";

      metricas.forEach((m, i) => {
        const cx = MARGIN + i * (CARD_W + GAP);

        // Card body
        cardsXml += buildRoundedRect(idCounter++, cx, CARD_Y, CARD_W, CARD_H, 8000, cardBodyFill);

        // Barra gradiente no topo
        const barFill = buildGradientFill([
          { pos: 0,      hex: C.purpleMid },
          { pos: 100000, hex: C.purpleDark },
        ], 0);
        cardsXml += buildPlainRect(idCounter++, cx, CARD_Y, CARD_W, BAR_H, barFill);

        // Valor grande
        const vColor = dark ? C.white : C.navy;
        const vRun = buildRun(m.valor || "", { color: vColor, sz: 4800, bold: true, typeface: "Manrope" });
        cardsXml += buildTextShape(idCounter++, cx + 200000, CARD_Y + BAR_H + 200000, CARD_W - 400000, 1200000,
          [{ runs: vRun, algn: "ctr" }], 'anchor="ctr"');

        // Label
        const lColor = dark ? C.purpleTint : C.textMuted;
        const lRun = buildRun(m.label || "", { color: lColor, sz: 2300, typeface: "Manrope" });
        cardsXml += buildTextShape(idCounter++, cx + 200000, CARD_Y + BAR_H + 1500000, CARD_W - 400000, 700000,
          [{ runs: lRun, algn: "ctr", lnSpc: "110000" }]);
      });

      const footer = buildFooterShapes(deckName, pageNum, dark);
      const xml = buildScratchSlide(bg, chrome + cardsXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── TRÊS PILARES (scratch) ────────────────────────────────────────────────────
  "tres-pilares": {
    build(s, { deckName, pageNum }) {
      const pilares = Array.isArray(s.pilares) ? s.pilares.slice(0, 3) : [];
      const bg = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const COL_Y    = CONTENT_Y;
      const COL_H    = 4200000;
      const HEADER_H = 600000;
      const GAP      = 200000;
      const USABLE_W = W - 2 * MARGIN;
      const COL_W    = Math.floor((USABLE_W - 2 * GAP) / 3);

      const headerFill = buildGradientFill([
        { pos: 0,      hex: C.purpleMid },
        { pos: 100000, hex: C.purpleDark },
      ], 135);
      const bodyFill = buildSolidFill("FFFFFF");

      let idCounter = 30;
      let colsXml = "";

      pilares.forEach((pilar, i) => {
        const cx = MARGIN + i * (COL_W + GAP);

        // Corpo do card
        colsXml += buildRoundedRect(idCounter++, cx, COL_Y, COL_W, COL_H, 5000, bodyFill);

        // Cabeçalho gradiente
        colsXml += buildPlainRect(idCounter++, cx, COL_Y, COL_W, HEADER_H, headerFill);

        // Título do pilar
        const tRun = buildRun((pilar.titulo || "").toUpperCase(), {
          color: C.white, sz: 3200, bold: true, typeface: "Manrope"
        });
        colsXml += buildTextShape(idCounter++, cx + 200000, COL_Y, COL_W - 400000, HEADER_H,
          [{ runs: tRun, algn: "ctr" }], 'anchor="ctr"');

        // Descrição
        const dRun = buildRun(pilar.descricao || "", { color: C.textMuted, sz: 2300, typeface: "Manrope" });
        colsXml += buildTextShape(idCounter++, cx + 200000, COL_Y + HEADER_H + 200000,
          COL_W - 400000, COL_H - HEADER_H - 400000, [{ runs: dRun, lnSpc: "120000" }]);
      });

      const footer = buildFooterShapes(deckName, pageNum, false);
      const xml = buildScratchSlide(bg, chrome + colsXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── DIAGRAMA-FLUXO (scratch) ──────────────────────────────────────────────────
  "diagrama-fluxo": {
    build(s, { deckName, pageNum }) {
      const camadas = Array.isArray(s.camadas) ? s.camadas : [];
      const bg = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const NODE_W   = 3200000;
      const NODE_H   = 800000;
      const NODE_GAP = 400000; // gap horizontal entre 2 nós na mesma camada
      const LAYER_H  = NODE_H + 500000; // altura total por camada (nó + seta)
      const CONTENT_Y_START = CONTENT_Y;

      const COR_FILL = {
        cyan:   () => buildSolidFill("5BBEED"),
        green:  () => buildSolidFill("A4DF64"),
        purple: () => buildGradientFill([{ pos: 0, hex: C.purpleMid }, { pos: 100000, hex: C.purpleDark }], 135),
        navy:   () => buildSolidFill(C.navy),
      };
      const COR_TEXT = { cyan: C.navy, green: C.navy, purple: C.white, navy: C.white };

      let idCounter = 30;
      let diagramXml = "";

      camadas.forEach((camada, layerIdx) => {
        const nos = Array.isArray(camada.nos) ? camada.nos.slice(0, 2) : [];
        const layerY = CONTENT_Y_START + layerIdx * LAYER_H;
        const isSingle = nos.length === 1;

        nos.forEach((no, ni) => {
          const cor = no.cor || "purple";
          const fill = (COR_FILL[cor] || COR_FILL.purple)();
          const txtColor = COR_TEXT[cor] || C.white;
          const stroke = no.destaque ? C.purple : null;

          // X: centralizado (1 nó) ou side-by-side (2 nós)
          let nx;
          if (isSingle) {
            nx = (W - NODE_W) / 2;
          } else {
            const totalW = NODE_W * 2 + NODE_GAP;
            nx = (W - totalW) / 2 + ni * (NODE_W + NODE_GAP);
          }

          diagramXml += buildRoundedRect(idCounter++, Math.round(nx), layerY, NODE_W, NODE_H, 8000, fill, stroke);

          // Label
          const lRun = buildRun(no.label || "", { color: txtColor, sz: 2000, bold: true, typeface: "Manrope" });
          diagramXml += buildTextShape(idCounter++, Math.round(nx) + 200000, layerY + 100000,
            NODE_W - 400000, 450000, [{ runs: lRun, algn: "ctr" }]);

          // Sublabel
          const sRun = buildRun(no.sublabel || "", { color: txtColor, sz: 1600, typeface: "Manrope" });
          diagramXml += buildTextShape(idCounter++, Math.round(nx) + 200000, layerY + 500000,
            NODE_W - 400000, 300000, [{ runs: sRun, algn: "ctr" }]);
        });

        // Seta entre camadas (não após a última)
        if (layerIdx < camadas.length - 1) {
          const arrowY = layerY + NODE_H + 100000;
          diagramXml += buildArrowText(idCounter++, (W - 400000) / 2, arrowY, "▼", C.footerLight, 2000);
        }
      });

      const footer = buildFooterShapes(deckName, pageNum, false);
      const xml = buildScratchSlide(bg, chrome + diagramXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── ENCERRAMENTO (slide18) ─────────────────────────────────────────────────
  encerramento: {
    sourceSlide: 18,
    render(xml, s, { deckName }) {
      if (s.titulo !== undefined)
        xml = replaceText(xml, "Obrigado!", s.titulo);
      // slide18 footer está numa caixa que contém "DATI | MIGRAÇÃO..."
      xml = replaceText(
        xml,
        "DATI | MIGRAÇÃO E MODERNIZAÇÃO NA AWS",
        (deckName || "DATI").toUpperCase()
      );
      return xml;
    },
  },

  // ── PAINEL-REGRA (scratch — faixa gradiente + 2 colunas) ─────────────────────
  "painel-regra": {
    build(s, { deckName, pageNum }) {
      const bg     = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const PANEL_H   = 927100;   // 146px
      const PANEL_W   = W - 2 * MARGIN;
      const panelFill = buildGradientFill([
        { pos: 0,      hex: C.purpleDarker },
        { pos: 100000, hex: C.purple },
      ], 90);
      let bodyXml = buildRoundedRect(30, MARGIN, CONTENT_Y, PANEL_W, PANEL_H, 8000, panelFill);

      if (s.painelRotulo) {
        const run = buildRun(s.painelRotulo, { color: "A4DF64", sz: 2000, bold: true, typeface: "Manrope" });
        bodyXml += buildTextShape(31, MARGIN + 350000, CONTENT_Y, PANEL_W - 700000, PANEL_H,
          [{ runs: run }], 'anchor="ctr"');
      }

      const COL_Y = CONTENT_Y + PANEL_H + 150000;
      const COL_H = FOOTER_Y - COL_Y - 200000;
      const HALF  = Math.floor(PANEL_W / 2);
      const PAD   = 200000;
      const FIO_W = 31750;
      const esq   = s.esquerda || {};
      const dir   = s.direita  || {};
      let   idC   = 32;

      bodyXml += buildPlainRect(idC++, MARGIN + HALF - Math.floor(FIO_W / 2), COL_Y,
        FIO_W, COL_H, buildSolidFill("C9C4D8"));

      if (esq.titulo) {
        const run = buildRun(esq.titulo, { color: C.navy, sz: 3200, bold: true, typeface: "Manrope" });
        bodyXml += buildTextShape(idC++, MARGIN + PAD, COL_Y + PAD, HALF - PAD - 100000, 700000,
          [{ runs: run, lnSpc: "110000" }]);
      }
      if (esq.descricao) {
        const run = buildRun(esq.descricao, { color: C.textMuted, sz: 2000, typeface: "Manrope" });
        bodyXml += buildTextShape(idC++, MARGIN + PAD, COL_Y + PAD + 750000, HALF - PAD - 100000,
          COL_H - PAD - 750000, [{ runs: run, lnSpc: "130000" }]);
      }

      const rightX = MARGIN + HALF + 100000;
      if (dir.titulo) {
        const run = buildRun(dir.titulo, { color: C.navy, sz: 3200, bold: true, typeface: "Manrope" });
        bodyXml += buildTextShape(idC++, rightX, COL_Y + PAD, HALF - PAD - 100000, 700000,
          [{ runs: run, lnSpc: "110000" }]);
      }
      if (dir.descricao) {
        const run = buildRun(dir.descricao, { color: C.textMuted, sz: 2000, typeface: "Manrope" });
        bodyXml += buildTextShape(idC++, rightX, COL_Y + PAD + 750000, HALF - PAD - 100000,
          COL_H - PAD - 750000, [{ runs: run, lnSpc: "130000" }]);
      }

      const footer  = buildFooterShapes(deckName, pageNum, false);
      const xml     = buildScratchSlide(bg, chrome + bodyXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── TRÊS-COLUNAS (scratch — 3 colunas com ícone, rótulo, título, descrição) ──
  "tres-colunas": {
    build(s, { deckName, pageNum }) {
      const bg     = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const colunas = Array.isArray(s.colunas) ? s.colunas.slice(0, 3) : [];
      const n       = Math.max(colunas.length, 1);
      const COL_W   = Math.floor((W - 2 * MARGIN) / n);
      const PAD     = 200000;
      const FIO_W   = 31750;
      const BADGE_H = 670000;
      let   idC     = 30;
      let   colXml  = "";

      colunas.forEach((col, i) => {
        const colX    = MARGIN + i * COL_W;
        const BADGE_Y = CONTENT_Y + PAD;

        if (i > 0) {
          colXml += buildPlainRect(idC++, colX - Math.floor(FIO_W / 2), CONTENT_Y, FIO_W,
            FOOTER_Y - CONTENT_Y - 200000, buildSolidFill("C9C4D8"));
        }

        colXml += buildIconBadge(col.icone || "diamond", colX + PAD, BADGE_Y, idC);
        idC += 2;

        const textBaseY = BADGE_Y + BADGE_H + 150000;

        if (col.rotulo) {
          const run = buildRun(String(col.rotulo).toUpperCase(),
            { color: C.purpleMed, sz: 1800, bold: true, typeface: "Manrope" });
          colXml += buildTextShape(idC++, colX + PAD, textBaseY, COL_W - 2 * PAD, 350000, [{ runs: run }]);
        }
        if (col.titulo) {
          const run = buildRun(col.titulo, { color: C.navy, sz: 2800, bold: true, typeface: "Manrope" });
          colXml += buildTextShape(idC++, colX + PAD, textBaseY + 400000, COL_W - 2 * PAD, 700000,
            [{ runs: run, lnSpc: "110000" }]);
        }
        if (col.descricao) {
          const run = buildRun(col.descricao, { color: C.textMuted, sz: 2000, typeface: "Manrope" });
          colXml += buildTextShape(idC++, colX + PAD, textBaseY + 1150000, COL_W - 2 * PAD,
            FOOTER_Y - textBaseY - 1150000 - 300000, [{ runs: run, lnSpc: "130000" }]);
        }
      });

      const footer  = buildFooterShapes(deckName, pageNum, false);
      const xml     = buildScratchSlide(bg, chrome + colXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── FLUXO-HORIZONTAL (scratch — faixa lavanda + linha roxa + badges + labels) ─
  "fluxo-horizontal": {
    build(s, { deckName, pageNum }) {
      const bg     = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const steps   = Array.isArray(s.steps) ? s.steps.slice(0, 6) : [];
      const n       = Math.max(steps.length, 1);
      const BAND_W  = W - 2 * MARGIN;
      const BAND_H  = 762000;
      const LABEL_H = 380000;
      const DESC_H  = 500000;
      const GAP     = 150000;
      const TOTAL_H = LABEL_H + GAP + BAND_H + GAP + DESC_H;
      const START_Y = CONTENT_Y + Math.floor((FOOTER_Y - CONTENT_Y - 250000 - TOTAL_H) / 2);
      const BAND_Y  = START_Y + LABEL_H + GAP;

      const bandFill = buildGradientFill([
        { pos: 0,      hex: "F1F1F1" },
        { pos: 100000, hex: "DED4F1" },
      ], 90);
      let bodyXml = buildRoundedRect(30, MARGIN, BAND_Y, BAND_W, BAND_H, 8000, bandFill);

      // Linha 8px gradiente roxa no centro vertical da faixa
      const LINE_H   = 50800;
      const LINE_Y   = BAND_Y + Math.floor((BAND_H - LINE_H) / 2);
      const lineFill = buildGradientFill([
        { pos: 0,      hex: C.purpleDarker },
        { pos: 100000, hex: C.purple },
      ], 90);
      bodyXml += buildRoundedRect(31, MARGIN, LINE_Y, BAND_W, LINE_H, 25000, lineFill);

      const STEP_W = Math.floor(BAND_W / n);
      let   idC    = 32;

      steps.forEach((step, i) => {
        const centerX = MARGIN + i * STEP_W + Math.floor(STEP_W / 2);
        const BADGE   = 670000;
        const badgeX  = centerX - Math.floor(BADGE / 2);
        const badgeY  = BAND_Y + Math.floor((BAND_H - BADGE) / 2);

        bodyXml += buildIconBadge(step.icone || "diamond", badgeX, badgeY, idC);
        idC += 2;

        if (step.label) {
          const run = buildRun(step.label, { color: C.purpleMed, sz: 1800, bold: true, typeface: "Manrope" });
          bodyXml += buildTextShape(idC++, centerX - Math.floor(STEP_W / 2), START_Y, STEP_W, LABEL_H,
            [{ runs: run, algn: "ctr" }]);
        }
        if (step.descricao) {
          const run = buildRun(step.descricao, { color: C.textMuted, sz: 1800, typeface: "Manrope" });
          bodyXml += buildTextShape(idC++, centerX - Math.floor(STEP_W / 2),
            BAND_Y + BAND_H + GAP, STEP_W, DESC_H,
            [{ runs: run, algn: "ctr", lnSpc: "110000" }]);
        }
      });

      const footer  = buildFooterShapes(deckName, pageNum, false);
      const xml     = buildScratchSlide(bg, chrome + bodyXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── COMPARAÇÃO-V2 (scratch — 2 cards com itens numerados, último em verde) ────
  "comparacao-v2": {
    build(s, { deckName, pageNum }) {
      const bg     = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const GAP    = 300000;
      const COL_W  = Math.floor((W - 2 * MARGIN - GAP) / 2);
      const CARD_H = Math.min(3073400, FOOTER_Y - CONTENT_Y - 200000);
      const PAD    = 250000;
      const esq    = s.esquerda || {};
      const dir    = s.direita  || {};
      let   idC    = 30;
      let   xml2   = "";

      // Left card — neutro
      xml2 += buildRoundedRect(idC++, MARGIN, CONTENT_Y, COL_W, CARD_H, 8000,
        buildSolidFill("FFFFFF"), "C9C4D8");
      if (esq.rotulo) {
        const run = buildRun(String(esq.rotulo).toUpperCase(),
          { color: C.footerLight, sz: 1600, bold: true, typeface: "Manrope" });
        xml2 += buildTextShape(idC++, MARGIN + PAD, CONTENT_Y + PAD, COL_W - 2 * PAD, 350000, [{ runs: run }]);
      }
      (Array.isArray(esq.items) ? esq.items : []).forEach((item, i) => {
        const isLast = i === esq.items.length - 1;
        const itemY  = CONTENT_Y + PAD + 400000 + i * 650000;
        const numRun = buildRun(`${String(i + 1).padStart(2, "0")}. `,
          { color: C.footerLight, sz: 1800, bold: true, typeface: "Manrope" });
        const txtRun = buildRun(item,
          { color: isLast ? "A4DF64" : C.navy, sz: 2000, bold: isLast, typeface: "Manrope" });
        xml2 += buildTextShape(idC++, MARGIN + PAD, itemY, COL_W - 2 * PAD, 550000,
          [{ runs: numRun + txtRun, lnSpc: "110000" }]);
      });

      // Right card — gradiente roxo
      const rightX    = MARGIN + COL_W + GAP;
      const rightFill = buildGradientFill([
        { pos: 0,      hex: C.purpleDarker },
        { pos: 100000, hex: C.purple },
      ], 135);
      xml2 += buildRoundedRect(idC++, rightX, CONTENT_Y, COL_W, CARD_H, 8000, rightFill);
      if (dir.rotulo) {
        const run = buildRun(String(dir.rotulo).toUpperCase(),
          { color: C.purpleTint, sz: 1600, bold: true, typeface: "Manrope" });
        xml2 += buildTextShape(idC++, rightX + PAD, CONTENT_Y + PAD, COL_W - 2 * PAD, 350000, [{ runs: run }]);
      }
      (Array.isArray(dir.items) ? dir.items : []).forEach((item, i) => {
        const isLast = i === dir.items.length - 1;
        const itemY  = CONTENT_Y + PAD + 400000 + i * 650000;
        const numRun = buildRun(`${String(i + 1).padStart(2, "0")}. `,
          { color: C.purpleTint, sz: 1800, bold: true, typeface: "Manrope" });
        const txtRun = buildRun(item,
          { color: isLast ? "A4DF64" : C.white, sz: 2000, bold: isLast, typeface: "Manrope" });
        xml2 += buildTextShape(idC++, rightX + PAD, itemY, COL_W - 2 * PAD, 550000,
          [{ runs: numRun + txtRun, lnSpc: "110000" }]);
      });

      const footer  = buildFooterShapes(deckName, pageNum, false);
      const xml     = buildScratchSlide(bg, chrome + xml2 + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── DECLARAÇÃO-PAINEL (scratch — card lavanda esq. + painel gradiente dir.) ───
  "declaracao-painel": {
    build(s, { deckName, pageNum }) {
      const bg     = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const USABLE  = W - 2 * MARGIN;
      const GAP     = 254000;   // 40px
      const LEFT_W  = Math.round(USABLE * 860 / 1660);
      const RIGHT_W = USABLE - LEFT_W - GAP;
      const CARD_H  = Math.min(2622550, FOOTER_Y - CONTENT_Y - 300000);
      const CARD_Y  = CONTENT_Y + Math.floor((FOOTER_Y - CONTENT_Y - 250000 - CARD_H) / 2);
      const PAD     = 300000;
      const rightX  = MARGIN + LEFT_W + GAP;
      let   idC     = 30;
      let   bodyXml = "";

      // Card lavanda
      bodyXml += buildRoundedRect(idC++, MARGIN, CARD_Y, LEFT_W, CARD_H, 8000,
        buildSolidFill("EBE4FF"), "A28CDC");
      if (s.declaracao) {
        let runs;
        if (typeof s.declaracao === "string") {
          runs = buildRun(s.declaracao, { color: C.navy, sz: 2800, bold: true, typeface: "Manrope" });
        } else {
          runs = s.declaracao.map(t => buildRun(t.text, {
            color: t.emphasis ? C.purpleMed : C.navy, sz: 2800, bold: true, typeface: "Manrope",
          })).join("");
        }
        bodyXml += buildTextShape(idC++, MARGIN + PAD, CARD_Y + PAD, LEFT_W - 2 * PAD,
          CARD_H - 2 * PAD, [{ runs, lnSpc: "130000" }]);
      }

      // Painel gradiente
      const rightFill = buildGradientFill([
        { pos: 0,      hex: C.purpleDarker },
        { pos: 100000, hex: C.purple },
      ], 135);
      bodyXml += buildRoundedRect(idC++, rightX, CARD_Y, RIGHT_W, CARD_H, 8000, rightFill);
      if (s.painelTitulo) {
        const run = buildRun(s.painelTitulo, { color: C.white, sz: 2800, bold: true, typeface: "Manrope" });
        bodyXml += buildTextShape(idC++, rightX + PAD, CARD_Y + PAD, RIGHT_W - 2 * PAD, 700000,
          [{ runs: run, lnSpc: "110000" }]);
      }
      if (s.painelDescricao) {
        const run = buildRun(s.painelDescricao, { color: C.purpleTint, sz: 2000, typeface: "Manrope" });
        bodyXml += buildTextShape(idC++, rightX + PAD, CARD_Y + PAD + 750000, RIGHT_W - 2 * PAD,
          CARD_H - PAD - 750000 - PAD, [{ runs: run, lnSpc: "130000" }]);
      }

      const footer  = buildFooterShapes(deckName, pageNum, false);
      const xml     = buildScratchSlide(bg, chrome + bodyXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── PRINCÍPIOS-LISTA (scratch — linhas com fio horizontal) ───────────────────
  "principios-lista": {
    build(s, { deckName, pageNum }) {
      const bg     = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const principios = Array.isArray(s.principios) ? s.principios.slice(0, 5) : [];
      const ROW_H  = 717550;   // 113px
      const FIO_H  = 6350;
      const W_COL  = W - 2 * MARGIN;
      const THIRD  = Math.floor(W_COL / 3);
      let   idC    = 30;
      let   listXml = "";

      principios.forEach((p, i) => {
        const rowY = CONTENT_Y + i * ROW_H;

        if (i > 0) {
          listXml += buildPlainRect(idC++, MARGIN, rowY, W_COL, FIO_H, buildSolidFill("C9C4D8"));
        }

        const TEXT_Y = rowY + 50000;
        const TEXT_H = ROW_H - 100000;

        if (p.termo) {
          const run = buildRun(p.termo, { color: C.navy, sz: 2800, bold: true, typeface: "Manrope" });
          listXml += buildTextShape(idC++, MARGIN, TEXT_Y, THIRD - 100000, TEXT_H,
            [{ runs: run }], 'anchor="ctr"');
        }

        const conRun = buildRun(p.conector || "acima de",
          { color: C.purpleMed, sz: 2300, typeface: "Manrope" });
        listXml += buildTextShape(idC++, MARGIN + THIRD, TEXT_Y, THIRD, TEXT_H,
          [{ runs: conRun, algn: "ctr" }], 'anchor="ctr"');

        if (p.neutro) {
          const run = buildRun(p.neutro, { color: C.footerLight, sz: 2300, typeface: "Manrope" });
          listXml += buildTextShape(idC++, MARGIN + 2 * THIRD + 100000, TEXT_Y, THIRD - 100000, TEXT_H,
            [{ runs: run }], 'anchor="ctr"');
        }
      });

      const footer  = buildFooterShapes(deckName, pageNum, false);
      const xml     = buildScratchSlide(bg, chrome + listXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── FLUXO-RAIAS (scratch — sidebar gradiente + 2 raias com cards) ────────────
  "fluxo-raias": {
    build(s, { deckName, pageNum }) {
      const bg     = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const raias   = Array.isArray(s.raias) ? s.raias.slice(0, 2) : [];
      const SIDE_W  = 952500;   // 150px
      const AREA_H  = FOOTER_Y - CONTENT_Y - 200000;
      const sideFill = buildGradientFill([
        { pos: 0,      hex: C.purpleDarker },
        { pos: 100000, hex: C.purple },
      ], 180);
      let bodyXml = buildRoundedRect(30, MARGIN, CONTENT_Y, SIDE_W, AREA_H, 8000, sideFill);

      if (s.sidebarLabel) {
        const run = buildRun(s.sidebarLabel, { color: C.white, sz: 1800, bold: true, typeface: "Manrope" });
        bodyXml += buildTextShape(31, MARGIN, CONTENT_Y, SIDE_W, AREA_H,
          [{ runs: run, algn: "ctr" }], 'anchor="ctr"');
      }

      const RAIL_X  = MARGIN + SIDE_W + 200000;
      const RAIL_W  = W - RAIL_X - MARGIN;
      const N       = Math.max(raias.length, 1);
      const RAIA_H  = Math.floor(AREA_H / N);
      const PAD     = 150000;
      let   idC     = 32;

      raias.forEach((raia, ri) => {
        const raiaY = CONTENT_Y + ri * RAIA_H;
        const steps = Array.isArray(raia.steps) ? raia.steps.slice(0, 4) : [];
        const ns    = Math.max(steps.length, 1);

        if (ri > 0) {
          bodyXml += buildPlainRect(idC++, RAIL_X, raiaY, RAIL_W, 6350, buildSolidFill("C9C4D8"));
        }
        if (raia.label) {
          const run = buildRun(raia.label, { color: C.purpleMed, sz: 1600, bold: true, typeface: "Manrope" });
          bodyXml += buildTextShape(idC++, RAIL_X, raiaY + PAD, 700000, RAIA_H - 2 * PAD, [{ runs: run }]);
        }

        const CARDS_X = RAIL_X + 750000;
        const CARD_W  = Math.floor((RAIL_W - 750000 - (ns - 1) * 150000) / ns);
        const CARD_H  = RAIA_H - 2 * PAD - 50000;

        steps.forEach((step, si) => {
          const cx = CARDS_X + si * (CARD_W + 150000);
          const cy = raiaY + PAD;
          bodyXml += buildRoundedRect(idC++, cx, cy, CARD_W, CARD_H, 8000,
            buildSolidFill("FFFFFF"), "DDD6EE");
          if (step.label) {
            const run = buildRun(step.label, { color: C.navy, sz: 1800, bold: true, typeface: "Manrope" });
            bodyXml += buildTextShape(idC++, cx + PAD, cy + PAD, CARD_W - 2 * PAD, 300000, [{ runs: run }]);
          }
          if (step.descricao) {
            const run = buildRun(step.descricao, { color: C.textMuted, sz: 1600, typeface: "Manrope" });
            bodyXml += buildTextShape(idC++, cx + PAD, cy + PAD + 350000, CARD_W - 2 * PAD,
              CARD_H - 2 * PAD - 350000, [{ runs: run, lnSpc: "120000" }]);
          }
        });
      });

      const footer  = buildFooterShapes(deckName, pageNum, false);
      const xml     = buildScratchSlide(bg, chrome + bodyXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── SISTEMA-HUB (scratch — círculo central + 4 cards + frase à direita) ──────
  "sistema-hub": {
    build(s, { deckName, pageNum }) {
      const bg     = buildBackground("light");
      const chrome = buildSlideChrome(s.eyebrow, s.titulo, false);

      const cards   = Array.isArray(s.cards) ? s.cards.slice(0, 4) : [];
      const CARD_W  = 1568450;   // 247px
      const CARD_H  = 1244600;   // 196px
      const CARD_GAP = 150000;
      const GRID_W  = 2 * CARD_W + CARD_GAP;
      const GRID_H  = 2 * CARD_H + CARD_GAP;
      const GRID_X  = MARGIN;
      const GRID_Y  = CONTENT_Y + Math.floor((FOOTER_Y - CONTENT_Y - 250000 - GRID_H) / 2);
      const PAD     = 150000;
      let   idC     = 30;
      let   bodyXml = "";

      cards.forEach((card, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx  = GRID_X + col * (CARD_W + CARD_GAP);
        const cy  = GRID_Y + row * (CARD_H + CARD_GAP);
        bodyXml += buildRoundedRect(idC++, cx, cy, CARD_W, CARD_H, 8000,
          buildSolidFill("FFFFFF"), "DDD6EE");
        if (card.titulo) {
          const run = buildRun(card.titulo, { color: C.navy, sz: 2000, bold: true, typeface: "Manrope" });
          bodyXml += buildTextShape(idC++, cx + PAD, cy + PAD, CARD_W - 2 * PAD, 400000,
            [{ runs: run, lnSpc: "110000" }]);
        }
        if (card.descricao) {
          const run = buildRun(card.descricao, { color: C.textMuted, sz: 1800, typeface: "Manrope" });
          bodyXml += buildTextShape(idC++, cx + PAD, cy + PAD + 450000, CARD_W - 2 * PAD,
            CARD_H - 2 * PAD - 450000, [{ runs: run, lnSpc: "120000" }]);
        }
      });

      // Círculo central
      const RADIUS  = 500000;
      const CIRC_X  = GRID_X + GRID_W + 250000;
      const CIRC_Y  = GRID_Y + Math.floor(GRID_H / 2) - RADIUS;
      const circFill = buildGradientFill([
        { pos: 0,      hex: C.purpleDarker },
        { pos: 100000, hex: C.purple },
      ], 135);
      bodyXml += `<p:sp>
        <p:nvSpPr><p:cNvPr id="${idC}" name="Hub"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="${CIRC_X}" y="${CIRC_Y}"/><a:ext cx="${RADIUS * 2}" cy="${RADIUS * 2}"/></a:xfrm>
          <a:prstGeom prst="ellipse"><a:avLst/></a:prstGeom>${circFill}<a:ln><a:noFill/></a:ln></p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody>
      </p:sp>`;
      idC++;
      if (s.hubLabel) {
        const run = buildRun(s.hubLabel, { color: C.white, sz: 1600, bold: true, typeface: "Manrope" });
        bodyXml += buildTextShape(idC++, CIRC_X, CIRC_Y, RADIUS * 2, RADIUS * 2,
          [{ runs: run, algn: "ctr" }], 'anchor="ctr"');
      }

      // Frase à direita
      const FRASE_X = CIRC_X + RADIUS * 2 + 300000;
      const FRASE_W = W - FRASE_X - MARGIN;
      if (s.frase && FRASE_W > 500000) {
        let runs;
        if (typeof s.frase === "string") {
          runs = buildRun(s.frase, { color: C.navy, sz: 2800, bold: true, typeface: "Manrope" });
        } else {
          runs = s.frase.map(t => buildRun(t.text, {
            color: t.emphasis ? C.purpleMed : C.navy, sz: 2800, bold: true, typeface: "Manrope",
          })).join("");
        }
        bodyXml += buildTextShape(idC++, FRASE_X, GRID_Y, FRASE_W, GRID_H,
          [{ runs, lnSpc: "120000" }], 'anchor="ctr"');
      }

      const footer  = buildFooterShapes(deckName, pageNum, false);
      const xml     = buildScratchSlide(bg, chrome + bodyXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },
};

// ─── PPTX builder ────────────────────────────────────────────────────────────

function buildPresentationXml(slideCount) {
  const sldIds = Array.from({ length: slideCount }, (_, i) => {
    const id = 256 + i;
    const rId = `rId${6 + i}`;
    return `<p:sldId id="${id}" r:id="${rId}"/>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
  saveSubsetFonts="1">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId4"/></p:sldMasterIdLst>
  <p:sldSz cx="12192000" cy="6858000"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:sldIdLst>${sldIds}</p:sldIdLst>
</p:presentation>`;
}

function buildPresentationRels(slideCount) {
  const slideRels = Array.from({ length: slideCount }, (_, i) => {
    const rId = `rId${6 + i}`;
    return `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`;
  }).join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps" Target="viewProps.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="notesMasters/notesMaster1.xml"/>
  ${slideRels}
</Relationships>`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("Uso: node pptx-template-engine.mjs <slides.json> [saida.pptx]");
    process.exit(1);
  }
  if (!fs.existsSync(TEMPLATE_PPTX)) {
    console.error(`Arquivo de template não encontrado: ${TEMPLATE_PPTX}`);
    console.error("Copie o MAP.pptx para assets/template-source/MAP.pptx");
    process.exit(1);
  }

  const input = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const deckName = input.deckName || "Dati";
  const slides = input.slides || [];

  // Open source PPTX
  const sourceZip = new AdmZip(TEMPLATE_PPTX);

  // Read all source slide XMLs (keyed by slide number)
  const sourceSlides = {};
  const sourceSlideRels = {};
  for (let i = 1; i <= 18; i++) {
    const entry = sourceZip.getEntry(`ppt/slides/slide${i}.xml`);
    const relsEntry = sourceZip.getEntry(`ppt/slides/_rels/slide${i}.xml.rels`);
    if (entry) sourceSlides[i] = entry.getData().toString("utf8");
    if (relsEntry) sourceSlideRels[i] = relsEntry.getData().toString("utf8");
  }

  // Build output zip
  const outZip = new AdmZip();

  // Copy all structural files except slides
  const skipPaths = new Set();
  for (let i = 1; i <= 18; i++) {
    skipPaths.add(`ppt/slides/slide${i}.xml`);
    skipPaths.add(`ppt/slides/_rels/slide${i}.xml.rels`);
  }
  skipPaths.add("ppt/presentation.xml");
  skipPaths.add("ppt/_rels/presentation.xml.rels");

  sourceZip.getEntries().forEach(entry => {
    // Skip notesSlides from source — the engine rebuilds only the ones that have content
    if (entry.entryName.startsWith("ppt/notesSlides/")) return;
    if (!skipPaths.has(entry.entryName)) {
      outZip.addFile(entry.entryName, entry.getData());
    }
  });

  // Embed logo PNG for scratch-built slides
  let logoEmbedded = false;
  if (fs.existsSync(LOGO_NAVY_PNG)) {
    outZip.addFile(`ppt/media/${LOGO_MEDIA_NAME}`, fs.readFileSync(LOGO_NAVY_PNG));
    logoEmbedded = true;
  } else {
    console.warn(`⚠️  Logo não encontrado em ${LOGO_NAVY_PNG} — slides sem logo`);
  }

  // ─── Bloco Institucional Fixo ────────────────────────────────────────────────
  // Os 6 primeiros slides do MAP.pptx são sempre copiados verbatim ao início
  // de toda apresentação Dati. Esta é uma REGRA ABSOLUTA — nunca remover.
  const INSTITUTIONAL_COUNT = 6;
  const outputSlides = [];

  for (let i = 1; i <= INSTITUTIONAL_COUNT; i++) {
    if (sourceSlides[i]) {
      const cleanRels = sourceSlideRels[i]
        ? sourceSlideRels[i].replace(/<Relationship[^>]*notesSlide[^>]*>/g, "")
        : null;
      outputSlides.push({ xml: sourceSlides[i], relsXml: cleanRels, notes: null });
    } else {
      console.warn(`⚠️  Slide institucional ${i} não encontrado no MAP.pptx`);
    }
  }
  console.log(`  ✓ Bloco institucional: ${outputSlides.length} slides do MAP.pptx adicionados verbatim`);

  // User content slides — page numbering continues after institutional block
  let pageNum = INSTITUTIONAL_COUNT + 1;

  for (const s of slides) {
    const tmpl = TEMPLATE_MAP[s.tipo];
    if (!tmpl) {
      console.warn(`⚠️  Tipo desconhecido: "${s.tipo}" — slide ignorado`);
      continue;
    }

    let xml, relsXml;

    if (tmpl.build) {
      // Scratch-built slide (novos tipos)
      const result = tmpl.build(s, { deckName, pageNum });
      xml = result.xml;
      relsXml = result.relsXml;
    } else {
      // MAP.pptx-based slide (tipos existentes)
      const srcNum = tmpl.sourceSlide;
      xml = sourceSlides[srcNum];
      relsXml = sourceSlideRels[srcNum];

      if (!xml) {
        console.warn(`⚠️  Slide template ${srcNum} não encontrado no PPTX`);
        continue;
      }
      const ctx = s.tipo === "capa" ? {} : { deckName, pageNum };
      xml = tmpl.render(xml, s, ctx);
    }

    if (s.tipo !== "capa" && s.tipo !== "encerramento") pageNum++;

    outputSlides.push({ xml, relsXml, notes: s.notes || null });
  }

  // Add generated slides to zip
  outputSlides.forEach(({ xml, relsXml, notes }, i) => {
    const slideNum = i + 1;
    outZip.addFile(`ppt/slides/slide${slideNum}.xml`, Buffer.from(xml, "utf8"));
    if (relsXml) {
      // Update notesSide reference in rels (just remove it to keep things clean)
      const cleanRels = relsXml.replace(
        /<Relationship[^>]*notesSlide[^>]*>/g,
        ""
      );
      outZip.addFile(`ppt/slides/_rels/slide${slideNum}.xml.rels`, Buffer.from(cleanRels, "utf8"));
    }

    if (notes) {
      const notesXml = buildNotesSlide(notes);
      const notesRelsXml = buildNotesRels(slideNum);
      outZip.addFile(`ppt/notesSlides/notesSlide${slideNum}.xml`, Buffer.from(notesXml, "utf8"));
      outZip.addFile(`ppt/notesSlides/_rels/notesSlide${slideNum}.xml.rels`, Buffer.from(notesRelsXml, "utf8"));
      // Adicionar relação notes no _rels do slide
      const sRels = outZip.getEntry(`ppt/slides/_rels/slide${slideNum}.xml.rels`);
      if (sRels) {
        let sRelsXml = sRels.getData().toString("utf8");
        const notesRel = `<Relationship Id="rIdNotes" ` +
          `Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" ` +
          `Target="../notesSlides/notesSlide${slideNum}.xml"/>`;
        sRelsXml = sRelsXml.replace("</Relationships>", `  ${notesRel}\n</Relationships>`);
        outZip.updateFile(`ppt/slides/_rels/slide${slideNum}.xml.rels`, Buffer.from(sRelsXml, "utf8"));
      }
    }
  });

  // Add updated presentation.xml and rels
  outZip.addFile("ppt/presentation.xml", Buffer.from(buildPresentationXml(outputSlides.length), "utf8"));
  outZip.addFile("ppt/_rels/presentation.xml.rels", Buffer.from(buildPresentationRels(outputSlides.length), "utf8"));

  // Fix [Content_Types].xml — remove stale slide entries from source template and add
  // correct entries for the actual output slides (including notesSlides).
  // Google Slides rejects files where Content_Types.xml references non-existent parts
  // or is missing entries for parts that do exist.
  const ctEntry = outZip.getEntry("[Content_Types].xml");
  if (ctEntry) {
    let ctXml = ctEntry.getData().toString("utf8");
    // Remove all Override entries for slides and notesSlides (stale from MAP.pptx)
    ctXml = ctXml.replace(/<Override[^>]*"\/ppt\/slides\/slide\d+\.xml"[^>]*\/>\s*/g, "");
    ctXml = ctXml.replace(/<Override[^>]*"\/ppt\/notesSlides\/notesSlide\d+\.xml"[^>]*\/>\s*/g, "");
    // Build fresh entries for actual output
    const slideEntries = outputSlides.map((slide, i) => {
      const n = i + 1;
      let entry = `  <Override PartName="/ppt/slides/slide${n}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
      if (slide.notes) {
        entry += `\n  <Override PartName="/ppt/notesSlides/notesSlide${n}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>`;
      }
      return entry;
    }).join("\n");
    ctXml = ctXml.replace("</Types>", slideEntries + "\n</Types>");
    outZip.updateFile("[Content_Types].xml", Buffer.from(ctXml, "utf8"));
  }

  // Write output
  const defaultOut = path.resolve(__dirname, "../../../../Downloads/dati-apresentacao-gerada.pptx");
  const outputPath = process.argv[3] || input.outputPath || defaultOut;
  outZip.writeZip(outputPath);
  console.log(`✓ Apresentação gerada em: ${outputPath}`);
  console.log(`  ${outputSlides.length} slides total (${INSTITUTIONAL_COUNT} institucionais + ${outputSlides.length - INSTITUTIONAL_COUNT} de conteúdo) | deck: ${deckName}`);
}

main().catch(err => {
  console.error("Erro:", err.message);
  process.exit(1);
});

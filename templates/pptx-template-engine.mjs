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

const W = 12192000; // slide width EMU
const H = 6858000;  // slide height EMU
const MARGIN = 457200; // lateral margin EMU

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
  footerMuted: "9891AB",
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
      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>
    <p:txBody><a:bodyPr wrap="square" lIns="0" rIns="0" tIns="0" bIns="0" ${bodyAttrs}><a:normAutofit/></a:bodyPr>
      <a:lstStyle/>${paras}</p:txBody>
  </p:sp>`;
}

function buildArrowText(id, x, y, char, color, sz = 2000) {
  const run = buildRun(char, { color, sz, typeface: "Segoe UI Symbol" });
  return buildTextShape(id, x, y, 400000, 400000,
    [{ runs: run, algn: "ctr" }], 'anchor="ctr"');
}

function buildEyebrowShape(id, text, x, y, dark = false) {
  const run = buildRun(text.toUpperCase(), {
    color: dark ? C.purpleTint : C.purpleMed, sz: 1200, typeface: "Manrope"
  });
  return buildTextShape(id, x, y, W - x - MARGIN, 400000, [{ runs: run }]);
}

function buildTitleShape(id, titulo, x, y, w, dark = false) {
  let runs;
  if (typeof titulo === "string") {
    runs = buildRun(titulo, {
      color: dark ? C.white : C.navy,
      sz: dark ? 4700 : 3100, bold: !dark, typeface: "Manrope"
    });
  } else {
    runs = titulo.map(t => buildRun(t.text, {
      color: t.emphasis ? (dark ? C.purpleTint : C.purpleMed) : (dark ? C.white : C.navy),
      sz: dark ? 4700 : 3100, bold: !dark, typeface: "Manrope"
    })).join("");
  }
  return buildTextShape(id, x, y, w, 1100000, [{ runs, lnSpc: "90000" }]);
}

function buildFooterShapes(deckName, pageNum, dark = false) {
  const color = C.footerMuted;
  const y = 6350000;
  const leftRun = buildRun(deckName, { color, sz: 1100, typeface: "Manrope" });
  const rightRun = buildRun(String(pageNum).padStart(2, "0"), { color, sz: 1100, typeface: "Manrope" });
  return [
    buildTextShape(900, MARGIN, y, 6000000, 300000, [{ runs: leftRun }]),
    buildTextShape(901, W - MARGIN - 600000, y, 600000, 300000,
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
  let idBase = 200;
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
  const rels = mediaRefs.map(r =>
    `<Relationship Id="${r.rId}" ` +
    `Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" ` +
    `Target="${r.target}"/>`
  ).join("\n  ");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${rels}
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
            const run = buildRun(line, { color: "FFFFFF", sz: 3900 });
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

  // ── CONTEÚDO (slide11 — eyebrow + título + corpo + footer) ────────────────
  // O slide11 tem o chrome exato do MAP: gradiente EDF0F2, logo navy, eyebrow
  // roxo, título navy bold, corpo cinza, formas decorativas roxas, footer.
  conteudo: {
    sourceSlide: 11,
    render(xml, s, { deckName, pageNum }) {
      // eyebrow
      if (s.eyebrow !== undefined)
        xml = replaceText(xml, "CONCEITO", s.eyebrow.toUpperCase());

      // título: single run (navy bold) ou array com ênfase
      if (s.titulo !== undefined) {
        const titulo = s.titulo;
        if (typeof titulo === "string") {
          xml = replaceText(xml, "Modernização do legado", titulo);
        } else {
          // Array [{text, emphasis}] → multiple runs
          const runs = titulo.map(t =>
            buildRun(t.text, {
              color: t.emphasis ? "8F65FE" : "1A0F3D",
              bold: true, sz: 3100,
            })
          ).join("");
          const newTxBody = `<p:txBody><a:bodyPr anchorCtr="0" anchor="t" bIns="16925" lIns="16925" spcFirstLastPara="1" rIns="16925" wrap="square" tIns="16925"><a:noAutofit/></a:bodyPr><a:lstStyle/>${buildParagraph(runs, { lnSpc: "78776" })}</p:txBody>`;
          xml = rebuildTextBox(xml, "1028700", newTxBody);
        }
      }

      // corpo: substitui os runs do body text box
      if (s.corpo !== undefined || s.itens !== undefined) {
        const items = s.itens
          ? (Array.isArray(s.itens) ? s.itens : [s.itens])
          : [s.corpo];

        // Build paragraphs — each item is a new paragraph
        const paragraphs = items.map(item => {
          if (typeof item === "string") {
            const run = buildRun(item, { color: "5B5570", sz: 1600 });
            return buildParagraph(run, { lnSpc: "101818" });
          }
          // Array of {text, emphasis}
          const runs = item.map(t =>
            buildRun(t.text, { color: t.emphasis ? "8F65FE" : "5B5570", sz: 1600 })
          ).join("");
          return buildParagraph(runs, { lnSpc: "101818" });
        }).join("");

        const newTxBody = `<p:txBody><a:bodyPr anchorCtr="0" anchor="t" bIns="16925" lIns="16925" spcFirstLastPara="1" rIns="16925" wrap="square" tIns="16925"><a:normAutofit/></a:bodyPr><a:lstStyle/>${paragraphs}</p:txBody>`;
        xml = rebuildTextBox(xml, "1555453", newTxBody);
      } else {
        // Clear body text if nothing provided
        xml = replaceText(xml, "Modernizar é quando plataforma, código ou arquitetura mudam", "");
        xml = replaceText(xml, ", ", "");
        xml = replaceText(xml, " não apenas trocam o host.", "");
      }

      // Remove layout-specific shapes from the MAP deck that don't belong in a
      // generic content slide (Replatform/Refactor/Rearchitect/Replace columns
      // and the bottom quote that are hardcoded in slide 11 of the source template)
      xml = removeShapesByY(xml, [
        2461122, // column card backgrounds (×4)
        2562722, // column icons / pics (×4)
        3019922, // column label text (Replatform / Refactor / …)
        3418880, // column heading text (MUDA A PLATAFORMA / …)
        3755430, // column description text
        5300960, // bottom quote
      ]);

      // footer
      xml = replaceText(xml, "Dati | Migração e modernização na AWS", deckName);
      xml = replaceText(xml, "11", String(pageNum).padStart(2, "0"));
      return xml;
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

  // ── CTA / PRÓXIMO PASSO (slide17) ─────────────────────────────────────────
  cta: {
    sourceSlide: 17,
    render(xml, s, { deckName, pageNum }) {
      if (s.eyebrow !== undefined)
        xml = replaceText(xml, "PRÓXIMO PASSO", s.eyebrow.toUpperCase());

      // Título com dois runs: normal + destaque
      const titulo = s.titulo || "";
      const destaque = s.tituloDestaque || "";

      const runs = [
        titulo && buildRun(titulo + " ", { color: "1A0F3D", bold: true, sz: 2400 }),
        destaque && buildRun(destaque, { color: "8F65FE", bold: true, sz: 2400 }),
      ].filter(Boolean).join("");

      const newTxBody = `<p:txBody><a:bodyPr anchorCtr="0" anchor="t" bIns="16925" lIns="16925" spcFirstLastPara="1" rIns="16925" wrap="square" tIns="16925"><a:normAutofit/></a:bodyPr><a:lstStyle/>${buildParagraph(runs, { lnSpc: "78776" })}</p:txBody>`;
      xml = rebuildTextBox(xml, "1028700", newTxBody);

      // Instrução / corpo (y=1555453)
      if (s.instrucao !== undefined)
        xml = replaceText(
          xml,
          "Escaneie o QR Code e a gente entra em contato para agendar uma conversa de aprofundamento sobre o seu ambiente.",
          s.instrucao
        );

      // ctaLabel: rebuild the supporting text box at y=3866059
      // ("Sem compromisso: o primeiro passo é a avaliação do MAP, financiada pela AWS.")
      if (s.ctaLabel !== undefined) {
        const run = buildRun(s.ctaLabel, { color: "1A0F3D", bold: true, sz: 1400 });
        const newTxBody = `<p:txBody><a:bodyPr anchorCtr="0" anchor="t" bIns="16925" lIns="16925" spcFirstLastPara="1" rIns="16925" wrap="square" tIns="16925"><a:normAutofit/></a:bodyPr><a:lstStyle/>${buildParagraph(run, { lnSpc: "101818" })}</p:txBody>`;
        xml = rebuildTextBox(xml, "3866059", newTxBody);
      }

      xml = replaceText(xml, "Dati | Migração e modernização na AWS", deckName);
      xml = replaceText(xml, "17", String(pageNum).padStart(2, "0"));
      return xml;
    },
  },

  // ── BIGWORD (slide9 — barra lateral + bigword + título + corpo) ──────────────
  bigword: {
    sourceSlide: 9,
    render(xml, s, { deckName, pageNum }) {
      if (s.eyebrow !== undefined)
        xml = replaceText(xml, "O CAMINHO ESTRUTURADO", s.eyebrow.toUpperCase());

      // Bigword (first paragraph in the title text box at y=1078504)
      if (s.bigword !== undefined)
        xml = replaceText(xml, "AWS MAP", s.bigword);

      // Título (second paragraph in the title text box)
      if (s.titulo !== undefined) {
        const titulo = s.titulo;
        if (typeof titulo === "string") {
          xml = replaceText(xml, "metodologia e incentivo financeiro", titulo);
        } else {
          // Array with emphasis — rebuild entire sp at y=1078504
          const bigwordText = s.bigword || "MAP";
          const titleRuns = titulo.map(t =>
            buildRun(t.text, { color: t.emphasis ? "8F65FE" : "1A0F3D", bold: true, sz: 3100 })
          ).join("");
          const bigwordRun = buildRun(bigwordText, { color: "FFFFFF", bold: true, sz: 3100 });
          const newTxBody = `<p:txBody><a:bodyPr anchorCtr="0" anchor="t" bIns="16925" lIns="16925" spcFirstLastPara="1" rIns="16925" wrap="square" tIns="16925"><a:normAutofit/></a:bodyPr><a:lstStyle/>${buildParagraph(bigwordRun, { lnSpc: "90000" })}${buildParagraph(titleRuns, { lnSpc: "90000" })}</p:txBody>`;
          xml = rebuildTextBox(xml, "1078504", newTxBody);
        }
      }

      // Corpo: rebuild the body text box at y=2710570
      if (s.corpo !== undefined) {
        const run = buildRun(s.corpo, { color: "EDF0F2", sz: 1400 });
        const newTxBody = `<p:txBody><a:bodyPr anchorCtr="0" anchor="t" bIns="16925" lIns="16925" spcFirstLastPara="1" rIns="16925" wrap="square" tIns="16925"><a:normAutofit/></a:bodyPr><a:lstStyle/>${buildParagraph(run, { lnSpc: "101818" })}</p:txBody>`;
        xml = rebuildTextBox(xml, "2710570", newTxBody);
      }

      // Remove the MAP-phase boxes (Assess / Mobilize / Migrate & Modernize)
      // that are hardcoded in slide 9 of the source template and don't belong
      // in a generic bigword slide
      xml = removeShapesByY(xml, [
        3153873, // phase card backgrounds (×3)
        3362078, // phase icon pics (×3)
        3528636, // decorative element inside the phase area
        4139378, // "FASE 01" / "FASE 02" labels
        4139374, // "FASE 03" label
        4470145, // phase names (Assess / Mobilize)
        4470141, // phase name (Migrate & Modernize)
        4839829, // phase description 1
        4839837, // phase description 2
        4811454, // phase description 3
      ]);

      xml = replaceText(xml, "Dati | Migração e modernização na AWS", deckName);
      xml = replaceText(xml, "09", String(pageNum).padStart(2, "0"));
      return xml;
    },
  },

  // ── CARDS (slide8 — 4 numbered cards with title + description) ────────────
  // Source slide has: eyebrow, title (2 runs), 4 cards each with card-title + card-description
  cards: {
    sourceSlide: 8,
    render(xml, s, { deckName, pageNum }) {
      if (s.eyebrow !== undefined)
        xml = replaceText(xml, "POR QUE MIGRAR", s.eyebrow.toUpperCase());

      // Title: original has two runs "O que muda quando o " + "ambiente vira nuvem"
      if (s.titulo !== undefined) {
        const titulo = s.titulo;
        if (typeof titulo === "string") {
          xml = replaceText(xml, "O que muda quando o ", "");
          xml = replaceText(xml, "ambiente vira nuvem", titulo);
        } else {
          // Array [{text, emphasis}] → rebuild text box at y=1028700
          const runs = titulo.map(t =>
            buildRun(t.text, { color: t.emphasis ? "8F65FE" : "1A0F3D", bold: true, sz: 3100 })
          ).join("");
          const newTxBody = `<p:txBody><a:bodyPr anchorCtr="0" anchor="t" bIns="16925" lIns="16925" spcFirstLastPara="1" rIns="16925" wrap="square" tIns="16925"><a:noAutofit/></a:bodyPr><a:lstStyle/>${buildParagraph(runs, { lnSpc: "78776" })}</p:txBody>`;
          xml = rebuildTextBox(xml, "1028700", newTxBody);
        }
      }

      // Cards: up to 4 items, each with titulo + descricao
      const CARD_TITULOS = [
        "Custo visível e variável",
        "Fim do ciclo de renovação",
        "Segurança e resiliência",
        "Base pronta para dados e IA",
      ];
      const CARD_DESCRICOES = [
        "A conta passa a ter dono por aplicação. Paga-se o que está ligado.",
        "O plano de cinco anos perde o degrau de investimento em hardware no meio dele.",
        "Backup, redundância e controles que custariam outro data center on-premises.",
        "O que bloqueia o valor de analytics e IA hoje é o ambiente. Na nuvem, o dado está a um serviço de distância.",
      ];
      const cards = Array.isArray(s.cards) ? s.cards : [];
      CARD_TITULOS.forEach((placeholder, i) => {
        const card = cards[i];
        xml = replaceText(xml, placeholder, card?.titulo || placeholder);
      });
      CARD_DESCRICOES.forEach((placeholder, i) => {
        const card = cards[i];
        xml = replaceText(xml, placeholder, card?.descricao || placeholder);
      });

      xml = replaceText(xml, "Dati | Migração e modernização na AWS", deckName);
      xml = replaceText(xml, "08", String(pageNum).padStart(2, "0"));

      // Injetar badges de ícone se fornecidos
      if (Array.isArray(s.cards) && s.cards.some(c => c.icone)) {
        xml = appendIconBadgesToSlideXml(xml, s.cards);
      }

      return xml;
    },
  },

  // ── COMPARAÇÃO (slide10 — 2-column comparison: left label/heading/desc + right) ─
  comparacao: {
    sourceSlide: 10,
    render(xml, s, { deckName, pageNum }) {
      if (s.eyebrow !== undefined)
        xml = replaceText(xml, "A ESTRATÉGIA DE VELOCIDADE", s.eyebrow.toUpperCase());

      // Title: original has two runs "A velocidade vem do " + "as-is"
      if (s.titulo !== undefined) {
        const titulo = s.titulo;
        if (typeof titulo === "string") {
          xml = replaceText(xml, "A velocidade vem do ", "");
          xml = replaceText(xml, "as-is", titulo);
        } else {
          const runs = titulo.map(t =>
            buildRun(t.text, { color: t.emphasis ? "8F65FE" : "1A0F3D", bold: true, sz: 3100 })
          ).join("");
          const newTxBody = `<p:txBody><a:bodyPr anchorCtr="0" anchor="t" bIns="16925" lIns="16925" spcFirstLastPara="1" rIns="16925" wrap="square" tIns="16925"><a:noAutofit/></a:bodyPr><a:lstStyle/>${buildParagraph(runs, { lnSpc: "78776" })}</p:txBody>`;
          xml = rebuildTextBox(xml, "1028700", newTxBody);
        }
      }

      if (s.subtitulo !== undefined)
        xml = replaceText(xml, "A IA permite modernizar alguns pontos no caminho, sem pagar pedágio de prazo.", s.subtitulo);

      // Left column
      const esq = s.esquerda || {};
      if (esq.rotulo !== undefined)
        xml = replaceText(xml, "MIGRAÇÃO AS-IS", esq.rotulo.toUpperCase());
      if (esq.titulo !== undefined)
        xml = replaceText(xml, "Migre rápido como está", esq.titulo);
      if (esq.descricao !== undefined) {
        xml = replaceText(xml, "Migramos o máximo possível da forma como está. ", esq.descricao);
        xml = replaceText(xml, "É o que dá velocidade, reduz risco e destrava o ganho da nuvem já na primeira onda.", "");
      }

      // Right column
      const dir = s.direita || {};
      if (dir.rotulo !== undefined)
        xml = replaceText(xml, "MODERNIZAÇÃO NO CAMINHO", dir.rotulo.toUpperCase());
      if (dir.titulo !== undefined)
        xml = replaceText(xml, "Meses viram dias", dir.titulo);
      if (dir.descricao !== undefined)
        xml = replaceText(xml, "Com Agentes de IA e o AWS Transform, modernizamos códigos durante a migração, sem onerar tempo.", dir.descricao);

      xml = replaceText(xml, "Dati | Migração e modernização na AWS", deckName);
      xml = replaceText(xml, "10", String(pageNum).padStart(2, "0"));
      return xml;
    },
  },

  // ── LISTA-ÍCONE (scratch) ─────────────────────────────────────────────────────
  "lista-icone": {
    build(s, { deckName, pageNum }) {
      const items = Array.isArray(s.items) ? s.items.slice(0, 5) : [];
      const dark = false;
      const bg = buildBackground("light");

      // Sidebar gradiente vertical no lado esquerdo
      const sidebarFill = buildGradientFill([
        { pos: 0,      hex: C.purpleMid },
        { pos: 100000, hex: C.purpleDark },
      ], 90);
      const sidebar = buildPlainRect(10, 0, 0, 500000, H, sidebarFill);

      // Eyebrow e título
      const eyebrow = buildEyebrowShape(20, s.eyebrow || "", 700000, 381000, dark);
      const title   = buildTitleShape(21, s.titulo || "", 700000, 685000, W - 700000 - MARGIN, dark);

      // Logo
      const logo = buildLogoShape(22, "rId1", W - MARGIN - 1600000, 200000, 1600000, 450000);

      // Itens
      const ITEM_Y_START = 1900000;
      const ITEM_SPACING = 900000;
      const BADGE_SIZE   = 670000;
      const TEXT_X       = 1500000;
      const TEXT_W       = W - TEXT_X - MARGIN;

      let idCounter = 30;
      let itemsXml = "";
      items.forEach((item, i) => {
        const y = ITEM_Y_START + i * ITEM_SPACING;
        // Badge
        itemsXml += buildIconBadge(item.icone || "diamond", 700000, y, idCounter);
        idCounter += 2;
        // Título do item
        const titleRun = buildRun(item.titulo || "", { color: C.navy, sz: 1800, bold: true, typeface: "Manrope" });
        itemsXml += buildTextShape(idCounter++, TEXT_X, y, TEXT_W, 500000, [{ runs: titleRun }]);
        // Descrição
        const descRun = buildRun(item.descricao || "", { color: C.textMuted, sz: 1300, typeface: "Manrope" });
        itemsXml += buildTextShape(idCounter++, TEXT_X, y + 460000, TEXT_W, 400000, [{ runs: descRun }]);
      });

      const footer = buildFooterShapes(deckName, pageNum, dark);
      const shapesXml = sidebar + eyebrow + title + logo + itemsXml + footer;
      const xml = buildScratchSlide(bg, shapesXml);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── GRID-ÍCONE (scratch) ──────────────────────────────────────────────────────
  "grid-icone": {
    build(s, { deckName, pageNum }) {
      const items = (Array.isArray(s.items) ? s.items : []).slice(0, 4);
      const bg = buildBackground("light");
      const eyebrow = buildEyebrowShape(20, s.eyebrow || "", MARGIN, 381000, false);
      const title   = buildTitleShape(21, s.titulo || "", MARGIN, 685000, W - 2 * MARGIN, false);
      const logo    = buildLogoShape(22, "rId1", W - MARGIN - 1600000, 200000, 1600000, 450000);

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
        const tRun = buildRun(item.titulo || "", { color: C.navy, sz: 1600, bold: true, typeface: "Manrope" });
        cardsXml += buildTextShape(idCounter++, cx + 200000, cy + 950000, CARD_W - 400000, 450000, [{ runs: tRun }]);

        // Descrição
        const dRun = buildRun(item.descricao || "", { color: C.textMuted, sz: 1300, typeface: "Manrope" });
        cardsXml += buildTextShape(idCounter++, cx + 200000, cy + 1400000, CARD_W - 400000, 600000, [{ runs: dRun, lnSpc: "110000" }]);
      });

      const footer = buildFooterShapes(deckName, pageNum, false);
      const xml = buildScratchSlide(bg, eyebrow + title + logo + cardsXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── PIPELINE (scratch) ────────────────────────────────────────────────────────
  pipeline: {
    build(s, { deckName, pageNum }) {
      const steps = Array.isArray(s.steps) ? s.steps.slice(0, 6) : [];
      const n = steps.length;
      const bg = buildBackground("light");
      const eyebrow = buildEyebrowShape(20, s.eyebrow || "", MARGIN, 381000, false);
      const title   = buildTitleShape(21, s.titulo || "", MARGIN, 685000, W - 2 * MARGIN, false);
      const logo    = buildLogoShape(22, "rId1", W - MARGIN - 1600000, 200000, 1600000, 450000);

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
        const lRun = buildRun(step.label || "", { color: C.white, sz: 1400, bold: true, typeface: "Manrope" });
        stepsXml += buildTextShape(idCounter++, x, PIPE_Y + 350000, STEP_W, 500000,
          [{ runs: lRun, algn: "ctr" }]);

        // Descrição
        const dRun = buildRun(step.descricao || "", { color: "FFFFFFBB", sz: 1100, typeface: "Manrope" });
        stepsXml += buildTextShape(idCounter++, x, PIPE_Y + 850000, STEP_W, 400000,
          [{ runs: dRun, algn: "ctr" }]);

        // Seta (não após o último)
        if (i < n - 1) {
          stepsXml += buildArrowText(idCounter++,
            x + STEP_W, PIPE_Y + STEP_H / 2 - 200000,
            "›", C.footerMuted, 2800);
        }
      });

      const footer = buildFooterShapes(deckName, pageNum, false);
      const xml = buildScratchSlide(bg, eyebrow + title + logo + stepsXml + footer);
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
      const eyebrow = buildEyebrowShape(20, s.eyebrow || "", MARGIN, 381000, false);
      const title   = buildTitleShape(21, s.titulo || "", MARGIN, 685000, W - 2 * MARGIN, false);
      const logo    = buildLogoShape(22, "rId1", W - MARGIN - 1600000, 200000, 1600000, 450000);

      const LINE_Y   = 3600000;
      const CIRCLE_D = 800000;
      const CIRCLE_R = CIRCLE_D / 2;
      const USABLE_W = W - 2 * MARGIN;
      const STEP_GAP = Math.floor(USABLE_W / (n - 1 || 1));

      // Linha horizontal de fundo
      const lineFill = buildSolidFill(C.purpleSubtle);
      let timelineXml = buildPlainRect(10, MARGIN, LINE_Y - 25000, USABLE_W, 50000, lineFill);

      let idCounter = 30;
      steps.forEach((step, i) => {
        const cx = MARGIN + (n > 1 ? i * STEP_GAP : USABLE_W / 2);
        const cy = LINE_Y - CIRCLE_R;

        // Círculo gradiente
        const circleFill = buildGradientFill([
          { pos: 0,      hex: C.purpleMid },
          { pos: 100000, hex: C.purpleDark },
        ], 135);
        timelineXml += buildRoundedRect(idCounter++, cx - CIRCLE_R, cy, CIRCLE_D, CIRCLE_D, 50000, circleFill);

        // Número
        const numRun = buildRun(String(i + 1), { color: C.white, sz: 2200, bold: true, typeface: "Manrope" });
        timelineXml += buildTextShape(idCounter++, cx - CIRCLE_R, cy, CIRCLE_D, CIRCLE_D,
          [{ runs: numRun, algn: "ctr" }], 'anchor="ctr"');

        // Label
        const lRun = buildRun(step.label || "", { color: C.navy, sz: 1400, bold: true, typeface: "Manrope" });
        timelineXml += buildTextShape(idCounter++, cx - 800000, LINE_Y + CIRCLE_R + 150000, 1600000, 450000,
          [{ runs: lRun, algn: "ctr" }]);

        // Descrição
        const dRun = buildRun(step.descricao || "", { color: C.textMuted, sz: 1200, typeface: "Manrope" });
        timelineXml += buildTextShape(idCounter++, cx - 800000, LINE_Y + CIRCLE_R + 600000, 1600000, 400000,
          [{ runs: dRun, algn: "ctr" }]);
      });

      const footer = buildFooterShapes(deckName, pageNum, false);
      const xml = buildScratchSlide(bg, eyebrow + title + logo + timelineXml + footer);
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

      const eyebrow = buildEyebrowShape(20, s.eyebrow || "", MARGIN, 381000, dark);
      const title   = buildTitleShape(21, s.titulo || "", MARGIN, 685000, W - 2 * MARGIN, dark);
      const logo    = buildLogoShape(22, "rId1", W - MARGIN - 1600000, 200000, 1600000, 450000);

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
        const lRun = buildRun(m.label || "", { color: lColor, sz: 1300, typeface: "Manrope" });
        cardsXml += buildTextShape(idCounter++, cx + 200000, CARD_Y + BAR_H + 1500000, CARD_W - 400000, 700000,
          [{ runs: lRun, algn: "ctr", lnSpc: "110000" }]);
      });

      const footer = buildFooterShapes(deckName, pageNum, dark);
      const xml = buildScratchSlide(bg, eyebrow + title + logo + cardsXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── TRÊS PILARES (scratch) ────────────────────────────────────────────────────
  "tres-pilares": {
    build(s, { deckName, pageNum }) {
      const pilares = Array.isArray(s.pilares) ? s.pilares.slice(0, 3) : [];
      const bg = buildBackground("light");
      const eyebrow = buildEyebrowShape(20, s.eyebrow || "", MARGIN, 381000, false);
      const title   = buildTitleShape(21, s.titulo || "", MARGIN, 685000, W - 2 * MARGIN, false);
      const logo    = buildLogoShape(22, "rId1", W - MARGIN - 1600000, 200000, 1600000, 450000);

      const COL_Y    = 1900000;
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
          color: C.white, sz: 1600, bold: true, typeface: "Manrope"
        });
        colsXml += buildTextShape(idCounter++, cx + 200000, COL_Y, COL_W - 400000, HEADER_H,
          [{ runs: tRun, algn: "ctr" }], 'anchor="ctr"');

        // Descrição
        const dRun = buildRun(pilar.descricao || "", { color: C.textMuted, sz: 1300, typeface: "Manrope" });
        colsXml += buildTextShape(idCounter++, cx + 200000, COL_Y + HEADER_H + 200000,
          COL_W - 400000, COL_H - HEADER_H - 400000, [{ runs: dRun, lnSpc: "120000" }]);
      });

      const footer = buildFooterShapes(deckName, pageNum, false);
      const xml = buildScratchSlide(bg, eyebrow + title + logo + colsXml + footer);
      const relsXml = buildScratchRels([{ rId: "rId1", target: `../media/${LOGO_MEDIA_NAME}` }]);
      return { xml, relsXml };
    },
  },

  // ── DIAGRAMA-FLUXO (scratch) ──────────────────────────────────────────────────
  "diagrama-fluxo": {
    build(s, { deckName, pageNum }) {
      const camadas = Array.isArray(s.camadas) ? s.camadas : [];
      const bg = buildBackground("light");
      const eyebrow = buildEyebrowShape(20, s.eyebrow || "", MARGIN, 381000, false);
      const title   = buildTitleShape(21, s.titulo || "", MARGIN, 685000, W - 2 * MARGIN, false);
      const logo    = buildLogoShape(22, "rId1", W - MARGIN - 1600000, 200000, 1600000, 450000);

      const NODE_W   = 3200000;
      const NODE_H   = 800000;
      const NODE_GAP = 400000; // gap horizontal entre 2 nós na mesma camada
      const LAYER_H  = NODE_H + 500000; // altura total por camada (nó + seta)
      const CONTENT_Y_START = 1900000;

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
          const lRun = buildRun(no.label || "", { color: txtColor, sz: 1500, bold: true, typeface: "Manrope" });
          diagramXml += buildTextShape(idCounter++, Math.round(nx) + 200000, layerY + 100000,
            NODE_W - 400000, 400000, [{ runs: lRun, algn: "ctr" }]);

          // Sublabel
          const sRun = buildRun(no.sublabel || "", { color: txtColor, sz: 1100, typeface: "Manrope" });
          diagramXml += buildTextShape(idCounter++, Math.round(nx) + 200000, layerY + 480000,
            NODE_W - 400000, 300000, [{ runs: sRun, algn: "ctr" }]);
        });

        // Seta entre camadas (não após a última)
        if (layerIdx < camadas.length - 1) {
          const arrowY = layerY + NODE_H + 100000;
          diagramXml += buildArrowText(idCounter++, (W - 400000) / 2, arrowY, "▼", C.footerMuted, 2000);
        }
      });

      const footer = buildFooterShapes(deckName, pageNum, false);
      const xml = buildScratchSlide(bg, eyebrow + title + logo + diagramXml + footer);
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
        ? sourceSlideRels[i].replace(/<Relationship[^>]*notesSlide[^>]*/g, "")
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
        /<Relationship[^>]*notesSlide[^>]*/g,
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

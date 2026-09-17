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
import { buildVisualSlide, VISUAL_TYPES } from "./pptx-visual-engine.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PPTX = path.resolve(__dirname, "../assets/template-source/MAP.pptx");

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
      outputSlides.push({ xml: sourceSlides[i], relsXml: cleanRels });
    } else {
      console.warn(`⚠️  Slide institucional ${i} não encontrado no MAP.pptx`);
    }
  }
  console.log(`  ✓ Bloco institucional: ${outputSlides.length} slides do MAP.pptx adicionados verbatim`);

  // User content slides — page numbering continues after institutional block
  let pageNum = INSTITUTIONAL_COUNT + 1;

  for (const s of slides) {
    // Visual slide types (generated from scratch, not from MAP.pptx templates)
    if (VISUAL_TYPES[s.tipo]) {
      const result = buildVisualSlide(s.tipo, s, { deckName, pageNum });
      if (result) {
        if (s.tipo !== "encerramento") pageNum++;
        outputSlides.push(result);
        continue;
      }
    }

    const tmpl = TEMPLATE_MAP[s.tipo];
    if (!tmpl) {
      console.warn(`⚠️  Tipo desconhecido: "${s.tipo}" — slide ignorado`);
      continue;
    }

    const srcNum = tmpl.sourceSlide;
    let xml = sourceSlides[srcNum];
    const relsXml = sourceSlideRels[srcNum];

    if (!xml) {
      console.warn(`⚠️  Slide template ${srcNum} não encontrado no PPTX`);
      continue;
    }

    // Apply template rendering
    const ctx = s.tipo === "capa" ? {} : { deckName, pageNum };
    xml = tmpl.render(xml, s, ctx);

    if (s.tipo !== "capa" && s.tipo !== "encerramento") pageNum++;

    outputSlides.push({ xml, relsXml });
  }

  // Add generated slides to zip
  outputSlides.forEach(({ xml, relsXml }, i) => {
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

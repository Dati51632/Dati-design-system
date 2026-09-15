/**
 * GERADOR DE APRESENTAÇÕES DATI
 * ─────────────────────────────────────────────────────────────────────────────
 * Reproduz fielmente o padrão visual da apresentação MAP
 * ("Acelerando a Jornada de adoção da nuvem").
 *
 * USO:
 *   node gerar-apresentacao.mjs <caminho-do-json> [nome-do-arquivo-saida.pptx]
 *
 * DEPENDÊNCIA (instalar uma vez na pasta deste arquivo):
 *   npm install pptxgenjs
 *
 * ASSETS (ficam em ../assets/ relativo a este arquivo):
 *   presentation-backgrounds/dark-section-divider.png  ← fundo seção escura
 *   presentation-backgrounds/dark-content.png          ← fundo conteúdo escuro
 *   logo/dati-logo-white.png                           ← logo branco (capa)
 *   logo/dati-logo-navy.png                            ← logo navy (slides claros)
 *   logo/dati-symbol-crop-color.png                    ← símbolo decorativo capa
 *
 * FORMATO DO JSON DE ENTRADA:
 *   Ver seção "# Formato JSON" abaixo.
 *
 * ─── # Formato JSON ─────────────────────────────────────────────────────────
 *
 * {
 *   "deckName": "Dati | Nome do deck",          ← obrigatório: vai no rodapé
 *   "outputPath": "C:/Users/.../arquivo.pptx",  ← opcional, sobrepõe o argumento CLI
 *   "tag": "Consultoria em Cloud & AI",         ← opcional: badge da capa
 *   "slides": [
 *     { "tipo": "capa",     ... },
 *     { "tipo": "secao",    ... },
 *     { "tipo": "conteudo", ... },
 *     { "tipo": "bigword",  ... },
 *     { "tipo": "impacto",  ... },
 *     { "tipo": "cta",      ... },
 *     { "tipo": "encerramento", ... }
 *   ]
 * }
 *
 * Campos por tipo:
 *
 * capa:
 *   titulo, titulo2 (linha 2 opcional), subtitulo, tag (badge, opcional)
 *
 * secao  (divisor de seção — fundo escuro):
 *   eyebrow, titulo
 *
 * conteudo  (slide claro com lista numerada):
 *   eyebrow, titulo (string ou array [{text, emphasis}]),
 *   subtitulo (opcional), itens (array de strings ou [{text, emphasis}])
 *
 * bigword  (barra roxa lateral + palavra gigante):
 *   bigword, eyebrow,
 *   titulo (string ou array [{text, emphasis}]),
 *   corpo (texto corrido, opcional)
 *
 * impacto  (fundo escuro, declaração de impacto):
 *   eyebrow, titulo, tituloDestaque (parte em ciano, opcional),
 *   corpo (opcional), destaque (texto do pill inferior, opcional)
 *
 * cta  (slide claro, próximo passo):
 *   eyebrow, titulo, tituloDestaque (opcional),
 *   instrucao (texto de apoio, opcional), ctaLabel (texto do botão, opcional)
 *
 * encerramento:
 *   titulo (padrão: "Obrigado!")
 */

import PptxGenJS from "pptxgenjs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(__dirname, "../assets");

// ─── TOKENS ─────────────────────────────────────────────────────────────────
const C = {
  navy:         "1A0F3D",
  neutral:      "EDF0F2",
  muted:        "5B5570",
  footer:       "9891AB",
  coverGray:    "C0C0C0",
  purple:       "6838E8",
  purpleMed:    "8F65FE",
  purpleTint:   "8C7DFF",
  purpleDark:   "3629D1",
  purpleSubtl:  "655CC6",
  purplePale:   "CFC9E6",
  cyan:         "5EBAE8",
  white:        "FFFFFF",
};
const FONT = "Manrope";
const W = 13.33;
const H = 7.5;

// ─── HELPERS ────────────────────────────────────────────────────────────────

function addFooter(slide, deckName, pageNum) {
  slide.addText(deckName, {
    x: 0.52, y: H - 0.38, w: 10, h: 0.28,
    fontFace: FONT, fontSize: 9, color: C.footer,
  });
  slide.addText(String(pageNum).padStart(2, "0"), {
    x: W - 0.7, y: H - 0.38, w: 0.55, h: 0.28,
    fontFace: FONT, fontSize: 9, color: C.footer, align: "right",
  });
}

function addEyebrow(slide, text, { dark = false, x = 0.52, y = 0.38 } = {}) {
  slide.addText(text.toUpperCase(), {
    x, y, w: 10, h: 0.25,
    fontFace: FONT, fontSize: 9,
    color: dark ? C.purpleTint : C.purpleMed,
    charSpacing: 1,
  });
}

function addLogoWhite(slide) {
  slide.addImage({
    path: path.join(ASSETS, "logo/dati-logo-white.png"),
    x: 0.85, y: 0.38, w: 1.5, h: 1.5 * (373 / 900),
  });
}

function addLogoNavy(slide) {
  slide.addImage({
    path: path.join(ASSETS, "logo/dati-logo-navy.png"),
    x: W - 1.9, y: 0.22, w: 1.4, h: 1.4 * (373 / 900),
  });
}

// Converte titulo string ou array para o formato pptxgenjs
function buildTitleRuns(titulo) {
  if (typeof titulo === "string") {
    return [{ text: titulo, options: { bold: true, color: C.navy } }];
  }
  return titulo.map(t => ({
    text: t.text,
    options: { bold: true, color: t.emphasis ? C.purpleMed : C.navy },
  }));
}

// ─── TEMPLATES ──────────────────────────────────────────────────────────────

function renderCapa(pptx, s) {
  const slide = pptx.addSlide();

  // Fundo escuro (gradiente radial simulado)
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: H,
    fill: { type: "solid", color: "170041" },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: H * 0.55, w: W, h: H * 0.45,
    fill: { type: "solid", color: "0D0824" },
  });

  // Card decorativo arredondado
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 9.5, y: -0.5, w: 4.5, h: 5.0,
    fill: { type: "solid", color: C.purpleDark, alpha: 62 },
    line: { color: "C5DFFF", width: 0.75, alpha: 35 },
    rectRadius: 0.5,
    rotate: 25,
  });

  // Símbolo crop decorativo
  slide.addImage({
    path: path.join(ASSETS, "logo/dati-symbol-crop-color.png"),
    x: W * 0.59, y: 0.05, w: 5.2, h: 5.2,
    opacity: 12,
  });

  // Logo branco
  addLogoWhite(slide);

  // Badge verde + tag
  const tag = s.tag || "Consultoria em Cloud & AI";
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 0.85, y: 2.08, w: 0.2, h: 0.2,
    fill: { type: "solid", color: "72E600" },
  });
  slide.addText(tag, {
    x: 1.13, y: 2.04, w: 5, h: 0.28,
    fontFace: FONT, fontSize: 11, color: C.white,
  });

  // Título
  slide.addText(s.titulo || "", {
    x: 0.85, y: 2.6, w: 8, h: 0.8,
    fontFace: FONT, fontSize: 27, bold: true, color: C.white,
  });
  if (s.titulo2) {
    slide.addText(s.titulo2, {
      x: 0.85, y: 3.32, w: 8, h: 0.8,
      fontFace: FONT, fontSize: 27, bold: true, color: C.white,
    });
  }

  // Subtítulo
  if (s.subtitulo) {
    slide.addText(s.subtitulo, {
      x: 0.85, y: s.titulo2 ? 4.2 : 3.55, w: 8.8, h: 0.7,
      fontFace: FONT, fontSize: 13, color: C.coverGray, wrap: true,
    });
  }
}

function renderSecao(pptx, s, { deckName, pageNum }) {
  const slide = pptx.addSlide();

  slide.addImage({
    path: path.join(ASSETS, "presentation-backgrounds/dark-section-divider.png"),
    x: 0, y: 0, w: W, h: H,
  });

  if (s.eyebrow) addEyebrow(slide, s.eyebrow, { dark: true });

  slide.addText(s.titulo || "", {
    x: 0.52, y: 1.7, w: 10, h: 3.2,
    fontFace: FONT, fontSize: 36, color: C.white,
    valign: "top", wrap: true,
  });

  addFooter(slide, deckName, pageNum);
}

function renderConteudo(pptx, s, { deckName, pageNum }) {
  const slide = pptx.addSlide();

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: H,
    fill: { type: "solid", color: C.neutral },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.09, h: H,
    fill: { type: "solid", color: C.purpleDark },
  });

  addLogoNavy(slide);
  if (s.eyebrow) addEyebrow(slide, s.eyebrow);

  // Título
  slide.addText(buildTitleRuns(s.titulo || ""), {
    x: 0.52, y: 0.72, w: 11.5, h: 0.9,
    fontFace: FONT, fontSize: 24,
  });

  // Subtítulo
  if (s.subtitulo) {
    slide.addText(s.subtitulo, {
      x: 0.52, y: 1.65, w: 11, h: 0.45,
      fontFace: FONT, fontSize: 13, color: C.muted,
    });
  }

  // Itens numerados
  const itens = s.itens || [];
  const startY = s.subtitulo ? 2.2 : 1.85;
  itens.forEach((item, i) => {
    const y = startY + i * 0.82;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.52, y, w: 0.36, h: 0.36,
      fill: { type: "solid", color: C.purpleSubtl },
      rectRadius: 0.07,
    });
    slide.addText(String(i + 1).padStart(2, "0"), {
      x: 0.52, y, w: 0.36, h: 0.36,
      fontFace: FONT, fontSize: 9, color: C.purplePale,
      bold: true, align: "center", valign: "middle",
    });
    const runs = typeof item === "string"
      ? [{ text: item, options: { color: C.muted } }]
      : item.map(t => ({ text: t.text, options: { color: t.emphasis ? C.purpleMed : C.muted } }));
    slide.addText(runs, {
      x: 1.02, y: y + 0.04, w: 11.7, h: 0.32,
      fontFace: FONT, fontSize: 11,
    });
  });

  addFooter(slide, deckName, pageNum);
}

function renderBigword(pptx, s, { deckName, pageNum }) {
  const slide = pptx.addSlide();

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: H,
    fill: { type: "solid", color: C.neutral },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.45, y: 0.45, w: 1.9, h: H - 0.9,
    fill: { type: "solid", color: C.purpleDark },
  });
  slide.addText(s.bigword || "", {
    x: 0.45, y: H / 2 - 0.9, w: 1.9, h: 1.8,
    fontFace: FONT, fontSize: 38, bold: true, color: C.white,
    align: "center", valign: "middle",
  });

  addLogoNavy(slide);
  if (s.eyebrow) addEyebrow(slide, s.eyebrow, { x: 2.6 });

  slide.addText(buildTitleRuns(s.titulo || ""), {
    x: 2.6, y: 0.72, w: 10.1, h: 0.9,
    fontFace: FONT, fontSize: 24,
  });

  if (s.corpo) {
    slide.addText(s.corpo, {
      x: 2.6, y: 1.8, w: 10.1, h: 2.5,
      fontFace: FONT, fontSize: 13, color: C.muted, wrap: true,
    });
  }

  addFooter(slide, deckName, pageNum);
}

function renderImpacto(pptx, s, { deckName, pageNum }) {
  const slide = pptx.addSlide();

  slide.addImage({
    path: path.join(ASSETS, "presentation-backgrounds/dark-content.png"),
    x: 0, y: 0, w: W, h: H,
  });

  if (s.eyebrow) addEyebrow(slide, s.eyebrow, { dark: true });

  const titleRuns = s.tituloDestaque
    ? [
        { text: s.titulo || "", options: { color: C.white } },
        { text: " " + s.tituloDestaque, options: { color: C.cyan } },
      ]
    : [{ text: s.titulo || "", options: { color: C.white } }];

  slide.addText(titleRuns, {
    x: 0.52, y: 0.72, w: 12, h: 2.2,
    fontFace: FONT, fontSize: 30, wrap: true,
  });

  if (s.corpo) {
    slide.addText(s.corpo, {
      x: 0.52, y: 3.2, w: 10, h: 1.5,
      fontFace: FONT, fontSize: 12, color: C.purplePale, wrap: true,
    });
  }

  if (s.destaque) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.52, y: H - 1.85, w: 6.5, h: 1.2,
      fill: { type: "solid", color: C.purple, alpha: 30 },
      line: { color: C.purple, width: 1 },
      rectRadius: 0.15,
    });
    slide.addText(s.destaque, {
      x: 0.72, y: H - 1.8, w: 6.1, h: 1.1,
      fontFace: FONT, fontSize: 11, color: C.purplePale,
      valign: "middle", wrap: true,
    });
  }

  addFooter(slide, deckName, pageNum);
}

function renderCTA(pptx, s, { deckName, pageNum }) {
  const slide = pptx.addSlide();

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: H,
    fill: { type: "solid", color: C.neutral },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.09, h: H,
    fill: { type: "solid", color: C.purpleDark },
  });

  addLogoNavy(slide);
  if (s.eyebrow) addEyebrow(slide, s.eyebrow);

  const titleRuns = s.tituloDestaque
    ? [
        { text: (s.titulo || "") + " ", options: { bold: true, color: C.navy } },
        { text: s.tituloDestaque, options: { bold: true, color: C.purpleMed } },
      ]
    : buildTitleRuns(s.titulo || "");

  slide.addText(titleRuns, {
    x: 0.52, y: 0.72, w: 11.5, h: 1.0,
    fontFace: FONT, fontSize: 24,
  });

  if (s.instrucao) {
    slide.addText(s.instrucao, {
      x: 0.52, y: 2.0, w: 10, h: 1.5,
      fontFace: FONT, fontSize: 13, color: C.muted, wrap: true,
    });
  }

  const ctaLabel = s.ctaLabel || "Agendar conversa →";
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.52, y: H - 2.1, w: Math.min(4, ctaLabel.length * 0.13 + 0.6), h: 0.55,
    fill: { type: "solid", color: C.purple },
    rectRadius: 0.28,
  });
  slide.addText(ctaLabel, {
    x: 0.52, y: H - 2.1, w: Math.min(4, ctaLabel.length * 0.13 + 0.6), h: 0.55,
    fontFace: FONT, fontSize: 12, color: C.white,
    bold: true, align: "center", valign: "middle",
  });

  addFooter(slide, deckName, pageNum);
}

function renderEncerramento(pptx, s, { deckName, pageNum }) {
  const slide = pptx.addSlide();

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: H,
    fill: { type: "solid", color: "0D0824" },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: H * 0.5,
    fill: { type: "solid", color: "1A0F3D", alpha: 70 },
  });

  slide.addText(s.titulo || "Obrigado!", {
    x: 0.52, y: 1.6, w: 9, h: 1.6,
    fontFace: FONT, fontSize: 50, color: C.white,
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.52, y: 3.35, w: 4.2, h: 0.07,
    fill: { type: "solid", color: C.purple },
  });

  addFooter(slide, (deckName || "DATI").toUpperCase(), pageNum);
}

// ─── DISPATCHER ─────────────────────────────────────────────────────────────

const RENDERERS = {
  capa:          renderCapa,
  secao:         renderSecao,
  conteudo:      renderConteudo,
  bigword:       renderBigword,
  impacto:       renderImpacto,
  cta:           renderCTA,
  encerramento:  renderEncerramento,
};

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("Uso: node gerar-apresentacao.mjs <slides.json> [saida.pptx]");
    process.exit(1);
  }

  const input = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const deckName = input.deckName || "Dati";
  const slides = input.slides || [];

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  let pageNum = 1;
  for (const s of slides) {
    const render = RENDERERS[s.tipo];
    if (!render) {
      console.warn(`⚠️  Tipo desconhecido: "${s.tipo}" — slide ignorado`);
      continue;
    }
    if (s.tipo === "capa") {
      render(pptx, s);
    } else {
      render(pptx, s, { deckName, pageNum });
      if (s.tipo !== "encerramento") pageNum++;
    }
  }

  const defaultOut = path.resolve(__dirname, "../../../../Downloads/dati-apresentacao-gerada.pptx");
  const outputPath = process.argv[3] || input.outputPath || defaultOut;
  await pptx.writeFile({ fileName: outputPath });
  console.log(`✓ Apresentação gerada em: ${outputPath}`);
}

main().catch(err => {
  console.error("Erro ao gerar apresentação:", err.message);
  process.exit(1);
});

/**
 * kb-upload.mjs — faz upload dos docs do design system para o S3 da knowledge base
 *
 * USO:
 *   node kb-upload.mjs <nome-do-bucket>
 *
 * PRÉ-REQUISITO:
 *   AWS CLI configurado com credenciais válidas
 *   npm install @aws-sdk/client-s3 (já no package.json)
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, "..");

const BUCKET = process.argv[2];
if (!BUCKET) {
  console.error("Uso: node kb-upload.mjs <nome-do-bucket>");
  process.exit(1);
}

const s3 = new S3Client({});

const FILES = [
  { local: "docs/01-marca-e-posicionamento.md",   key: "design-system/01-marca-e-posicionamento.md"   },
  { local: "docs/02-cores.md",                     key: "design-system/02-cores.md"                     },
  { local: "docs/03-tipografia.md",                key: "design-system/03-tipografia.md"                },
  { local: "docs/04-logo-e-simbolo.md",            key: "design-system/04-logo-e-simbolo.md"            },
  { local: "docs/05-elementos-graficos.md",        key: "design-system/05-elementos-graficos.md"        },
  { local: "docs/materiais/apresentacoes.md",      key: "design-system/apresentacoes.md"                },
  { local: "tokens/colors.json",                   key: "design-system/tokens-colors.json"              },
  { local: "tokens/typography.json",               key: "design-system/tokens-typography.json"          },
  { local: "SKILL-amazon-q.md",                    key: "design-system/SKILL-amazon-q.md"               },
];

const CONTENT_TYPE = {
  ".md":   "text/markdown; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

let ok = 0, fail = 0;

for (const { local, key } of FILES) {
  const fullPath = path.join(ROOT, local);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠  Não encontrado — pulando: ${local}`);
    fail++;
    continue;
  }
  const ext = path.extname(local);
  try {
    await s3.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      Body:        fs.readFileSync(fullPath),
      ContentType: CONTENT_TYPE[ext] || "text/plain",
    }));
    console.log(`✓  ${key}`);
    ok++;
  } catch (err) {
    console.error(`✗  ${key} — ${err.message}`);
    fail++;
  }
}

console.log(`\n${ok} arquivo(s) enviados${fail ? `, ${fail} com erro` : ""}.`);
if (ok > 0) {
  console.log(`\nPróximo passo: conecte o bucket "${BUCKET}" como data source no Amazon Quick.`);
}

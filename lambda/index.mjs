/**
 * Lambda handler — Dati PPTX Generator
 * Recebe JSON de slides, gera PPTX via engine, faz upload no S3 e retorna presigned URL.
 */

import { generateToBuffer } from "./pptx-template-engine.mjs";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3     = new S3Client({});
const BUCKET = process.env.OUTPUT_BUCKET;
const TTL    = parseInt(process.env.PRESIGN_TTL_SECONDS || "3600", 10);

export const handler = async (event) => {
  try {
    // Parse body
    let input;
    try {
      input = JSON.parse(event.body || "{}");
    } catch {
      return response(400, { error: "Body inválido — JSON esperado" });
    }

    if (!input.slides || !Array.isArray(input.slides)) {
      return response(400, { error: "Campo obrigatório: slides (array)" });
    }
    if (!input.deckName) {
      return response(400, { error: "Campo obrigatório: deckName (string)" });
    }

    // Gera o PPTX
    const buffer = await generateToBuffer(input);

    // Upload para S3
    const key = `presentations/${randomUUID()}.pptx`;
    await s3.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      Body:        buffer,
      ContentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ContentDisposition: `attachment; filename="${encodeURIComponent(input.deckName)}.pptx"`,
    }));

    // Gera presigned URL
    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: key }),
      { expiresIn: TTL }
    );

    return response(200, {
      downloadUrl,
      slides:    input.slides.length,
      deckName:  input.deckName,
      expiresIn: `${TTL / 60} minutos`,
    });

  } catch (err) {
    console.error("Erro ao gerar apresentação:", err);
    return response(500, { error: err.message });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type":                "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

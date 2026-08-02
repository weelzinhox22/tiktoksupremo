import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const FILE_NAME = "tiktokPu4xX39cAcKyrWRQxwlbT3yugxvy05v1.txt";
const EXPECTED_SHA256 = "F2294B7B14C41D3D96847A4364D2D4D0CB96420C204770EB78B026F9FF326F12";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDirectory = resolve(root, "public");
const publicFile = resolve(publicDirectory, FILE_NAME);
const buildFile = resolve(root, ".output", "public", FILE_NAME);
const targetUrl = process.argv.find((value) => /^https?:\/\//i.test(value));

function fail(message) {
  console.error(`TikTok verification failed: ${message}`);
  process.exitCode = 1;
}

function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

async function readAndValidate(path, label) {
  let bytes;
  try {
    bytes = await readFile(path);
  } catch {
    fail(`${label} não encontrado em ${path}`);
    return null;
  }
  if (!bytes.length) fail(`${label} está vazio.`);
  if (digest(bytes) !== EXPECTED_SHA256) fail(`${label} teve seu conteúdo alterado.`);
  if (/<(?:!doctype|html|script|body)\b/i.test(bytes.toString("utf8"))) {
    fail(`${label} contém HTML.`);
  }
  return bytes;
}

const publicEntries = await readdir(publicDirectory);
const tokenFiles = publicEntries.filter((name) =>
  name.startsWith("tiktokPu4xX39cAcKyrWRQxwlbT3yugxvy05v1"),
);
if (tokenFiles.length !== 1 || tokenFiles[0] !== FILE_NAME) {
  fail(`a pasta public deve conter somente ${FILE_NAME} para este token.`);
}

const sourceBytes = await readAndValidate(publicFile, "Arquivo público");
const buildBytes = await readAndValidate(buildFile, "Arquivo do build");
if (sourceBytes && buildBytes && !sourceBytes.equals(buildBytes)) {
  fail("o build não preservou os bytes do arquivo público.");
}

if (targetUrl && sourceBytes) {
  const verificationUrl = new URL(FILE_NAME, targetUrl.endsWith("/") ? targetUrl : `${targetUrl}/`);
  const response = await fetch(verificationUrl, { redirect: "manual" });
  const contentType = response.headers.get("content-type") ?? "";
  const responseBytes = Buffer.from(await response.arrayBuffer());
  if (response.status !== 200) fail(`a URL respondeu HTTP ${response.status}.`);
  if (/text\/html/i.test(contentType)) fail("a URL respondeu text/html.");
  if (!/text\/plain/i.test(contentType))
    fail(`Content-Type inesperado: ${contentType || "ausente"}.`);
  if (!sourceBytes.equals(responseBytes)) fail("o corpo HTTP é diferente do arquivo público.");
  console.log(`HTTP validado: ${verificationUrl.href}`);
}

if (!process.exitCode) {
  console.log(`${FILE_NAME}: arquivo público e build validados byte a byte.`);
}

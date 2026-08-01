import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const requestSchema = z.object({ url: z.string().url().max(2_000) });
const allowedHosts = ["tiktok.com", "kalodata.com"];

function assertAllowedUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Use um link HTTPS do TikTok Shop ou Kalodata.");
  const host = url.hostname.toLowerCase();
  if (!allowedHosts.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
    throw new Error("No momento, a importação aceita links do TikTok Shop e Kalodata.");
  }
  return url;
}

function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .trim();
}

function meta(html: string, key: string) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern)?.[1];
    if (match) return decodeHtml(match);
  }
  return "";
}

function findProduct(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findProduct(item);
      if (found) return found;
    }
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const type = record["@type"];
  if (type === "Product" || (Array.isArray(type) && type.includes("Product"))) return record;
  for (const child of Object.values(record)) {
    const found = findProduct(child);
    if (found) return found;
  }
  return null;
}

function textValue(value: unknown) {
  return typeof value === "string" ? decodeHtml(value) : "";
}

export const importProductFromUrl = createServerFn({ method: "POST" })
  .validator(requestSchema)
  .handler(async ({ data }) => {
    let url = assertAllowedUrl(data.url);
    let response: Response | null = null;
    for (let redirect = 0; redirect < 4; redirect++) {
      response = await fetch(url, {
        redirect: "manual",
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "Mozilla/5.0 (compatible; TikSupremo/1.0; product-import)",
        },
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) break;
        url = assertAllowedUrl(new URL(location, url).toString());
        continue;
      }
      break;
    }
    if (!response?.ok) {
      throw new Error(
        url.hostname.includes("kalodata")
          ? "O Kalodata não liberou os dados desta página. Links que exigem login precisam de uma integração autorizada."
          : "O TikTok não liberou os dados públicos deste produto. Você ainda pode preencher manualmente.",
      );
    }
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > 5 * 1024 * 1024) throw new Error("A página do produto é grande demais para importar.");
    const html = (await response.text()).slice(0, 5 * 1024 * 1024);

    let product: Record<string, unknown> | null = null;
    const scripts = html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    );
    for (const match of scripts) {
      try {
        product = findProduct(JSON.parse(decodeHtml(match[1] ?? "")));
        if (product) break;
      } catch {
        // Continua para os metadados públicos da página.
      }
    }

    const offers = product?.["offers"];
    const offer = Array.isArray(offers)
      ? (offers[0] as Record<string, unknown> | undefined)
      : offers && typeof offers === "object"
        ? (offers as Record<string, unknown>)
        : undefined;
    const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
    const name = textValue(product?.["name"]) || meta(html, "og:title") || decodeHtml(titleTag);
    const description =
      textValue(product?.["description"]) ||
      meta(html, "og:description") ||
      meta(html, "description");
    const priceRaw = offer?.["price"] ?? product?.["price"];
    const price =
      typeof priceRaw === "number"
        ? String(priceRaw)
        : typeof priceRaw === "string"
          ? priceRaw.replace(/[^0-9.,]/g, "")
          : "";
    const category = textValue(product?.["category"]);

    if (!name || /^(tiktok shop|kalodata)$/i.test(name.trim())) {
      throw new Error(
        url.hostname.includes("kalodata")
          ? "Esse link do Kalodata exige uma sessão autorizada; não foi possível ler o produto automaticamente."
          : "Não encontrei dados públicos de produto nesse link do TikTok Shop.",
      );
    }
    return { name, description, price, category, sourceUrl: url.toString() };
  });

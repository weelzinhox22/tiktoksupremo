import type { FFmpeg as FFmpegType } from "@ffmpeg/ffmpeg";
import type {
  TextAnimationPresetId,
  TextLoopAnimationPresetId,
} from "@/features/video-editor/presets";

export type ExportFormat = "9x16-720" | "9x16-1080" | "16x9-1080";

/** Returns { w, h } for the given export format. */
function formatDimensions(
  fmt: ExportFormat | undefined,
  legacyWidth: 720 | 1080 = 720,
): { w: number; h: number } {
  if (fmt === "16x9-1080") return { w: 1920, h: 1080 };
  if (fmt === "9x16-1080") return { w: 1080, h: 1920 };
  if (fmt === "9x16-720") return { w: 720, h: 1280 };
  return legacyWidth === 1080 ? { w: 1080, h: 1920 } : { w: 720, h: 1280 };
}

export type EditorSegment = {
  id: string;
  label: string;
  group: "hook" | "body" | "cta";
  file: File | null;
  start: number;
  end: number;
  duration: number;
  mute: boolean;
  playbackRate: number;
  volume: number;
  mirror: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  fadeIn: number;
  fadeOut: number;
  animationIn: "none" | "fade" | "fade-white" | "zoom" | "pulse" | "blur" | "shake";
  animationOut: "none" | "fade" | "fade-white" | "zoom" | "pulse" | "blur" | "shake";
  animationDuration: number;
  transition:
    | "none"
    | "fade"
    | "fadeblacks"
    | "fadewhites"
    | "wipeleft"
    | "wiperight"
    | "wipeup"
    | "wipedown"
    | "slideleft"
    | "slideright"
    | "slideup"
    | "slidedown"
    | "smoothleft"
    | "smoothright"
    | "circleopen"
    | "circleclose"
    | "pixelize"
    | "zoomin";
  transitionDuration: number;
  audioDetached: boolean;
  hideOverlay: boolean;
  overlayPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  overlayWidth: number;
  overlayHeight: number;
};

export type EditorTextOverlay = {
  id: string;
  text: string;
  start: number;
  end: number;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  backgroundColor: string;
  style: "classic" | "caption" | "impact" | "neon" | "minimal";
  animationIn: TextAnimationPresetId;
  animationOut: TextAnimationPresetId;
  animationLoop: TextLoopAnimationPresetId;
  animationDuration: number;
  presetId?: string;
  fontFamily?: string;
  fontWeight?: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  rotation?: number;
  letterSpacing?: number;
  textTransform?: "none" | "uppercase" | "lowercase";
  borderRadius?: number;
  captionWords?: string[];
  captionGroupId?: string;
  captionLineWordCounts?: number[];
  maxLines?: number;
  activeWordIndex?: number;
  highlightColor?: string;
  captionPreset?:
    | "tiktok"
    | "capcut"
    | "capcut_yellow"
    | "capcut_purple"
    | "capcut_neon_green"
    | "capcut_dynamic"
    | "capcut_clean"
    | "four_words"
    | "word_pop"
    | "karaoke"
    | "minimal"
    | "impact";
  important?: boolean;
  decorations?: Array<{
    type: "sparkle" | "star" | "dot" | "bolt";
    color: string;
    x: number;
    y: number;
    size: number;
    rotation?: number;
  }>;
};

export type EditorAudioLayer = {
  id: string;
  name: string;
  file: File;
  start: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  volume: number;
  muted: boolean;
  fadeIn: number;
  fadeOut: number;
  sourceSegmentId?: string;
};

export type EditorCombination = {
  number: number;
  hook: number;
  body: number;
  cta: number;
  label: string;
  purpose?:
    | "aggressive"
    | "emotional"
    | "demonstrative"
    | "price"
    | "social-proof"
    | "short-retention"
    | "long-explanation";
};

let ffmpegInstance: FFmpegType | null = null;
let loaded = false;
let cachedCoreBlobUrl: string | null = null;
let cachedWasmBlobUrl: string | null = null;
let activeLogListener: ((event: { message: string }) => void) | null = null;

export function createCombinations(hookCount: number, bodyCount: number, ctaCount: number) {
  const result: EditorCombination[] = [];
  for (let hook = 0; hook < hookCount; hook++) {
    for (let body = 0; body < bodyCount; body++) {
      for (let cta = 0; cta < ctaCount; cta++) {
        result.push({
          number: result.length + 1,
          hook,
          body,
          cta,
          label: `Gancho ${hook + 1} + Corpo ${body + 1} + CTA ${cta + 1}`,
        });
      }
    }
  }
  return result;
}

export function createPurposefulCombinations(
  hookCount: number,
  bodyCount: number,
  ctaCount: number,
) {
  const purposes: Array<{
    purpose: NonNullable<EditorCombination["purpose"]>;
    label: string;
    indexes: [number, number, number];
  }> = [
    { purpose: "aggressive", label: "Agressiva · urgência e cortes rápidos", indexes: [0, 0, 0] },
    { purpose: "emotional", label: "Emocional · história e transformação", indexes: [1, 1, 1] },
    { purpose: "demonstrative", label: "Demonstrativa · produto em ação", indexes: [2, 2, 0] },
    { purpose: "price", label: "Preço · valor e objeção", indexes: [3, 1, 1] },
    { purpose: "social-proof", label: "Prova social · validação", indexes: [1, 3, 2] },
    { purpose: "short-retention", label: "Curta · máxima retenção", indexes: [2, 0, 0] },
    { purpose: "long-explanation", label: "Longa · explicação completa", indexes: [0, 3, 2] },
  ];
  return purposes.map(({ purpose, label, indexes }, index): EditorCombination => ({
    number: index + 1,
    hook: indexes[0] % Math.max(1, hookCount),
    body: indexes[1] % Math.max(1, bodyCount),
    cta: indexes[2] % Math.max(1, ctaCount),
    label,
    purpose,
  }));
}

async function getMediaDuration(file: File, element: "video" | "audio") {
  try {
    const { Input, ALL_FORMATS, BlobSource } = await import("mediabunny");
    const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
    const duration = await input.computeDuration();
    if (Number.isFinite(duration) && duration > 0) return duration;
  } catch {
    // Navegadores sem suporte ao codec ainda podem ler a duração pelo elemento HTML.
  }
  const url = URL.createObjectURL(file);
  try {
    const media = document.createElement(element);
    media.preload = "metadata";
    media.src = url;
    await new Promise<void>((resolve, reject) => {
      media.onloadedmetadata = () => resolve();
      media.onerror = () => reject(new Error(`Não foi possível ler ${file.name}.`));
    });
    return Number.isFinite(media.duration) ? media.duration : element === "video" ? 8 : 30;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function getVideoDuration(file: File) {
  return getMediaDuration(file, "video");
}

export async function getAudioDuration(file: File) {
  return getMediaDuration(file, "audio");
}

export async function inspectMediaMetadata(source: Blob) {
  try {
    const { Input, ALL_FORMATS, BlobSource } = await import("mediabunny");
    const input = new Input({ source: new BlobSource(source), formats: ALL_FORMATS });
    const tags = await input.getMetadataTags();
    return Object.fromEntries(
      Object.entries(tags).filter(
        ([, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
  } catch {
    return {};
  }
}

function privacyMetadataArgs(enabled: boolean | undefined) {
  // Every field listed here will be explicitly cleared in the output container.
  // Using flatMap avoids repeating "-metadata" for every entry.
  const clearFields = [
    // ── Core identity ─────────────────────────────────────────────────────────
    "title",
    "artist",
    "author",
    "comment",
    "description",
    "synopsis",
    // ── Dates & timestamps ────────────────────────────────────────────────────
    "creation_time",
    "date",
    "year",
    "recording_time",
    // ── Location / GPS ────────────────────────────────────────────────────────
    "location",
    "location-eng",
    // ── Device & software fingerprints ────────────────────────────────────────
    "make",
    "model",
    "encoder",
    "encoded_by",
    "software",
    "handler_name",
    "vendor_id",
    "major_brand",
    "minor_version",
    "compatible_brands",
    // ── Copyright & publishing ────────────────────────────────────────────────
    "copyright",
    "publisher",
    "url",
    "rating",
    // ── Media catalogue ───────────────────────────────────────────────────────
    "album",
    "genre",
    "track",
    "disc",
    "language",
    // ── Streaming / broadcast ─────────────────────────────────────────────────
    "show",
    "episode_id",
    "episode_sort",
    "season_number",
    "network",
    // ── Apple QuickTime private udta tags ─────────────────────────────────────
    "com.apple.quicktime.make",
    "com.apple.quicktime.model",
    "com.apple.quicktime.software",
    "com.apple.quicktime.creationdate",
    "com.apple.quicktime.location.ISO6709",
    "com.apple.quicktime.camera.framereadouttimeinmicroseconds",
    "com.apple.quicktime.camera.currentexposurebiasvalue",
    "com.apple.quicktime.camera.identifier",
    "com.apple.quicktime.player.version",
    "com.apple.photos.originating.signature",
    // ── Android / generic device tags ─────────────────────────────────────────
    "com.android.version",
    "com.android.capture.fps",
  ];

  return enabled
    ? [
        // Strip all metadata from the global container and every stream type.
        "-map_metadata",
        "-1",
        "-map_metadata:s:v",
        "-1",
        "-map_metadata:s:a",
        "-1",
        "-map_metadata:s:s",
        "-1",
        "-map_metadata:s:d",
        "-1",
        // Remove all chapter metadata.
        "-map_chapters",
        "-1",
        // Zero-out creation dates on stream level
        "-metadata:s:v",
        "creation_time=1970-01-01T00:00:00Z",
        "-metadata:s:a",
        "creation_time=1970-01-01T00:00:00Z",
        "-metadata",
        "creation_time=1970-01-01T00:00:00Z",
        "-metadata:s:v",
        "handler_name=",
        "-metadata:s:a",
        "handler_name=",
        "-metadata:s:v",
        "vendor_id=",
        "-metadata:s:a",
        "vendor_id=",
        "-metadata:s:v",
        "encoder=",
        "-metadata:s:a",
        "encoder=",
        // Explicitly zero-out every known sensitive field so container muxers
        // cannot silently preserve them even after -map_metadata -1.
        ...clearFields.flatMap((key) => ["-metadata", `${key}=`]),
      ]
    : [];
}

function fileExtension(filename: string) {
  return filename.match(/\.([a-z0-9]{1,8})$/i)?.[1]?.toLowerCase() ?? "mp4";
}

function metadataOutputMimeType(extension: string, fallback: string) {
  const knownTypes: Record<string, string> = {
    avi: "video/x-msvideo",
    m4v: "video/x-m4v",
    mkv: "video/x-matroska",
    mov: "video/quicktime",
    mp4: "video/mp4",
    ogv: "video/ogg",
    webm: "video/webm",
  };
  return knownTypes[extension] ?? (fallback || "application/octet-stream");
}

function timeoutPromise<T>(promise: Promise<T>, ms: number, msg: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(msg)), ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function runFFmpeg(ffmpeg: FFmpegType, args: string[], context: string) {
  const exitCode = await ffmpeg.exec(["-y", "-hide_banner", ...args]);
  if (exitCode !== 0) {
    throw new Error(`${context} (código ${exitCode}). Verifique os arquivos e tente novamente.`);
  }
}

async function readOutputFile(ffmpeg: FFmpegType, path: string, context: string) {
  const data = await ffmpeg.readFile(path);
  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data);
  if (bytes.byteLength < 1024) throw new Error(`${context}: o arquivo gerado ficou incompleto.`);
  return bytes;
}

export async function loadVideoEngine(
  options?:
    | ((message: string) => void)
    | {
        onProgress?: (message: string) => void;
        onLog?: (message: string) => void;
      },
): Promise<FFmpegType> {
  const onLog = typeof options === "function" ? options : options?.onLog;
  const onProgress = typeof options === "function" ? undefined : options?.onProgress;

  const ensureFFmpeg = async () => {
    if (!ffmpegInstance) {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      ffmpegInstance = new FFmpeg();
    }
    return ffmpegInstance;
  };

  const instance = await ensureFFmpeg();

  if (onLog) {
    if (activeLogListener) instance.off("log", activeLogListener);
    activeLogListener = ({ message }) => onLog(message);
    instance.on("log", activeLogListener);
  }

  if (!loaded) {
    onProgress?.("Conectando ao motor de vídeo local...");
    const { toBlobURL } = await import("@ffmpeg/util");

    if (cachedCoreBlobUrl && cachedWasmBlobUrl) {
      onProgress?.("Inicializando motor de vídeo a partir do cache local...");
      try {
        const activeEngine = await ensureFFmpeg();
        await timeoutPromise(
          activeEngine.load({ coreURL: cachedCoreBlobUrl, wasmURL: cachedWasmBlobUrl }),
          180000,
          "Tempo limite excedido ao carregar a partir do cache.",
        );
        loaded = true;
        return activeEngine;
      } catch (err) {
        console.warn("Reutilização de cache falhou, realizando novo download:", err);
        cachedCoreBlobUrl = null;
        cachedWasmBlobUrl = null;
      }
    }

    const fetchToBlobURL = async (url: string, mimeType: string): Promise<string> => {
      try {
        const response = await fetch(url, { cache: "force-cache", credentials: "same-origin" });
        if (!response.ok) {
          throw new Error(`Erro ao baixar ${url}: status ${response.status}`);
        }
        const blob = await response.blob();
        if (blob.size < 1024)
          throw new Error(`O servidor retornou um arquivo inválido para ${url}.`);
        return URL.createObjectURL(new Blob([blob], { type: mimeType }));
      } catch (err) {
        // Fallback para toBlobURL se fetch falhar por alguma política de CORS
        return await toBlobURL(url, mimeType);
      }
    };

    const loadConfigs = [
      async () => {
        onProgress?.("Carregando motor de vídeo local do servidor...");
        const baseURL = new URL(
          `${import.meta.env.BASE_URL}ffmpeg/`,
          window.location.origin,
        ).href.replace(/\/$/, "");
        const coreURL = await fetchToBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
        const wasmURL = await fetchToBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");
        onProgress?.("Inicializando motor de vídeo WebAssembly (servidor local)...");
        const activeEngine = await ensureFFmpeg();
        await timeoutPromise(
          activeEngine.load({ coreURL, wasmURL }),
          45000,
          "Tempo limite excedido ao carregar motor local.",
        );
        cachedCoreBlobUrl = coreURL;
        cachedWasmBlobUrl = wasmURL;
      },
      async () => {
        onProgress?.("Baixando biblioteca do editor (jsdelivr, ~32MB)...");
        const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
        const coreURL = await fetchToBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
        const wasmURL = await fetchToBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");
        onProgress?.("Inicializando motor de vídeo WebAssembly...");
        const activeEngine = await ensureFFmpeg();
        await timeoutPromise(
          activeEngine.load({ coreURL, wasmURL }),
          180000,
          "Tempo limite excedido ao carregar pelo jsdelivr.",
        );
        cachedCoreBlobUrl = coreURL;
        cachedWasmBlobUrl = wasmURL;
      },
      async () => {
        onProgress?.("Baixando biblioteca do editor (unpkg, ~32MB)...");
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
        const coreURL = await fetchToBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
        const wasmURL = await fetchToBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");
        onProgress?.("Inicializando motor de vídeo WebAssembly...");
        const activeEngine = await ensureFFmpeg();
        await timeoutPromise(
          activeEngine.load({ coreURL, wasmURL }),
          180000,
          "Tempo limite excedido ao carregar pelo unpkg.",
        );
        cachedCoreBlobUrl = coreURL;
        cachedWasmBlobUrl = wasmURL;
      },
      async () => {
        onProgress?.("Conectando ao motor de vídeo direto...");
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
        const activeEngine = await ensureFFmpeg();
        await timeoutPromise(
          activeEngine.load({
            coreURL: `${baseURL}/ffmpeg-core.js`,
            wasmURL: `${baseURL}/ffmpeg-core.wasm`,
          }),
          180000,
          "Tempo limite excedido no modo direto.",
        );
      },
    ];

    let lastError: unknown = null;
    let success = false;
    for (const loadAttempt of loadConfigs) {
      try {
        await loadAttempt();
        success = true;
        break;
      } catch (err) {
        console.warn("Tentativa de carregar motor FFmpeg falhou:", err);
        lastError = err;
        if (ffmpegInstance) {
          try {
            ffmpegInstance.terminate();
          } catch {
            // Ignorar erros na limpeza
          }
          ffmpegInstance = null;
        }
      }
    }

    if (!success) {
      if (ffmpegInstance) {
        try {
          ffmpegInstance.terminate();
        } catch {
          // Ignorar erros na limpeza
        }
      }
      ffmpegInstance = null;
      loaded = false;
      throw (
        lastError ||
        new Error(
          "Não foi possível inicializar o editor de vídeo local. Verifique sua conexão à internet.",
        )
      );
    }
    loaded = true;
  }
  return ffmpegInstance!;
}

async function deleteIfPresent(ffmpeg: FFmpegType, path: string) {
  try {
    await ffmpeg.deleteFile(path);
  } catch {
    // O arquivo ainda não existe no sistema temporário.
  }
}

export async function cleanVideoMetadata(
  ffmpeg: FFmpegType,
  file: File,
  id: string,
  options?: { deepClean?: boolean; randomizeFilename?: boolean; audioPitchShift?: boolean },
) {
  const { fetchFile } = await import("@ffmpeg/util");
  const extension = fileExtension(file.name);
  const safeId = id.replace(/[^a-z0-9-]/gi, "").slice(0, 48) || crypto.randomUUID();
  const input = `metadata-input-${safeId}.${extension}`;
  const output = `metadata-output-${safeId}.${extension}`;

  const originalBaseName = file.name.replace(/\.[^.]+$/, "") || "video";
  const cleanRandomName = `video_${Math.floor(100000 + Math.random() * 900000)}.${extension}`;
  const filename = options?.randomizeFilename
    ? cleanRandomName
    : `${originalBaseName}-sem-metadados.${extension}`;

  await deleteIfPresent(ffmpeg, input);
  await deleteIfPresent(ffmpeg, output);
  await ffmpeg.writeFile(input, await fetchFile(file));

  const isDeep = Boolean(options?.deepClean);
  const isPitchShift = Boolean(options?.audioPitchShift);

  let codecArgs: string[];
  if (isDeep || isPitchShift) {
    codecArgs = [
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      ...(isPitchShift ? ["-af", "asetrate=48288,aresample=48000"] : []),
    ];
  } else {
    codecArgs = ["-c", "copy"];
  }

  try {
    const result = await ffmpeg.exec([
      "-i",
      input,
      "-map",
      "0:v?",
      "-map",
      "0:a?",
      "-map",
      "0:s?",
      "-dn",
      ...codecArgs,
      "-fflags",
      "+bitexact",
      "-flags",
      "+bitexact",
      ...privacyMetadataArgs(true),
      ...(extension === "mp4" || extension === "mov" || extension === "m4v"
        ? ["-movflags", "+faststart"]
        : []),
      output,
    ]);
    if (result !== 0) {
      throw new Error(
        `Não foi possível limpar ${file.name}. Tente converter o arquivo para MP4 primeiro.`,
      );
    }
    const data = await ffmpeg.readFile(output);
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data);
    return {
      blob: new Blob([bytes.slice().buffer], {
        type: metadataOutputMimeType(extension, file.type),
      }),
      filename,
    };
  } finally {
    await deleteIfPresent(ffmpeg, input);
    await deleteIfPresent(ffmpeg, output);
  }
}

export async function normalizeSegment(
  ffmpeg: FFmpegType,
  segment: EditorSegment,
  options: {
    removeAudio: boolean;
    width: 720 | 1080;
    stripMetadata?: boolean;
    exportFormat?: ExportFormat;
    fitMode?: "contain" | "cover";
    normalizeAudio?: boolean;
  },
) {
  if (!segment.file) throw new Error(`Envie o arquivo de ${segment.label}.`);
  const { fetchFile } = await import("@ffmpeg/util");
  const extension =
    segment.file.name
      .split(".")
      .pop()
      ?.replace(/[^a-z0-9]/gi, "") || "mp4";
  const input = `input-${segment.id}.${extension}`;
  const output = `normalized-${segment.id}.mp4`;
  await ffmpeg.writeFile(input, await fetchFile(segment.file));
  await deleteIfPresent(ffmpeg, output);

  const selectedDuration = Math.max(0.1, segment.end - segment.start);
  const playedDuration = selectedDuration / segment.playbackRate;
  const { w: outputWidth, h: height } = formatDimensions(options.exportFormat, options.width);
  const scaleFilter =
    options.fitMode === "cover"
      ? `scale=${outputWidth}:${height}:force_original_aspect_ratio=increase,crop=${outputWidth}:${height}`
      : `scale=${outputWidth}:${height}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`;
  const padFilter =
    options.fitMode === "cover"
      ? null
      : `pad=${outputWidth}:${height}:x='trunc((ow-iw)/2)':y='trunc((oh-ih)/2)':color=black`;
  const videoFilters = [
    `trim=end=${selectedDuration}`,
    `setpts=(PTS-STARTPTS)/${segment.playbackRate}`,
    scaleFilter,
    ...(padFilter ? [padFilter] : []),
    ...(segment.mirror ? ["hflip"] : []),
    `eq=brightness=${segment.brightness}:contrast=${segment.contrast}:saturation=${segment.saturation}`,
    "fps=30",
  ];
  if (segment.hideOverlay) {
    const boxWidth = Math.max(16, Math.round((outputWidth * segment.overlayWidth) / 100));
    const boxHeight = Math.max(16, Math.round((height * segment.overlayHeight) / 100));
    const x = segment.overlayPosition.endsWith("right") ? outputWidth - boxWidth - 4 : 4;
    const y = segment.overlayPosition.startsWith("bottom") ? height - boxHeight - 4 : 4;
    videoFilters.push(`delogo=x=${x}:y=${y}:w=${boxWidth}:h=${boxHeight}:show=0`);
  }
  const animationDuration = Math.min(segment.animationDuration, playedDuration / 2);
  const fadeInDuration = segment.animationIn.startsWith("fade")
    ? animationDuration
    : segment.fadeIn;
  const fadeOutDuration = segment.animationOut.startsWith("fade")
    ? animationDuration
    : segment.fadeOut;
  if (
    segment.animationIn === "zoom" ||
    segment.animationOut === "zoom" ||
    segment.animationIn === "pulse" ||
    segment.animationOut === "pulse"
  ) {
    const frameCount = Math.max(1, Math.round(playedDuration * 30));
    const animationFrames = Math.max(1, Math.round(animationDuration * 30));
    const zoomIn =
      segment.animationIn === "zoom" || segment.animationIn === "pulse"
        ? `if(lt(on,${animationFrames}),1.16-(0.16*on/${animationFrames}),1)`
        : "1";
    const zoomOut =
      segment.animationOut === "zoom" || segment.animationOut === "pulse"
        ? `if(gt(on,${Math.max(0, frameCount - animationFrames)}),1+(0.16*(on-${Math.max(0, frameCount - animationFrames)})/${animationFrames}),${zoomIn})`
        : zoomIn;
    videoFilters.push(
      `zoompan=z='${zoomOut}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${outputWidth}x${height}:fps=30`,
    );
  }
  if (segment.animationIn === "blur") {
    videoFilters.push(`boxblur=8:1:enable='lt(t,${animationDuration})'`);
  }
  if (segment.animationOut === "blur") {
    videoFilters.push(
      `boxblur=8:1:enable='gte(t,${Math.max(0, playedDuration - animationDuration)})'`,
    );
  }
  if (segment.animationIn === "shake" || segment.animationOut === "shake") {
    const shakeIn =
      segment.animationIn === "shake"
        ? `if(lt(t,${animationDuration}),10*sin(48*t)*(1-t/${animationDuration}),0)`
        : "0";
    const shakeOut =
      segment.animationOut === "shake"
        ? `if(gte(t,${Math.max(0, playedDuration - animationDuration)}),10*sin(48*t)*(t-${Math.max(0, playedDuration - animationDuration)})/${animationDuration},0)`
        : "0";
    videoFilters.push(
      `crop=iw-24:ih-24:x='12+${shakeIn}+${shakeOut}':y='12+(${shakeIn})*0.6+(${shakeOut})*0.6'`,
      `scale=${outputWidth}:${height}`,
    );
  }
  if (fadeInDuration > 0) {
    videoFilters.push(
      `fade=t=in:st=0:d=${fadeInDuration}${segment.animationIn === "fade-white" ? ":color=white" : ""}`,
    );
  }
  if (fadeOutDuration > 0) {
    videoFilters.push(
      `fade=t=out:st=${Math.max(0, playedDuration - fadeOutDuration)}:d=${fadeOutDuration}${segment.animationOut === "fade-white" ? ":color=white" : ""}`,
    );
  }
  const videoFilter = videoFilters.join(",");

  const base = ["-ss", String(segment.start), "-i", input];
  const encodeVideo = [
    "-vf",
    videoFilter,
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-crf",
    "24",
    "-pix_fmt",
    "yuv420p",
  ];
  const privacyArgs = privacyMetadataArgs(options.stripMetadata);

  if (options.removeAudio) {
    await runFFmpeg(
      ffmpeg,
      [
        ...base,
        ...encodeVideo,
        "-t",
        String(playedDuration),
        "-an",
        ...privacyArgs,
        "-movflags",
        "+faststart",
        output,
      ],
      `Falha ao preparar ${segment.label}`,
    );
  } else if (segment.mute) {
    await ffmpeg.exec([
      ...base,
      "-f",
      "lavfi",
      "-t",
      String(playedDuration),
      "-i",
      "anullsrc=channel_layout=stereo:sample_rate=48000",
      ...encodeVideo,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:a",
      "aac",
      ...privacyArgs,
      "-shortest",
      "-movflags",
      "+faststart",
      output,
    ]);
  } else {
    const audioFilters = [
      `atrim=end=${selectedDuration}`,
      "asetpts=PTS-STARTPTS",
      `atempo=${segment.playbackRate}`,
      `volume=${segment.volume / 100}`,
      `atrim=end=${playedDuration}`,
      ...(options.normalizeAudio ? ["loudnorm=I=-16:TP=-1.5:LRA=11"] : []),
    ];
    if (segment.fadeIn > 0) audioFilters.push(`afade=t=in:st=0:d=${segment.fadeIn}`);
    if (segment.fadeOut > 0)
      audioFilters.push(
        `afade=t=out:st=${Math.max(0, playedDuration - segment.fadeOut)}:d=${segment.fadeOut}`,
      );
    const audioFilter = audioFilters.join(",");
    const withAudio = await ffmpeg.exec([
      ...base,
      ...encodeVideo,
      "-af",
      audioFilter,
      "-c:a",
      "aac",
      "-ar",
      "48000",
      ...privacyArgs,
      "-movflags",
      "+faststart",
      "-t",
      String(playedDuration),
      output,
    ]);
    if (withAudio !== 0) {
      await deleteIfPresent(ffmpeg, output);
      await ffmpeg.exec([
        ...base,
        "-f",
        "lavfi",
        "-t",
        String(playedDuration),
        "-i",
        "anullsrc=channel_layout=stereo:sample_rate=48000",
        ...encodeVideo,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:a",
        "aac",
        ...privacyArgs,
        "-shortest",
        "-movflags",
        "+faststart",
        output,
      ]);
    }
  }
  await deleteIfPresent(ffmpeg, input);
  await readOutputFile(ffmpeg, output, `Falha ao preparar ${segment.label}`);
  return output;
}

export function getSegmentOutputDuration(segment: EditorSegment) {
  return Math.max(0.1, (segment.end - segment.start) / segment.playbackRate);
}

export function getTimelineLayout(segments: EditorSegment[]) {
  let cursor = 0;
  const entries = segments.map((segment, index) => {
    const duration = getSegmentOutputDuration(segment);
    const next = segments[index + 1];
    const transitionDuration = next
      ? Math.min(
          segment.transition === "none" ? 0 : segment.transitionDuration,
          duration / 2,
          getSegmentOutputDuration(next) / 2,
        )
      : 0;
    const entry = { segment, start: cursor, end: cursor + duration, duration, transitionDuration };
    cursor += duration - transitionDuration;
    return entry;
  });
  return { entries, duration: entries.at(-1)?.end ?? 0 };
}

export function segmentIdsForCombination(combination: EditorCombination) {
  return [
    `hook-${combination.hook + 1}`,
    `body-${combination.body + 1}-a`,
    `body-${combination.body + 1}-b`,
    `cta-${combination.cta + 1}`,
  ];
}
export async function renderCombination(
  ffmpeg: FFmpegType,
  combination: EditorCombination,
  normalizedFiles: Map<string, string>,
  options?: {
    segments?: EditorSegment[];
    textOverlays?: EditorTextOverlay[];
    audioLayers?: EditorAudioLayer[];
    segmentIds?: string[];
    width?: 720 | 1080;
    exportFormat?: ExportFormat;
    removeAudio?: boolean;
    stripMetadata?: boolean;
  },
) {
  const ids = options?.segmentIds?.length
    ? options.segmentIds
    : segmentIdsForCombination(combination);
  const filenames = ids.map((id) => normalizedFiles.get(id));
  if (filenames.some((filename) => !filename)) throw new Error("Há cenas não preparadas.");
  const output = `tik-supremo-${String(combination.number).padStart(2, "0")}.mp4`;
  await deleteIfPresent(ffmpeg, output);
  const selectedSegments = ids.map((id) => options?.segments?.find((segment) => segment.id === id));
  const canUseFastConcat =
    selectedSegments.every(Boolean) &&
    selectedSegments.every((segment) => segment?.transition === "none") &&
    !options?.textOverlays?.length &&
    !options?.audioLayers?.length;

  if (canUseFastConcat) {
    const listFile = `concat-${combination.number}.txt`;
    const list = filenames.map((filename) => `file '${filename}'`).join("\n");
    await ffmpeg.writeFile(listFile, new TextEncoder().encode(list));
    await runFFmpeg(
      ffmpeg,
      [
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        listFile,
        ...(options?.removeAudio ? ["-an", "-c:v", "copy"] : ["-c", "copy"]),
        ...privacyMetadataArgs(options?.stripMetadata),
        "-movflags",
        "+faststart",
        output,
      ],
      "Falha ao unir os clipes",
    );
    await deleteIfPresent(ffmpeg, listFile);
  } else {
    const clips = selectedSegments.filter((segment): segment is EditorSegment => Boolean(segment));
    if (clips.length !== filenames.length) throw new Error("Não foi possível montar a timeline.");
    const includeAudio = !options?.removeAudio;
    const args: string[] = [];
    filenames.forEach((filename) => args.push("-i", filename as string));

    const overlays = (options?.textOverlays ?? []).filter(
      (overlay) => overlay.text.trim() && overlay.end > overlay.start,
    );
    const { w: width, h: height } = formatDimensions(options?.exportFormat, options?.width);
    for (const [index, overlay] of overlays.entries()) {
      const filename = `text-${combination.number}-${index}.png`;
      await ffmpeg.writeFile(filename, await createTextOverlayPng(overlay, width, height));
      args.push(
        "-framerate",
        "30",
        "-loop",
        "1",
        "-t",
        String(overlay.end - overlay.start),
        "-i",
        filename,
      );
    }
    const audioLayers = (options?.audioLayers ?? []).filter(
      (layer) => !layer.muted && layer.trimEnd > layer.trimStart,
    );
    const audioInputFiles: string[] = [];
    if (audioLayers.length) {
      const { fetchFile } = await import("@ffmpeg/util");
      for (const [index, layer] of audioLayers.entries()) {
        const extension =
          layer.file.name
            .split(".")
            .pop()
            ?.replace(/[^a-z0-9]/gi, "") || "mp3";
        const filename = `audio-${combination.number}-${index}.${extension}`;
        await ffmpeg.writeFile(filename, await fetchFile(layer.file));
        args.push("-i", filename);
        audioInputFiles.push(filename);
      }
    }

    const filters: string[] = [];
    let videoLabel = "0:v";
    let audioLabel = "0:a";
    let assembledDuration = getSegmentOutputDuration(clips[0]!);
    for (let index = 1; index < clips.length; index += 1) {
      const previous = clips[index - 1]!;
      const next = clips[index]!;
      const transitionDuration = Math.min(
        previous.transition === "none" ? 0 : previous.transitionDuration,
        getSegmentOutputDuration(previous) / 2,
        getSegmentOutputDuration(next) / 2,
      );
      const nextVideo = `${index}:v`;
      const nextAudio = `${index}:a`;
      const outputVideo = `v${index}`;
      const outputAudio = `a${index}`;
      if (transitionDuration > 0) {
        const offset = Math.max(0, assembledDuration - transitionDuration);
        filters.push(
          `[${videoLabel}][${nextVideo}]xfade=transition=${previous.transition}:duration=${transitionDuration}:offset=${offset}[${outputVideo}]`,
        );
        if (includeAudio) {
          filters.push(
            `[${audioLabel}][${nextAudio}]acrossfade=d=${transitionDuration}:c1=tri:c2=tri[${outputAudio}]`,
          );
        }
      } else {
        filters.push(`[${videoLabel}][${nextVideo}]concat=n=2:v=1:a=0[${outputVideo}]`);
        if (includeAudio) {
          filters.push(`[${audioLabel}][${nextAudio}]concat=n=2:v=0:a=1[${outputAudio}]`);
        }
      }
      videoLabel = outputVideo;
      if (includeAudio) audioLabel = outputAudio;
      assembledDuration += getSegmentOutputDuration(next) - transitionDuration;
    }

    for (const [index, overlay] of overlays.entries()) {
      const inputIndex = filenames.length + index;
      const localDuration = overlay.end - overlay.start;
      const animationDuration = Math.min(overlay.animationDuration, localDuration / 2);
      const overlayLabel = `txt${index}`;
      const nextVideoLabel = `vt${index}`;
      const overlayFilters = ["format=rgba"];
      const fadeAnimation = (value: EditorTextOverlay["animationIn"]) =>
        value !== "none" && value !== "shake";
      if (fadeAnimation(overlay.animationIn)) {
        overlayFilters.push(`fade=t=in:st=0:d=${animationDuration}:alpha=1`);
      }
      if (fadeAnimation(overlay.animationOut)) {
        overlayFilters.push(
          `fade=t=out:st=${Math.max(0, localDuration - animationDuration)}:d=${animationDuration}:alpha=1`,
        );
      }
      if (overlay.animationIn === "pop" || overlay.animationIn === "zoom") {
        const strength = overlay.animationIn === "pop" ? 0.35 : 0.2;
        overlayFilters.push(
          `scale=w='iw*(1+${strength}*max(0,1-t/${animationDuration}))':h='ih*(1+${strength}*max(0,1-t/${animationDuration}))':eval=frame`,
          `crop=${width}:${height}:(iw-${width})/2:(ih-${height})/2`,
        );
      }
      if (
        overlay.animationLoop === "pulse" ||
        overlay.animationLoop === "breathe" ||
        overlay.animationLoop === "slow-zoom"
      ) {
        const scaleExpression =
          overlay.animationLoop === "slow-zoom"
            ? "1+0.018*mod(t,2.5)"
            : overlay.animationLoop === "pulse"
              ? "1+0.06*max(0,sin(8.8*t))"
              : "1+0.035*sin(3.14*t)";
        overlayFilters.push(
          `scale=w='iw*(${scaleExpression})':h='ih*(${scaleExpression})':eval=frame`,
          `crop=${width}:${height}:(iw-${width})/2:(ih-${height})/2`,
        );
      }
      if (overlay.animationLoop === "swing") {
        overlayFilters.push("rotate='0.0436*sin(3.9*t)':c=none:ow=iw:oh=ih");
      }
      overlayFilters.push(`setpts=PTS-STARTPTS+${overlay.start}/TB`);
      filters.push(`[${inputIndex}:v]${overlayFilters.join(",")}[${overlayLabel}]`);
      const inEnd = overlay.start + animationDuration;
      const outStart = overlay.end - animationDuration;
      const xParts: string[] = [];
      const yParts: string[] = [];
      if (overlay.animationIn === "slide-left") {
        xParts.push(
          `if(between(t,${overlay.start},${inEnd}),-55*(1-(t-${overlay.start})/${animationDuration}),0)`,
        );
      }
      if (overlay.animationOut === "slide-left") {
        xParts.push(
          `if(between(t,${outStart},${overlay.end}),-55*((t-${outStart})/${animationDuration}),0)`,
        );
      }
      if (overlay.animationIn === "shake") {
        xParts.push(
          `if(between(t,${overlay.start},${inEnd}),11*sin(55*(t-${overlay.start}))*(1-(t-${overlay.start})/${animationDuration}),0)`,
        );
      }
      if (overlay.animationOut === "shake") {
        xParts.push(
          `if(between(t,${outStart},${overlay.end}),11*sin(55*(t-${outStart}))*((t-${outStart})/${animationDuration}),0)`,
        );
      }
      if (overlay.animationLoop === "shake") {
        xParts.push(`2.5*sin(31.4*(t-${overlay.start}))`);
      }
      if (overlay.animationIn === "slide-up" || overlay.animationIn === "bounce") {
        const bounce =
          overlay.animationIn === "bounce"
            ? `-10*sin(PI*(t-${overlay.start})/${animationDuration})`
            : "0";
        yParts.push(
          `if(between(t,${overlay.start},${inEnd}),42*(1-(t-${overlay.start})/${animationDuration})${bounce === "0" ? "" : `+${bounce}`},0)`,
        );
      }
      if (overlay.animationOut === "slide-up" || overlay.animationOut === "bounce") {
        yParts.push(
          `if(between(t,${outStart},${overlay.end}),42*((t-${outStart})/${animationDuration}),0)`,
        );
      }
      if (overlay.animationLoop === "float") {
        yParts.push(`5*sin(4.18*(t-${overlay.start}))`);
      }
      if (overlay.animationLoop === "bounce-soft") {
        yParts.push(`-5*abs(sin(5.65*(t-${overlay.start})))`);
      }
      filters.push(
        `[${videoLabel}][${overlayLabel}]overlay=x='${xParts.length ? xParts.join("+") : "0"}':y='${yParts.length ? yParts.join("+") : "0"}':eof_action=pass:shortest=0[${nextVideoLabel}]`,
      );
      videoLabel = nextVideoLabel;
    }

    const mixedAudioLabels = includeAudio ? [audioLabel] : [];
    for (const [index, layer] of audioLayers.entries()) {
      const inputIndex = filenames.length + overlays.length + index;
      const localDuration = Math.max(0.1, layer.trimEnd - layer.trimStart);
      const layerLabel = `music${index}`;
      const layerFilters = [
        `atrim=start=${layer.trimStart}:end=${layer.trimEnd}`,
        `asetpts=PTS-STARTPTS+${Math.max(0, layer.start)}/TB`,
        `volume=${layer.volume / 100}`,
      ];
      if (layer.fadeIn > 0) {
        layerFilters.push(`afade=t=in:st=0:d=${Math.min(layer.fadeIn, localDuration / 2)}`);
      }
      if (layer.fadeOut > 0) {
        const fadeDuration = Math.min(layer.fadeOut, localDuration / 2);
        layerFilters.push(
          `afade=t=out:st=${Math.max(0, localDuration - fadeDuration)}:d=${fadeDuration}`,
        );
      }
      layerFilters.push(`apad=pad_dur=${assembledDuration}`, `atrim=end=${assembledDuration}`);
      filters.push(`[${inputIndex}:a]${layerFilters.join(",")}[${layerLabel}]`);
      mixedAudioLabels.push(layerLabel);
    }

    let finalAudioLabel: string | null = mixedAudioLabels[0] ?? null;
    if (mixedAudioLabels.length > 1) {
      finalAudioLabel = "aout";
      filters.push(
        `${mixedAudioLabels.map((label) => `[${label}]`).join("")}amix=inputs=${mixedAudioLabels.length}:duration=longest:dropout_transition=0:normalize=0[${finalAudioLabel}]`,
      );
    }

    args.push("-filter_complex", filters.join(";"), "-map", `[${videoLabel}]`);
    if (finalAudioLabel) args.push("-map", `[${finalAudioLabel}]`);
    args.push("-c:v", "libx264", "-preset", "ultrafast", "-crf", "24", "-pix_fmt", "yuv420p");
    if (finalAudioLabel) args.push("-c:a", "aac", "-ar", "48000");
    else args.push("-an");
    args.push(
      "-t",
      String(assembledDuration),
      ...privacyMetadataArgs(options?.stripMetadata),
      "-movflags",
      "+faststart",
      output,
    );
    await runFFmpeg(ffmpeg, args, "Falha ao renderizar a timeline");
    for (const index of overlays.keys()) {
      await deleteIfPresent(ffmpeg, `text-${combination.number}-${index}.png`);
    }
    for (const filename of audioInputFiles) await deleteIfPresent(ffmpeg, filename);
  }
  const bytes = await readOutputFile(ffmpeg, output, "Falha ao finalizar a exportação");
  const blob = new Blob([bytes.slice().buffer], { type: "video/mp4" });
  await deleteIfPresent(ffmpeg, output);
  return { blob, filename: output };
}

async function createTextOverlayPng(overlay: EditorTextOverlay, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível preparar o texto do vídeo.");
  const fontSize = Math.round((overlay.fontSize / 720) * width);
  const maxWidth = width * 0.84;
  const fontFamily =
    overlay.fontFamily ??
    (overlay.style === "impact" ? "Impact, Arial Black, sans-serif" : "Arial, sans-serif");
  const fontWeight = overlay.fontWeight ?? (overlay.style === "minimal" ? 600 : 800);
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  context.letterSpacing = `${((overlay.letterSpacing ?? 0) / 720) * width}px`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const transform = overlay.textTransform ?? (overlay.style === "impact" ? "uppercase" : "none");
  const displayText =
    transform === "uppercase"
      ? overlay.text.toUpperCase()
      : transform === "lowercase"
        ? overlay.text.toLowerCase()
        : overlay.text;
  const words = displayText.trim().split(/\s+/);
  const lines: string[] = [];
  if (overlay.captionLineWordCounts?.length) {
    let wordOffset = 0;
    for (const count of overlay.captionLineWordCounts) {
      const value = words.slice(wordOffset, wordOffset + count).join(" ");
      if (value) lines.push(value);
      wordOffset += count;
    }
  } else {
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }
  const lineHeight = fontSize * 1.15;
  const x = (overlay.x / 100) * width;
  const y = (overlay.y / 100) * height;
  const widest = Math.max(...lines.map((value) => context.measureText(value).width), 0);
  const blockHeight = lines.length * lineHeight;
  const padding = fontSize * 0.35;
  context.save();
  context.translate(x, y);
  context.rotate(((overlay.rotation ?? 0) * Math.PI) / 180);
  if (overlay.backgroundColor !== "transparent") {
    if (overlay.backgroundColor.startsWith("linear-gradient")) {
      const gradient = context.createLinearGradient(-widest / 2, 0, widest / 2, 0);
      gradient.addColorStop(0, "#ef4444");
      gradient.addColorStop(1, "#22c55e");
      context.fillStyle = gradient;
    } else {
      context.fillStyle = overlay.backgroundColor;
    }
    context.beginPath();
    context.roundRect(
      -widest / 2 - padding,
      -blockHeight / 2 - padding,
      widest + padding * 2,
      blockHeight + padding * 2,
      Math.min(padding, ((overlay.borderRadius ?? 12) / 720) * width),
    );
    context.fill();
  }
  context.fillStyle = overlay.color;
  context.strokeStyle =
    overlay.strokeColor ?? (overlay.style === "neon" ? overlay.color : "rgba(0,0,0,.82)");
  context.lineWidth =
    overlay.strokeWidth !== undefined
      ? (overlay.strokeWidth / 720) * width
      : overlay.style === "minimal"
        ? 0
        : Math.max(2, fontSize * 0.08);
  context.lineJoin = "round";
  context.shadowColor =
    overlay.shadowColor ?? (overlay.style === "neon" ? overlay.color : "rgba(0,0,0,.8)");
  context.shadowBlur =
    overlay.shadowBlur !== undefined
      ? (overlay.shadowBlur / 720) * width
      : overlay.style === "neon"
        ? fontSize * 0.35
        : 2;
  context.shadowOffsetX = ((overlay.shadowOffsetX ?? 0) / 720) * width;
  context.shadowOffsetY = ((overlay.shadowOffsetY ?? 2) / 720) * width;
  let renderedWordOffset = 0;
  lines.forEach((value, index) => {
    const lineY = -blockHeight / 2 + lineHeight * (index + 0.5);
    const lineWords = value.split(/\s+/);
    const hasWordHighlight = overlay.activeWordIndex !== undefined && overlay.captionWords?.length;
    if (!hasWordHighlight) {
      if (context.lineWidth > 0) context.strokeText(value, 0, lineY, maxWidth);
      context.fillText(value, 0, lineY, maxWidth);
    } else {
      const spaceWidth = context.measureText(" ").width;
      const widths = lineWords.map((word) => context.measureText(word).width);
      const totalWidth =
        widths.reduce((sum, wordWidth) => sum + wordWidth, 0) +
        spaceWidth * Math.max(0, lineWords.length - 1);
      let wordX = -totalWidth / 2;
      lineWords.forEach((word, wordIndex) => {
        const wordWidth = widths[wordIndex]!;
        context.textAlign = "left";
        if (context.lineWidth > 0) context.strokeText(word, wordX, lineY);
        context.fillStyle =
          renderedWordOffset + wordIndex === overlay.activeWordIndex
            ? (overlay.highlightColor ?? "#facc15")
            : overlay.color;
        context.fillText(word, wordX, lineY);
        wordX += wordWidth + spaceWidth;
      });
      context.textAlign = "center";
      context.fillStyle = overlay.color;
      renderedWordOffset += lineWords.length;
    }
  });
  context.shadowColor = "transparent";
  for (const decoration of overlay.decorations ?? []) {
    const decorationX = ((decoration.x - 50) / 100) * (widest + padding * 2);
    const decorationY = ((decoration.y - 50) / 100) * (blockHeight + padding * 2);
    const decorationSize = (decoration.size / 720) * width;
    context.save();
    context.translate(decorationX, decorationY);
    context.rotate((((decoration.rotation ?? 0) + (overlay.rotation ?? 0)) * Math.PI) / 180);
    context.fillStyle = decoration.color;
    context.font = `900 ${decorationSize}px Arial, sans-serif`;
    const symbol =
      decoration.type === "sparkle"
        ? "✦"
        : decoration.type === "star"
          ? "★"
          : decoration.type === "bolt"
            ? "ϟ"
            : "●";
    context.fillText(symbol, 0, 0);
    context.restore();
  }
  context.restore();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error("Não foi possível gerar o texto."))),
      "image/png",
    ),
  );
  return new Uint8Array(await blob.arrayBuffer());
}

export async function clearVideoEngineFiles(ffmpeg: FFmpegType, paths: Iterable<string>) {
  for (const path of paths) await deleteIfPresent(ffmpeg, path);
}

export function downloadVideo(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function disposeVideoEngine() {
  if (ffmpegInstance) ffmpegInstance.terminate();
  ffmpegInstance = null;
  loaded = false;
  if (cachedCoreBlobUrl) URL.revokeObjectURL(cachedCoreBlobUrl);
  if (cachedWasmBlobUrl) URL.revokeObjectURL(cachedWasmBlobUrl);
  cachedCoreBlobUrl = null;
  cachedWasmBlobUrl = null;
}

export async function convertImageToMp4Video(
  ffmpeg: FFmpegType,
  imageFile: File | Blob,
  durationSeconds: number = 5,
  aspectRatio: "9:16" | "16:9" | "1:1" = "9:16",
) {
  const { fetchFile } = await import("@ffmpeg/util");
  const safeId = crypto.randomUUID().slice(0, 8);
  const input = `image-input-${safeId}.jpg`;
  const output = `video-output-${safeId}.mp4`;

  const width = aspectRatio === "9:16" ? 720 : aspectRatio === "16:9" ? 1280 : 720;
  const height = aspectRatio === "9:16" ? 1280 : aspectRatio === "16:9" ? 720 : 720;
  const totalFrames = Math.max(30, durationSeconds * 30);

  await deleteIfPresent(ffmpeg, input);
  await deleteIfPresent(ffmpeg, output);
  await ffmpeg.writeFile(input, await fetchFile(imageFile));

  try {
    // Filtro Ken Burns de movimento fluido de câmera (Zoom In gradual 3D)
    const vfFilter = `scale=${width * 2}:${height * 2},zoompan=z='min(zoom+0.0012,1.20)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height},format=yuv420p`;

    const args = [
      "-loop",
      "1",
      "-i",
      input,
      "-vf",
      vfFilter,
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-t",
      String(durationSeconds),
      "-r",
      "30",
      "-movflags",
      "+faststart",
      output,
    ];

    const result = await ffmpeg.exec(args);
    if (result !== 0) {
      throw new Error("Não foi possível converter a imagem em vídeo MP4.");
    }

    const data = await ffmpeg.readFile(output);
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data);
    const videoBlob = new Blob([bytes.slice().buffer], { type: "video/mp4" });
    return {
      blob: videoBlob,
      url: URL.createObjectURL(videoBlob),
      filename: `video_ai_${safeId}.mp4`,
    };
  } finally {
    await deleteIfPresent(ffmpeg, input);
    await deleteIfPresent(ffmpeg, output);
  }
}

export async function convertMultiImageToMp4Video(
  ffmpeg: FFmpegType,
  imageFiles: (File | Blob)[],
  durationSeconds: number = 5,
  aspectRatio: "9:16" | "16:9" | "1:1" = "9:16",
) {
  const { fetchFile } = await import("@ffmpeg/util");
  const safeId = crypto.randomUUID().slice(0, 8);
  const width = aspectRatio === "9:16" ? 720 : aspectRatio === "16:9" ? 1280 : 720;
  const height = aspectRatio === "9:16" ? 1280 : aspectRatio === "16:9" ? 720 : 720;
  const output = `video-motion-${safeId}.mp4`;

  const inputPaths: string[] = [];
  for (let i = 0; i < imageFiles.length; i++) {
    const path = `frame-${safeId}-${i}.jpg`;
    await deleteIfPresent(ffmpeg, path);
    await ffmpeg.writeFile(path, await fetchFile(imageFiles[i]!));
    inputPaths.push(path);
  }
  await deleteIfPresent(ffmpeg, output);

  try {
    const frameDuration = (durationSeconds / imageFiles.length).toFixed(2);
    const filterComplex =
      inputPaths
        .map(
          (_, i) =>
            `[${i}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS[v${i}];`,
        )
        .join("") +
      inputPaths.map((_, i) => `[v${i}]`).join("") +
      `concat=n=${inputPaths.length}:v=1:a=0[outv]`;

    const args: string[] = [];
    for (const path of inputPaths) {
      args.push("-loop", "1", "-t", frameDuration, "-i", path);
    }
    args.push(
      "-filter_complex",
      filterComplex,
      "-map",
      "[outv]",
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "30",
      "-movflags",
      "+faststart",
      output,
    );

    const result = await ffmpeg.exec(args);
    if (result !== 0) {
      throw new Error("Não foi possível compilar os quadros de movimento.");
    }

    const data = await ffmpeg.readFile(output);
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data);
    const videoBlob = new Blob([bytes.slice().buffer], { type: "video/mp4" });
    return {
      blob: videoBlob,
      url: URL.createObjectURL(videoBlob),
      filename: `video_motion_${safeId}.mp4`,
    };
  } finally {
    for (const path of inputPaths) await deleteIfPresent(ffmpeg, path);
    await deleteIfPresent(ffmpeg, output);
  }
}

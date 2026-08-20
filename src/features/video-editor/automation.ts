import type { EditorSegment, EditorTextOverlay } from "@/features/video-editor/engine";

export type CaptionPreset =
  | "tiktok"
  | "capcut"
  | "capcut_yellow"
  | "capcut_purple"
  | "capcut_neon_green"
  | "capcut_dynamic"
  | "karaoke"
  | "minimal"
  | "impact";
export type TimedWord = { text: string; start: number; end: number; important: boolean };
export type SpeechAnalysis = {
  duration: number;
  speech: Array<{ start: number; end: number }>;
  silences: Array<{ start: number; end: number; duration: number }>;
  peak: number;
  averageSpeechLevel: number;
};

const importantTerms =
  /\b(gr[aá]tis|novo|segredo|resultado|desconto|oferta|economize|melhor|r[aá]pido|agora|aten[cç][aã]o|comprovado|exclusiv[oa]|problema|solu[cç][aã]o|antes|depois|qualidade|tecido|cintura|transparente)\b/i;
const emojiRules: Array<[RegExp, string]> = [
  [/\b(dinheiro|pre[cç]o|desconto|economize|barato|oferta)\b/i, "💰"],
  [/\b(aten[cç][aã]o|cuidado|erro|problema)\b/i, "⚠️"],
  [/\b(segredo|dica|ideia)\b/i, "💡"],
  [/\b(r[aá]pido|agora|corre)\b/i, "⚡"],
  [/\b(am[eé]i|amor|incr[ií]vel|lindo|perfeito)\b/i, "😍"],
  [/\b(resultado|funciona|comprovado)\b/i, "✅"],
  [/\b(roupa|vestido|cal[cç]a|tecido)\b/i, "👗"],
];

const presetStyles: Record<CaptionPreset, Partial<EditorTextOverlay>> = {
  capcut_yellow: {
    y: 74,
    fontSize: 50,
    color: "#000000",
    backgroundColor: "#facc15",
    style: "caption",
    fontFamily: "Montserrat, Arial Black, sans-serif",
    fontWeight: 900,
    strokeColor: "#000000",
    strokeWidth: 0,
    borderRadius: 14,
    highlightColor: "#ffffff",
    textTransform: "uppercase",
  },
  capcut_purple: {
    y: 74,
    fontSize: 50,
    color: "#ffffff",
    backgroundColor: "#7c3aed",
    style: "caption",
    fontFamily: "Montserrat, Arial Black, sans-serif",
    fontWeight: 900,
    strokeColor: "#000000",
    strokeWidth: 2,
    borderRadius: 14,
    highlightColor: "#facc15",
    textTransform: "uppercase",
  },
  capcut_neon_green: {
    y: 74,
    fontSize: 50,
    color: "#000000",
    backgroundColor: "#22c55e",
    style: "caption",
    fontFamily: "Montserrat, Arial Black, sans-serif",
    fontWeight: 900,
    strokeColor: "#000000",
    strokeWidth: 0,
    borderRadius: 14,
    highlightColor: "#ffffff",
    textTransform: "uppercase",
  },
  capcut_dynamic: {
    y: 76,
    fontSize: 54,
    color: "#ffffff",
    backgroundColor: "transparent",
    style: "impact",
    fontFamily: "Montserrat, Arial Black, sans-serif",
    fontWeight: 900,
    strokeColor: "#000000",
    strokeWidth: 7,
    highlightColor: "#facc15",
    textTransform: "uppercase",
  },
  tiktok: {
    y: 72,
    fontSize: 48,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,.58)",
    style: "caption",
    fontFamily: "Montserrat, Arial Black, sans-serif",
    fontWeight: 900,
    strokeColor: "#101010",
    strokeWidth: 4,
    borderRadius: 12,
    highlightColor: "#facc15",
    textTransform: "none",
  },
  capcut: {
    y: 76,
    fontSize: 50,
    color: "#fff",
    backgroundColor: "#facc15",
    style: "caption",
    fontFamily: "Montserrat, Arial Black, sans-serif",
    fontWeight: 900,
    strokeColor: "#000",
    strokeWidth: 0,
    borderRadius: 14,
    highlightColor: "#a3e635",
    textTransform: "uppercase",
  },
  karaoke: {
    y: 70,
    fontSize: 46,
    color: "#d1d5db",
    backgroundColor: "rgba(8,8,12,.75)",
    style: "caption",
    fontFamily: "Montserrat, Arial, sans-serif",
    fontWeight: 800,
    strokeColor: "#111827",
    strokeWidth: 3,
    highlightColor: "#22d3ee",
  },
  minimal: {
    y: 74,
    fontSize: 40,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,.45)",
    style: "minimal",
    fontFamily: "Montserrat, Arial, sans-serif",
    fontWeight: 700,
    strokeWidth: 0,
    highlightColor: "#fff",
  },
  impact: {
    y: 68,
    fontSize: 56,
    color: "#fff",
    backgroundColor: "transparent",
    style: "impact",
    fontFamily: "Impact, Montserrat, sans-serif",
    fontWeight: 900,
    strokeColor: "#000",
    strokeWidth: 7,
    highlightColor: "#fb2c36",
    textTransform: "uppercase",
  },
};

export function transcriptToCaptions(transcript: string, duration: number): EditorTextOverlay[] {
  return timedWordsToCaptions(estimateTimedWords(transcript, duration), {
    preset: "tiktok",
    emojis: false,
  });
}

export async function createSmartCaptions(
  transcript: string,
  file: File,
  options: { preset: CaptionPreset; emojis: boolean; wordsPerCard?: number },
) {
  const analysis = await analyzeSpeech(file);
  const words = alignWordsToSpeech(transcript, analysis);
  return {
    words,
    analysis,
    importantPhrases: detectImportantPhrases(transcript),
    captions: timedWordsToCaptions(words, options),
  };
}

export function timedWordsToCaptions(
  words: TimedWord[],
  options: { preset: CaptionPreset; emojis: boolean; wordsPerCard?: number },
) {
  const isCapcutStyle = options.preset.startsWith("capcut");
  const defaultSize = isCapcutStyle ? 3 : 4;
  const cardSize = Math.max(1, Math.min(6, options.wordsPerCard ?? defaultSize));
  const overlays: EditorTextOverlay[] = [];
  for (let offset = 0; offset < words.length; offset += cardSize) {
    const card = words.slice(offset, offset + cardSize);
    const baseText = card.map((word) => word.text).join(" ");
    const emoji = options.emojis ? emojiForText(baseText) : "";
    const displayWords = emoji
      ? [...card.map((word) => word.text), emoji]
      : card.map((word) => word.text);
    for (const [activeWordIndex, word] of card.entries()) {
      overlays.push({
        id: `caption-${crypto.randomUUID()}`,
        text: displayWords.join(" "),
        start: word.start,
        end: Math.max(word.start + 0.08, word.end),
        x: 50,
        y: 76,
        fontSize: 48,
        color: "#fff",
        backgroundColor: "rgba(0,0,0,.55)",
        style: "caption",
        animationIn: activeWordIndex === 0 ? "pop" : "none",
        animationOut: "none",
        animationLoop: "none",
        animationDuration: 0.12,
        fontFamily: "Montserrat, Arial Black, sans-serif",
        fontWeight: 900,
        strokeColor: "#111827",
        strokeWidth: 3,
        shadowColor: "rgba(0,0,0,.75)",
        shadowBlur: 3,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        rotation: 0,
        letterSpacing: 0,
        textTransform: "none",
        borderRadius: 14,
        captionWords: displayWords,
        activeWordIndex,
        important: word.important,
        captionPreset: options.preset,
        ...presetStyles[options.preset],
      });
    }
  }
  return overlays;
}

export async function analyzeSpeech(file: File): Promise<SpeechAnalysis> {
  const Context = window.AudioContext ?? window.webkitAudioContext;
  if (!Context) throw new Error("Seu navegador não oferece análise local de áudio.");
  const context = new Context();
  try {
    const buffer = await context.decodeAudioData(await file.arrayBuffer());
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) =>
      buffer.getChannelData(index),
    );
    const windowSize = Math.max(256, Math.round(buffer.sampleRate * 0.025));
    const levels: number[] = [];
    for (let offset = 0; offset < buffer.length; offset += windowSize) {
      let sum = 0;
      let count = 0;
      for (const channel of channels) {
        const end = Math.min(channel.length, offset + windowSize);
        for (let index = offset; index < end; index += 1) {
          sum += channel[index]! ** 2;
          count += 1;
        }
      }
      levels.push(Math.sqrt(sum / Math.max(1, count)));
    }
    const peak = Math.max(...levels, 0);
    const sorted = [...levels].sort((a, b) => a - b);
    const noiseFloor = sorted[Math.floor(sorted.length * 0.2)] ?? 0;
    const threshold = Math.max(0.004, noiseFloor * 2.8, peak * 0.065);
    const frameDuration = windowSize / buffer.sampleRate;
    const rawSpeech: Array<{ start: number; end: number }> = [];
    let start: number | null = null;
    levels.forEach((level, index) => {
      if (level >= threshold && start === null) start = index * frameDuration;
      if (level < threshold && start !== null) {
        rawSpeech.push({ start, end: index * frameDuration });
        start = null;
      }
    });
    if (start !== null) rawSpeech.push({ start, end: buffer.duration });
    const speech: Array<{ start: number; end: number }> = [];
    for (const region of rawSpeech) {
      const previous = speech.at(-1);
      if (previous && region.start - previous.end < 0.22) previous.end = region.end;
      else if (region.end - region.start >= 0.08) speech.push({ ...region });
    }
    const silences: SpeechAnalysis["silences"] = [];
    let cursor = 0;
    for (const region of speech) {
      if (region.start - cursor >= 0.28)
        silences.push({ start: cursor, end: region.start, duration: region.start - cursor });
      cursor = region.end;
    }
    if (buffer.duration - cursor >= 0.28)
      silences.push({ start: cursor, end: buffer.duration, duration: buffer.duration - cursor });
    const speechLevels = levels.filter((level) => level >= threshold);
    return {
      duration: buffer.duration,
      speech,
      silences,
      peak,
      averageSpeechLevel:
        speechLevels.reduce((sum, value) => sum + value, 0) / Math.max(1, speechLevels.length),
    };
  } finally {
    await context.close();
  }
}

export async function detectSpeechBounds(file: File) {
  const analysis = await analyzeSpeech(file);
  const first = analysis.speech[0];
  const last = analysis.speech.at(-1);
  if (!first || !last) return { start: 0, end: analysis.duration, removed: 0 };
  const start = Math.max(0, first.start - 0.08);
  const end = Math.min(analysis.duration, last.end + 0.08);
  return { start, end, removed: Math.max(0, analysis.duration - (end - start)) };
}

function alignWordsToSpeech(transcript: string, analysis: SpeechAnalysis): TimedWord[] {
  const tokens = transcript.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const regions = analysis.speech.length ? analysis.speech : [{ start: 0, end: analysis.duration }];
  const totalSpeech = regions.reduce((sum, region) => sum + region.end - region.start, 0);
  const weights = tokens.map((token) =>
    Math.max(0.7, token.replace(/[^\p{L}\p{N}]/gu, "").length / 5),
  );
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = 0;
  return tokens.map((text, index) => {
    const wordDuration = (weights[index]! / totalWeight) * totalSpeech;
    const start = speechOffsetToTime(cursor, regions);
    cursor += wordDuration;
    return {
      text,
      start,
      end: speechOffsetToTime(cursor, regions),
      important: importantTerms.test(text) || /[!?]$/.test(text),
    };
  });
}

function speechOffsetToTime(offset: number, regions: Array<{ start: number; end: number }>) {
  let remaining = offset;
  for (const region of regions) {
    const duration = region.end - region.start;
    if (remaining <= duration) return region.start + remaining;
    remaining -= duration;
  }
  return regions.at(-1)?.end ?? 0;
}

function estimateTimedWords(transcript: string, duration: number): TimedWord[] {
  const tokens = transcript.trim().split(/\s+/).filter(Boolean);
  const perWord = duration / Math.max(1, tokens.length);
  return tokens.map((text, index) => ({
    text,
    start: index * perWord,
    end: Math.min(duration, (index + 1) * perWord),
    important: importantTerms.test(text),
  }));
}

export function detectImportantPhrases(transcript: string) {
  return transcript
    .split(/(?<=[.!?])\s+/)
    .map((text) => text.trim())
    .filter((text) => text && (importantTerms.test(text) || /[!?]/.test(text)))
    .slice(0, 8);
}
function emojiForText(text: string) {
  return emojiRules.find(([pattern]) => pattern.test(text))?.[1] ?? "";
}

export type CreativeAuditCheck = {
  id: string;
  label: string;
  passed: boolean;
  severity: "info" | "warning" | "critical";
  detail: string;
};
export type CreativeAudit = {
  score: number;
  warnings: string[];
  duration: number;
  checks: CreativeAuditCheck[];
};

export function auditEditorProject(input: {
  segments: EditorSegment[];
  timelineIds: string[];
  textOverlays: EditorTextOverlay[];
  removeAudio: boolean;
}): CreativeAudit {
  const clips = input.timelineIds
    .map((id) => input.segments.find((segment) => segment.id === id))
    .filter((segment): segment is EditorSegment => Boolean(segment));
  const duration = clips.reduce(
    (sum, segment) => sum + Math.max(0.1, (segment.end - segment.start) / segment.playbackRate),
    0,
  );
  const allText = input.textOverlays.map((overlay) => overlay.text).join(" ");
  const duplicateKeys = clips.map(
    (clip) => `${clip.file?.name}:${clip.start.toFixed(1)}:${clip.end.toFixed(1)}`,
  );
  const checks: CreativeAuditCheck[] = [
    check(
      "hook",
      "Gancho nos primeiros segundos",
      input.textOverlays.some((o) => o.start <= 2.2),
      "Inclua texto ou legenda até 2,2s.",
    ),
    check(
      "audio",
      "Fala presente",
      !input.removeAudio && clips.some((clip) => !clip.mute && clip.volume >= 55),
      "A voz pode estar ausente ou muito baixa.",
    ),
    check(
      "safe-zone",
      "Texto na área segura",
      input.textOverlays.every((o) => o.y >= 14 && o.y <= 78 && o.x >= 10 && o.x <= 88),
      "Há texto próximo da interface do TikTok.",
    ),
    check(
      "cta",
      "CTA presente",
      /compre|confira|veja|toque|clique|garanta|carrinho|link/i.test(allText),
      "Inclua uma chamada para ação clara.",
    ),
    check(
      "repeated",
      "Sem cenas repetidas",
      new Set(duplicateKeys).size === duplicateKeys.length,
      "A timeline contém cenas repetidas.",
    ),
    check(
      "duration",
      "Duração adequada",
      duration >= 8 && duration <= 45,
      `Duração atual: ${Math.round(duration)}s; valide contra o objetivo.`,
    ),
    check(
      "risk",
      "Linguagem publicitária segura",
      !/cura|milagre|garantido|100%|sem risco|resultado certo|enrique[cç]a/i.test(allText),
      "Revise possíveis promessas absolutas ou palavras arriscadas.",
    ),
    check(
      "pace",
      "Ritmo visual",
      clips.length > 0 && duration / clips.length <= 5.5,
      "O ritmo está lento; encurte cenas ou adicione cortes.",
    ),
  ];
  const score = Math.max(
    0,
    Math.round(
      (checks.filter((item) => item.passed).length / checks.length) * 80 +
        Math.min(20, clips.length * 3),
    ),
  );
  return {
    score: Math.min(100, score),
    warnings: checks.filter((item) => !item.passed).map((item) => item.detail),
    duration,
    checks,
  };
}

export async function enrichCreativeAudit(
  base: CreativeAudit,
  clips: EditorSegment[],
): Promise<CreativeAudit> {
  const analyses = await Promise.all(
    clips
      .filter((clip) => clip.file && !clip.mute)
      .slice(0, 6)
      .map((clip) => analyzeSpeech(clip.file!).catch(() => null)),
  );
  const valid = analyses.filter((item): item is SpeechAnalysis => Boolean(item));
  const longPauses = valid
    .flatMap((item) => item.silences)
    .filter((silence) => silence.duration >= 0.7);
  const visualAnalyses = await Promise.all(
    clips
      .filter((clip) => clip.file?.type.startsWith("video/"))
      .slice(0, 8)
      .map((clip) => analyzeVideoVisual(clip.file!).catch(() => null)),
  );
  const visuals = visualAnalyses.filter((item): item is { blackBars: boolean; hash: string } =>
    Boolean(item),
  );
  const repeatedFrames = visuals.length - new Set(visuals.map((item) => item.hash)).size;
  const extra = [
    check(
      "long-pauses",
      "Sem pausas longas",
      longPauses.length === 0,
      `${longPauses.length} pausa(s) acima de 0,7s detectada(s).`,
    ),
    check(
      "audibility",
      "Fala audível",
      valid.some((item) => item.averageSpeechLevel >= 0.012),
      "O nível médio da fala parece baixo; normalize ou aumente o volume.",
    ),
    check(
      "black-bars",
      "Sem barras pretas",
      visuals.every((item) => !item.blackBars),
      "Foram detectadas bordas pretas persistentes no quadro.",
    ),
    check(
      "visual-duplicates",
      "Sem cenas visualmente repetidas",
      repeatedFrames === 0,
      `${repeatedFrames} cena(s) parecem visualmente duplicadas.`,
    ),
  ];
  const checks = [...base.checks.filter((item) => item.id !== "audio"), ...extra];
  const score = Math.round((checks.filter((item) => item.passed).length / checks.length) * 100);
  return {
    ...base,
    score,
    checks,
    warnings: checks.filter((item) => !item.passed).map((item) => item.detail),
  };
}

async function analyzeVideoVisual(file: File) {
  const video = document.createElement("video");
  const url = URL.createObjectURL(file);
  video.muted = true;
  video.preload = "metadata";
  video.playsInline = true;
  video.src = url;
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Vídeo inválido"));
    });
    video.currentTime = Math.min(
      Math.max(0.05, video.duration * 0.45),
      Math.max(0.05, video.duration - 0.05),
    );
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      window.setTimeout(resolve, 900);
    });
    const canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 48;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas indisponível");
    context.drawImage(video, 0, 0, 48, 48);
    const pixels = context.getImageData(0, 0, 48, 48).data;
    const luminosity = (x: number, y: number) => {
      const index = (y * 48 + x) * 4;
      return (pixels[index]! + pixels[index + 1]! + pixels[index + 2]!) / 3;
    };
    const edgeSamples: number[] = [];
    const centerSamples: number[] = [];
    for (let y = 0; y < 48; y += 2)
      for (let x = 0; x < 48; x += 2) {
        const value = luminosity(x, y);
        if (x < 4 || x > 43 || y < 4 || y > 43) edgeSamples.push(value);
        else if (x > 12 && x < 36 && y > 12 && y < 36) centerSamples.push(value);
      }
    const edge = edgeSamples.reduce((sum, value) => sum + value, 0) / edgeSamples.length;
    const center = centerSamples.reduce((sum, value) => sum + value, 0) / centerSamples.length;
    const bits: string[] = [];
    const average = centerSamples.reduce((sum, value) => sum + value, 0) / centerSamples.length;
    for (let y = 4; y < 44; y += 5)
      for (let x = 4; x < 44; x += 5) bits.push(luminosity(x, y) >= average ? "1" : "0");
    return { blackBars: edge < 16 && center > edge * 2.4, hash: bits.join("") };
  } finally {
    URL.revokeObjectURL(url);
  }
}
function check(id: string, label: string, passed: boolean, detail: string): CreativeAuditCheck {
  return {
    id,
    label,
    passed,
    detail,
    severity: id === "risk" || id === "audibility" ? "critical" : "warning",
  };
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

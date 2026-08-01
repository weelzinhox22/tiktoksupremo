import type { FFmpeg as FFmpegType } from "@ffmpeg/ffmpeg";

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
  hideOverlay: boolean;
  overlayPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  overlayWidth: number;
  overlayHeight: number;
};

export type EditorCombination = {
  number: number;
  hook: number;
  body: number;
  cta: number;
  label: string;
};

let ffmpegInstance: FFmpegType | null = null;
let loaded = false;

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

export async function getVideoDuration(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error(`Não foi possível ler ${file.name}.`));
    });
    return Number.isFinite(video.duration) ? video.duration : 8;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function loadVideoEngine(onLog?: (message: string) => void) {
  if (!ffmpegInstance) {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    ffmpegInstance = new FFmpeg();
    ffmpegInstance.on("log", ({ message }) => onLog?.(message));
  }
  if (!loaded) {
    const { toBlobURL } = await import("@ffmpeg/util");
    const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    loaded = true;
  }
  return ffmpegInstance;
}

async function deleteIfPresent(ffmpeg: FFmpegType, path: string) {
  try {
    await ffmpeg.deleteFile(path);
  } catch {
    // O arquivo ainda não existe no sistema temporário.
  }
}

export async function normalizeSegment(
  ffmpeg: FFmpegType,
  segment: EditorSegment,
  options: { removeAudio: boolean; width: 720 | 1080 },
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

  const selectedDuration = Math.max(
    0.1,
    Math.min(8 * segment.playbackRate, segment.end - segment.start),
  );
  const playedDuration = Math.min(8, selectedDuration / segment.playbackRate);
  const height = options.width === 1080 ? 1920 : 1280;
  const scaleFilter = `scale=${options.width}:${height}:force_original_aspect_ratio=decrease`;
  const videoFilters = [
    `trim=duration=${selectedDuration}`,
    `setpts=(PTS-STARTPTS)/${segment.playbackRate}`,
    scaleFilter,
    `pad=${options.width}:${height}:(ow-iw)/2:(oh-ih)/2:black`,
    ...(segment.mirror ? ["hflip"] : []),
    `eq=brightness=${segment.brightness}:contrast=${segment.contrast}:saturation=${segment.saturation}`,
    "fps=30",
  ];
  if (segment.hideOverlay) {
    const boxWidth = Math.max(16, Math.round((options.width * segment.overlayWidth) / 100));
    const boxHeight = Math.max(16, Math.round((height * segment.overlayHeight) / 100));
    const x = segment.overlayPosition.endsWith("right") ? options.width - boxWidth - 4 : 4;
    const y = segment.overlayPosition.startsWith("bottom") ? height - boxHeight - 4 : 4;
    videoFilters.push(`delogo=x=${x}:y=${y}:w=${boxWidth}:h=${boxHeight}:show=0`);
  }
  if (segment.fadeIn > 0) videoFilters.push(`fade=t=in:st=0:d=${segment.fadeIn}`);
  if (segment.fadeOut > 0)
    videoFilters.push(`fade=t=out:st=${Math.max(0, 8 - segment.fadeOut)}:d=${segment.fadeOut}`);
  videoFilters.push(
    `tpad=stop_mode=clone:stop_duration=${Math.max(0, 8 - playedDuration)}`,
    "trim=duration=8",
  );
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

  if (options.removeAudio) {
    await ffmpeg.exec([...base, ...encodeVideo, "-an", "-movflags", "+faststart", output]);
  } else if (segment.mute) {
    await ffmpeg.exec([
      ...base,
      "-f",
      "lavfi",
      "-t",
      "8",
      "-i",
      "anullsrc=channel_layout=stereo:sample_rate=48000",
      ...encodeVideo,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:a",
      "aac",
      "-shortest",
      output,
    ]);
  } else {
    const audioFilters = [
      `atrim=duration=${selectedDuration}`,
      "asetpts=PTS-STARTPTS",
      `atempo=${segment.playbackRate}`,
      `volume=${segment.volume / 100}`,
      `apad=pad_dur=${Math.max(0, 8 - playedDuration)}`,
      "atrim=duration=8",
    ];
    if (segment.fadeIn > 0) audioFilters.push(`afade=t=in:st=0:d=${segment.fadeIn}`);
    if (segment.fadeOut > 0)
      audioFilters.push(`afade=t=out:st=${Math.max(0, 8 - segment.fadeOut)}:d=${segment.fadeOut}`);
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
      "-movflags",
      "+faststart",
      output,
    ]);
    if (withAudio !== 0) {
      await deleteIfPresent(ffmpeg, output);
      await ffmpeg.exec([
        ...base,
        "-f",
        "lavfi",
        "-t",
        "8",
        "-i",
        "anullsrc=channel_layout=stereo:sample_rate=48000",
        ...encodeVideo,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:a",
        "aac",
        "-shortest",
        output,
      ]);
    }
  }
  await deleteIfPresent(ffmpeg, input);
  return output;
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
) {
  const ids = segmentIdsForCombination(combination);
  const filenames = ids.map((id) => normalizedFiles.get(id));
  if (filenames.some((filename) => !filename)) throw new Error("Há cenas não preparadas.");
  const listFile = `concat-${combination.number}.txt`;
  const output = `tik-supremo-${String(combination.number).padStart(2, "0")}.mp4`;
  const list = filenames.map((filename) => `file '${filename}'`).join("\n");
  await ffmpeg.writeFile(listFile, new TextEncoder().encode(list));
  await deleteIfPresent(ffmpeg, output);
  await ffmpeg.exec([
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listFile,
    "-c",
    "copy",
    "-movflags",
    "+faststart",
    output,
  ]);
  const data = await ffmpeg.readFile(output);
  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data);
  const blob = new Blob([bytes.slice().buffer], { type: "video/mp4" });
  await deleteIfPresent(ffmpeg, output);
  await deleteIfPresent(ffmpeg, listFile);
  return { blob, filename: output };
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
}

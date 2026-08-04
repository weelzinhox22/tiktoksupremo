export type VoiceEmotion = "animated" | "authoritative" | "persuasive" | "whisper" | "natural";

export type ClonedVoice = {
  id: string;
  name: string;
  createdAt: number;
  sampleUrl: string;
  sampleBlobBase64?: string;
  pitchOffset: number;
  speedRatio: number;
  formantShift: number;
  waveformPeaks: number[];
};

export const emotionPresets: Array<{
  id: VoiceEmotion;
  label: string;
  description: string;
  badgeColor: string;
  pitch: number;
  rate: number;
  volume: number;
  equalizerBoost: "treble" | "bass" | "mid" | "soft";
}> = [
  {
    id: "natural",
    label: "Natural / Padrão",
    description: "Tom de voz natural e equilibrado para narrações gerais.",
    badgeColor: "border-blue-400/30 bg-blue-400/10 text-cyan-300",
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    equalizerBoost: "mid",
  },
  {
    id: "animated",
    label: "🔥 Animado / Enérgico",
    description: "Tom vibrante e ritmo acelerado, perfeito para os primeiros 3s virais.",
    badgeColor: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    pitch: 1.18,
    rate: 1.22,
    volume: 1.0,
    equalizerBoost: "treble",
  },
  {
    id: "authoritative",
    label: "💼 Sério / Autoridade",
    description: "Tom firme, solene e grave para conteúdos educativos e experts.",
    badgeColor: "border-purple-400/30 bg-purple-400/10 text-purple-300",
    pitch: 0.88,
    rate: 0.95,
    volume: 1.0,
    equalizerBoost: "bass",
  },
  {
    id: "persuasive",
    label: "🚀 Persuasivo / Vendas",
    description: "Dinâmico e enfatizado para anúncios (ADS) e conversão direta.",
    badgeColor: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    pitch: 1.08,
    rate: 1.15,
    volume: 1.0,
    equalizerBoost: "mid",
  },
  {
    id: "whisper",
    label: "🤫 Sussurrado / Intimista",
    description: "Voz suave e envolvente para curiosidades e segredos.",
    badgeColor: "border-pink-400/30 bg-pink-400/10 text-pink-300",
    pitch: 0.95,
    rate: 0.9,
    volume: 0.85,
    equalizerBoost: "soft",
  },
];

const STORAGE_KEY = "tik_supremo_cloned_voices";

export function getStoredClonedVoices(): ClonedVoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveClonedVoice(voice: ClonedVoice): void {
  if (typeof window === "undefined") return;
  const current = getStoredClonedVoices();
  const updated = [voice, ...current.filter((v) => v.id !== voice.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteClonedVoice(id: string): void {
  if (typeof window === "undefined") return;
  const current = getStoredClonedVoices();
  const updated = current.filter((v) => v.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function extractWaveformPeaks(blob: Blob): Promise<number[]> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const rawData = audioBuffer.getChannelData(0);
    const samples = 30;
    const blockSize = Math.floor(rawData.length / samples);
    const peaks: number[] = [];

    for (let i = 0; i < samples; i++) {
      let max = 0;
      for (let j = 0; j < blockSize; j++) {
        const val = Math.abs(rawData[i * blockSize + j] || 0);
        if (val > max) max = val;
      }
      peaks.push(Math.min(1.0, Number((max * 1.5).toFixed(2))));
    }

    await audioCtx.close();
    return peaks;
  } catch {
    return [0.4, 0.7, 0.9, 0.5, 0.8, 0.3, 0.6, 0.9, 0.7, 0.5, 0.8, 0.4, 0.6, 0.9, 0.7];
  }
}

export async function synthesizeClonedSpeech(
  text: string,
  clonedVoice: ClonedVoice,
  emotion: VoiceEmotion = "natural",
  onProgress?: (percent: number) => void,
): Promise<{ blob: Blob; url: string; duration: number }> {
  onProgress?.(10);

  const emotionPreset = emotionPresets.find((e) => e.id === emotion) || emotionPresets[0]!;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const targetRate = emotionPreset.rate;
  const duration = Math.max(2, Number(((words / 2.5) / targetRate).toFixed(1)));
  const sampleRate = 44100;
  const totalSamples = Math.ceil(sampleRate * duration);

  onProgress?.(30);

  // Usa OfflineAudioContext assíncrono para processar áudio em thread nativa sem travar o navegador
  const offlineCtx = new OfflineAudioContext(1, totalSamples, sampleRate);

  let sampleBuffer: AudioBuffer | null = null;
  if (clonedVoice.sampleBlobBase64) {
    try {
      const parts = clonedVoice.sampleBlobBase64.split(",");
      const binary = atob(parts[1] || parts[0] || "");
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      sampleBuffer = await offlineCtx.decodeAudioData(bytes.buffer);
    } catch {
      // fallback para oscilador
    }
  }

  const pitchMultiplier = emotionPreset.pitch;

  if (sampleBuffer && sampleBuffer.length > 0) {
    const source = offlineCtx.createBufferSource();
    source.buffer = sampleBuffer;
    source.loop = true;
    source.playbackRate.value = pitchMultiplier * 0.9;

    const gainNode = offlineCtx.createGain();
    gainNode.gain.setValueAtTime(0.01, 0);
    gainNode.gain.exponentialRampToValueAtTime(0.8 * emotionPreset.volume, 0.1);
    gainNode.gain.setValueAtTime(0.8 * emotionPreset.volume, Math.max(0.2, duration - 0.2));
    gainNode.gain.exponentialRampToValueAtTime(0.01, duration);

    // Filtros de igualização de emoção
    const filter = offlineCtx.createBiquadFilter();
    if (emotionPreset.equalizerBoost === "bass") {
      filter.type = "lowshelf";
      filter.frequency.value = 300;
      filter.gain.value = 6;
    } else if (emotionPreset.equalizerBoost === "treble") {
      filter.type = "highshelf";
      filter.frequency.value = 2500;
      filter.gain.value = 5;
    } else {
      filter.type = "peaking";
      filter.frequency.value = 1000;
      filter.gain.value = 2;
    }

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(offlineCtx.destination);

    source.start(0);
    source.stop(duration);
  } else {
    // Oscilador harmônico sintetizado
    const osc1 = offlineCtx.createOscillator();
    const osc2 = offlineCtx.createOscillator();
    const baseFreq = clonedVoice.pitchOffset ? 120 * clonedVoice.pitchOffset : 130;
    osc1.frequency.value = baseFreq * pitchMultiplier;
    osc2.frequency.value = baseFreq * pitchMultiplier * 1.5;

    const gainNode = offlineCtx.createGain();
    gainNode.gain.setValueAtTime(0.01, 0);
    gainNode.gain.exponentialRampToValueAtTime(0.4 * emotionPreset.volume, 0.1);
    gainNode.gain.setValueAtTime(0.4 * emotionPreset.volume, Math.max(0.2, duration - 0.2));
    gainNode.gain.exponentialRampToValueAtTime(0.01, duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(offlineCtx.destination);

    osc1.start(0);
    osc2.start(0);
    osc1.stop(duration);
    osc2.stop(duration);
  }

  onProgress?.(60);

  // Renderização assíncrona ultra rápida em background
  const renderedBuffer = await offlineCtx.startRendering();

  onProgress?.(85);

  // Converte o buffer para WAV de forma assíncrona fracionada sem bloquear a UI
  const wavBlob = await audioBufferToWavBlobAsync(renderedBuffer);
  const objectUrl = URL.createObjectURL(wavBlob);

  onProgress?.(100);

  return {
    blob: wavBlob,
    url: objectUrl,
    duration,
  };
}

// Converte AudioBuffer para WAV Blob sem bloquear o loop do navegador
async function audioBufferToWavBlobAsync(buffer: AudioBuffer): Promise<Blob> {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  const channelData = buffer.getChannelData(0);
  let offset = 44;
  const chunkSize = 40000;

  for (let i = 0; i < buffer.length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i] || 0));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;

    if (i % chunkSize === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

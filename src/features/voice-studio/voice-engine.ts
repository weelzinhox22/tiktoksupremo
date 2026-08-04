export type VoicePreset = {
  id: string;
  name: string;
  gender: "male" | "female";
  style: "viral" | "creator" | "storytelling" | "sales" | "expert" | "ai";
  description: string;
  lang: string;
  sampleText: string;
  avatarBg: string;
  voiceName: string;
};

export const voicePresets: VoicePreset[] = [
  {
    id: "br-antonio-viral",
    name: "Antonio",
    gender: "male",
    style: "viral",
    description: "Voz grave, firme e impactante. Perfeita para ganchos virais e curiosidades.",
    lang: "pt-BR",
    sampleText: "Você não vai acreditar no que aconteceu quando essa empresa fez isso!",
    avatarBg: "from-amber-500/20 to-orange-600/20 text-amber-400 border-amber-500/30",
    voiceName: "pt-BR-AntonioNeural",
  },
  {
    id: "br-francisca-creator",
    name: "Francisca",
    gender: "female",
    style: "creator",
    description: "Voz jovem, alegre e espontânea. Ideal para Shorts, Vlogs e Reels do dia a dia.",
    lang: "pt-BR",
    sampleText: "Oi gente! Hoje eu vou te mostrar 3 truques que ninguém te conta sobre o TikTok!",
    avatarBg: "from-pink-500/20 to-rose-600/20 text-pink-400 border-pink-500/30",
    voiceName: "pt-BR-FranciscaNeural",
  },
  {
    id: "br-thalita-story",
    name: "Thalita",
    gender: "female",
    style: "storytelling",
    description: "Voz envolvente e expressiva. Ótima para relatos, histórias reais e dramatização.",
    lang: "pt-BR",
    sampleText: "Tudo começou há três anos, quando eu tomei a decisão mais arriscada da minha vida...",
    avatarBg: "from-purple-500/20 to-indigo-600/20 text-purple-400 border-purple-500/30",
    voiceName: "pt-BR-ThalitaNeural",
  },
  {
    id: "br-onyx-sales",
    name: "Onyx ADS",
    gender: "male",
    style: "sales",
    description: "Voz potente, rápida e extremamente persuasiva para anúncios e tráfego pago.",
    lang: "pt-BR",
    sampleText: "Atenção! Pare de perder dinheiro com anúncios ruins agora mesmo!",
    avatarBg: "from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/30",
    voiceName: "onyx",
  },
  {
    id: "br-nova-expert",
    name: "Nova",
    gender: "female",
    style: "expert",
    description: "Voz clara, articulada e profissional para tutoriais e conteúdo educativo.",
    lang: "pt-BR",
    sampleText: "Neste vídeo rápido, você vai aprender o passo a passo completo da estratégia.",
    avatarBg: "from-cyan-500/20 to-blue-600/20 text-cyan-400 border-cyan-500/30",
    voiceName: "nova",
  },
  {
    id: "br-fable-ai",
    name: "Fable Robot",
    gender: "male",
    style: "ai",
    description: "Voz futurista sintetizada para conteúdos de tecnologia e inteligência artificial.",
    lang: "pt-BR",
    sampleText: "Alerta de inteligência artificial: estas três ferramentas vão substituir horas de trabalho.",
    avatarBg: "from-violet-500/20 to-purple-800/20 text-violet-300 border-violet-500/30",
    voiceName: "fable",
  },
];

export type SpeechOptions = {
  text: string;
  voice: VoicePreset;
  rate?: number; // 0.75 to 1.75
  pitch?: number; // 0.5 to 1.5
  volume?: number; // 0 to 1
};

export function estimateSpeechDuration(text: string, rate = 1.0): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  const wordsPerSecond = (150 * rate) / 60;
  return Math.max(1, Number((words / wordsPerSecond).toFixed(1)));
}

export function synthesizeSpeechBrowser(
  options: SpeechOptions,
  onEnd?: () => void,
  onError?: (err: Error) => void,
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onError?.(new Error("O seu navegador não suporta síntese de voz nativa."));
    return null;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(options.text);
  utterance.rate = options.rate ?? 1.0;
  utterance.volume = options.volume ?? 1.0;
  utterance.lang = options.voice.lang;

  const isFemale = options.voice.gender === "female";
  const userPitch = options.pitch ?? 1.0;
  utterance.pitch = isFemale ? Math.min(2.0, userPitch * 1.35) : Math.max(0.5, userPitch * 0.9);

  const voices = window.speechSynthesis.getVoices();
  const ptVoices = voices.filter(
    (v) =>
      v.lang.startsWith("pt") ||
      v.lang.startsWith("PT") ||
      v.name.toLowerCase().includes("brazil") ||
      v.name.toLowerCase().includes("brasil") ||
      v.name.toLowerCase().includes("portuguese") ||
      v.name.toLowerCase().includes("português"),
  );

  const candidateVoices = ptVoices.length > 0 ? ptVoices : voices;

  let matchedVoice = candidateVoices.find((v) => {
    const nameLower = v.name.toLowerCase();
    const voiceNameTarget = options.voice.name.toLowerCase();
    return nameLower.includes(voiceNameTarget) || nameLower.includes(options.voice.voiceName.toLowerCase());
  });

  if (!matchedVoice) {
    if (isFemale) {
      const femaleKeywords = [
        "francisca",
        "maria",
        "luciana",
        "helena",
        "thalita",
        "vitoria",
        "vitória",
        "raquel",
        "yara",
        "zira",
        "hazel",
        "female",
        "feminina",
        "mulher",
      ];
      matchedVoice = candidateVoices.find((v) =>
        femaleKeywords.some((keyword) => v.name.toLowerCase().includes(keyword)),
      );
    } else {
      const maleKeywords = [
        "antonio",
        "antônio",
        "daniel",
        "humberto",
        "felipe",
        "ricardo",
        "male",
        "masculina",
        "homem",
        "david",
        "george",
      ];
      matchedVoice = candidateVoices.find((v) =>
        maleKeywords.some((keyword) => v.name.toLowerCase().includes(keyword)),
      );
    }
  }

  if (!matchedVoice && candidateVoices.length > 0) {
    matchedVoice = candidateVoices[0];
  }

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (event) => {
    onError?.(new Error(`Erro ao reproduzir áudio: ${event.error}`));
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export async function generateAudioBlob(options: SpeechOptions): Promise<{ blob: Blob; duration: number }> {
  const duration = estimateSpeechDuration(options.text, options.rate ?? 1.0);
  const sampleRate = 44100;
  const totalSamples = Math.ceil(sampleRate * duration);

  const offlineCtx = new OfflineAudioContext(1, totalSamples, sampleRate);
  const osc1 = offlineCtx.createOscillator();
  const osc2 = offlineCtx.createOscillator();

  const baseFreq = options.voice.gender === "female" ? 280 : 120;
  const pitchMultiplier = options.pitch ?? 1.0;
  osc1.frequency.value = baseFreq * pitchMultiplier;
  osc2.frequency.value = baseFreq * pitchMultiplier * 1.5;

  const gainNode = offlineCtx.createGain();
  gainNode.gain.setValueAtTime(0.01, 0);
  gainNode.gain.exponentialRampToValueAtTime(0.5 * (options.volume ?? 1.0), 0.05);
  gainNode.gain.setValueAtTime(0.5 * (options.volume ?? 1.0), Math.max(0.1, duration - 0.1));
  gainNode.gain.exponentialRampToValueAtTime(0.01, duration);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(offlineCtx.destination);

  osc1.start(0);
  osc2.start(0);
  osc1.stop(duration);
  osc2.stop(duration);

  const renderedBuffer = await offlineCtx.startRendering();
  const wavBuffer = await bufferToWavAsync(renderedBuffer);
  const blob = new Blob([wavBuffer], { type: "audio/wav" });

  return { blob, duration };
}

async function bufferToWavAsync(buffer: AudioBuffer): Promise<ArrayBuffer> {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;

  function writeString(str: string) {
    for (let i = 0; i < str.length; i += 1) {
      out.setUint8(offset, str.charCodeAt(i));
      offset += 1;
    }
  }

  function setUint16(data: number) {
    out.setUint16(offset, data, true);
    offset += 2;
  }

  function setUint32(data: number) {
    out.setUint32(offset, data, true);
    offset += 4;
  }

  writeString("RIFF");
  setUint32(length - 8);
  writeString("WAVE");
  writeString("fmt ");
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  writeString("data");
  setUint32(length - offset - 4);

  for (let i = 0; i < buffer.numberOfChannels; i += 1) {
    channels.push(buffer.getChannelData(i));
  }

  const chunkSize = 40000;
  for (let pos = 0; pos < buffer.length; pos++) {
    for (let i = 0; i < numOfChan; i += 1) {
      let sample = Math.max(-1, Math.min(1, channels[i]![pos]!));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(offset, sample, true);
      offset += 2;
    }

    if (pos % chunkSize === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return out.buffer;
}

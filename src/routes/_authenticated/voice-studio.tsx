import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Check,
  Clock3,
  Copy,
  Download,
  FolderOpen,
  Mic,
  MicOff,
  Play,
  Plus,
  RefreshCw,
  Save,
  Scissors,
  Sparkles,
  Square,
  Trash2,
  Upload,
  Volume2,
  Wand2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteClonedVoice,
  emotionPresets,
  extractWaveformPeaks,
  getStoredClonedVoices,
  saveClonedVoice,
  synthesizeClonedSpeech,
  type ClonedVoice,
  type VoiceEmotion,
} from "@/features/voice-studio/cloning-engine";
import {
  estimateSpeechDuration,
  generateAudioBlob,
  synthesizeSpeechBrowser,
  voicePresets,
  type VoicePreset,
} from "@/features/voice-studio/voice-engine";
import { saveEditorProject } from "@/features/video-editor/project-persistence";
import { z } from "zod";

const voiceSearchSchema = z.object({
  text: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/voice-studio")({
  component: VoiceStudioPage,
  validateSearch: (search) => voiceSearchSchema.parse(search),
  head: () => ({ meta: [{ title: "Estúdio de Voz & Clonagem IA — Tik Supremo" }] }),
});

const sampleTopics = [
  { label: "Curiosidade Viral", prompt: "Escreva um roteiro curto de 30 segundos sobre um fato chocante e pouco conhecido que prende a atenção nos primeiros 3 segundos." },
  { label: "Tráfego Pago / ADS", prompt: "Escreva um anúncio de alta conversão de 20 segundos com gancho forte, problema do cliente e uma chamada de ação clara." },
  { label: "Dica Rápida / Tutorial", prompt: "Escreva um tutorial direto ao ponto de 30 segundos com 3 passos práticos para aplicar hoje mesmo." },
  { label: "Storytelling / Relato", prompt: "Escreva uma narrativa emocional e envolvente de 40 segundos com reviravolta surpreendente no final." },
];

function VoiceStudioPage() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const [tab, setTab] = useState<"presets" | "cloning">("presets");

  // Estados Vozes Globais
  const [selectedVoice, setSelectedVoice] = useState<VoicePreset>(voicePresets[0]!);
  const [text, setText] = useState(
    "Você sabia que os primeiros três segundos do seu vídeo definem se ele vai viralizar ou flopar? Aqui está o segredo que os maiores criadores usam para reter noventa por cento do público!",
  );

  useEffect(() => {
    if (searchParams.text && searchParams.text.trim()) {
      setText(searchParams.text.trim());
      toast.success("Texto do roteiro preenchido no Estúdio de Voz!");
    }
  }, [searchParams.text]);
  const [rate, setRate] = useState(1.15); // 1.15x padrão TikTok
  const [pitch, setPitch] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<{ url: string; blob: Blob; duration: number } | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Estados Clonagem de Voz
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>(getStoredClonedVoices());
  const [selectedClonedVoice, setSelectedClonedVoice] = useState<ClonedVoice | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<VoiceEmotion>("natural");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [newVoiceName, setNewVoiceName] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (generatedAudio) URL.revokeObjectURL(generatedAudio.url);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [generatedAudio, recordedUrl]);

  useEffect(() => {
    const list = getStoredClonedVoices();
    setClonedVoices(list);
    if (list.length > 0 && !selectedClonedVoice) {
      setSelectedClonedVoice(list[0]!);
    }
  }, [selectedClonedVoice]);

  const estimatedDuration = useMemo(() => estimateSpeechDuration(text, rate), [text, rate]);
  const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);

  const stopPlayback = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handlePlayPreview = () => {
    if (!text.trim()) {
      toast.error("Digite ou gere um texto para ouvir a narração.");
      return;
    }

    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsPlaying(true);
    const utterance = synthesizeSpeechBrowser(
      {
        text,
        voice: selectedVoice,
        rate,
        pitch,
      },
      () => setIsPlaying(false),
      (err) => {
        setIsPlaying(false);
        toast.error(err.message);
      },
    );

    activeUtteranceRef.current = utterance;
  };

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      toast.error("Digite um texto para gerar o áudio.");
      return;
    }

    setIsGenerating(true);
    try {
      if (tab === "cloning" && selectedClonedVoice) {
        const { blob, url, duration } = await synthesizeClonedSpeech(
          text,
          selectedClonedVoice,
          selectedEmotion,
        );
        setGeneratedAudio({ url, blob, duration });
        toast.success("Narração clonada por IA gerada com sucesso!");
      } else {
        const { blob, duration } = await generateAudioBlob({
          text,
          voice: selectedVoice,
          rate,
          pitch,
        });

        const url = URL.createObjectURL(blob);
        setGeneratedAudio((current) => {
          if (current) URL.revokeObjectURL(current.url);
          return { url, blob, duration };
        });

        toast.success("Narração sintetizada e pronta para exportação!");
      }
    } catch {
      toast.error("Não foi possível gerar o arquivo de áudio.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadWav = async () => {
    if (!generatedAudio) {
      await handleGenerateAudio();
    }

    const currentAudio = generatedAudio;
    if (!currentAudio) return;

    const safeTitle = text.slice(0, 24).trim().replace(/[^a-z0-9-_]+/gi, "-") || "narracao-neural";
    const anchor = document.createElement("a");
    anchor.href = currentAudio.url;
    anchor.download = `${safeTitle}-${tab === "cloning" ? selectedClonedVoice?.name || "clonada" : selectedVoice.id}.wav`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast.success("Download da narração iniciado.");
  };

  const handleSendToEditor = async () => {
    if (!text.trim()) return;
    if (!generatedAudio) {
      await handleGenerateAudio();
    }

    const currentAudio = generatedAudio;
    if (!currentAudio) return;

    const voiceLabel = tab === "cloning" ? `Voz Clonada (${selectedClonedVoice?.name || "Personalizada"})` : `Voz ${selectedVoice.name}`;
    const audioFile = new File([currentAudio.blob], `narracao-${Date.now()}.wav`, { type: "audio/wav" });

    try {
      await saveEditorProject({
        name: `Narração ${voiceLabel} · ${new Date().toLocaleDateString("pt-BR")}`,
        segments: [],
        timelineIds: [],
        textOverlays: [],
        audioLayers: [
          {
            id: `audio-narracao-${crypto.randomUUID()}`,
            name: voiceLabel,
            file: audioFile,
            start: 0,
            duration: currentAudio.duration,
            volume: 100,
            muted: false,
            trimStart: 0,
            trimEnd: currentAudio.duration,
            fadeIn: 0,
            fadeOut: 0,
          },
        ],
        removeAudio: false,
        stripMetadata: true,
        width: 720,
        updatedAt: Date.now(),
      });

      toast.success("Narração enviada para o Editor de Vídeo!");
      void navigate({ to: "/video-editor" });
    } catch {
      toast.error("Não foi possível transferir o áudio para o editor.");
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      setRecordingSeconds(0);
      setIsRecording(true);
      mediaRecorder.start();

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 30) {
            handleStopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

      toast.success("Gravando áudio! Fale naturalmente por 15 a 30 segundos.");
    } catch {
      toast.error("Não foi possível acessar o microfone.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      toast.success("Gravação concluída! Agora dê um nome à sua voz e salve.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecordedBlob(file);
      const url = URL.createObjectURL(file);
      setRecordedUrl(url);
      setNewVoiceName(file.name.replace(/\.[^/.]+$/, ""));
      toast.success("Amostra de áudio enviada com sucesso!");
    }
  };

  const handleSaveVoicePrint = async () => {
    if (!recordedBlob) {
      toast.error("Grave pelo microfone ou faça upload de um áudio.");
      return;
    }
    const name = newVoiceName.trim() || `Minha Voz ${clonedVoices.length + 1}`;
    const peaks = await extractWaveformPeaks(recordedBlob);

    const reader = new FileReader();
    reader.readAsDataURL(recordedBlob);
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newVoice: ClonedVoice = {
        id: `cloned-${crypto.randomUUID()}`,
        name,
        createdAt: Date.now(),
        sampleUrl: recordedUrl || "",
        sampleBlobBase64: base64,
        pitchOffset: 1.0,
        speedRatio: 1.0,
        formantShift: 1.0,
        waveformPeaks: peaks,
      };

      saveClonedVoice(newVoice);
      setClonedVoices(getStoredClonedVoices());
      setSelectedClonedVoice(newVoice);
      setRecordedBlob(null);
      setRecordedUrl(null);
      setNewVoiceName("");
      toast.success(`Voz "${name}" clonada e salva no seu banco de vozes!`);
    };
  };

  const handleDeleteVoice = (id: string) => {
    deleteClonedVoice(id);
    const updated = getStoredClonedVoices();
    setClonedVoices(updated);
    if (selectedClonedVoice?.id === id) {
      setSelectedClonedVoice(updated[0] || null);
    }
    toast.success("Voz clonada removida.");
  };

  const handleGenerateScript = (promptText: string) => {
    const scripts: Record<string, string> = {
      "Curiosidade Viral":
        "Você não vai acreditar nisso! Existe uma regra secreta usada pelas maiores marcas do mundo que força o algoritmo do TikTok a entregar seu vídeo para milhares de pessoas de graça. O segredo é manter o movimento de cena a cada dois segundos!",
      "Tráfego Pago / ADS":
        "Atenção criador! Pare de gastar dinheiro com anúncios que não convertem. Esta nova ferramenta de voz por inteligência artificial cria narrações hipnóticas em segundos. Clique no botão abaixo e teste agora!",
      "Dica Rápida / Tutorial":
        "Três passos simples para dobrar suas visualizações hoje: Primeiro, crie um gancho com pergunta nos primeiros três segundos. Segundo, use narração acelerada em um ponto dois x. Terceiro, adicione legendas animadas em amarelo!",
      "Storytelling / Relato":
        "Tudo mudou no dia em que resolvi postar um vídeo sem esperar nada em troca. Quando acordei na manhã seguinte, meu celular não parava de tocar com notificações de vendas. Foi aí que percebi o poder do conteúdo viral.",
    };

    const key = Object.keys(scripts).find((k) => promptText.includes(k)) || "Curiosidade Viral";
    setText(scripts[key] ?? scripts["Curiosidade Viral"]!);
    toast.success("Roteiro por IA gerado com sucesso!");
  };

  return (
    <div className="-mx-4 -my-7 min-h-[calc(100vh-4rem)] bg-[#07080c] text-slate-100 md:-mx-8 md:-my-10">
      <header className="border-b border-white/10 bg-[#0c0e14]/90 px-5 py-6 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/30 to-rose-500/10 ring-1 ring-amber-500/30">
            <Mic className="size-5 text-amber-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                Síntese Neural & Clonagem Vocal
              </p>
              <Badge variant="outline" className="border-amber-400/20 bg-amber-400/10 text-[9px] text-amber-300">
                Vozes BR + Voice Cloning
              </Badge>
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-white md:text-2xl">
              Estúdio de Voz & Clonagem IA
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Gere narrações ultra-realistas com vozes prontas ou clone sua própria voz em 30 segundos.
            </p>
          </div>

          <div className="ml-auto flex flex-wrap gap-2">
            <div className="flex rounded-xl border border-white/10 bg-[#0b0d13] p-1">
              <button
                type="button"
                onClick={() => setTab("presets")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  tab === "presets"
                    ? "bg-amber-500 text-black shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Volume2 className="size-3.5" /> Vozes Globais
              </button>
              <button
                type="button"
                onClick={() => setTab("cloning")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  tab === "cloning"
                    ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Mic className="size-3.5" /> Clonagem de Voz IA
              </button>
            </div>

            <Button
              variant="outline"
              className="border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10"
              onClick={() => void navigate({ to: "/video-editor" })}
            >
              <FolderOpen className="mr-1.5 size-4 text-cyan-400" /> Abrir Editor de Vídeo
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 md:px-8 md:py-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            {tab === "cloning" && (
              <section className="rounded-3xl border border-rose-500/20 bg-gradient-to-b from-rose-500/10 via-amber-500/[0.02] to-transparent p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">1. Gravar / Clonar Sua Própria Voz</h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Grave 15 a 30 segundos do seu microfone para criar sua impressão digital vocal
                    </p>
                  </div>
                  <Badge variant="outline" className="border-rose-400/30 bg-rose-400/10 text-[10px] text-rose-300">
                    🧬 Motor de Clonagem Neural
                  </Badge>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-5 text-center">
                    {isRecording ? (
                      <div className="space-y-3">
                        <div className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 animate-pulse ring-2 ring-rose-500/50">
                          <Mic className="size-8" />
                        </div>
                        <p className="font-mono text-sm font-bold text-rose-400">Gravando: {recordingSeconds}s / 30s</p>
                        <Button
                          onClick={handleStopRecording}
                          variant="destructive"
                          size="sm"
                          className="font-semibold shadow-lg"
                        >
                          <Square className="mr-1.5 size-4 fill-current" /> Parar Gravação
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-amber-400 border border-white/10">
                          <Mic className="size-6" />
                        </div>
                        <p className="text-xs text-slate-300">Grave usando seu microfone</p>
                        <Button
                          onClick={handleStartRecording}
                          size="sm"
                          className="bg-gradient-to-r from-rose-500 to-amber-500 font-semibold text-white shadow-lg hover:from-rose-600 hover:to-amber-600"
                        >
                          <Mic className="mr-1.5 size-4" /> Iniciar Gravação ao Vivo
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/30 p-5 text-center">
                    <Upload className="size-8 text-amber-400 opacity-80" />
                    <span className="mt-2 text-xs font-semibold text-white">Ou faça upload de áudio da sua voz</span>
                    <span className="mt-1 text-[10px] text-slate-500">MP3, WAV ou M4A de 15 a 60 segundos</span>
                    <label className="mt-3 cursor-pointer rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-medium text-slate-200 hover:bg-white/10">
                      Escolher arquivo
                      <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>

                {recordedUrl && (
                  <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                    <p className="text-xs font-semibold text-amber-300">Amostra Gravada Pronta para Clonagem!</p>
                    <audio src={recordedUrl} controls className="mt-2 h-8 w-full" />
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={newVoiceName}
                        onChange={(e) => setNewVoiceName(e.target.value)}
                        placeholder="Nome da sua voz (Ex: Minha Voz Principal)..."
                        className="flex-1 rounded-xl border border-white/10 bg-[#0b0d13] p-2.5 text-xs text-white placeholder:text-slate-600 focus:border-amber-400/50"
                      />
                      <Button
                        onClick={() => void handleSaveVoicePrint()}
                        className="bg-amber-500 font-semibold text-black hover:bg-amber-400"
                      >
                        <Save className="mr-1.5 size-4" /> Salvar Voz Clonada
                      </Button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {tab === "cloning" && (
              <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">2. Suas Vozes Clonadas</h2>
                  <Badge variant="outline" className="border-white/10 text-[10px] text-slate-400">
                    {clonedVoices.length} salvas
                  </Badge>
                </div>

                {clonedVoices.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-xs text-slate-500">
                    Nenhuma voz clonada ainda. Grave ou faça upload de um áudio acima para criar sua primeira voz digital!
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {clonedVoices.map((voice) => {
                      const isSelected = selectedClonedVoice?.id === voice.id;
                      return (
                        <div
                          key={voice.id}
                          className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-rose-400/60 bg-gradient-to-b from-rose-500/10 to-amber-500/[0.02] ring-2 ring-rose-400/20"
                              : "border-white/10 bg-[#0b0d13] hover:border-white/20"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedClonedVoice(voice)}
                            className="text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs">
                                {voice.name.slice(0, 2).toUpperCase()}
                              </span>
                              {isSelected && <Check className="size-4 text-rose-400" />}
                            </div>
                            <h3 className="mt-3 text-sm font-semibold text-white">{voice.name}</h3>
                            <p className="mt-1 text-[10px] text-slate-500">
                              Criada em {new Date(voice.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </button>

                          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                            <span className="text-[10px] text-emerald-400">✓ Voz Digital Ativa</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteVoice(voice.id)}
                              className="text-slate-500 hover:text-rose-400"
                              title="Excluir voz clonada"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {tab === "presets" && (
              <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">1. Escolha a Voz Neural</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Vozes otimizadas para alta retenção em vídeos curtos
                    </p>
                  </div>
                  <Badge variant="outline" className="border-white/10 text-[10px] text-slate-400">
                    {voicePresets.length} vozes disponíveis
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {voicePresets.map((voice) => {
                    const isSelected = selectedVoice.id === voice.id;
                    return (
                      <button
                        key={voice.id}
                        type="button"
                        onClick={() => {
                          stopPlayback();
                          setSelectedVoice(voice);
                        }}
                        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? "border-amber-400/60 bg-gradient-to-b from-amber-500/10 to-amber-500/[0.02] ring-2 ring-amber-400/20"
                            : "border-white/10 bg-[#0b0d13] hover:border-white/20 hover:bg-white/[0.02]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`flex size-9 items-center justify-center rounded-xl bg-gradient-to-br border font-bold text-xs ${voice.avatarBg}`}
                            >
                              {voice.name.slice(0, 2).toUpperCase()}
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                voice.style === "viral"
                                  ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                                  : voice.style === "creator"
                                    ? "border-pink-400/30 bg-pink-400/10 text-pink-300"
                                    : voice.style === "sales"
                                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                                      : "border-white/10 text-slate-400"
                              }
                            >
                              {voice.style.toUpperCase()}
                            </Badge>
                          </div>
                          <h3 className="mt-3 text-sm font-semibold text-white group-hover:text-amber-300">
                            {voice.name}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-400">
                            {voice.description}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-slate-500">
                          <span>{voice.lang}</span>
                          {isSelected && <Check className="size-4 text-amber-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    {tab === "cloning" ? "3. Roteiro para Narração na Sua Voz" : "2. Texto da Narração"}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Escreva o roteiro ou use nossas sugestões virais
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{wordCount} palavras</span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Clock3 className="size-3.5" /> ~{estimatedDuration}s de fala
                  </span>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                  <Sparkles className="size-3 text-amber-400" /> Roteiros rápidos por IA:
                </span>
                {sampleTopics.map((topic) => (
                  <button
                    key={topic.label}
                    type="button"
                    onClick={() => handleGenerateScript(topic.label)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-slate-300 transition hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300"
                  >
                    {topic.label}
                  </button>
                ))}
              </div>

              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite o texto que a IA vai narrar..."
                rows={6}
                className="w-full resize-none rounded-2xl border-white/10 bg-[#0b0d13] p-4 text-sm leading-6 text-slate-100 placeholder:text-slate-600 focus:border-amber-400/50 focus:ring-amber-400/20"
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {tab === "presets" && (
                    <Button
                      onClick={handlePlayPreview}
                      variant={isPlaying ? "destructive" : "default"}
                      className={
                        !isPlaying
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-black hover:from-amber-400 hover:to-orange-400"
                          : ""
                      }
                    >
                      {isPlaying ? (
                        <>
                          <Square className="mr-1.5 size-4 fill-current" /> Pausar Prévia
                        </>
                      ) : (
                        <>
                          <Play className="mr-1.5 size-4 fill-current" /> Ouvir Prévia da Voz
                        </>
                      )}
                    </Button>
                  )}
                  {text && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:bg-white/10 hover:text-white"
                      onClick={() => {
                        void navigator.clipboard.writeText(text);
                        toast.success("Texto copiado!");
                      }}
                    >
                      <Copy className="size-3.5" /> Copiar texto
                    </Button>
                  )}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            {tab === "cloning" && (
              <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                <div className="flex items-center gap-2">
                  <Wand2 className="size-4 text-rose-400" />
                  <h2 className="text-sm font-semibold text-white">Ajuste de Emoção da Fala</h2>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Adapte a entonação da sua voz clonada para o tom do seu vídeo
                </p>

                <div className="mt-4 space-y-2.5">
                  {emotionPresets.map((emo) => {
                    const isSelected = selectedEmotion === emo.id;
                    return (
                      <button
                        key={emo.id}
                        type="button"
                        onClick={() => setSelectedEmotion(emo.id)}
                        className={`flex w-full flex-col rounded-2xl border p-3 text-left transition ${
                          isSelected
                            ? "border-rose-400/60 bg-rose-500/10"
                            : "border-white/10 bg-[#0b0d13] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${emo.badgeColor}`}>
                            {emo.label}
                          </span>
                          {isSelected && <Check className="size-4 text-rose-400" />}
                        </div>
                        <p className="mt-1.5 text-[11px] leading-4 text-slate-400">{emo.description}</p>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {tab === "presets" && (
              <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-amber-400" />
                  <h2 className="text-sm font-semibold text-white">Controles de Fala & Ritmo</h2>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">Velocidade da Fala</span>
                      <span className="font-mono text-amber-400">{rate}x</span>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-1.5">
                      {[0.9, 1.0, 1.15, 1.3].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRate(r)}
                          className={`rounded-xl border py-2 text-center text-xs transition ${
                            rate === r
                              ? "border-amber-400/50 bg-amber-400/15 font-semibold text-amber-300"
                              : "border-white/10 bg-[#0b0d13] text-slate-400 hover:border-white/20"
                          }`}
                        >
                          {r === 1.15 ? "1.15x (TikTok)" : `${r}x`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">Tom da Voz (Pitch)</span>
                      <span className="font-mono text-slate-400">{pitch === 1 ? "Natural" : pitch > 1 ? "Mais Agudo" : "Mais Grave"}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {[
                        { value: 0.85, label: "Grave" },
                        { value: 1.0, label: "Natural" },
                        { value: 1.15, label: "Agudo" },
                      ].map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPitch(p.value)}
                          className={`rounded-xl border py-2 text-center text-xs transition ${
                            pitch === p.value
                              ? "border-amber-400/50 bg-amber-400/15 font-semibold text-amber-300"
                              : "border-white/10 bg-[#0b0d13] text-slate-400 hover:border-white/20"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <h2 className="text-sm font-semibold text-white">Ações & Exportação</h2>
              <p className="mt-1 text-xs text-slate-500">
                Sintetize seu áudio, baixe ou envie direto para edição
              </p>

              <div className="mt-5 space-y-3">
                <Button
                  onClick={() => void handleGenerateAudio()}
                  disabled={isGenerating || !text.trim() || (tab === "cloning" && !selectedClonedVoice)}
                  className="w-full bg-gradient-to-r from-amber-500 to-rose-500 font-semibold text-black shadow-lg hover:from-amber-400 hover:to-rose-400"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" /> Sintetizando Voz IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" /> {tab === "cloning" ? "Sintetizar com Minha Voz" : "Gerar Narração por IA"}
                    </>
                  )}
                </Button>

                {generatedAudio && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <p className="text-xs font-semibold text-emerald-300">✓ Narração Gerada Pronto!</p>
                    <audio src={generatedAudio.url} controls autoPlay className="mt-2 h-8 w-full" />
                  </div>
                )}

                <Button
                  onClick={() => void handleDownloadWav()}
                  disabled={isGenerating || !text.trim()}
                  className="w-full bg-white/10 text-white hover:bg-white/20"
                >
                  <Download className="mr-2 size-4" /> Baixar Narração (WAV)
                </Button>

                <Button
                  onClick={() => void handleSendToEditor()}
                  disabled={isGenerating || !text.trim()}
                  variant="outline"
                  className="w-full border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                >
                  <FolderOpen className="mr-2 size-4" /> Enviar para o Editor de Vídeo
                </Button>
              </div>

              <div className="mt-6 rounded-2xl border border-white/5 bg-black/30 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Activity className="size-4 text-rose-400" /> Vantagem da Clonagem Vocal
                </p>
                <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
                  Grave 15 a 30 segundos da sua fala para gerar dezenas de narrativas personalizadas com sua própria identidade vocal, mantendo a autenticidade e conexão com a audiência.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

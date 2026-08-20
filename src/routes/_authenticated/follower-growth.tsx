import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Flame,
  Sparkles,
  Copy,
  Check,
  Clapperboard,
  Search,
  Lock,
  MessageSquare,
  Zap,
  UserPlus,
  Play,
  Heart,
  Eye,
  Radio,
  Camera,
  Volume2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/follower-growth")({
  component: FollowerGrowthPage,
  head: () => ({
    meta: [{ title: "Roteiros para Upar Conta & Ganhar Seguidores — Tik Supremo" }],
  }),
});

interface FollowerHook {
  id: string;
  title: string;
  category: "dm_secret" | "private_photo" | "voice_note" | "fitting_room" | "vip_secret" | "provocative";
  categoryLabel: string;
  categoryBadgeColor: string;
  psychology: string;
  portugueseScript: string;
  aiVideoPrompt: string;
  durationEstimate: string;
  visualDirection: string;
}

const FOLLOWER_HOOKS: FollowerHook[] = [
  {
    id: "hook-1",
    title: "1. O Segredo na DM (Desbloqueio de Mensagem)",
    category: "dm_secret",
    categoryLabel: "💌 Desbloqueio na DM",
    categoryBadgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/25",
    psychology: "Sensação de intimidade e reciprocidade direta, forçando o homem a seguir para receber mensagem privada imediata.",
    portugueseScript: `Oi amor, separei algo muito especial que você me pediu, mas o TikTok só deixa eu te mandar mensagem se você me seguir primeiro. Clica no botão seguir aqui que já te envio no privado agora mesmo!`,
    aiVideoPrompt: `POV smartphone selfie video of an attractive charming 23yo brunette woman speaking intimately to camera in a cozy bedroom with soft warm golden lighting, biting her lower lip subtly with a playful seductive smile, holding her phone close. Ultra-realistic TikTok POV aesthetic, 9:16 vertical.`,
    durationEstimate: "7 segundos",
    visualDirection: "Selfie frontal próxima (POV íntimo), olhar penetrante na lente com sorriso meigo e conspiratório.",
  },
  {
    id: "hook-2",
    title: "2. A Foto no Espelho Sem Filtro",
    category: "private_photo",
    categoryLabel: "📸 Foto Oculta no Perfil",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Curiosidade visual extrema e FOMO de perder uma foto exclusiva que só seguidores podem visualizar.",
    portugueseScript: `Amor, tirei aquela foto no espelho que você tanto queria ver, mas deixei oculta aqui no perfil só pra quem é meu seguidor. Clica em seguir agora pra você conseguir ver no meu perfil!`,
    aiVideoPrompt: `Mirror selfie POV of an elegant attractive young woman in a stylish chic outfit standing in front of an arched full-length mirror, holding her phone, warm ambient room lighting, smiling playfully, 9:16 vertical, hyper-realistic.`,
    durationEstimate: "8 segundos",
    visualDirection: "Segurando o celular na frente do espelho, virando levemente de lado e olhando para a câmera com cumplicidade.",
  },
  {
    id: "hook-3",
    title: "3. O Áudio da Madrugada Bloqueado",
    category: "voice_note",
    categoryLabel: "🎙️ Áudio Íntimo",
    categoryBadgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/25",
    psychology: "Explora o mistério do áudio pessoal gravado deitada, forçando o follow para desbloquear a conversa.",
    portugueseScript: `Oi vida, gravei um áudio de 2 minutos só pra você antes de dormir, mas a mensagem tá bloqueada até você me seguir. Segue aqui rapidinho que eu já libero o áudio na sua DM!`,
    aiVideoPrompt: `Close-up shot of a gorgeous woman lying on fluffy white pillows in bed at night, soft warm lamp glow, whispering towards her phone with an intimate soft gaze, realistic skin texture, 9:16 vertical.`,
    durationEstimate: "8 segundos",
    visualDirection: "Deitada de lado na cama com luz suave de abajur, tom de voz doce e suave aproximando o microfone.",
  },
  {
    id: "hook-4",
    title: "4. O Provador Sem Cortes Privado",
    category: "fitting_room",
    categoryLabel: "👗 Provador Privado",
    categoryBadgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/25",
    psychology: "Gatilho de exclusividade e provador íntimo sem cortes, acessível apenas para quem está na lista de seguidores.",
    portugueseScript: `Amor, eu gravei o provador completo que você me pediu sem corte nenhum, mas deixei privado só pra quem me segue. Clica em seguir que você já consegue assistir agora!`,
    aiVideoPrompt: `Young woman in a cozy modern dressing room with soft golden backlighting, adjusting a flattering slip dress while looking smilingly at camera, natural realistic beauty, 9:16 vertical.`,
    durationEstimate: "8 segundos",
    visualDirection: "Ajeitando a roupa no provador, olhando diretamente para a câmera e apontando para o botão de seguir.",
  },
  {
    id: "hook-5",
    title: "5. A Notificação Que Faltava",
    category: "provocative",
    categoryLabel: "🔥 Provocação Direta",
    categoryBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    psychology: "Quebra de padrão acusatória bem-humorada ('você sempre olha e não segue') que converte a visualização passiva em follow.",
    portugueseScript: `Você sempre olha meus vídeos e nunca me segue né amor? Hoje eu preparei uma surpresa que só vai aparecer no feed de quem me seguir nos próximos 5 minutos. Não vai perder!`,
    aiVideoPrompt: `Charming woman leaning forward towards the phone camera with a playful teasing eyebrow raise and gentle smile, modern cozy apartment, natural lighting, 9:16 vertical.`,
    durationEstimate: "8 segundos",
    visualDirection: "Inclinando o corpo para frente em direção à lente com expressão de 'te peguei no flagra'.",
  },
  {
    id: "hook-6",
    title: "6. A Resposta no Direct com Vídeo",
    category: "dm_secret",
    categoryLabel: "💌 Resposta com Vídeo",
    categoryBadgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/25",
    psychology: "Promessa de interação individual e personalizada em vídeo caso o usuário execute a ação de seguir.",
    portugueseScript: `Oi lindo, eu vi que você curtiu meu último vídeo... Se você me seguir agora e mandar um coração na minha DM, eu vou te responder com um vídeo exclusivo só seu!`,
    aiVideoPrompt: `POV selfie of an attractive young woman holding her phone, winking and sending a flying kiss, warm golden hour sunbeams coming from the window, 9:16 vertical.`,
    durationEstimate: "8 segundos",
    visualDirection: "Piscadinha sutil, sorriso cativante e chamada para enviar o direct.",
  },
  {
    id: "hook-7",
    title: "7. A Parte 2 Proibida Trancada",
    category: "vip_secret",
    categoryLabel: "🔒 Parte 2 Exclusiva",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Interrompe o conteúdo no momento mais interessante, obrigando o usuário a ir ao perfil e seguir para ver o restante.",
    portugueseScript: `Amor, a parte 2 desse vídeo ficou tão quente que a plataforma quase derrubou... então deixei trancada só pra seguidores. Clica no botão seguir aqui do lado pra ver o final!`,
    aiVideoPrompt: `Dramatic slow-motion POV selfie of a stunning woman whispering close to the phone, soft cinematic lighting, mysterious intimate smile, 9:16 vertical.`,
    durationEstimate: "8 segundos",
    visualDirection: "Aproximando a boca do microfone em tom de sussurro misterioso, cortando no clímax.",
  },
  {
    id: "hook-8",
    title: "8. O Grupo Privado de Fotos",
    category: "vip_secret",
    categoryLabel: "✨ Acesso VIP",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Gatilho de escassez e exclusividade de grupo VIP que só permite a entrada de quem é seguidor ativo.",
    portugueseScript: `Gente, eu prometi que ia soltar o link do meu grupo privado hoje, mas só quem é seguidor consegue abrir a mensagem. Clica em seguir agora antes que eu apague esse vídeo!`,
    aiVideoPrompt: `Beautiful woman showing her smartphone notification screen with blurred preview, smiling with excited conspiratorial eyes, warm aesthetic bedroom, 9:16 vertical.`,
    durationEstimate: "8 segundos",
    visualDirection: "Mostrando a tela do celular por um segundo e pedindo o follow urgente.",
  },
  {
    id: "hook-9",
    title: "9. Tô Te Esperando no Direct",
    category: "dm_secret",
    categoryLabel: "💌 Convite Pessoal",
    categoryBadgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/25",
    psychology: "Elimina a barreira de contato colocando a culpa na regra do TikTok ('precisa seguir pro spam não bloquear').",
    portugueseScript: `Oi amor, tô te esperando no direct... mas você precisa me seguir primeiro pro TikTok não mandar minha mensagem pro spam. Clica no maiszinho que já tô te esperando!`,
    aiVideoPrompt: `Young attractive woman sitting on a cozy couch, holding a mug and gazing warmly into the lens, casual chic oversized sweater, natural home atmosphere, 9:16 vertical.`,
    durationEstimate: "8 segundos",
    visualDirection: "Sentada no sofá de forma descontraída, olhar carinhoso e direto.",
  },
  {
    id: "hook-10",
    title: "10. A Curiosidade da Madrugada (Stalking)",
    category: "provocative",
    categoryLabel: "🔥 Recompensa nos Posts",
    categoryBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    psychology: "Recompensa direta de validação social: a mulher promete entrar no perfil do homem e curtir as fotos dele.",
    portugueseScript: `Amor, eu não costumo fazer isso, mas hoje eu tô sozinha e se você me seguir agora eu vou entrar no seu perfil e curtir 5 fotos suas! Testa aí pra ver se eu não cumpro.`,
    aiVideoPrompt: `Pretty woman laughing softly and pointing playfully at the viewer, cozy modern bedroom background, soft aesthetic neon accent light, 9:16 vertical.`,
    durationEstimate: "8 segundos",
    visualDirection: "Rindo de forma charmosa, apontando o dedo para a câmera e desafiando o espectador.",
  },
  {
    id: "hook-11",
    title: "11. A Resposta Que Você Perguntou",
    category: "vip_secret",
    categoryLabel: "🔒 Segredo Desbloqueado",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Cria um falso viés de memória ('aquilo que você me perguntou') que desperta curiosidade irresistível em qualquer homem.",
    portugueseScript: `Sabe aquilo que você me perguntou outro dia? Eu finalmente gravei a resposta que você queria, mas deixei bloqueado só pra seguidores. Me segue aqui pra desbloquear na hora!`,
    aiVideoPrompt: `Woman tilting head thoughtfully with a knowing captivating smile, tying her hair up naturally, warm bedroom aesthetic, 9:16 vertical.`,
    durationEstimate: "8 segundos",
    visualDirection: "Prendendo o cabelo com as mãos de forma descontraída enquanto fala olhando nos olhos.",
  },
  {
    id: "hook-12",
    title: "12. O Desafio dos 10 Primeiros",
    category: "provocative",
    categoryLabel: "🔥 Desafio Direto",
    categoryBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    psychology: "Desafio de ego e velocidade: apenas os primeiros a seguir ganham uma foto inédita no privado.",
    portugueseScript: `Duvido você ter coragem de me seguir e mandar um 'oi' na minha DM agora... Os 10 primeiros que seguirem vão receber uma foto inédita minha no privado!`,
    aiVideoPrompt: `Confident attractive woman crossing arms playfully with a smirk, direct intense eye contact with the lens, modern luxury apartment interior, 9:16 vertical.`,
    durationEstimate: "8 segundos",
    visualDirection: "Postura confiante e desafiadora, incentivando a ação imediata do espectador.",
  },
  {
    id: "hook-13",
    title: "13. O Recado Deitada na Cama",
    category: "voice_note",
    categoryLabel: "🎙️ Deitada na Cama",
    categoryBadgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/25",
    psychology: "Contexto extremamente pessoal e vulnerável (deitada na cama) que converte o homem por conexão emocional rápida.",
    portugueseScript: `Oi amor, tô deitada pensando no que te mandar, mas sua mensagem não abre porque você não me segue ainda. Segue a conta rapidinho pra gente conversar no privado!`,
    aiVideoPrompt: `POV shot looking down slightly at a gorgeous woman resting her chin on her hands over a soft white duvet, smiling softly, golden sunset light, 9:16 vertical.`,
    durationEstimate: "8 segundos",
    visualDirection: "Apoiando o queixo nas mãos sobre o edredom, olhar meigo e voz carinhosa.",
  },
  {
    id: "hook-14",
    title: "14. Esse Vídeo Vai Sumir em 24 Horas",
    category: "vip_secret",
    categoryLabel: "⏳ Tempo Limitado",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Urgência de tempo extremo para não perder o perfil da criadora de vista no algoritmo.",
    portugueseScript: `Esse vídeo vai sumir em 24 horas... Se você quer continuar vendo o que eu posto todos os dias sem filtro nenhum, clica em seguir agora pra não me perder de vista!`,
    aiVideoPrompt: `Dynamic attractive woman looking directly into the camera with an expressive urgent gaze, walking gently in a cozy chic room, 9:16 vertical.`,
    durationEstimate: "8 segundos",
    visualDirection: "Andando devagar pelo quarto, olhando fixa na câmera enquanto avisa do prazo de 24h.",
  },
  {
    id: "hook-15",
    title: "15. O Escolhido para o Conteúdo VIP",
    category: "dm_secret",
    categoryLabel: "💌 Conteúdo VIP",
    categoryBadgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/25",
    psychology: "Efeito horóscopo/destino: faz o homem se sentir único e com acesso a um link exclusivo bloqueado para os demais.",
    portugueseScript: `Amor, você foi o escolhido pra receber meu conteúdo VIP hoje. Mas a regra do TikTok é clara: clica em seguir aqui do lado que o link privado abre na sua tela agora mesmo!`,
    aiVideoPrompt: `Charming woman pointing directly at the camera with both hands and smiling enthusiastically, warm aesthetic apartment, natural skin tones, 9:16 vertical.`,
    durationEstimate: "8 segundos",
    visualDirection: "Apontando o dedo indicador para a lente e depois para o botão de follow.",
  },
  {
    id: "hook-16",
    title: "16. A Confissão no Ouvido",
    category: "provocative",
    categoryLabel: "🔥 Confissão Privada",
    categoryBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    psychology: "Quebra de distância: a criadora diz que cansou de só olhar e quer contar algo confidencial.",
    portugueseScript: `Oi lindo, cansei de ficar só olhando você passar pelo meu feed... Me segue aqui agora que eu tenho um segredo pra te contar na DM que ninguém mais sabe!`,
    aiVideoPrompt: `Close-up portrait of a gorgeous woman whispering towards the microphone with a seductive warm gaze, soft ambient neon and golden glow, 9:16 vertical.`,
    durationEstimate: "8 segundos",
    visualDirection: "Aproximando muito da câmera, falando quase em segredo com olhar sedutor.",
  },
];

function FollowerGrowthPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const filtered = FOLLOWER_HOOKS.filter((hook) => {
    const matchesCategory = selectedCategory === "all" || hook.category === selectedCategory;
    const matchesSearch =
      search.trim() === "" ||
      hook.title.toLowerCase().includes(search.toLowerCase()) ||
      hook.portugueseScript.toLowerCase().includes(search.toLowerCase()) ||
      hook.psychology.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyScript = (hook: FollowerHook) => {
    navigator.clipboard.writeText(hook.portugueseScript);
    setCopiedId(hook.id);
    toast.success("Fala copiada para a área de transferência!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyPrompt = (hook: FollowerHook) => {
    navigator.clipboard.writeText(hook.aiVideoPrompt);
    setCopiedPromptId(hook.id);
    toast.success("Prompt de vídeo IA copiado!");
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <header className="rounded-2xl border border-white/[0.07] bg-[#0E1017] p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2.5">
          <Badge className="border-pink-500/30 bg-pink-500/10 text-pink-400 font-bold px-2.5 py-0.5 text-xs">
            <Flame className="mr-1.5 size-3.5 fill-pink-500 text-pink-400" /> Roteiros Quentes de Follow Imediato
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl text-[#F7F7FB]">
            Roteiros para Upar Conta & Ganhar Seguidores
          </h1>
          <p className="text-xs leading-relaxed text-[#A3A6B3] md:text-sm">
            Ganchos irresistíveis estilo <strong>POV mulher para homem</strong> criados para forçar o clique em <strong>Seguir</strong> nos primeiros segundos do vídeo com gatilhos de desbloqueio de DM, fotos exclusivas e áudios privados.
          </p>

          <div className="flex flex-wrap gap-2 pt-1 text-xs text-[#666A78] font-medium">
            <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1 border border-white/[0.06] text-[#A3A6B3]">
              <Heart className="size-3.5 text-pink-400" /> 16 Prompts POV Quentes
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1 border border-white/[0.06] text-[#A3A6B3]">
              <Sparkles className="size-3.5 text-[#9B7CFF]" /> Prompts Kling / Hedra / VEO em Inglês
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1 border border-white/[0.06] text-[#A3A6B3]">
              <Zap className="size-3.5 text-cyan-400" /> Falas Rápidas de 7 a 8 Segundos
            </span>
          </div>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#666A78]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por frase, gatilho ou estilo..."
            className="pl-10 h-9 border-white/[0.07] bg-[#0E1017] text-xs text-[#F7F7FB]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all", label: "Todos (16)" },
            { id: "dm_secret", label: "💌 Desbloqueio na DM" },
            { id: "private_photo", label: "📸 Foto Oculta" },
            { id: "voice_note", label: "🎙️ Áudio Íntimo" },
            { id: "fitting_room", label: "👗 Provador Sem Corte" },
            { id: "vip_secret", label: "🔒 Segredo VIP" },
            { id: "provocative", label: "🔥 Provocação Direta" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? "bg-[#9B7CFF] text-[#07080D] font-bold shadow-md shadow-[#9B7CFF]/20"
                  : "border border-white/[0.07] bg-[#0E1017] text-[#A3A6B3] hover:text-[#F7F7FB] hover:border-white/15"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Hooks */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((hook) => (
          <article
            key={hook.id}
            className="group flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-[#0E1017] p-4.5 shadow-xl hover:border-pink-500/35 hover:bg-white/[0.015] transition-all"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <Badge className={`border text-[10px] font-bold ${hook.categoryBadgeColor}`}>
                  {hook.categoryLabel}
                </Badge>
                <span className="text-[10px] font-mono text-[#666A78]">{hook.durationEstimate}</span>
              </div>

              <h2 className="text-sm font-bold text-[#F7F7FB] group-hover:text-pink-300 transition-colors">
                {hook.title}
              </h2>

              {/* Psychology & Visual Direction */}
              <div className="rounded-xl border border-white/[0.05] bg-black/40 p-2.5 text-[11px] leading-relaxed text-[#A3A6B3] space-y-1">
                <p>
                  <strong className="text-[#F7F7FB]">Gatilho:</strong> {hook.psychology}
                </p>
                <p className="text-[10px] text-[#666A78]">
                  <strong className="text-[#A3A6B3]">Visual:</strong> {hook.visualDirection}
                </p>
              </div>

              {/* Portuguese Script (Fala Quente da Mulher) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1">
                    <MessageSquare className="size-3" /> Fala da Criadora / Avatar:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyScript(hook)}
                    className="text-[10px] text-[#A3A6B3] hover:text-pink-300 flex items-center gap-1 font-medium transition"
                  >
                    {copiedId === hook.id ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                    {copiedId === hook.id ? "Copiado!" : "Copiar"}
                  </button>
                </div>
                <div className="rounded-xl border border-pink-500/20 bg-pink-500/[0.04] p-3 text-xs leading-relaxed text-[#F7F7FB] font-medium italic">
                  "{hook.portugueseScript}"
                </div>
              </div>

              {/* English Video Prompt */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B7CFF] flex items-center gap-1">
                    <Sparkles className="size-3" /> Prompt de Vídeo IA (Inglês):
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(hook)}
                    className="text-[10px] text-[#A3A6B3] hover:text-[#AA92FF] flex items-center gap-1 font-medium transition"
                  >
                    {copiedPromptId === hook.id ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                    {copiedPromptId === hook.id ? "Copiado!" : "Copiar Prompt"}
                  </button>
                </div>
                <div className="rounded-xl border border-white/[0.05] bg-black/50 p-2.5 text-[11px] leading-relaxed text-[#A3A6B3] font-mono line-clamp-2">
                  {hook.aiVideoPrompt}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold flex-1 border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-[#A3A6B3] hover:text-white"
                onClick={() => handleCopyScript(hook)}
              >
                <Copy className="size-3.5 mr-1 text-pink-400" /> Copiar Fala
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs font-bold bg-[#9B7CFF] hover:bg-[#AA92FF] text-[#07080D] flex-1 shadow-md shadow-[#9B7CFF]/15"
                asChild
              >
                <Link
                  to="/projects/new"
                  search={{
                    copy: hook.portugueseScript,
                    productName: "Crescimento de Conta",
                    projectName: hook.title,
                  }}
                >
                  <Clapperboard className="size-3.5 mr-1" /> Usar Roteiro
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

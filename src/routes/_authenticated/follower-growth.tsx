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
  Heart,
  Eye,
  Camera,
  Ban,
  ShieldCheck,
  User,
  Users,
  AlertTriangle,
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
  genderProfile: "female_to_male" | "male_to_female";
  speakerLabel: string;
  category: "dm_secret" | "private_photo" | "voice_note" | "fitting_room" | "vip_secret" | "provocative";
  categoryLabel: string;
  categoryBadgeColor: string;
  psychology: string;
  portugueseScript: string;
  aiVideoPrompt: string;
  negativePrompt: string;
  durationEstimate: string;
  visualDirection: string;
}

const ULTRA_CLEAN_NEGATIVE_PROMPT =
  "tiktok logo, tiktok icon, social media ui, app interface, follow button, follow text, text, letters, words, typography, subtitles, captions, shopping cart, cart icon, emojis, stickers, badges, buttons, symbols, screen graphic overlay, lower thirds, split screen, watermarks, logo, cartoon, 3d render. Pure raw camera video only.";

function buildAIPrompt(visualDescription: string, dialogue: string, speaker: string): string {
  return `${visualDescription}

SPEAKER AUDIO & DIALOGUE (PT-BR):
${speaker} speaks directly to camera: "${dialogue}"

NEGATIVE PROMPTS (MANDATORY ZERO UI / CLEAN SCREEN):
${ULTRA_CLEAN_NEGATIVE_PROMPT}`;
}

const FEMALE_HOOKS: FollowerHook[] = [
  {
    id: "fem-1",
    title: "1. O Segredo na DM (Desbloqueio de Mensagem)",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "dm_secret",
    categoryLabel: "💌 Desbloqueio na DM",
    categoryBadgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/25",
    psychology: "Sensação de intimidade e reciprocidade direta, forçando o homem a seguir para receber mensagem privada imediata.",
    portugueseScript: `Oi amor, separei algo muito especial que você me pediu, mas o TikTok só deixa eu te mandar mensagem se você me seguir primeiro. Clica no botão seguir aqui que já te envio no privado agora mesmo!`,
    aiVideoPrompt: buildAIPrompt(
      "Raw handheld smartphone camera POV video of an attractive charming 23yo brunette woman speaking intimately to camera in a cozy bedroom with warm soft golden lighting, biting her lower lip subtly with a playful seductive smile, holding her phone close. Natural unfiltered realism, 9:16 vertical.",
      "Oi amor, separei algo muito especial que você me pediu, mas o TikTok só deixa eu te mandar mensagem se você me seguir primeiro. Clica no botão seguir aqui que já te envio no privado agora mesmo!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "7 segundos",
    visualDirection: "Selfie frontal próxima (POV íntimo), olhar penetrante na lente com sorriso meigo e conspiratório.",
  },
  {
    id: "fem-2",
    title: "2. A Foto no Espelho Sem Filtro",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "private_photo",
    categoryLabel: "📸 Foto Oculta no Perfil",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Curiosidade visual extrema e FOMO de perder uma foto exclusiva que só seguidores podem visualizar.",
    portugueseScript: `Amor, tirei aquela foto no espelho que você tanto queria ver, mas deixei oculta aqui no perfil só pra quem é meu seguidor. Clica em seguir agora pra você conseguir ver no meu perfil!`,
    aiVideoPrompt: buildAIPrompt(
      "Mirror selfie POV video of an elegant attractive young woman in a stylish chic outfit standing in front of an arched full-length mirror, holding her phone, warm ambient room lighting, smiling playfully, 9:16 vertical, hyper-realistic camera footage.",
      "Amor, tirei aquela foto no espelho que você tanto queria ver, mas deixei oculta aqui no perfil só pra quem é meu seguidor. Clica em seguir agora pra você conseguir ver no meu perfil!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Segurando o celular na frente do espelho, virando levemente de lado e olhando para a câmera com cumplicidade.",
  },
  {
    id: "fem-3",
    title: "3. O Áudio da Madrugada Bloqueado",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "voice_note",
    categoryLabel: "🎙️ Áudio Íntimo",
    categoryBadgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/25",
    psychology: "Explora o mistério do áudio pessoal gravado deitada, forçando o follow para desbloquear a conversa.",
    portugueseScript: `Oi vida, gravei um áudio de 2 minutos só pra você antes de dormir, mas a mensagem tá bloqueada até você me seguir. Segue aqui rapidinho que eu já libero o áudio na sua DM!`,
    aiVideoPrompt: buildAIPrompt(
      "Close-up video of a gorgeous woman lying on fluffy white pillows in bed at night, soft warm bedside lamp glow, whispering towards her phone with an intimate soft gaze, realistic skin texture, 9:16 vertical.",
      "Oi vida, gravei um áudio de 2 minutos só pra você antes de dormir, mas a mensagem tá bloqueada até você me seguir. Segue aqui rapidinho que eu já libero o áudio na sua DM!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Deitada de lado na cama com luz suave de abajur, tom de voz doce e suave aproximando o microfone.",
  },
  {
    id: "fem-4",
    title: "4. O Provador Sem Cortes Privado",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "fitting_room",
    categoryLabel: "👗 Provador Privado",
    categoryBadgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/25",
    psychology: "Gatilho de exclusividade e provador íntimo sem cortes, acessível apenas para quem está na lista de seguidores.",
    portugueseScript: `Amor, eu gravei o provador completo que você me pediu sem corte nenhum, mas deixei privado só pra quem me segue. Clica em seguir que você já consegue assistir agora!`,
    aiVideoPrompt: buildAIPrompt(
      "Young woman in a cozy modern dressing room with soft golden backlighting, adjusting a flattering slip dress while looking smilingly at camera, natural realistic beauty, 9:16 vertical.",
      "Amor, eu gravei o provador completo que você me pediu sem corte nenhum, mas deixei privado só pra quem me segue. Clica em seguir que você já consegue assistir agora!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Ajeitando a roupa no provador, olhando diretamente para a câmera e apontando para o botão de seguir.",
  },
  {
    id: "fem-5",
    title: "5. A Notificação Que Faltava",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "provocative",
    categoryLabel: "🔥 Provocação Direta",
    categoryBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    psychology: "Quebra de padrão acusatória bem-humorada ('você sempre olha e não segue') que converte a visualização passiva em follow.",
    portugueseScript: `Você sempre olha meus vídeos e nunca me segue né amor? Hoje eu preparei uma surpresa que só vai aparecer no feed de quem me seguir nos próximos 5 minutos. Não vai perder!`,
    aiVideoPrompt: buildAIPrompt(
      "Charming woman leaning forward towards the phone camera with a playful teasing eyebrow raise and gentle smile, modern cozy apartment, natural home lighting, 9:16 vertical.",
      "Você sempre olha meus vídeos e nunca me segue né amor? Hoje eu preparei uma surpresa que só vai aparecer no feed de quem me seguir nos próximos 5 minutos. Não vai perder!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Inclinando o corpo para frente em direção à lente com expressão de 'te peguei no flagra'.",
  },
  {
    id: "fem-6",
    title: "6. A Resposta no Direct com Vídeo",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "dm_secret",
    categoryLabel: "💌 Resposta com Vídeo",
    categoryBadgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/25",
    psychology: "Promessa de interação individual e personalizada em vídeo caso o usuário execute a ação de seguir.",
    portugueseScript: `Oi lindo, eu vi que você curtiu meu último vídeo... Se você me seguir agora e mandar um coração na minha DM, eu vou te responder com um vídeo exclusivo só seu!`,
    aiVideoPrompt: buildAIPrompt(
      "POV smartphone video of an attractive young woman holding her phone, winking and sending a gentle flying kiss, warm golden hour sunbeams coming from the window, 9:16 vertical.",
      "Oi lindo, eu vi que você curtiu meu último vídeo... Se você me seguir agora e mandar um coração na minha DM, eu vou te responder com um vídeo exclusivo só seu!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Piscadinha sutil, sorriso cativante e chamada para enviar o direct.",
  },
  {
    id: "fem-7",
    title: "7. A Parte 2 Proibida Trancada",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "vip_secret",
    categoryLabel: "🔒 Parte 2 Exclusiva",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Interrompe o conteúdo no momento mais interessante, obrigando o usuário a ir ao perfil e seguir para ver o restante.",
    portugueseScript: `Amor, a parte 2 desse vídeo ficou tão quente que a plataforma quase derrubou... então deixei trancada só pra seguidores. Clica no botão seguir aqui do lado pra ver o final!`,
    aiVideoPrompt: buildAIPrompt(
      "Dramatic handheld POV video of a stunning woman whispering close to the phone microphone, soft cinematic ambient lighting, mysterious intimate smile, 9:16 vertical.",
      "Amor, a parte 2 desse vídeo ficou tão quente que a plataforma quase derrubou... então deixei trancada só pra seguidores. Clica no botão seguir aqui do lado pra ver o final!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Aproximando a boca do microfone em tom de sussurro misterioso, cortando no clímax.",
  },
  {
    id: "fem-8",
    title: "8. O Grupo Privado de Fotos",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "vip_secret",
    categoryLabel: "✨ Acesso VIP",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Gatilho de escassez e exclusividade de grupo VIP que só permite a entrada de quem é seguidor ativo.",
    portugueseScript: `Gente, eu prometi que ia soltar o link do meu grupo privado hoje, mas só quem é seguidor consegue abrir a mensagem. Clica em seguir agora antes que eu apague esse vídeo!`,
    aiVideoPrompt: buildAIPrompt(
      "Beautiful woman talking excitedly to camera in a warm aesthetic bedroom with conspiratorial eyes, holding phone naturally, 9:16 vertical.",
      "Gente, eu prometi que ia soltar o link do meu grupo privado hoje, mas só quem é seguidor consegue abrir a mensagem. Clica em seguir agora antes que eu apague esse vídeo!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Mostrando a tela do celular por um segundo e pedindo o follow urgente.",
  },
  {
    id: "fem-9",
    title: "9. Tô Te Esperando no Direct",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "dm_secret",
    categoryLabel: "💌 Convite Pessoal",
    categoryBadgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/25",
    psychology: "Elimina a barreira de contato colocando a culpa na regra do TikTok ('precisa seguir pro spam não bloquear').",
    portugueseScript: `Oi amor, tô te esperando no direct... mas você precisa me seguir primeiro pro TikTok não mandar minha mensagem pro spam. Clica no maiszinho que já tô te esperando!`,
    aiVideoPrompt: buildAIPrompt(
      "Young attractive woman sitting on a cozy couch holding a ceramic mug, gazing warmly into camera lens, casual chic oversized sweater, natural home atmosphere, 9:16 vertical.",
      "Oi amor, tô te esperando no direct... mas você precisa me seguir primeiro pro TikTok não mandar minha mensagem pro spam. Clica no maiszinho que já tô te esperando!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Sentada no sofá de forma descontraída, olhar carinhoso e direto.",
  },
  {
    id: "fem-10",
    title: "10. A Curiosidade da Madrugada (Stalking)",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "provocative",
    categoryLabel: "🔥 Recompensa nos Posts",
    categoryBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    psychology: "Recompensa direta de validação social: a mulher promete entrar no perfil do homem e curtir as fotos dele.",
    portugueseScript: `Amor, eu não costumo fazer isso, mas hoje eu tô sozinha e se você me seguir agora eu vou entrar no seu perfil e curtir 5 fotos suas! Testa aí pra ver se eu não cumpro.`,
    aiVideoPrompt: buildAIPrompt(
      "Pretty woman laughing softly and pointing playfully at the viewer, cozy modern bedroom background, soft aesthetic warm light, 9:16 vertical.",
      "Amor, eu não costumo fazer isso, mas hoje eu tô sozinha e se você me seguir agora eu vou entrar no seu perfil e curtir 5 fotos suas! Testa aí pra ver se eu não cumpro.",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Rindo de forma charmosa, apontando o dedo para a câmera e desafiando o espectador.",
  },
  {
    id: "fem-11",
    title: "11. A Resposta Que Você Perguntou",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "vip_secret",
    categoryLabel: "🔒 Segredo Desbloqueado",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Cria um falso viés de memória ('aquilo que você me perguntou') que desperta curiosidade irresistível em qualquer homem.",
    portugueseScript: `Sabe aquilo que você me perguntou outro dia? Eu finalmente gravei a resposta que você queria, mas deixei bloqueado só pra seguidores. Me segue aqui pra desbloquear na hora!`,
    aiVideoPrompt: buildAIPrompt(
      "Woman tilting head thoughtfully with a knowing captivating smile, tying her hair up naturally, warm bedroom aesthetic, clean camera recording, 9:16 vertical.",
      "Sabe aquilo que você me perguntou outro dia? Eu finalmente gravei a resposta que você queria, mas deixei bloqueado só pra seguidores. Me segue aqui pra desbloquear na hora!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Prendendo o cabelo com as mãos de forma descontraída enquanto fala olhando nos olhos.",
  },
  {
    id: "fem-12",
    title: "12. O Desafio dos 10 Primeiros",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "provocative",
    categoryLabel: "🔥 Desafio Direto",
    categoryBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    psychology: "Desafio de ego e velocidade: apenas os primeiros a seguir ganham uma foto inédita no privado.",
    portugueseScript: `Duvido você ter coragem de me seguir e mandar um 'oi' na minha DM agora... Os 10 primeiros que seguirem vão receber uma foto inédita minha no privado!`,
    aiVideoPrompt: buildAIPrompt(
      "Confident attractive woman crossing arms playfully with a smirk, direct intense eye contact with the camera lens, modern luxury apartment interior, 9:16 vertical.",
      "Duvido você ter coragem de me seguir e mandar um 'oi' na minha DM agora... Os 10 primeiros que seguirem vão receber uma foto inédita minha no privado!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Postura confiante e desafiadora, incentivando a ação imediata do espectador.",
  },
  {
    id: "fem-13",
    title: "13. O Recado Deitada na Cama",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "voice_note",
    categoryLabel: "🎙️ Deitada na Cama",
    categoryBadgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/25",
    psychology: "Contexto extremamente pessoal e vulnerável (deitada na cama) que converte o homem por conexão emocional rápida.",
    portugueseScript: `Oi amor, tô deitada pensando no que te mandar, mas sua mensagem não abre porque você não me segue ainda. Segue a conta rapidinho pra gente conversar no privado!`,
    aiVideoPrompt: buildAIPrompt(
      "POV shot looking down slightly at a gorgeous woman resting her chin on her hands over a soft white duvet, smiling softly, golden sunset light, 9:16 vertical.",
      "Oi amor, tô deitada pensando no que te mandar, mas sua mensagem não abre porque você não me segue ainda. Segue a conta rapidinho pra gente conversar no privado!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Apoiando o queixo nas mãos sobre o edredom, olhar meigo e voz carinhosa.",
  },
  {
    id: "fem-14",
    title: "14. Esse Vídeo Vai Sumir em 24 Horas",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "vip_secret",
    categoryLabel: "⏳ Tempo Limitado",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Urgência de tempo extremo para não perder o perfil da criadora de vista no algoritmo.",
    portugueseScript: `Esse vídeo vai sumir em 24 horas... Se você quer continuar vendo o que eu posto todos os dias sem filtro nenhum, clica em seguir agora pra não me perder de vista!`,
    aiVideoPrompt: buildAIPrompt(
      "Dynamic attractive woman looking directly into camera with an expressive urgent gaze, walking gently in a cozy chic room, raw camera recording, 9:16 vertical.",
      "Esse vídeo vai sumir em 24 horas... Se você quer continuar vendo o que eu posto todos os dias sem filtro nenhum, clica em seguir agora pra não me perder de vista!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Andando devagar pelo quarto, olhando fixa na câmera enquanto avisa do prazo de 24h.",
  },
  {
    id: "fem-15",
    title: "15. O Escolhido para o Conteúdo VIP",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "dm_secret",
    categoryLabel: "💌 Conteúdo VIP",
    categoryBadgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/25",
    psychology: "Efeito horóscopo/destino: faz o homem se sentir único e com acesso a um link exclusivo bloqueado para os demais.",
    portugueseScript: `Amor, você foi o escolhido pra receber meu conteúdo VIP hoje. Mas a regra do TikTok é clara: clica em seguir aqui do lado que o link privado abre na sua tela agora mesmo!`,
    aiVideoPrompt: buildAIPrompt(
      "Charming woman pointing directly at camera with both hands and smiling enthusiastically, warm aesthetic apartment, natural skin tones, 9:16 vertical.",
      "Amor, você foi o escolhido pra receber meu conteúdo VIP hoje. Mas a regra do TikTok é clara: clica em seguir aqui do lado que o link privado abre na sua tela agora mesmo!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Apontando o dedo indicador para a lente e depois para o botão de follow.",
  },
  {
    id: "fem-16",
    title: "16. A Confissão no Ouvido",
    genderProfile: "female_to_male",
    speakerLabel: "Mulher fala para Homem",
    category: "provocative",
    categoryLabel: "🔥 Confissão Privada",
    categoryBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    psychology: "Quebra de distância: a criadora diz que cansou de só olhar e quer contar algo confidencial.",
    portugueseScript: `Oi lindo, cansei de ficar só olhando você passar pelo meu feed... Me segue aqui agora que eu tenho um segredo pra te contar na DM que ninguém mais sabe!`,
    aiVideoPrompt: buildAIPrompt(
      "Close-up portrait of a gorgeous woman whispering towards the microphone with a seductive warm gaze, soft ambient golden glow, 9:16 vertical.",
      "Oi lindo, cansei de ficar só olhando você passar pelo meu feed... Me segue aqui agora que eu tenho um segredo pra te contar na DM que ninguém mais sabe!",
      "Woman"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Aproximando muito da câmera, falando quase em segredo com olhar sedutor.",
  },
];

const MALE_HOOKS: FollowerHook[] = [
  {
    id: "male-1",
    title: "1. O Segredo na DM (Para Ela)",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "dm_secret",
    categoryLabel: "💌 Desbloqueio na DM",
    categoryBadgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    psychology: "Charme masculino direto e tom de cumplicidade que faz a mulher se sentir notada e desejada na DM.",
    portugueseScript: `Oi linda, separei algo muito especial que você me pediu no direct, mas o TikTok só deixa eu te mandar mensagem se você me seguir primeiro. Clica no botão seguir aqui que já te envio no privado agora mesmo!`,
    aiVideoPrompt: buildAIPrompt(
      "Raw handheld smartphone camera POV video of an attractive handsome 25yo man with charming warm eyes and stubble, speaking intimately to camera inside a modern aesthetic apartment, gentle playful smile, holding phone with one hand, natural vertical 9:16.",
      "Oi linda, separei algo muito especial que você me pediu no direct, mas o TikTok só deixa eu te mandar mensagem se você me seguir primeiro. Clica no botão seguir aqui que já te envio no privado agora mesmo!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "7 segundos",
    visualDirection: "Selfie frontal, sorriso de canto, olhar focado e charmoso diretamente na lente.",
  },
  {
    id: "male-2",
    title: "2. A Foto no Espelho Sem Camisa Oculta",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "private_photo",
    categoryLabel: "📸 Foto Oculta no Perfil",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Curiosidade estética e atração visual, prometendo acesso a fotos exclusivas do perfil apenas para seguidoras.",
    portugueseScript: `Princesa, tirei aquela foto no espelho que você tanto queria ver, mas deixei oculta aqui no perfil só pra quem é minha seguidora. Clica em seguir agora pra você conseguir ver no meu perfil!`,
    aiVideoPrompt: buildAIPrompt(
      "Mirror selfie POV video of an athletic handsome young man wearing a fitted minimalist black t-shirt standing in front of a modern mirror, holding smartphone, warm cozy bedroom lighting, confident attractive gaze, 9:16 vertical.",
      "Princesa, tirei aquela foto no espelho que você tanto queria ver, mas deixei oculta aqui no perfil só pra quem é minha seguidora. Clica em seguir agora pra você conseguir ver no meu perfil!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Segurando o celular no espelho com postura confiante, sorrindo e olhando cúmplice.",
  },
  {
    id: "male-3",
    title: "3. O Áudio da Madrugada (Voz Grave)",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "voice_note",
    categoryLabel: "🎙️ Áudio Íntimo",
    categoryBadgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/25",
    psychology: "Conexão por voz grave e afetuosa antes de dormir, criando intimidade instantânea com o público feminino.",
    portugueseScript: `Oi amor, gravei um áudio de 2 minutos com aquela voz de sono só pra você ouvir antes de dormir, mas a mensagem tá bloqueada até você me seguir. Segue aqui rapidinho que eu já libero o áudio na sua DM!`,
    aiVideoPrompt: buildAIPrompt(
      "Close-up video of a handsome man lying in bed at night, cozy dark room with warm bedside lamp glow, deep gaze towards camera, whispering softly, 9:16 vertical, hyper-realistic.",
      "Oi amor, gravei um áudio de 2 minutos com aquela voz de sono só pra você ouvir antes de dormir, mas a mensagem tá bloqueada até você me seguir. Segue aqui rapidinho que eu já libero o áudio na sua DM!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Deitado na cama de lado, voz calma e grave, olhando com carinho.",
  },
  {
    id: "male-4",
    title: "4. O Vídeo do Treino Sem Corte",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "fitting_room",
    categoryLabel: "💪 Treino Privado",
    categoryBadgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    psychology: "Exclusividade de bastidores e rotina fitness que desperta grande engajamento e curiosidade feminina.",
    portugueseScript: `Linda, eu gravei o vídeo do treino que você me pediu sem corte nenhum, mas deixei privado só pra quem me segue. Clica em seguir que você já consegue assistir agora!`,
    aiVideoPrompt: buildAIPrompt(
      "Fit athletic young man in modern minimalist gym or loft setting, holding towel around neck and drinking water while talking to phone camera, warm golden lighting, charismatic smile, 9:16 vertical.",
      "Linda, eu gravei o vídeo do treino que você me pediu sem corte nenhum, mas deixei privado só pra quem me segue. Clica em seguir que você já consegue assistir agora!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Após o treino, descansando e falando de forma espontânea e atraente.",
  },
  {
    id: "male-5",
    title: "5. A Notificação Que Faltava (Flagra)",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "provocative",
    categoryLabel: "🔥 Provocação Direta",
    categoryBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    psychology: "Provocação de cavalheiro que faz a espectadora sorrir e clicar no follow por brincadeira cúmplice.",
    portugueseScript: `Você sempre assiste meus vídeos até o final e nunca me segue né moça? Hoje eu preparei uma surpresa que só vai aparecer no feed de quem me seguir nos próximos 5 minutos. Não vai perder!`,
    aiVideoPrompt: buildAIPrompt(
      "Charming young man sitting inside a modern car or living room, leaning forward playfully with a smirk and fixing his watch, natural daylight, sharp jawline, 9:16 vertical.",
      "Você sempre assiste meus vídeos até o final e nunca me segue né moça? Hoje eu preparei uma surpresa que só vai aparecer no feed de quem me seguir nos próximos 5 minutos. Não vai perder!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Inclinando-se para frente, ajeitando o relógio ou o cabelo com sorriso provocante.",
  },
  {
    id: "male-6",
    title: "6. A Resposta no Direct com Vídeo",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "dm_secret",
    categoryLabel: "💌 Resposta com Vídeo",
    categoryBadgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    psychology: "Gatilho de reciprocidade: promessa de mandar um vídeo personalizado respondendo a mensagem dela.",
    portugueseScript: `Oi linda, eu vi que você curtiu meu último vídeo... Se você me seguir agora e mandar um coração na minha DM, eu vou te responder com um vídeo exclusivo só seu!`,
    aiVideoPrompt: buildAIPrompt(
      "Handsome man holding smartphone, winking subtly with a warm captivating grin, standing on an urban balcony at golden hour sunset, clean camera recording, 9:16 vertical.",
      "Oi linda, eu vi que você curtiu meu último vídeo... Se você me seguir agora e mandar um coração na minha DM, eu vou te responder com um vídeo exclusivo só seu!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Piscadinha de canto e sorriso aberto no pôr do sol.",
  },
  {
    id: "male-7",
    title: "7. A Parte 2 Proibida Trancada",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "vip_secret",
    categoryLabel: "🔒 Parte 2 Exclusiva",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Corta a narrativa no momento de maior suspense e tensão romântica, forçando o follow para assistir.",
    portugueseScript: `Princesa, a parte 2 desse vídeo ficou tão quente que a plataforma quase derrubou... então deixei trancada só pra seguidoras. Clica no botão seguir aqui do lado pra ver o final!`,
    aiVideoPrompt: buildAIPrompt(
      "Cinematic portrait video of a stylish man whispering close to the phone microphone with an intense seductive look, soft mood lighting, 9:16 vertical.",
      "Princesa, a parte 2 desse vídeo ficou tão quente que a plataforma quase derrubou... então deixei trancada só pra seguidoras. Clica no botão seguir aqui do lado pra ver o final!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Aproximando a boca do microfone em tom de sussurro charmoso.",
  },
  {
    id: "male-8",
    title: "8. O Grupo VIP no WhatsApp / Direct",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "vip_secret",
    categoryLabel: "✨ Acesso VIP",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Sensação de clube seleto onde ele conversa e posta fotos diárias apenas para seguidoras fiéis.",
    portugueseScript: `Meninas, eu prometi que ia soltar o link do meu grupo privado hoje, mas só quem é seguidora consegue abrir a mensagem. Clica em seguir agora antes que eu apague esse vídeo!`,
    aiVideoPrompt: buildAIPrompt(
      "Young man smiling enthusiastically looking at camera lens, cozy modern loft interior, natural daylight, 9:16 vertical.",
      "Meninas, eu prometi que ia soltar o link do meu grupo privado hoje, mas só quem é seguidora consegue abrir a mensagem. Clica em seguir agora antes que eu apague esse vídeo!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Mostrando a tela do celular por um instante e convidando com urgência.",
  },
  {
    id: "male-9",
    title: "9. Tô Te Esperando no Direct",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "dm_secret",
    categoryLabel: "💌 Convite Pessoal",
    categoryBadgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    psychology: "Transfere a culpa técnica para o app ('precisa seguir pro spam não bloquear'), gerando ação imediata.",
    portugueseScript: `Oi amor, tô te esperando no direct... mas você precisa me seguir primeiro pro TikTok não mandar minha mensagem pro spam. Clica no maiszinho que já tô te esperando!`,
    aiVideoPrompt: buildAIPrompt(
      "Attractive man sitting on leather couch holding coffee mug, making direct soft eye contact with camera, relaxed morning domestic vibe, 9:16 vertical.",
      "Oi amor, tô te esperando no direct... mas você precisa me seguir primeiro pro TikTok não mandar minha mensagem pro spam. Clica no maiszinho que já tô te esperando!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Segurando uma caneca de café no sofá, olhar direto e aconchegante.",
  },
  {
    id: "male-10",
    title: "10. A Curiosidade da Madrugada (Stalking)",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "provocative",
    categoryLabel: "🔥 Recompensa nos Posts",
    categoryBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    psychology: "Validação direta: promessa de que ele vai olhar o perfil dela e curtir fotos caso ela o siga.",
    portugueseScript: `Linda, eu não costumo fazer isso, mas hoje eu tô sozinho e se você me seguir agora eu vou entrar no seu perfil e curtir 5 fotos suas! Testa aí pra ver se eu não cumpro.`,
    aiVideoPrompt: buildAIPrompt(
      "Playful handsome guy pointing finger smoothly toward camera lens and chuckling with charm, cozy bedroom, soft ambient light, 9:16 vertical.",
      "Linda, eu não costumo fazer isso, mas hoje eu tô sozinho e se você me seguir agora eu vou entrar no seu perfil e curtir 5 fotos suas! Testa aí pra ver se eu não cumpro.",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Apontando o dedo com sorriso confiante e tom descontraído.",
  },
  {
    id: "male-11",
    title: "11. A Resposta Que Você Perguntou",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "vip_secret",
    categoryLabel: "🔒 Segredo Desbloqueado",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Gatilho de curiosidade irresistível fazendo parecer que ele está respondendo a uma pergunta íntima dela.",
    portugueseScript: `Sabe aquilo que você me perguntou outro dia? Eu finalmente gravei a resposta que você queria, mas deixei bloqueado só pra seguidoras. Me segue aqui pra desbloquear na hora!`,
    aiVideoPrompt: buildAIPrompt(
      "Charming man scratching beard thoughtfully and smiling knowingly into camera lens, modern apartment hallway, warm ambient lighting, 9:16 vertical.",
      "Sabe aquilo que você me perguntou outro dia? Eu finalmente gravei a resposta que você queria, mas deixei bloqueado só pra seguidoras. Me segue aqui pra desbloquear na hora!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Passando a mão no queixo ou barba com sorriso de quem guarda um segredo.",
  },
  {
    id: "male-12",
    title: "12. O Desafio das 10 Primeiras",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "provocative",
    categoryLabel: "🔥 Desafio Direto",
    categoryBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    psychology: "Desafio de atitude: ele instiga a espectadora a ter iniciativa e mandar mensagem na DM.",
    portugueseScript: `Duvido você ter coragem de me seguir e mandar um 'oi' na minha DM agora... As 10 primeiras que seguirem vão receber uma foto inédita minha no privado!`,
    aiVideoPrompt: buildAIPrompt(
      "Confident young man crossing arms with an attractive challenge smirk, looking deeply into camera lens, stylish casual hoodie, 9:16 vertical.",
      "Duvido você ter coragem de me seguir e mandar um 'oi' na minha DM agora... As 10 primeiras que seguirem vão receber uma foto inédita minha no privado!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Braços cruzados, olhar provocante e postura de desafio.",
  },
  {
    id: "male-13",
    title: "13. O Recado Deitado na Cama",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "voice_note",
    categoryLabel: "🎙️ Deitado na Cama",
    categoryBadgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/25",
    psychology: "Cenário de relaxamento na cama que humaniza o criador e gera conexão emocional direta.",
    portugueseScript: `Oi linda, tô deitado aqui pensando no que te mandar, mas sua mensagem não abre porque você não me segue ainda. Segue a conta rapidinho pra gente conversar no privado!`,
    aiVideoPrompt: buildAIPrompt(
      "POV video of a handsome man resting head on white pillow in bed, smiling gently with relaxed eyes towards camera, soft ambient room glow, 9:16 vertical.",
      "Oi linda, tô deitado aqui pensando no que te mandar, mas sua mensagem não abre porque você não me segue ainda. Segue a conta rapidinho pra gente conversar no privado!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Com a cabeça no travesseiro, sorriso doce e voz tranquila.",
  },
  {
    id: "male-14",
    title: "14. Esse Vídeo Vai Sumir em 24 Horas",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "vip_secret",
    categoryLabel: "⏳ Tempo Limitado",
    categoryBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    psychology: "Gatilho de urgência para não perder as postagens dele no algoritmo do TikTok.",
    portugueseScript: `Esse vídeo vai sumir em 24 horas... Se você quer continuar vendo o que eu posto todos os dias sem filtro nenhum, clica em seguir agora pra não me perder de vista!`,
    aiVideoPrompt: buildAIPrompt(
      "Man walking slowly through a stylish apartment looking directly into camera with an urgent earnest expression, warm interior design, pure camera recording, 9:16 vertical.",
      "Esse vídeo vai sumir em 24 horas... Se você quer continuar vendo o que eu posto todos os dias sem filtro nenhum, clica em seguir agora pra não me perder de vista!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Caminhando devagar enquanto olha com seriedade e charme.",
  },
  {
    id: "male-15",
    title: "15. A Escolhida para o Conteúdo VIP",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "dm_secret",
    categoryLabel: "💌 Conteúdo VIP",
    categoryBadgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    psychology: "Elogio e personalização: faz a espectadora se sentir única e com acesso a algo especial.",
    portugueseScript: `Princesa, você foi a escolhida pra receber meu conteúdo VIP hoje. Mas a regra do TikTok é clara: clica em seguir aqui do lado que o link privado abre na sua tela agora mesmo!`,
    aiVideoPrompt: buildAIPrompt(
      "Handsome athletic man pointing directly at camera with a warm engaging smile, bright aesthetic apartment, natural skin texture, 9:16 vertical.",
      "Princesa, você foi a escolhida pra receber meu conteúdo VIP hoje. Mas a regra do TikTok é clara: clica em seguir aqui do lado que o link privado abre na sua tela agora mesmo!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Apontando o dedo para a tela com sorriso cativante.",
  },
  {
    id: "male-16",
    title: "16. A Confissão no Ouvido",
    genderProfile: "male_to_female",
    speakerLabel: "Homem fala para Mulher",
    category: "provocative",
    categoryLabel: "🔥 Confissão Privada",
    categoryBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    psychology: "Proximidade extrema de áudio sussurrado que cria intimidade instantânea e gera clique no follow.",
    portugueseScript: `Oi linda, cansei de ficar só olhando você passar pelo meu feed... Me segue aqui agora que eu tenho um segredo pra te contar na DM que ninguém mais sabe!`,
    aiVideoPrompt: buildAIPrompt(
      "Close-up portrait video of a handsome man whispering near phone microphone, soft cinematic lighting, captivating deep gaze, 9:16 vertical.",
      "Oi linda, cansei de ficar só olhando você passar pelo meu feed... Me segue aqui agora que eu tenho um segredo pra te contar na DM que ninguém mais sabe!",
      "Man"
    ),
    negativePrompt: ULTRA_CLEAN_NEGATIVE_PROMPT,
    durationEstimate: "8 segundos",
    visualDirection: "Falando bem perto do microfone com olhar penetrante.",
  },
];

function FollowerGrowthPage() {
  const [activeGender, setActiveGender] = useState<"female" | "male">("female");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const currentList = activeGender === "female" ? FEMALE_HOOKS : MALE_HOOKS;

  const filtered = currentList.filter((hook) => {
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
    toast.success("Prompt completo de vídeo IA copiado (Sem UI/Texto/Logos)!");
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <header className="rounded-2xl border border-white/[0.08] bg-[#0E1017] p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative z-10 max-w-3xl space-y-2.5">
            <div className="flex items-center gap-2">
              <Badge className="border-pink-500/30 bg-pink-500/10 text-pink-400 font-bold px-2.5 py-0.5 text-xs">
                <Flame className="mr-1.5 size-3.5 fill-pink-500 text-pink-400" /> Roteiros Quentes de Follow Imediato
              </Badge>
              <span className="text-xs text-[#666A78]">32 Prompts (Feminino & Masculino)</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl text-[#F7F7FB]">
              Roteiros para Upar Conta & Ganhar Seguidores
            </h1>
            <p className="text-xs leading-relaxed text-[#A3A6B3]">
              Ganchos irresistíveis com <strong>instruções anti-poluição visual</strong>: sem ícone de aplicativo, sem texto "follow", sem carrinho e sem overlays. Câmera 100% limpa e realista.
            </p>

            <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium">
              <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1 border border-white/[0.06] text-pink-300">
                <Heart className="size-3.5 text-pink-400" /> 16 Prompts Mulher fala para Homem
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1 border border-white/[0.06] text-blue-300">
                <User className="size-3.5 text-blue-400" /> 16 Prompts Homem fala para Mulher
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1 border border-white/[0.06] text-amber-300">
                <Ban className="size-3.5 text-amber-400" /> Anti-Texto & Anti-Ícones Ativado
              </span>
            </div>
          </div>

          {/* Gender Selector Switcher */}
          <div className="flex items-center gap-2 rounded-xl bg-[#11131E] border border-white/[0.08] p-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveGender("female");
                setSelectedCategory("all");
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
                activeGender === "female"
                  ? "bg-pink-500 text-white shadow-md shadow-pink-500/20"
                  : "text-[#A3A6B3] hover:text-white"
              }`}
            >
              👩 Modelo Feminino (16)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveGender("male");
                setSelectedCategory("all");
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
                activeGender === "male"
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                  : "text-[#A3A6B3] hover:text-white"
              }`}
            >
              👨 Modelo Masculino (16)
            </button>
          </div>
        </div>
      </header>

      {/* Warning / Clean Screen Notice */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3.5 flex items-center gap-3 text-xs text-amber-200">
        <ShieldCheck className="size-5 text-amber-400 shrink-0" />
        <div>
          <strong className="text-amber-300">Garantia de Tela Limpa (Anti-Artefatos):</strong>
          <span className="text-[#A3A6B3] ml-1">
            Todos os prompts foram recalibrados com exclusão estrita de palavras-chave literais. A IA de vídeo gerará apenas a pessoa real falando na câmera, sem botões de seguir, sem texto na tela e sem logotipo do TikTok.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#666A78]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Buscar roteiros (${activeGender === "female" ? "Mulher -> Homem" : "Homem -> Mulher"})...`}
            className="pl-10 h-9 border-white/[0.08] bg-[#0E1017] text-xs text-[#F7F7FB]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all", label: "Todos (16)" },
            { id: "dm_secret", label: "💌 Desbloqueio na DM" },
            { id: "private_photo", label: "📸 Foto Oculta" },
            { id: "voice_note", label: "🎙️ Áudio Íntimo" },
            { id: "fitting_room", label: activeGender === "female" ? "👗 Provador" : "💪 Treino Privado" },
            { id: "vip_secret", label: "🔒 Segredo VIP" },
            { id: "provocative", label: "🔥 Provocação Direta" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? activeGender === "female"
                    ? "bg-pink-500 text-white font-bold shadow-md shadow-pink-500/20"
                    : "bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20"
                  : "border border-white/[0.08] bg-[#0E1017] text-[#A3A6B3] hover:text-[#F7F7FB] hover:border-white/15"
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
            className={`group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0E1017] p-4.5 shadow-xl transition-all ${
              activeGender === "female"
                ? "hover:border-pink-500/35 hover:bg-pink-500/[0.01]"
                : "hover:border-blue-500/35 hover:bg-blue-500/[0.01]"
            }`}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <Badge className={`border text-[10px] font-bold ${hook.categoryBadgeColor}`}>
                  {hook.categoryLabel}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    activeGender === "female" ? "bg-pink-500/10 text-pink-300 border-pink-500/20" : "bg-blue-500/10 text-blue-300 border-blue-500/20"
                  }`}>
                    {hook.speakerLabel}
                  </span>
                  <span className="text-[10px] font-mono text-[#666A78]">{hook.durationEstimate}</span>
                </div>
              </div>

              <h2 className={`text-sm font-bold text-[#F7F7FB] transition-colors ${
                activeGender === "female" ? "group-hover:text-pink-300" : "group-hover:text-blue-300"
              }`}>
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

              {/* Portuguese Script (Fala do Criador) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    activeGender === "female" ? "text-pink-400" : "text-blue-400"
                  }`}>
                    <MessageSquare className="size-3" /> {hook.speakerLabel} (PT-BR):
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyScript(hook)}
                    className={`text-[10px] text-[#A3A6B3] flex items-center gap-1 font-medium transition ${
                      activeGender === "female" ? "hover:text-pink-300" : "hover:text-blue-300"
                    }`}
                  >
                    {copiedId === hook.id ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                    {copiedId === hook.id ? "Copiado!" : "Copiar Fala"}
                  </button>
                </div>
                <div className={`rounded-xl border p-3 text-xs leading-relaxed text-[#F7F7FB] font-medium italic ${
                  activeGender === "female"
                    ? "border-pink-500/20 bg-pink-500/[0.04]"
                    : "border-blue-500/20 bg-blue-500/[0.04]"
                }`}>
                  "{hook.portugueseScript}"
                </div>
              </div>

              {/* English Video Prompt + Dialogue PTBR + Negative Prompts */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B7CFF] flex items-center gap-1">
                    <Sparkles className="size-3" /> Prompt IA Completo (Tela Limpa):
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
                <div className="rounded-xl border border-white/[0.05] bg-black/60 p-2.5 text-[11px] leading-relaxed text-[#A3A6B3] font-mono space-y-1.5 max-h-32 overflow-y-auto">
                  <p className="text-white/90">{hook.aiVideoPrompt.split("\n\n")[0]}</p>
                  <p className={`font-semibold ${activeGender === "female" ? "text-pink-300/90" : "text-blue-300/90"}`}>
                    {hook.aiVideoPrompt.split("\n\n")[1]}
                  </p>
                  <p className="text-amber-400/80 text-[10px]">{hook.aiVideoPrompt.split("\n\n")[2]}</p>
                </div>
              </div>

              {/* Negative Prompt Badge */}
              <div className="rounded-lg bg-amber-500/[0.04] border border-amber-500/20 px-2.5 py-1 text-[10px] text-amber-300/90 flex items-center gap-1.5">
                <Ban className="size-3 text-amber-400 shrink-0" />
                <span className="truncate">Sem logo do TikTok, sem botões de follow, sem textos.</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold flex-1 border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-[#A3A6B3] hover:text-white"
                onClick={() => handleCopyPrompt(hook)}
              >
                <Copy className="size-3.5 mr-1 text-[#9B7CFF]" /> Copiar Prompt IA
              </Button>
              <Button
                size="sm"
                className={`h-8 text-xs font-bold text-[#07080D] flex-1 shadow-md ${
                  activeGender === "female"
                    ? "bg-[#9B7CFF] hover:bg-[#AA92FF] shadow-[#9B7CFF]/15"
                    : "bg-blue-400 hover:bg-blue-300 shadow-blue-400/15"
                }`}
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

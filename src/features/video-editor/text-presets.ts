import type { EditorTextOverlay } from "@/features/video-editor/engine";
import type {
  TextAnimationPresetId,
  TextLoopAnimationPresetId,
} from "@/features/video-editor/presets";

export type TextPresetCategory = "questions" | "promotion" | "social" | "minimal" | "captions";

export type TextPresetStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  backgroundColor: string;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  rotation: number;
  letterSpacing: number;
  textTransform: "none" | "uppercase" | "lowercase";
  borderRadius: number;
};

export type TextPresetDecoration = {
  type: "sparkle" | "star" | "dot" | "bolt";
  color: string;
  x: number;
  y: number;
  size: number;
  rotation?: number;
};

export type TextPreset = {
  id: string;
  name: string;
  category: TextPresetCategory;
  tags: string[];
  previewText: string;
  previewDurationMs: number;
  style: TextPresetStyle;
  decorations?: TextPresetDecoration[];
  animation: {
    entrance: TextAnimationPresetId;
    loop?: TextLoopAnimationPresetId;
    exit: TextAnimationPresetId;
  };
};

const baseStyle: TextPresetStyle = {
  fontFamily: "Arial Black, Montserrat, Arial, sans-serif",
  fontSize: 54,
  fontWeight: 900,
  color: "#ffffff",
  backgroundColor: "transparent",
  strokeColor: "#111827",
  strokeWidth: 4,
  shadowColor: "rgba(0,0,0,.7)",
  shadowBlur: 2,
  shadowOffsetX: 3,
  shadowOffsetY: 4,
  rotation: 0,
  letterSpacing: 0,
  textTransform: "uppercase",
  borderRadius: 14,
};

function preset(
  value: Omit<TextPreset, "previewDurationMs" | "style"> & {
    style: Partial<TextPresetStyle>;
    previewDurationMs?: number;
  },
): TextPreset {
  return {
    ...value,
    previewDurationMs: value.previewDurationMs ?? 900,
    style: { ...baseStyle, ...value.style },
  };
}

export const textPresets: TextPreset[] = [
  preset({
    id: "question-pink-pop",
    name: "Pergunta Rosa Pop",
    category: "questions",
    tags: ["pergunta", "rosa", "viral"],
    previewText: "SERÁ QUE É BOM?",
    style: {
      color: "#ff4da6",
      backgroundColor: "#fff7fb",
      strokeColor: "#ffffff",
      strokeWidth: 7,
      shadowColor: "#74133f",
      shadowOffsetX: 5,
      shadowOffsetY: 7,
      rotation: -2,
      borderRadius: 28,
    },
    decorations: [
      { type: "sparkle", color: "#ffe45c", x: 8, y: 18, size: 16 },
      { type: "star", color: "#ff4da6", x: 88, y: 74, size: 14, rotation: 14 },
    ],
    animation: { entrance: "pop", loop: "breathe", exit: "fade" },
  }),
  preset({
    id: "question-yellow",
    name: "Pergunta Amarela",
    category: "questions",
    tags: ["pergunta", "amarelo", "review"],
    previewText: "VALE A PENA?",
    style: {
      color: "#111111",
      backgroundColor: "#ffd928",
      strokeWidth: 0,
      rotation: -4,
      letterSpacing: -1,
      borderRadius: 7,
      shadowOffsetX: 7,
      shadowOffsetY: 7,
    },
    animation: { entrance: "bounce", exit: "slide-left" },
  }),
  preset({
    id: "did-you-know",
    name: "Você Sabia?",
    category: "questions",
    tags: ["curiosidade", "gancho"],
    previewText: "VOCÊ SABIA?",
    style: {
      color: "#ffffff",
      strokeColor: "#09090b",
      strokeWidth: 6,
      shadowColor: "#22d3ee",
      shadowOffsetX: 6,
      shadowOffsetY: 6,
      rotation: 1,
    },
    decorations: [{ type: "dot", color: "#22d3ee", x: 90, y: 13, size: 18 }],
    animation: { entrance: "zoom", exit: "fade" },
  }),
  preset({
    id: "quick-question",
    name: "Pergunta Rápida",
    category: "questions",
    tags: ["pergunta", "rápido"],
    previewText: "ME RESPONDE ISSO",
    style: {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: 45,
      color: "#0f172a",
      backgroundColor: "#a7f3d0",
      strokeWidth: 0,
      borderRadius: 999,
      letterSpacing: 1,
      rotation: 2,
    },
    animation: { entrance: "slide-up", exit: "fade" },
  }),
  preset({
    id: "last-units",
    name: "Últimas Unidades",
    category: "promotion",
    tags: ["urgência", "estoque", "venda"],
    previewText: "ÚLTIMAS UNIDADES",
    style: {
      color: "#ffffff",
      backgroundColor: "#e11d48",
      strokeColor: "#7f1d1d",
      strokeWidth: 3,
      shadowColor: "#450a0a",
      shadowOffsetY: 8,
      borderRadius: 5,
      letterSpacing: 1,
    },
    decorations: [{ type: "bolt", color: "#fef08a", x: 91, y: 15, size: 17 }],
    animation: { entrance: "shake", loop: "pulse", exit: "zoom" },
  }),
  preset({
    id: "flash-sale",
    name: "Oferta Relâmpago",
    category: "promotion",
    tags: ["oferta", "relâmpago", "desconto"],
    previewText: "OFERTA RELÂMPAGO",
    style: {
      color: "#111827",
      backgroundColor: "#fde047",
      strokeColor: "#ffffff",
      strokeWidth: 3,
      shadowColor: "#f97316",
      shadowOffsetX: 7,
      shadowOffsetY: 7,
      rotation: -3,
      borderRadius: 18,
    },
    decorations: [
      { type: "bolt", color: "#f97316", x: 4, y: 20, size: 18, rotation: -12 },
      { type: "bolt", color: "#f97316", x: 91, y: 68, size: 16, rotation: 12 },
    ],
    animation: { entrance: "pop", exit: "shake" },
  }),
  preset({
    id: "cheap-find",
    name: "Baratinho",
    category: "promotion",
    tags: ["barato", "achadinho", "preço"],
    previewText: "BARATINHO",
    style: {
      fontFamily: "Impact, Arial Black, sans-serif",
      fontSize: 66,
      color: "#fef3c7",
      backgroundColor: "#7c3aed",
      strokeColor: "#4c1d95",
      strokeWidth: 5,
      shadowColor: "#22d3ee",
      shadowOffsetX: 6,
      shadowOffsetY: 6,
      rotation: 3,
      borderRadius: 999,
    },
    animation: { entrance: "bounce", exit: "zoom" },
  }),
  preset({
    id: "special-discount",
    name: "Desconto Especial",
    category: "promotion",
    tags: ["desconto", "cupom"],
    previewText: "-40% HOJE",
    style: {
      fontFamily: "Georgia, serif",
      color: "#ffffff",
      backgroundColor: "#0f766e",
      strokeColor: "#042f2e",
      strokeWidth: 2,
      shadowOffsetX: 0,
      shadowOffsetY: 9,
      letterSpacing: 2,
      borderRadius: 10,
    },
    animation: { entrance: "zoom", exit: "fade" },
  }),
  preset({
    id: "tiktok-shop-buy",
    name: "Comprei no TikTok Shop",
    category: "promotion",
    tags: ["tiktok shop", "compra", "produto"],
    previewText: "COMPREI NO SHOP",
    style: {
      color: "#ffffff",
      backgroundColor: "#111827",
      strokeColor: "#25f4ee",
      strokeWidth: 4,
      shadowColor: "#fe2c55",
      shadowOffsetX: 7,
      shadowOffsetY: 5,
      rotation: -1,
      borderRadius: 16,
    },
    animation: { entrance: "slide-left", exit: "slide-up" },
  }),
  preset({
    id: "free-shipping",
    name: "Frete Grátis",
    category: "promotion",
    tags: ["frete", "grátis", "benefício"],
    previewText: "FRETE GRÁTIS",
    style: {
      fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
      color: "#052e16",
      backgroundColor: "#86efac",
      strokeColor: "#ffffff",
      strokeWidth: 3,
      shadowColor: "#16a34a",
      shadowOffsetY: 7,
      borderRadius: 999,
    },
    animation: { entrance: "slide-up", exit: "fade" },
  }),
  preset({
    id: "my-opinion",
    name: "Minha Opinião",
    category: "social",
    tags: ["opinião", "review", "depoimento"],
    previewText: "MINHA OPINIÃO",
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 48,
      fontWeight: 700,
      color: "#f8fafc",
      backgroundColor: "rgba(15,23,42,.82)",
      strokeWidth: 0,
      shadowBlur: 12,
      shadowOffsetX: 0,
      shadowOffsetY: 3,
      textTransform: "none",
      borderRadius: 12,
    },
    animation: { entrance: "fade", exit: "fade" },
  }),
  preset({
    id: "tested-for-you",
    name: "Testei Para Você",
    category: "social",
    tags: ["teste", "review"],
    previewText: "TESTEI PRA VOCÊ",
    style: {
      color: "#1e1b4b",
      backgroundColor: "#c4b5fd",
      strokeColor: "#ffffff",
      strokeWidth: 4,
      rotation: -2,
      borderRadius: 24,
      shadowColor: "#6d28d9",
      shadowOffsetY: 7,
    },
    decorations: [{ type: "sparkle", color: "#ffffff", x: 89, y: 15, size: 15 }],
    animation: { entrance: "pop", exit: "fade" },
  }),
  preset({
    id: "before-after",
    name: "Antes e Depois",
    category: "social",
    tags: ["antes", "depois", "transformação"],
    previewText: "ANTES → DEPOIS",
    style: {
      fontFamily: "Impact, Arial Black, sans-serif",
      color: "#ffffff",
      backgroundColor: "linear-gradient(90deg,#ef4444,#22c55e)",
      strokeColor: "#111827",
      strokeWidth: 5,
      letterSpacing: 1,
      borderRadius: 8,
    },
    animation: { entrance: "slide-left", exit: "slide-left" },
  }),
  preset({
    id: "worth-it",
    name: "Vale a Pena?",
    category: "social",
    tags: ["review", "compra", "pergunta"],
    previewText: "VALE A PENA?",
    style: {
      color: "#ffffff",
      backgroundColor: "#2563eb",
      strokeColor: "#172554",
      strokeWidth: 4,
      shadowColor: "#60a5fa",
      shadowOffsetX: -6,
      shadowOffsetY: 6,
      rotation: 2,
      borderRadius: 15,
    },
    animation: { entrance: "bounce", exit: "fade" },
  }),
  preset({
    id: "viral-product",
    name: "Produto Viral",
    category: "social",
    tags: ["viral", "produto", "trend"],
    previewText: "PRODUTO VIRAL",
    style: {
      fontFamily: "Impact, Arial Black, sans-serif",
      fontSize: 62,
      color: "#ffffff",
      backgroundColor: "#ec4899",
      strokeColor: "#831843",
      strokeWidth: 5,
      shadowColor: "#facc15",
      shadowOffsetX: 7,
      shadowOffsetY: 7,
      rotation: -3,
      borderRadius: 6,
    },
    decorations: [
      { type: "star", color: "#facc15", x: 6, y: 15, size: 18 },
      { type: "sparkle", color: "#ffffff", x: 91, y: 70, size: 14 },
    ],
    animation: { entrance: "zoom", exit: "shake" },
  }),
  preset({
    id: "everyone-buying",
    name: "Todo Mundo Está Comprando",
    category: "social",
    tags: ["prova social", "viral", "compra"],
    previewText: "TODO MUNDO QUER",
    style: {
      fontFamily: "Arial Narrow, Arial, sans-serif",
      fontSize: 46,
      color: "#111827",
      backgroundColor: "#f8fafc",
      strokeColor: "#f97316",
      strokeWidth: 2,
      shadowColor: "#fb923c",
      shadowOffsetY: 8,
      letterSpacing: 2,
      borderRadius: 2,
    },
    animation: { entrance: "slide-up", exit: "zoom" },
  }),
  preset({
    id: "minimal-white",
    name: "Título Branco",
    category: "minimal",
    tags: ["branco", "limpo", "minimalista"],
    previewText: "NOVIDADE",
    style: {
      fontFamily: "Helvetica Neue, Arial, sans-serif",
      fontSize: 45,
      fontWeight: 700,
      color: "#ffffff",
      strokeWidth: 0,
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      letterSpacing: 4,
    },
    animation: { entrance: "fade", exit: "fade" },
  }),
  preset({
    id: "minimal-black",
    name: "Título Preto",
    category: "minimal",
    tags: ["preto", "editorial", "minimalista"],
    previewText: "ESSENCIAL",
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 43,
      fontWeight: 600,
      color: "#111111",
      backgroundColor: "rgba(255,255,255,.9)",
      strokeWidth: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      textTransform: "none",
      letterSpacing: 2,
      borderRadius: 0,
    },
    animation: { entrance: "slide-up", exit: "fade" },
  }),
  preset({
    id: "minimal-band",
    name: "Fundo em Faixa",
    category: "minimal",
    tags: ["faixa", "clean"],
    previewText: "DESTAQUE",
    style: {
      fontFamily: "Arial, sans-serif",
      fontSize: 44,
      color: "#ffffff",
      backgroundColor: "#0f172a",
      strokeWidth: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      letterSpacing: 3,
      borderRadius: 0,
    },
    animation: { entrance: "slide-left", exit: "slide-left" },
  }),
  preset({
    id: "minimal-glass",
    name: "Caixa Transparente",
    category: "minimal",
    tags: ["vidro", "transparente", "clean"],
    previewText: "MINHA ROTINA",
    style: {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: 42,
      fontWeight: 700,
      color: "#ffffff",
      backgroundColor: "rgba(15,23,42,.42)",
      strokeColor: "rgba(255,255,255,.65)",
      strokeWidth: 1,
      shadowBlur: 16,
      shadowOffsetX: 0,
      shadowOffsetY: 3,
      textTransform: "none",
      borderRadius: 18,
    },
    animation: { entrance: "zoom", exit: "fade" },
  }),
  preset({
    id: "editorial-title",
    name: "Título Editorial",
    category: "minimal",
    tags: ["editorial", "elegante"],
    previewText: "A NOVA ESCOLHA",
    style: {
      fontFamily: "Times New Roman, Georgia, serif",
      fontSize: 47,
      fontWeight: 700,
      color: "#f5f5f4",
      strokeWidth: 0,
      shadowColor: "rgba(0,0,0,.85)",
      shadowBlur: 8,
      shadowOffsetX: 0,
      shadowOffsetY: 3,
      textTransform: "none",
      letterSpacing: 1,
    },
    animation: { entrance: "fade", loop: "float", exit: "slide-up" },
  }),
  preset({
    id: "caption-highlight",
    name: "Palavra Destacada",
    category: "captions",
    tags: ["legenda", "destaque", "palavra"],
    previewText: "VOCÊ PRECISA VER",
    style: {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: 42,
      color: "#facc15",
      backgroundColor: "rgba(0,0,0,.72)",
      strokeColor: "#111111",
      strokeWidth: 4,
      shadowOffsetX: 0,
      shadowOffsetY: 3,
      borderRadius: 8,
    },
    animation: { entrance: "pop", exit: "fade" },
  }),
  preset({
    id: "caption-karaoke",
    name: "Legenda Karaokê",
    category: "captions",
    tags: ["legenda", "karaokê", "fala"],
    previewText: "OLHA SÓ ISSO",
    style: {
      fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
      fontSize: 44,
      color: "#ffffff",
      backgroundColor: "transparent",
      strokeColor: "#111827",
      strokeWidth: 6,
      shadowColor: "#22d3ee",
      shadowOffsetX: 4,
      shadowOffsetY: 5,
      borderRadius: 0,
    },
    animation: { entrance: "bounce", loop: "bounce-soft", exit: "fade" },
  }),
  preset({
    id: "caption-background",
    name: "Legenda com Fundo",
    category: "captions",
    tags: ["legenda", "fundo", "acessível"],
    previewText: "PRESTA ATENÇÃO",
    style: {
      fontFamily: "Verdana, Arial, sans-serif",
      fontSize: 39,
      fontWeight: 800,
      color: "#ffffff",
      backgroundColor: "rgba(0,0,0,.84)",
      strokeWidth: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      textTransform: "none",
      borderRadius: 10,
    },
    animation: { entrance: "slide-up", exit: "slide-up" },
  }),
  preset({
    id: "caption-word-by-word",
    name: "Legenda Palavra por Palavra",
    category: "captions",
    tags: ["legenda", "palavra", "dinâmica"],
    previewText: "NÃO PULA ESSE VÍDEO",
    style: {
      fontFamily: "Impact, Arial Black, sans-serif",
      fontSize: 48,
      color: "#ffffff",
      backgroundColor: "#7c3aed",
      strokeColor: "#2e1065",
      strokeWidth: 4,
      shadowColor: "#f0abfc",
      shadowOffsetX: 5,
      shadowOffsetY: 5,
      rotation: -1,
      borderRadius: 12,
    },
    animation: { entrance: "pop", exit: "zoom" },
  }),
];

export const textPresetCategories: Array<{
  id: "all" | TextPresetCategory | "favorites";
  label: string;
}> = [
  { id: "all", label: "Todos" },
  { id: "promotion", label: "Promoção" },
  { id: "social", label: "Social" },
  { id: "questions", label: "Perguntas" },
  { id: "minimal", label: "Minimalista" },
  { id: "captions", label: "Legendas" },
  { id: "favorites", label: "Favoritos" },
];

export function presetStyleToOverlay(
  presetValue: TextPreset,
): Pick<
  EditorTextOverlay,
  | "presetId"
  | "fontFamily"
  | "fontSize"
  | "fontWeight"
  | "color"
  | "backgroundColor"
  | "strokeColor"
  | "strokeWidth"
  | "shadowColor"
  | "shadowBlur"
  | "shadowOffsetX"
  | "shadowOffsetY"
  | "rotation"
  | "letterSpacing"
  | "textTransform"
  | "borderRadius"
  | "decorations"
  | "animationIn"
  | "animationLoop"
  | "animationOut"
> {
  return {
    presetId: presetValue.id,
    ...presetValue.style,
    decorations: presetValue.decorations ?? [],
    animationIn: presetValue.animation.entrance,
    animationLoop: presetValue.animation.loop ?? "none",
    animationOut: presetValue.animation.exit,
  };
}

export function getTextPreset(id: string | undefined) {
  return textPresets.find((item) => item.id === id);
}

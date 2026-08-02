export type TextAnimationPresetId =
  "none" | "fade" | "pop" | "bounce" | "slide-up" | "slide-left" | "shake" | "zoom";

export type TextLoopAnimationPresetId =
  | "none"
  | "float"
  | "pulse"
  | "breathe"
  | "shake"
  | "swing"
  | "blink"
  | "bounce-soft"
  | "slow-zoom";

export type AnimationKeyframe = {
  time: number;
  opacity: number;
  scale: number;
  x: number;
  y: number;
  rotate: number;
};

export type TextAnimationPreset = {
  id: TextAnimationPresetId;
  name: string;
  category: "basic" | "tiktok" | "motion";
  description: string;
  keyframes: AnimationKeyframe[];
};

export const textAnimationPresets: TextAnimationPreset[] = [
  {
    id: "none",
    name: "Sem animação",
    category: "basic",
    description: "Texto estático.",
    keyframes: [{ time: 0, opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }],
  },
  {
    id: "fade",
    name: "Fade suave",
    category: "basic",
    description: "Entrada limpa e discreta.",
    keyframes: [
      { time: 0, opacity: 0, scale: 1, x: 0, y: 0, rotate: 0 },
      { time: 1, opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 },
    ],
  },
  {
    id: "pop",
    name: "Pop TikTok",
    category: "tiktok",
    description: "Impacto rápido com acomodação de escala.",
    keyframes: [
      { time: 0, opacity: 0, scale: 1.35, x: 0, y: 0, rotate: -3 },
      { time: 0.72, opacity: 1, scale: 0.94, x: 0, y: 0, rotate: 1 },
      { time: 1, opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 },
    ],
  },
  {
    id: "bounce",
    name: "Bounce creator",
    category: "tiktok",
    description: "Texto sobe e quica uma vez.",
    keyframes: [
      { time: 0, opacity: 0, scale: 0.9, x: 0, y: 34, rotate: 0 },
      { time: 0.68, opacity: 1, scale: 1.06, x: 0, y: -7, rotate: 0 },
      { time: 1, opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 },
    ],
  },
  {
    id: "slide-up",
    name: "Subir legenda",
    category: "motion",
    description: "Entrada vertical usada em legendas curtas.",
    keyframes: [
      { time: 0, opacity: 0, scale: 1, x: 0, y: 42, rotate: 0 },
      { time: 1, opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 },
    ],
  },
  {
    id: "slide-left",
    name: "Deslizar lateral",
    category: "motion",
    description: "Entra pela esquerda com desaceleração.",
    keyframes: [
      { time: 0, opacity: 0, scale: 1, x: -55, y: 0, rotate: 0 },
      { time: 1, opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 },
    ],
  },
  {
    id: "shake",
    name: "Shake de alerta",
    category: "tiktok",
    description: "Tremida curta para preço, aviso ou CTA.",
    keyframes: [
      { time: 0, opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 },
      { time: 0.25, opacity: 1, scale: 1, x: -11, y: 0, rotate: -2 },
      { time: 0.5, opacity: 1, scale: 1, x: 10, y: 0, rotate: 2 },
      { time: 0.75, opacity: 1, scale: 1, x: -5, y: 0, rotate: -1 },
      { time: 1, opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 },
    ],
  },
  {
    id: "zoom",
    name: "Zoom dramático",
    category: "tiktok",
    description: "Aproximação curta para benefício principal.",
    keyframes: [
      { time: 0, opacity: 0, scale: 0.72, x: 0, y: 0, rotate: 0 },
      { time: 1, opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 },
    ],
  },
];

export const textLoopAnimationPresets: Array<{
  id: TextLoopAnimationPresetId;
  name: string;
  description: string;
}> = [
  { id: "none", name: "Sem loop", description: "Mantém o texto estático." },
  { id: "float", name: "Flutuar", description: "Movimento vertical calmo." },
  { id: "pulse", name: "Pulsar", description: "Pulso curto para ofertas." },
  { id: "breathe", name: "Respirar", description: "Escala suave e contínua." },
  { id: "shake", name: "Tremer", description: "Tremida rápida de alerta." },
  { id: "swing", name: "Balançar", description: "Rotação lateral orgânica." },
  { id: "blink", name: "Piscar", description: "Pisca sem desaparecer completamente." },
  { id: "bounce-soft", name: "Bounce suave", description: "Quica discretamente." },
  { id: "slow-zoom", name: "Zoom lento", description: "Aproximação contínua." },
];

const presetById = new Map(textAnimationPresets.map((preset) => [preset.id, preset]));

export function evaluateTextAnimation(id: TextAnimationPresetId, progress: number) {
  const preset = presetById.get(id) ?? presetById.get("none")!;
  const time = Math.max(0, Math.min(1, progress));
  const rightIndex = preset.keyframes.findIndex((keyframe) => keyframe.time >= time);
  if (rightIndex <= 0) return preset.keyframes[0]!;
  const right = preset.keyframes[rightIndex] ?? preset.keyframes.at(-1)!;
  const left = preset.keyframes[rightIndex - 1] ?? right;
  const span = Math.max(0.0001, right.time - left.time);
  const amount = (time - left.time) / span;
  const interpolate = (start: number, end: number) => start + (end - start) * amount;
  return {
    time,
    opacity: interpolate(left.opacity, right.opacity),
    scale: interpolate(left.scale, right.scale),
    x: interpolate(left.x, right.x),
    y: interpolate(left.y, right.y),
    rotate: interpolate(left.rotate, right.rotate),
  };
}

export function evaluateTextLoopAnimation(
  id: TextLoopAnimationPresetId | undefined,
  seconds: number,
) {
  const cycle = seconds * Math.PI * 2;
  if (id === "float")
    return { opacity: 1, scale: 1, x: 0, y: Math.sin(cycle / 1.5) * 5, rotate: 0 };
  if (id === "pulse")
    return {
      opacity: 1,
      scale: 1 + Math.max(0, Math.sin(cycle * 1.4)) * 0.06,
      x: 0,
      y: 0,
      rotate: 0,
    };
  if (id === "breathe")
    return { opacity: 1, scale: 1 + Math.sin(cycle / 2) * 0.035, x: 0, y: 0, rotate: 0 };
  if (id === "shake")
    return {
      opacity: 1,
      scale: 1,
      x: Math.sin(cycle * 5) * 2.5,
      y: 0,
      rotate: Math.sin(cycle * 4) * 0.7,
    };
  if (id === "swing")
    return { opacity: 1, scale: 1, x: 0, y: 0, rotate: Math.sin(cycle / 1.6) * 2.5 };
  if (id === "blink")
    return {
      opacity: 0.72 + Math.max(0, Math.sin(cycle * 1.2)) * 0.28,
      scale: 1,
      x: 0,
      y: 0,
      rotate: 0,
    };
  if (id === "bounce-soft")
    return { opacity: 1, scale: 1, x: 0, y: -Math.abs(Math.sin(cycle * 0.9)) * 5, rotate: 0 };
  if (id === "slow-zoom")
    return { opacity: 1, scale: 1 + (seconds % 2.5) * 0.018, x: 0, y: 0, rotate: 0 };
  return { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 };
}

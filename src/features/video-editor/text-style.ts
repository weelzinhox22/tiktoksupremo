import type { CSSProperties } from "react";
import type { EditorTextOverlay } from "@/features/video-editor/engine";
import type { TextPreset } from "@/features/video-editor/text-presets";

type TextVisualSource = Pick<
  EditorTextOverlay,
  | "fontSize"
  | "color"
  | "backgroundColor"
  | "style"
  | "fontFamily"
  | "fontWeight"
  | "strokeColor"
  | "strokeWidth"
  | "shadowColor"
  | "shadowBlur"
  | "shadowOffsetX"
  | "shadowOffsetY"
  | "letterSpacing"
  | "textTransform"
  | "borderRadius"
>;

export function getTextVisualStyle(source: TextVisualSource, scale = 1): CSSProperties {
  const legacyImpact = source.style === "impact";
  const legacyNeon = source.style === "neon";
  const strokeWidth = (source.strokeWidth ?? (source.style === "minimal" ? 0 : 3)) * scale;
  const strokeColor = source.strokeColor ?? (legacyNeon ? source.color : "rgba(0,0,0,.82)");
  const shadowColor = source.shadowColor ?? (legacyNeon ? source.color : "rgba(0,0,0,.8)");
  const shadowBlur = (source.shadowBlur ?? (legacyNeon ? 10 : 2)) * scale;
  const shadowX = (source.shadowOffsetX ?? 0) * scale;
  const shadowY = (source.shadowOffsetY ?? 2) * scale;

  return {
    color: source.color,
    background: source.backgroundColor,
    fontFamily:
      source.fontFamily ??
      (legacyImpact ? "Impact, Arial Black, sans-serif" : "Arial Black, Arial, sans-serif"),
    fontSize: source.fontSize * scale,
    fontWeight: source.fontWeight ?? (source.style === "minimal" ? 600 : 800),
    letterSpacing: (source.letterSpacing ?? 0) * scale,
    textTransform: source.textTransform ?? (legacyImpact ? "uppercase" : "none"),
    borderRadius: (source.borderRadius ?? 8) * scale,
    padding: `${6 * scale}px ${10 * scale}px`,
    WebkitTextStroke: strokeWidth ? `${strokeWidth}px ${strokeColor}` : undefined,
    paintOrder: "stroke fill",
    textShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}`,
  };
}

export function getPresetPreviewStyle(preset: TextPreset): CSSProperties {
  return getTextVisualStyle(
    {
      ...preset.style,
      style: "classic",
    },
    0.3,
  );
}

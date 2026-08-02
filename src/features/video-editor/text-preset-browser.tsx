import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Heart, Play, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { evaluateTextAnimation } from "@/features/video-editor/presets";
import {
  textPresetCategories,
  textPresets,
  type TextPreset,
  type TextPresetCategory,
} from "@/features/video-editor/text-presets";
import { getPresetPreviewStyle } from "@/features/video-editor/text-style";

const FAVORITES_KEY = "tik-supremo-editor-text-favorites";
const RECENTS_KEY = "tik-supremo-editor-text-recents";

function readList(key: string) {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function TextPresetBrowser({ onApply }: { onApply: (preset: TextPreset) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | TextPresetCategory | "favorites">("all");
  const [favorites, setFavorites] = useState<string[]>(() => readList(FAVORITES_KEY));
  const [recents, setRecents] = useState<string[]>(() => readList(RECENTS_KEY));

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return textPresets.filter((preset) => {
      if (category === "favorites" && !favorites.includes(preset.id)) return false;
      if (category !== "all" && category !== "favorites" && preset.category !== category)
        return false;
      if (!normalizedQuery) return true;
      return [preset.name, preset.previewText, ...preset.tags]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(normalizedQuery);
    });
  }, [category, favorites, query]);

  const recentPresets = recents
    .map((id) => textPresets.find((preset) => preset.id === id))
    .filter((preset): preset is TextPreset => Boolean(preset))
    .slice(0, 4);

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = current.includes(id)
        ? current.filter((value) => value !== id)
        : [id, ...current];
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const apply = (preset: TextPreset) => {
    const nextRecents = [preset.id, ...recents.filter((id) => id !== preset.id)].slice(0, 8);
    setRecents(nextRecents);
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(nextRecents));
    onApply(preset);
  };

  return (
    <div className="space-y-4">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-9 border-white/10 bg-black/25 pl-9 text-xs text-white placeholder:text-slate-500"
          placeholder="Buscar estilo de texto"
          aria-label="Buscar presets de texto"
        />
      </label>

      <div className="flex gap-1.5 overflow-x-auto pb-1" aria-label="Categorias de presets">
        {textPresetCategories.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={category === item.id}
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] transition ${
              category === item.id
                ? "border-primary/50 bg-primary/20 text-primary"
                : "border-white/10 bg-white/[0.025] text-slate-400 hover:border-white/20 hover:text-white"
            }`}
            onClick={() => setCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {!query && category === "all" && recentPresets.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Usados recentemente
          </p>
          <div className="grid grid-cols-2 gap-2">
            {recentPresets.map((preset) => (
              <PresetCard
                key={`recent-${preset.id}`}
                preset={preset}
                favorite={favorites.includes(preset.id)}
                onApply={() => apply(preset)}
                onFavorite={() => toggleFavorite(preset.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {category === "all"
              ? "Presets"
              : textPresetCategories.find((item) => item.id === category)?.label}
          </p>
          <span className="text-[10px] text-slate-600">{filtered.length}</span>
        </div>
        {filtered.length ? (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                favorite={favorites.includes(preset.id)}
                onApply={() => apply(preset)}
                onFavorite={() => toggleFavorite(preset.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
            <Sparkles className="mx-auto size-5 text-slate-600" />
            <p className="mt-2 text-xs text-slate-400">Nenhum estilo encontrado.</p>
            <button
              type="button"
              className="mt-2 text-[10px] text-primary hover:underline"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const PresetCard = memo(function PresetCard({
  preset,
  favorite,
  onApply,
  onFavorite,
}: {
  preset: TextPreset;
  favorite: boolean;
  onApply: () => void;
  onFavorite: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [animationStyle, setAnimationStyle] = useState({
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
  });

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      {
        rootMargin: "100px",
      },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const stopPreview = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    hoverTimer.current = null;
    frameRef.current = null;
    setPreviewing(false);
    setAnimationStyle({ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 });
  };

  const startPreview = () => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stopPreview();
    hoverTimer.current = window.setTimeout(() => {
      setPreviewing(true);
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / preset.previewDurationMs);
        const next = evaluateTextAnimation(preset.animation.entrance, progress);
        setAnimationStyle(next);
        if (progress < 1) frameRef.current = requestAnimationFrame(tick);
        else setPreviewing(false);
      };
      frameRef.current = requestAnimationFrame(tick);
    }, 150);
  };

  useEffect(() => stopPreview, []);

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/[0.055]"
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
    >
      <button
        type="button"
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        title={`Aplicar ${preset.name}`}
        onClick={onApply}
      >
        <span className="relative flex aspect-[9/7] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-800 via-slate-950 to-black px-2">
          {preset.decorations?.map((decoration, index) => (
            <span
              key={`${decoration.type}-${index}`}
              className="absolute font-black"
              style={{
                color: decoration.color,
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: decoration.size * 0.55,
                transform: `rotate(${decoration.rotation ?? 0}deg)`,
              }}
            >
              {decoration.type === "sparkle"
                ? "✦"
                : decoration.type === "star"
                  ? "★"
                  : decoration.type === "bolt"
                    ? "ϟ"
                    : "●"}
            </span>
          ))}
          <span
            className="relative z-10 max-w-full text-center leading-[1.05]"
            style={{
              ...getPresetPreviewStyle(preset),
              opacity: animationStyle.opacity,
              transform: `translate(${animationStyle.x * 0.22}px, ${animationStyle.y * 0.22}px) scale(${animationStyle.scale}) rotate(${preset.style.rotation + animationStyle.rotate}deg)`,
            }}
          >
            {preset.previewText}
          </span>
          <span className="absolute bottom-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition group-hover:opacity-100">
            <Play className="size-2.5" fill="currentColor" />
          </span>
          {previewing && (
            <span className="absolute left-1.5 top-1.5 size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
          )}
        </span>
        <span className="block truncate px-2 pb-2 pt-1.5 text-[10px] font-medium text-slate-300">
          {preset.name}
        </span>
      </button>
      <button
        type="button"
        aria-label={favorite ? `Remover ${preset.name} dos favoritos` : `Favoritar ${preset.name}`}
        aria-pressed={favorite}
        className={`absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full border border-white/10 bg-black/55 transition hover:scale-105 ${favorite ? "text-pink-400" : "text-white/60 hover:text-white"}`}
        onClick={(event) => {
          event.stopPropagation();
          onFavorite();
        }}
      >
        <Heart className="size-3" fill={favorite ? "currentColor" : "none"} />
      </button>
    </div>
  );
});

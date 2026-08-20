import { useState } from "react";
import { Search, Sparkles, Type, ChevronRight, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  textPresets,
  type TextPreset,
} from "@/features/video-editor/text-presets";

export function TextPresetBrowser({
  onApply,
  onAddHeading,
  onAddBody,
}: {
  onApply: (preset: TextPreset) => void;
  onAddHeading?: (() => void) | undefined;
  onAddBody?: (() => void) | undefined;
}) {
  const [topTab, setTopTab] = useState<"templates" | "effects">("templates");
  const [filter, setFilter] = useState<"all" | "commercial">("all");

  const populares = textPresets.slice(0, 6);
  const katseye = textPresets.filter((p) => p.category === "social").slice(0, 3);
  const comic = textPresets.filter((p) => p.category === "promotion").slice(0, 3);
  const summer = textPresets.filter((p) => p.category === "questions").slice(0, 3);
  const classico = textPresets.filter((p) => p.category === "minimal").slice(0, 4);

  return (
    <div className="space-y-4 text-slate-100">
      {/* Top CapCut Tabs: Modelos de texto / Efeitos de texto */}
      <div className="flex items-center gap-6 border-b border-white/10 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setTopTab("templates")}
          className={`pb-2 transition relative ${
            topTab === "templates"
              ? "text-white font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-cyan-400 after:rounded-full"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Modelos de texto
        </button>
        <button
          type="button"
          onClick={() => setTopTab("effects")}
          className={`pb-2 transition relative ${
            topTab === "effects"
              ? "text-white font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-cyan-400 after:rounded-full"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Efeitos de texto
        </button>
      </div>

      {/* Filter Chips: Todos / Comercial */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`h-6 px-3 rounded-full text-[10px] font-semibold transition ${
            filter === "all"
              ? "bg-white/15 text-white ring-1 ring-white/20"
              : "bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          Todos
        </button>
        <button
          type="button"
          onClick={() => setFilter("commercial")}
          className={`h-6 px-3 rounded-full text-[10px] font-semibold transition flex items-center gap-1 ${
            filter === "commercial"
              ? "bg-white/15 text-white ring-1 ring-white/20"
              : "bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          Comercial <span className="text-[9px] text-slate-500">ⓘ</span>
        </button>
      </div>

      {/* Section: BÁSICO */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-slate-400">Básico</span>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onAddHeading}
            className="w-full h-10 px-4 rounded-xl border border-white/10 bg-[#161822] hover:border-cyan-400/50 hover:bg-white/[0.04] flex items-center justify-start text-xs font-bold text-white transition shadow-sm"
          >
            Adicionar cabeçalho
          </button>
          <button
            type="button"
            onClick={onAddBody}
            className="w-full h-9 px-4 rounded-xl border border-white/10 bg-[#161822] hover:border-cyan-400/50 hover:bg-white/[0.04] flex items-center justify-start text-xs font-medium text-slate-300 transition shadow-sm"
          >
            Adicionar corpo de texto
          </button>
        </div>
      </div>

      {/* Section: Populares */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1">
            <Sparkles className="size-3 text-amber-400" /> Populares
          </span>
          <span className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center cursor-pointer">
            Ver todos <ChevronRight className="size-3" />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {populares.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onApply(preset)}
              className="group aspect-square rounded-xl border border-white/10 bg-[#14161f] p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-400/60 hover:bg-cyan-500/[0.04] transition shadow-md relative overflow-hidden"
            >
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-cyan-400/60" />
              <span
                className="text-[11px] font-black leading-tight group-hover:scale-105 transition-transform"
                style={{
                  color: preset.style.color,
                  textShadow: preset.style.strokeWidth ? `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000` : undefined,
                  fontFamily: preset.style.fontFamily || "Montserrat, sans-serif",
                }}
              >
                {preset.name.slice(0, 10)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section: KATSEYE / Neon */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">KATSEYE</span>
          <span className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center cursor-pointer">
            Ver todos <ChevronRight className="size-3" />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {katseye.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onApply(preset)}
              className="aspect-square rounded-xl border border-white/10 bg-[#14161f] p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-400 hover:bg-purple-500/[0.05] transition"
            >
              <span className="text-[10px] font-bold text-purple-300 tracking-wider">
                {preset.name.slice(0, 8)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Aranha / Comic */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">Aranha & Comic</span>
          <span className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center cursor-pointer">
            Ver todos <ChevronRight className="size-3" />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {comic.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onApply(preset)}
              className="aspect-square rounded-xl border border-white/10 bg-[#14161f] p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-400 hover:bg-amber-500/[0.05] transition"
            >
              <span className="text-[11px] font-black text-amber-300 uppercase">
                {preset.name.slice(0, 7)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Verão 🍧 */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">Verão 🍧</span>
          <span className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center cursor-pointer">
            Ver todos <ChevronRight className="size-3" />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {summer.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onApply(preset)}
              className="aspect-square rounded-xl border border-white/10 bg-[#14161f] p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-400 hover:bg-pink-500/[0.05] transition"
            >
              <span className="text-[10px] font-extrabold text-pink-300">
                {preset.name.slice(0, 8)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Clássico */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">Clássico</span>
          <span className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center cursor-pointer">
            Ver todos <ChevronRight className="size-3" />
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {classico.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onApply(preset)}
              className="h-12 rounded-xl border border-white/10 bg-[#14161f] p-2 flex items-center justify-center text-center cursor-pointer hover:border-cyan-400 hover:bg-white/[0.04] transition"
            >
              <span className="text-xs font-black text-white">{preset.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

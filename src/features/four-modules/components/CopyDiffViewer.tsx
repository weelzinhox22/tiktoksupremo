import type { CopySegment } from "../types";

interface CopyDiffViewerProps {
  originalText: string;
  originalSegments?: CopySegment[] | undefined;
  newText: string;
  newSegments?: CopySegment[] | undefined;
}


export function CopyDiffViewer({ originalText, originalSegments = [], newText, newSegments = [] }: CopyDiffViewerProps) {
  const segmentBadges: Record<string, { label: string; bg: string }> = {
    hook: { label: "GANCHO", bg: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    context: { label: "CONTEXTO", bg: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    pain: { label: "DOR", bg: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
    desire: { label: "DESEJO", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    product: { label: "PRODUTO", bg: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    benefit: { label: "BENEFÍCIO", bg: "bg-cyan/20 text-cyan border-cyan/30" },
    feature: { label: "CARACTERÍSTICA", bg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
    demonstration: { label: "DEMONSTRAÇÃO", bg: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
    proof: { label: "PROVA", bg: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    objection: { label: "QUEBRA DE OBJEÇÃO", bg: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    urgency: { label: "URGÊNCIA", bg: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
    scarcity: { label: "ESCASSEZ", bg: "bg-red-500/20 text-red-300 border-red-500/30" },
    offer: { label: "OFERTA", bg: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
    cta: { label: "CTA / CARRINHO", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    other: { label: "OUTRO", bg: "bg-secondary text-muted-foreground border-border" },
  };

  const defaultBadge = { label: "OUTRO", bg: "bg-secondary text-muted-foreground border-border" };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Coluna Esquerda: Original */}
      <div className="rounded-2xl border border-border bg-secondary/15 p-5">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-semibold">Copy de Referência</h3>
            <p className="text-xs text-muted-foreground">Original inserida para análise</p>
          </div>
          <span className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-medium">Original</span>
        </div>
        {originalSegments.length > 0 ? (
          <div className="space-y-3">
            {originalSegments.map((seg) => {
              const badge = segmentBadges[seg.type] ?? defaultBadge;
              return (
                <div key={seg.id} className="rounded-xl border border-border bg-background/40 p-3">
                  <span className={`mb-2 inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <p className="text-sm leading-relaxed">{seg.text}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{originalText}</p>
        )}
      </div>

      {/* Coluna Direita: Nova Copy Gerada */}
      <div className="rounded-2xl border border-primary/30 bg-primary/[0.03] p-5">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-semibold text-primary">Nova Copy Modelada</h3>
            <p className="text-xs text-muted-foreground">Nova versão reescrita sem cópia literal</p>
          </div>
          <span className="rounded-lg bg-primary/20 px-2.5 py-1 text-[11px] font-medium text-primary">
            Transformada pelo Tik Supremo
          </span>
        </div>
        {newSegments.length > 0 ? (
          <div className="space-y-3">
            {newSegments.map((seg) => {
              const badge = segmentBadges[seg.type] ?? defaultBadge;
              return (
                <div key={seg.id} className="rounded-xl border border-primary/20 bg-background/60 p-3 shadow-sm">
                  <span className={`mb-2 inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <p className="text-sm leading-relaxed">{seg.text}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{newText}</p>
        )}
      </div>
    </div>
  );
}

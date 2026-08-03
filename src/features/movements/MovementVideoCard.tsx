import { useState, useRef } from "react";
import { Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MovementVideoCardProps {
  videoUrl: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function MovementVideoCard({
  videoUrl,
  isFavorite,
  onToggleFavorite,
}: MovementVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div
      className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black/80 shadow-inner group cursor-pointer border border-primary/20 hover:border-primary/50 transition-all"
      onMouseEnter={() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }}
      onMouseLeave={() => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
          setIsPlaying(false);
        }
      }}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-30 transition-opacity" />

      {onToggleFavorite && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 size-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/70 text-white z-10"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          title={isFavorite ? "Remover dos favoritos" : "Favoritar movimento"}
        >
          <Star
            className={`size-4 ${
              isFavorite ? "fill-amber-400 text-amber-400" : "text-white/80"
            }`}
          />
        </Button>
      )}

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-semibold text-white bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 shadow-lg">
        <span className="flex items-center gap-1.5 text-xs text-primary font-bold">
          <Play
            className={`size-3.5 ${
              isPlaying ? "animate-pulse fill-primary text-primary" : "fill-white/80"
            }`}
          />
          {isPlaying ? "Reproduzindo prévia" : "Passe o mouse ou toque para ver"}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">15.17s</span>
      </div>
    </div>
  );
}

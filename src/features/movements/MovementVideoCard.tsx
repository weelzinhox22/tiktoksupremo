import { useState, useRef, useEffect } from "react";
import { Play, Star, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MovementVideoCardProps {
  videoUrl: string;
  isFavorite?: boolean | undefined;
  onToggleFavorite?: (() => void) | undefined;
  duration?: string | undefined;
}

export function MovementVideoCard({
  videoUrl,
  isFavorite,
  onToggleFavorite,
  duration,
}: MovementVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secureSrc, setSecureSrc] = useState<string>("");

  // Convert direct asset URL into an in-memory ephemeral Blob URL to obfuscate raw file path from DOM inspector
  useEffect(() => {
    let active = true;
    let blobUrl = "";

    async function loadSecureBlob() {
      try {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        if (active) {
          blobUrl = URL.createObjectURL(blob);
          setSecureSrc(blobUrl);
        }
      } catch {
        if (active) setSecureSrc(videoUrl);
      }
    }

    loadSecureBlob();

    return () => {
      active = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [videoUrl]);

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
      className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black/90 shadow-inner group cursor-pointer border border-primary/20 hover:border-primary/50 transition-all select-none"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onDragStart={(e) => {
        e.preventDefault();
        return false;
      }}
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
      {/* Video Element Protected with controlsList, disablePiP, and pointer-events-none */}
      <video
        ref={videoRef}
        src={secureSrc || undefined}
        className="h-full w-full object-cover pointer-events-none select-none"
        muted
        loop
        playsInline
        preload="metadata"
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      />

      {/* Invisible Anti-Download Protective Glass Shield */}
      <div
        className="absolute inset-0 z-0 bg-transparent select-none"
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        draggable={false}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-30 transition-opacity pointer-events-none" />

      {onToggleFavorite && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 size-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/80 text-white z-10"
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

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-semibold text-white bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 shadow-lg pointer-events-none">
        <span className="flex items-center gap-1.5 text-xs text-primary font-bold">
          <Play
            className={`size-3.5 ${
              isPlaying ? "animate-pulse fill-primary text-primary" : "fill-white/80"
            }`}
          />
          {isPlaying ? "Reproduzindo prévia" : "Passe o mouse ou toque para ver"}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">{duration || "Vídeo"}</span>
      </div>
    </div>
  );
}


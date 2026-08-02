import { useEffect, useRef } from "react";

export type EditorShortcut = {
  id: string;
  label: string;
  keys: string;
  category: "Geral" | "Reprodução" | "Timeline";
};

export const editorShortcuts: EditorShortcut[] = [
  { id: "undo", label: "Desfazer", keys: "Ctrl/Cmd + Z", category: "Geral" },
  { id: "redo", label: "Refazer", keys: "Ctrl/Cmd + Shift + Z", category: "Geral" },
  { id: "save", label: "Salvar projeto", keys: "Ctrl/Cmd + S", category: "Geral" },
  { id: "commands", label: "Buscar comandos", keys: "Ctrl/Cmd + K", category: "Geral" },
  { id: "duplicate", label: "Duplicar seleção", keys: "Ctrl/Cmd + D", category: "Geral" },
  { id: "delete", label: "Excluir seleção", keys: "Delete", category: "Geral" },
  { id: "help", label: "Ver atalhos", keys: "?", category: "Geral" },
  { id: "play", label: "Reproduzir ou pausar", keys: "Espaço", category: "Reprodução" },
  { id: "pause", label: "Pausar", keys: "K", category: "Reprodução" },
  { id: "back", label: "Voltar 1 segundo", keys: "J", category: "Reprodução" },
  { id: "forward", label: "Avançar 1 segundo", keys: "L", category: "Reprodução" },
  { id: "start", label: "Ir ao início", keys: "Home", category: "Reprodução" },
  { id: "end", label: "Ir ao final", keys: "End", category: "Reprodução" },
  { id: "frame-back", label: "Voltar um frame", keys: "←", category: "Reprodução" },
  { id: "frame-forward", label: "Avançar um frame", keys: "→", category: "Reprodução" },
  { id: "split", label: "Dividir no cursor", keys: "S ou Ctrl/Cmd + B", category: "Timeline" },
  { id: "trim-start", label: "Aparar início no cursor", keys: "[", category: "Timeline" },
  { id: "trim-end", label: "Aparar final no cursor", keys: "]", category: "Timeline" },
  { id: "zoom-in", label: "Aumentar zoom", keys: "+", category: "Timeline" },
  { id: "zoom-out", label: "Diminuir zoom", keys: "-", category: "Timeline" },
  { id: "zoom-fit", label: "Ajustar timeline", keys: "0", category: "Timeline" },
  { id: "text", label: "Adicionar texto", keys: "T", category: "Timeline" },
  { id: "mute", label: "Silenciar seleção", keys: "M", category: "Timeline" },
];

export type EditorShortcutActions = {
  undo: () => void;
  redo: () => void;
  save: () => void;
  openCommands: () => void;
  openHelp: () => void;
  duplicate: () => void;
  remove: () => void;
  clearSelection: () => void;
  togglePlayback: () => void;
  pause: () => void;
  seekBy: (seconds: number) => void;
  seekStart: () => void;
  seekEnd: () => void;
  split: () => void;
  trimStart: () => void;
  trimEnd: () => void;
  zoomBy: (amount: number) => void;
  zoomFit: () => void;
  addText: () => void;
  mute: () => void;
};

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.matches("input, textarea, select") ||
    target.isContentEditable ||
    Boolean(target.closest("[contenteditable='true']"))
  );
}

export function useEditorKeyboardShortcuts(actions: EditorShortcutActions) {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const action = actionsRef.current;
      const command = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (command && key === "z") {
        event.preventDefault();
        if (event.shiftKey) action.redo();
        else action.undo();
        return;
      }
      if (command && key === "y") {
        event.preventDefault();
        action.redo();
        return;
      }
      if (command && key === "s") {
        event.preventDefault();
        action.save();
        return;
      }
      if (command && key === "k") {
        event.preventDefault();
        action.openCommands();
        return;
      }
      if (command && key === "d") {
        event.preventDefault();
        action.duplicate();
        return;
      }
      if (command && key === "b") {
        event.preventDefault();
        action.split();
        return;
      }
      if (command || event.altKey) return;

      if (event.key === "?" || (event.key === "/" && event.shiftKey)) {
        event.preventDefault();
        action.openHelp();
      } else if (event.code === "Space") {
        event.preventDefault();
        action.togglePlayback();
      } else if (key === "k") {
        action.pause();
      } else if (key === "j") {
        action.seekBy(-1);
      } else if (key === "l") {
        action.seekBy(1);
      } else if (event.key === "Home") {
        event.preventDefault();
        action.seekStart();
      } else if (event.key === "End") {
        event.preventDefault();
        action.seekEnd();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        action.seekBy((event.shiftKey ? -10 : -1) / 30);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        action.seekBy((event.shiftKey ? 10 : 1) / 30);
      } else if (key === "s") {
        action.split();
      } else if (event.key === "[") {
        action.trimStart();
      } else if (event.key === "]") {
        action.trimEnd();
      } else if (event.key === "+" || event.key === "=") {
        action.zoomBy(8);
      } else if (event.key === "-") {
        action.zoomBy(-8);
      } else if (event.key === "0") {
        action.zoomFit();
      } else if (key === "t") {
        action.addText();
      } else if (key === "m") {
        action.mute();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        action.remove();
      } else if (event.key === "Escape") {
        action.clearSelection();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

import type {
  EditorAudioLayer,
  EditorSegment,
  EditorTextOverlay,
} from "@/features/video-editor/engine";

export type VideoEditorProject = {
  name: string;
  segments: EditorSegment[];
  timelineIds: string[];
  textOverlays: EditorTextOverlay[];
  audioLayers: EditorAudioLayer[];
  removeAudio: boolean;
  stripMetadata: boolean;
  width: 720 | 1080;
  updatedAt: number;
};

const DATABASE = "tik-supremo-video-editor";
const STORE = "projects";
const ACTIVE_PROJECT = "active-project";

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Não foi possível abrir o projeto local."));
  });
}

export async function saveEditorProject(project: VideoEditorProject) {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put(project, ACTIVE_PROJECT);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Falha ao salvar o projeto."));
    });
  } finally {
    database.close();
  }
}

export async function loadEditorProject() {
  const database = await openDatabase();
  try {
    return await new Promise<VideoEditorProject | null>((resolve, reject) => {
      const request = database
        .transaction(STORE, "readonly")
        .objectStore(STORE)
        .get(ACTIVE_PROJECT);
      request.onsuccess = () => resolve((request.result as VideoEditorProject | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error("Falha ao restaurar o projeto."));
    });
  } finally {
    database.close();
  }
}

export async function clearEditorProject() {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).delete(ACTIVE_PROJECT);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Falha ao limpar o projeto."));
    });
  } finally {
    database.close();
  }
}

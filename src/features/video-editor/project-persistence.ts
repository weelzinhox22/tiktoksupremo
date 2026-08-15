import type {
  EditorAudioLayer,
  EditorSegment,
  EditorTextOverlay,
  ExportFormat,
} from "@/features/video-editor/engine";

export type { ExportFormat };

export type VideoEditorProject = {
  name: string;
  segments: EditorSegment[];
  timelineIds: string[];
  textOverlays: EditorTextOverlay[];
  audioLayers: EditorAudioLayer[];
  removeAudio: boolean;
  stripMetadata: boolean;
  /** @deprecated use exportFormat instead */
  width: 720 | 1080;
  exportFormat?: ExportFormat;
  updatedAt: number;
};

export type VideoEditorTemplate = {
  id: string;
  name: string;
  segmentStyles: Array<Partial<EditorSegment>>;
  textOverlays: EditorTextOverlay[];
  removeAudio: boolean;
  stripMetadata: boolean;
  width: 720 | 1080;
  exportFormat?: ExportFormat;
  createdAt: number;
};

const DATABASE = "tik-supremo-video-editor";
const STORE = "projects";
const TEMPLATE_STORE = "templates";
const ACTIVE_PROJECT = "active-project";

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
      if (!request.result.objectStoreNames.contains(TEMPLATE_STORE)) {
        request.result.createObjectStore(TEMPLATE_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Não foi possível abrir o projeto local."));
  });
}

export function createTemplateFromProject(
  project: VideoEditorProject,
  name: string,
): VideoEditorTemplate {
  return {
    id: `editor-template-${crypto.randomUUID()}`,
    name,
    segmentStyles: project.timelineIds.map((id) => {
      const segment = project.segments.find((item) => item.id === id);
      if (!segment) return {};
      return {
        mute: segment.mute,
        playbackRate: segment.playbackRate,
        volume: segment.volume,
        mirror: segment.mirror,
        brightness: segment.brightness,
        contrast: segment.contrast,
        saturation: segment.saturation,
        fadeIn: segment.fadeIn,
        fadeOut: segment.fadeOut,
        animationIn: segment.animationIn,
        animationOut: segment.animationOut,
        animationDuration: segment.animationDuration,
        transition: segment.transition,
        transitionDuration: segment.transitionDuration,
        hideOverlay: segment.hideOverlay,
        overlayPosition: segment.overlayPosition,
        overlayWidth: segment.overlayWidth,
        overlayHeight: segment.overlayHeight,
      };
    }),
    textOverlays: project.textOverlays.map((overlay) => ({ ...overlay })),
    removeAudio: project.removeAudio,
    stripMetadata: project.stripMetadata,
    width: project.width,
    ...(project.exportFormat ? { exportFormat: project.exportFormat } : {}),
    createdAt: Date.now(),
  };
}

export function applyEditorTemplate(
  project: VideoEditorProject,
  template: VideoEditorTemplate,
): VideoEditorProject {
  const styleById = new Map(
    project.timelineIds.map((id, index) => [
      id,
      template.segmentStyles[index] ?? template.segmentStyles.at(-1) ?? {},
    ]),
  );
  return {
    ...project,
    segments: project.segments.map((segment) => ({
      ...segment,
      ...(styleById.get(segment.id) ?? {}),
    })),
    textOverlays: template.textOverlays.map((overlay) => ({
      ...overlay,
      id: `text-${crypto.randomUUID()}`,
    })),
    removeAudio: template.removeAudio,
    stripMetadata: template.stripMetadata,
    width: template.width,
    ...(template.exportFormat ? { exportFormat: template.exportFormat } : {}),
    updatedAt: Date.now(),
  };
}

export async function saveEditorTemplate(template: VideoEditorTemplate) {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(TEMPLATE_STORE, "readwrite");
      transaction.objectStore(TEMPLATE_STORE).put(template);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Falha ao salvar o template."));
    });
  } finally {
    database.close();
  }
}

export async function listEditorTemplates() {
  const database = await openDatabase();
  try {
    return await new Promise<VideoEditorTemplate[]>((resolve, reject) => {
      const request = database
        .transaction(TEMPLATE_STORE, "readonly")
        .objectStore(TEMPLATE_STORE)
        .getAll();
      request.onsuccess = () =>
        resolve(
          (request.result as VideoEditorTemplate[]).sort((a, b) => b.createdAt - a.createdAt),
        );
      request.onerror = () => reject(request.error ?? new Error("Falha ao listar templates."));
    });
  } finally {
    database.close();
  }
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

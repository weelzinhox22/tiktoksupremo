import { useCallback, useEffect, useRef, useState } from "react";

type UpdateOptions = {
  immediate?: boolean;
  key?: string;
};

export function useEditorHistory<T>(initialState: T) {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);
  const pendingRef = useRef<{ base: T; key: string; timer: number } | null>(null);
  const [, refreshControls] = useState(0);

  const syncState = useCallback((next: T) => {
    stateRef.current = next;
    setState(next);
    refreshControls((version) => version + 1);
  }, []);

  const flushPending = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    window.clearTimeout(pending.timer);
    pastRef.current = [...pastRef.current.slice(-79), pending.base];
    pendingRef.current = null;
    refreshControls((version) => version + 1);
  }, []);

  const update = useCallback(
    (updater: T | ((current: T) => T), options: UpdateOptions = {}) => {
      const current = stateRef.current;
      const next = typeof updater === "function" ? (updater as (value: T) => T)(current) : updater;
      if (Object.is(current, next)) return;

      const key = options.key ?? "editor";
      if (options.immediate) {
        flushPending();
        pastRef.current = [...pastRef.current.slice(-79), current];
      } else {
        if (pendingRef.current && pendingRef.current.key !== key) flushPending();
        const base = pendingRef.current?.base ?? current;
        if (pendingRef.current) window.clearTimeout(pendingRef.current.timer);
        const timer = window.setTimeout(flushPending, 320);
        pendingRef.current = { base, key, timer };
      }

      futureRef.current = [];
      syncState(next);
    },
    [flushPending, syncState],
  );

  const undo = useCallback(() => {
    flushPending();
    const previous = pastRef.current.at(-1);
    if (!previous) return;
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [stateRef.current, ...futureRef.current.slice(0, 79)];
    syncState(previous);
  }, [flushPending, syncState]);

  const redo = useCallback(() => {
    flushPending();
    const next = futureRef.current[0];
    if (!next) return;
    futureRef.current = futureRef.current.slice(1);
    pastRef.current = [...pastRef.current.slice(-79), stateRef.current];
    syncState(next);
  }, [flushPending, syncState]);

  const replace = useCallback(
    (next: T, clearHistory = true) => {
      if (pendingRef.current) window.clearTimeout(pendingRef.current.timer);
      pendingRef.current = null;
      if (clearHistory) {
        pastRef.current = [];
        futureRef.current = [];
      }
      syncState(next);
    },
    [syncState],
  );

  useEffect(
    () => () => {
      if (pendingRef.current) window.clearTimeout(pendingRef.current.timer);
    },
    [],
  );

  return {
    state,
    update,
    undo,
    redo,
    replace,
    canUndo: pastRef.current.length > 0 || Boolean(pendingRef.current),
    canRedo: futureRef.current.length > 0,
  };
}

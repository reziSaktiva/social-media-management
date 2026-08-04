"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/** Browser-only backup for an unfinished New Post — KSP-05-F13, ADR-052. */
const STORAGE_KEY = "sm_draft_editor_new_post_unsaved_v1";

export interface UnsavedNewPost {
  caption: string;
  savedAt: number;
}

export type DraftEditorState =
  | { mode: "closed" }
  | { mode: "resume-check"; unsaved: UnsavedNewPost }
  | { mode: "create"; prefillCaption?: string }
  | { mode: "edit"; postId: string };

interface DraftEditorContextValue {
  state: DraftEditorState;
  openNewPost: () => void;
  openEditDraft: (postId: string) => void;
  resume: () => void;
  discardAndStartNew: () => void;
  close: () => void;
  persistUnsavedNewPost: (caption: string) => void;
  clearUnsavedNewPost: () => void;
}

const DraftEditorContext = createContext<DraftEditorContextValue | null>(null);

function readUnsavedNewPost(): UnsavedNewPost | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<UnsavedNewPost>;
    return parsed.caption ? (parsed as UnsavedNewPost) : null;
  } catch {
    return null;
  }
}

export function DraftEditorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<DraftEditorState>({ mode: "closed" });

  const openNewPost = useCallback(() => {
    const unsaved = readUnsavedNewPost();
    setState(unsaved ? { mode: "resume-check", unsaved } : { mode: "create" });
  }, []);

  const openEditDraft = useCallback((postId: string) => {
    setState({ mode: "edit", postId });
  }, []);

  const resume = useCallback(() => {
    setState((prev) =>
      prev.mode === "resume-check"
        ? { mode: "create", prefillCaption: prev.unsaved.caption }
        : prev,
    );
  }, []);

  const discardAndStartNew = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState({ mode: "create" });
  }, []);

  const close = useCallback(() => setState({ mode: "closed" }), []);

  const persistUnsavedNewPost = useCallback((caption: string) => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ caption, savedAt: Date.now() }),
    );
  }, []);

  const clearUnsavedNewPost = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<DraftEditorContextValue>(
    () => ({
      state,
      openNewPost,
      openEditDraft,
      resume,
      discardAndStartNew,
      close,
      persistUnsavedNewPost,
      clearUnsavedNewPost,
    }),
    [
      state,
      openNewPost,
      openEditDraft,
      resume,
      discardAndStartNew,
      close,
      persistUnsavedNewPost,
      clearUnsavedNewPost,
    ],
  );

  return (
    <DraftEditorContext.Provider value={value}>
      {children}
    </DraftEditorContext.Provider>
  );
}

export function useDraftEditor(): DraftEditorContextValue {
  const ctx = useContext(DraftEditorContext);
  if (!ctx) {
    throw new Error("useDraftEditor must be used within DraftEditorProvider");
  }
  return ctx;
}

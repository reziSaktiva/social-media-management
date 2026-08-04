"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * Browser-only backup for an unfinished New Post — KSP-05-F13, ADR-052.
 * Scoped per workspace: the sidebar CTA (ADR-053) can open the editor from any
 * section of any workspace, so a shared key would offer workspace A's caption
 * while the user is in workspace B — and save it there.
 */
const STORAGE_KEY_PREFIX = "sm_draft_editor_new_post_unsaved_v1";

function storageKey(slug: string): string {
  return `${STORAGE_KEY_PREFIX}:${slug}`;
}

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

function readUnsavedNewPost(slug: string): UnsavedNewPost | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(storageKey(slug));
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
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<DraftEditorState>({ mode: "closed" });

  const openNewPost = useCallback(() => {
    const unsaved = readUnsavedNewPost(slug);
    setState(unsaved ? { mode: "resume-check", unsaved } : { mode: "create" });
  }, [slug]);

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
    window.localStorage.removeItem(storageKey(slug));
    setState({ mode: "create" });
  }, [slug]);

  const close = useCallback(() => setState({ mode: "closed" }), []);

  const persistUnsavedNewPost = useCallback(
    (caption: string) => {
      window.localStorage.setItem(
        storageKey(slug),
        JSON.stringify({ caption, savedAt: Date.now() }),
      );
    },
    [slug],
  );

  const clearUnsavedNewPost = useCallback(() => {
    window.localStorage.removeItem(storageKey(slug));
  }, [slug]);

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

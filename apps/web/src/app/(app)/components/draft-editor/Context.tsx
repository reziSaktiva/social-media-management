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

function storageKey(workspaceId: string): string {
  return `${STORAGE_KEY_PREFIX}:${workspaceId}`;
}

export interface UnsavedNewPost {
  caption: string;
  savedAt: number;
}

export type DraftEditorState =
  | { mode: "closed" }
  | { mode: "resume-check"; unsaved: UnsavedNewPost }
  | { mode: "create"; prefillCaption?: string; preSelectedAccountId?: string }
  | { mode: "edit"; postId: string };

interface DraftEditorContextValue {
  state: DraftEditorState;
  /**
   * `preSelectedAccountId` is passed by entry points scoped to a specific
   * connected account (e.g. the sidebar "Channels" quick-compose "+" button,
   * T-012 / ADR-058 addendum poin 9). When provided, the Resume Unfinished
   * Post check is intentionally skipped — that flow belongs to a different
   * context (a specific account) than the generic "+ New Post" CTA.
   */
  openNewPost: (preSelectedAccountId?: string) => void;
  openEditDraft: (postId: string) => void;
  resume: () => void;
  discardAndStartNew: () => void;
  close: () => void;
  persistUnsavedNewPost: (caption: string) => void;
  clearUnsavedNewPost: () => void;
}

const DraftEditorContext = createContext<DraftEditorContextValue | null>(null);

function readUnsavedNewPost(workspaceId: string): UnsavedNewPost | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(storageKey(workspaceId));
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
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<DraftEditorState>({ mode: "closed" });

  const openNewPost = useCallback(
    (preSelectedAccountId?: string) => {
      // Entry point berbeda konteks (terikat akun tertentu) — skip
      // resume-check sepenuhnya, ADR-058 addendum poin 9.
      if (preSelectedAccountId) {
        setState({ mode: "create", preSelectedAccountId });
        return;
      }
      const unsaved = readUnsavedNewPost(workspaceId);
      setState(
        unsaved ? { mode: "resume-check", unsaved } : { mode: "create" },
      );
    },
    [workspaceId],
  );

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
    window.localStorage.removeItem(storageKey(workspaceId));
    setState({ mode: "create" });
  }, [workspaceId]);

  const close = useCallback(() => setState({ mode: "closed" }), []);

  const persistUnsavedNewPost = useCallback(
    (caption: string) => {
      window.localStorage.setItem(
        storageKey(workspaceId),
        JSON.stringify({ caption, savedAt: Date.now() }),
      );
    },
    [workspaceId],
  );

  const clearUnsavedNewPost = useCallback(() => {
    window.localStorage.removeItem(storageKey(workspaceId));
  }, [workspaceId]);

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

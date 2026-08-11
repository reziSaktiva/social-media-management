"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { useDraftEditor } from "./Context";

/**
 * Loads the Draft Editor chunk only once the editor is first opened. The modal
 * lives at workspace level (ADR-053, T-011.2), so a static import would ship
 * Dialog/DateInput/FileInput/RadioList and friends to every section — Home,
 * Analyze, Settings — that never opens it.
 *
 * Once mounted it stays mounted, so closing still runs the Dialog's own exit
 * handling instead of vanishing on unmount.
 */
const DraftEditorModal = dynamic(
  () => import("./Modal").then((mod) => mod.DraftEditorModal),
  { ssr: false },
);

export function DraftEditorMount() {
  const { state } = useDraftEditor();
  const [hasOpened, setHasOpened] = useState(false);

  if (state.mode !== "closed" && !hasOpened) {
    setHasOpened(true);
  }

  if (!hasOpened) {
    return null;
  }

  return <DraftEditorModal />;
}

"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

/**
 * Code review PR 118/119 (finding: duplicated "sync local state from
 * prop" pattern) — collapses the `prevX`/`localX` dual-`useState` idiom
 * (React's documented "Adjusting state when a prop changes" pattern,
 * dilakukan SAAT RENDER supaya tidak ada render tambahan/cascading) yang
 * sebelumnya disalin near-verbatim di `CalendarScreen.tsx`,
 * `QueueScreen.tsx`, `DraftsList.tsx`, dan `HistoryList.tsx` menjadi satu
 * hook. Setiap kali `value` berubah referensinya (mis. `page.tsx`
 * re-render server-side dengan data baru), state lokal di-reset ke
 * `value` tersebut sebelum commit; di antara reset itu, pemanggil bebas
 * memodifikasi state lokal sendiri (granular patch Realtime) lewat
 * setter yang dikembalikan.
 */
export function useSyncedState<T>(
  value: T,
  onReset?: () => void,
): [T, Dispatch<SetStateAction<T>>] {
  const [prevValue, setPrevValue] = useState(value);
  const [localValue, setLocalValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
    onReset?.();
  }

  return [localValue, setLocalValue];
}

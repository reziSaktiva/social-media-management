"use client";

import { useState } from "react";

export interface UseConfirmActionResult<T> {
  target: T | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  open: (target: T) => void;
  close: () => void;
  confirm: () => Promise<void>;
}

/**
 * State machine untuk dialog konfirmasi Tier 2 (ADR-049): target yang mau
 * dikonfirmasi + loading + error, dipasangkan ke `AlertDialog`. Sebelumnya
 * diduplikasi identik 3x (MembersTable remove-member, MembersTable
 * role-change, QueueScreen cancel-schedule) — dipindah ke sini supaya
 * perilakunya (mis. reset error saat dialog dibuka ulang) hanya perlu
 * diperbaiki di satu tempat.
 */
export function useConfirmAction<T>(
  action: (target: T) => Promise<{ error?: string }>,
  onSuccess?: (target: T) => void,
): UseConfirmActionResult<T> {
  const [target, setTarget] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function open(next: T) {
    setError(null);
    setTarget(next);
  }

  function close() {
    setTarget(null);
  }

  async function confirm() {
    if (target === null) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await action(target);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess?.(target);
      setTarget(null);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    target,
    isOpen: target !== null,
    isLoading,
    error,
    open,
    close,
    confirm,
  };
}

"use client";

import { useEffect } from "react";
import type { NotificationRecord } from "@/domains/notification";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { subscribeToNotificationInserts } from "@/lib/supabase/realtime/notifications";

/**
 * T-036.2 (ADR-023) — subscribe ke notifikasi baru milik `userId` selama
 * komponen pemanggil mount. Tidak merender apa pun sendiri; dipasang oleh
 * komponen bell (T-036.4, masih menunggu rancangan Claude Design).
 *
 * `userId` `null` berarti belum ada session siap (mis. masih loading) —
 * hook tidak subscribe sampai `userId` tersedia.
 *
 * T-036.3: sebelum subscribe, client harus otentikasi dulu ke Supabase
 * Realtime lewat JWT bridge (`/api/realtime/token`, AS-D03 "Mekanisme
 * Konteks 2") supaya `auth.uid()` valid untuk RLS
 * `notifications_realtime_own_rows`. Kalau fetch token gagal
 * (network/401), error di-log via `console.error` dan subscribe dibatalkan
 * — sengaja tidak throw supaya komponen pemanggil tidak crash.
 */
export function useNotificationRealtime(
  userId: string | null,
  onInsert: (notification: NotificationRecord) => void,
): void {
  useEffect(() => {
    if (!userId) return;
    const currentUserId = userId;
    // Dibuat sekali per effect run (bukan di dalam `connect()`) supaya
    // cleanup di bawah bisa disconnect socket client YANG SAMA — sebelumnya
    // `client` cuma scoped ke `connect()` jadi cleanup tidak bisa
    // menutupnya, membiarkan websocket menggantung tiap effect ini re-run
    // (StrictMode dev, atau `userId` berubah).
    const client = createBrowserSupabaseClient();

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    async function connect() {
      try {
        const response = await fetch("/api/realtime/token");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch Supabase Realtime token: ${response.status}`,
          );
        }

        const { token } = (await response.json()) as { token: string };
        if (cancelled) return;

        await client.realtime.setAuth(token);
        if (cancelled) return;

        unsubscribe = subscribeToNotificationInserts(
          client,
          currentUserId,
          onInsert,
        );
      } catch (error) {
        console.error(
          "useNotificationRealtime: failed to authenticate Supabase Realtime client",
          error,
        );
      }
    }

    void connect();

    return () => {
      cancelled = true;
      unsubscribe?.();
      client.realtime.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
}

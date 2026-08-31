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
 * Catatan: browser client di sini masih pakai anon key polos — bridging JWT
 * Realtime dari session Better Auth (`createSupabaseRealtimeJwt`) adalah
 * T-036.3, belum dikerjakan. Sampai itu selesai, callback `onInsert` tidak
 * akan pernah terpanggil (RLS `users_own_notifications` default-deny tanpa
 * `auth.uid()` yang valid).
 */
export function useNotificationRealtime(
  userId: string | null,
  onInsert: (notification: NotificationRecord) => void,
): void {
  useEffect(() => {
    if (!userId) return;

    const client = createBrowserSupabaseClient();
    const unsubscribe = subscribeToNotificationInserts(
      client,
      userId,
      onInsert,
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
}

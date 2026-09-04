"use client";

import { useEffect } from "react";
import type { NotificationRecord } from "@/domains/notification";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { subscribeToNotificationInserts } from "@/lib/supabase/realtime/notifications";

type InsertListener = (notification: NotificationRecord) => void;

type SharedSubscription = {
  refCount: number;
  listeners: Set<InsertListener>;
  teardown: () => void;
};

// T-098.4 (KI-042): `NotificationBell` sekarang bisa mount lebih dari satu
// kali bersamaan untuk `userId` yang sama (sidebar desktop yang di-hide
// lewat CSS di viewport mobile tetap mounted, sementara Sheet mobile
// me-mount salinan `AppSideNav` lain saat dibuka) — tanpa registry ini,
// tiap mount bikin client Supabase + fetch token + subscription realtime
// sendiri-sendiri untuk user yang sama. Registry per-`userId` ini
// memastikan hanya SATU koneksi yang benar-benar dibuka; mount kedua+
// cukup numpang di listener Set yang sama, dan insert baru di-fan-out ke
// semua listener yang sedang aktif (jadi badge tetap ikut update di semua
// instance yang mounted, bukan cuma yang bikin koneksi pertama).
const sharedSubscriptions = new Map<string, SharedSubscription>();

function subscribeShared(userId: string, listener: InsertListener) {
  let shared = sharedSubscriptions.get(userId);

  if (!shared) {
    // Dibuat sekali per entry registry (bukan di dalam `connect()`) supaya
    // teardown di bawah bisa disconnect socket client YANG SAMA — client
    // yang cuma scoped ke `connect()` membuat teardown tidak bisa
    // menutupnya, membiarkan websocket menggantung.
    const client = createBrowserSupabaseClient();
    const listeners = new Set<InsertListener>();
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
          userId,
          (notification) => {
            listeners.forEach((fn) => fn(notification));
          },
        );
      } catch (error) {
        console.error(
          "useNotificationRealtime: failed to authenticate Supabase Realtime client",
          error,
        );
      }
    }

    void connect();

    shared = {
      refCount: 0,
      listeners,
      teardown: () => {
        cancelled = true;
        unsubscribe?.();
        client.realtime.disconnect();
      },
    };
    sharedSubscriptions.set(userId, shared);
  }

  shared.refCount += 1;
  shared.listeners.add(listener);

  return () => {
    const current = sharedSubscriptions.get(userId);
    if (!current) return;
    current.listeners.delete(listener);
    current.refCount -= 1;
    if (current.refCount <= 0) {
      current.teardown();
      sharedSubscriptions.delete(userId);
    }
  };
}

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
 *
 * Koneksi sesungguhnya di-dedupe per `userId` lewat `subscribeShared` di
 * atas (T-098.4/KI-042) — beberapa komponen yang mount bersamaan untuk
 * user yang sama berbagi satu client/subscription, bukan masing-masing
 * bikin sendiri.
 */
export function useNotificationRealtime(
  userId: string | null,
  onInsert: InsertListener,
): void {
  useEffect(() => {
    if (!userId) return;
    return subscribeShared(userId, onInsert);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
}

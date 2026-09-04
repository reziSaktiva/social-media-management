"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { value: "calendar", label: "Calendar" },
  { value: "queue", label: "Queue" },
  { value: "drafts", label: "Drafts" },
  { value: "history", label: "History" },
] as const;

/**
 * Tabbar navigasi Calendar/Queue/Drafts/History di halaman Publish
 * (migrasi shadcn/ui T-101.4, ADR-097). `TabList`/`Tab` Astryx → `Tabs`/
 * `TabsList`/`TabsTrigger` shadcn (Radix Tabs). Ini tabbar navigasi rute
 * (bukan tab konten client-side biasa) — tiap `TabsTrigger` dirender
 * `asChild` sebagai `next/link` `Link` supaya tetap navigasi Next.js
 * (prefetch, back/forward, tanpa full reload), dan `Tabs` dikontrol lewat
 * `value` yang disinkronkan ke `usePathname()` supaya active state selalu
 * benar setelah navigasi (bukan state Radix internal). Tidak ada
 * `onValueChange` karena tidak ada state lokal untuk di-set — aktivasi
 * sesungguhnya terjadi lewat navigasi `Link` (klik/Enter), bukan lewat
 * fokus. `activationMode="manual"` supaya perpindahan fokus lewat panah
 * tidak memicu mode "automatic" bawaan Radix (yang butuh `onValueChange`
 * untuk sinkron dan diam-diam no-op tanpanya).
 */
export function PublishTabbar() {
  const pathname = usePathname();

  const activeTab =
    TABS.find((tab) => pathname.includes(`/publish/${tab.value}`))?.value ??
    "calendar";

  return (
    <Tabs value={activeTab} activationMode="manual">
      <TabsList variant="line">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} asChild>
            <Link href={`/publish/${tab.value}`}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

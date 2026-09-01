"use client";

import { useEffect, type ReactNode } from "react";

import { useLayer } from "@astryxdesign/core/Layer";
import { useFocusTrap, useScrollLock } from "@astryxdesign/core/hooks";
import { Stack } from "@astryxdesign/core/Stack";
import { VStack } from "@astryxdesign/core/VStack";

/**
 * Wrapper selektif Astryx (ADR-041) — PERTAMA di codebase ini, bukan
 * swizzle/canary. Dipakai karena Astryx v0.4.3 tidak punya komponen
 * "Drawer"/side-sheet, dan `Dialog` bawaan tidak bisa full-height: base
 * style-nya hardcode `height: fit-content`, yang membuat `top`+`bottom`
 * sekaligus jadi over-constrained (browser mengabaikan `bottom`, tinggi
 * tetap mengikuti konten) — dibuktikan visual saat implementasi T-036.4
 * (notifikasi bell). Drawer ini murni dirakit dari primitive Astryx
 * (`useLayer` mode "fixed" untuk top-layer + `useFocusTrap` untuk fokus +
 * `useScrollLock` untuk kunci scroll body), tanpa CSS/komponen custom di
 * luar Astryx — geometrinya benar-benar full-height karena kontainer
 * terluar diberi tinggi eksplisit (`h-dvh`, bukan `fit-content`).
 *
 * Lebar tetap 400px (`w-100` — token `--spacing-1` 4px × 100, bukan
 * arbitrary Tailwind). Belum dibuat configurable karena baru satu pemanggil
 * (notification-panel) yang butuh nilai ini — YAGNI, tambahkan prop `width`
 * kalau pemanggil kedua benar-benar butuh lebar lain.
 *
 * Slide-in animation sengaja di-skip: `useEntryAnimation` Astryx cuma punya
 * preset vertikal (slideUp/slideDown/fadeIn/scaleIn, tidak ada slide
 * horizontal), dan hook itu hanya animasi sekali saat mount pertama —
 * Drawer ini tetap ter-mount terus (buka/tutup lewat Popover API, bukan
 * mount/unmount React) jadi animasinya tidak akan terulang tiap dibuka.
 * Geometri statis yang benar lebih baik daripada animasi setengah jalan.
 */
export function Drawer({
  isOpen,
  onOpenChange,
  "aria-label": ariaLabel,
  children,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Accessible name (role="dialog" aria-label) — WAJIB diisi jelas. */
  "aria-label": string;
  children: ReactNode;
}) {
  const layer = useLayer({
    mode: "fixed",
    // "manual" (default, bukan "auto"/lightDismiss): drawer ini menutupi
    // seluruh viewport sendiri, jadi tidak ada "area di luar popover" untuk
    // native click-outside berlaku — backdrop-click & Escape ditangani
    // manual di bawah (onClick pada backdrop + useFocusTrap.onEscape).
    onHide: () => onOpenChange(false),
  });

  const { containerRef, focusFirst } = useFocusTrap<HTMLDivElement>({
    isActive: isOpen,
    onEscape: layer.hide,
  });

  useScrollLock(isOpen);

  // `isOpen` terkontrol dari luar (state parent) — sinkronkan ke show/hide
  // imperatif useLayer (Popover API), bukan conditional render.
  useEffect(() => {
    if (isOpen) {
      layer.show();
    } else {
      layer.hide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => focusFirst());
    return () => cancelAnimationFrame(raf);
  }, [isOpen, focusFirst]);

  return layer.render(
    // Kontainer terluar = backdrop penuh viewport (klik di luar panel →
    // tutup, dicek via target===currentTarget supaya klik di dalam panel
    // tidak ikut menutup). Panel sebenarnya adalah child `absolute` yang
    // menempel ke tepi kanan, tinggi penuh karena parent-nya (`h-dvh`)
    // punya tinggi eksplisit — bukan `fit-content` seperti masalah Dialog.
    <Stack
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
      className="h-dvh w-screen bg-overlay"
    >
      <VStack
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className="absolute inset-y-0 right-0 w-100 overflow-hidden bg-surface shadow-lg"
      >
        {children}
      </VStack>
    </Stack>,
    { x: 0, y: 0 },
  );
}

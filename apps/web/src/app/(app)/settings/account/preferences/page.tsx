"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons";

import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { useThemeMode } from "@/components/Providers";

// T-016.3 — reuse useThemeMode() (sudah tersambung ke cookie `theme`
// server-side via Providers.tsx, ADR-055). Tidak membuat state/cookie baru.
// Scope preferences hanya "Tema Tampilan" — tidak ada setting lain di
// baseline (information-architecture.md § 7 User Settings).
//
// T-099.1: `ToggleButtonGroup` Astryx (type="single") -> `ToggleGroup`
// shadcn (type="single" juga tersedia di primitive Radix-nya). Ikon
// FaSun/FaMoon (react-icons) diganti Sun01Icon/Moon01Icon (hugeicons) —
// komponen ini ditulis ulang penuh untuk migrasi, bukan cuma disentuh
// sebagian, jadi ikon default Maia dipakai (bukan react-icons yang cuma
// dipertahankan untuk logo brand platform, ADR-058).
export default function Page() {
  const { mode, toggleMode } = useThemeMode();

  return (
    /* eslint-disable-next-line no-restricted-syntax -- T-099.1: file ini
       sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097), bukan lagi
       VStack Astryx. */
    <div className="flex max-w-2xl flex-col gap-6">
      <h2 className="font-heading text-lg font-semibold tracking-tight">
        Preferences
      </h2>

      <Card>
        <CardContent>
          {/* eslint-disable-next-line no-restricted-syntax -- T-099.1, sama seperti di atas */}
          <div className="flex items-center justify-between gap-4">
            {/* eslint-disable-next-line no-restricted-syntax -- T-099.1, sama seperti di atas */}
            <div className="flex flex-col gap-1">
              <Text variant="small">Tema Tampilan</Text>
              <Text variant="muted">
                Pilih tampilan Light atau Dark untuk akun Anda.
              </Text>
            </div>

            <ToggleGroup
              type="single"
              variant="outline"
              value={mode}
              onValueChange={(value) => {
                if (value && value !== mode) {
                  toggleMode();
                }
              }}
              aria-label="Tema Tampilan"
            >
              <ToggleGroupItem value="light" aria-label="Light">
                <HugeiconsIcon icon={Sun01Icon} strokeWidth={2} />
                Light
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" aria-label="Dark">
                <HugeiconsIcon icon={Moon01Icon} strokeWidth={2} />
                Dark
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

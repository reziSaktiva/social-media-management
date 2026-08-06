"use client";

import { FaMoon, FaSun } from "react-icons/fa6";

import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import {
  ToggleButton,
  ToggleButtonGroup,
} from "@astryxdesign/core/ToggleButton";
import { VStack } from "@astryxdesign/core/VStack";

import { useThemeMode } from "@/components/Providers";

// T-016.3 — reuse useThemeMode() (sudah tersambung ke cookie `theme`
// server-side via Providers.tsx, ADR-055). Tidak membuat state/cookie baru.
// Scope preferences hanya "Tema Tampilan" — tidak ada setting lain di
// baseline (information-architecture.md § 7 User Settings).
export default function Page() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <VStack gap={6} maxWidth={640}>
      <Heading level={2}>Preferences</Heading>

      <Card>
        <HStack gap={4} align="center" justify="between">
          <VStack gap={1}>
            <Text type="label">Tema Tampilan</Text>
            <Text type="supporting">
              Pilih tampilan Light atau Dark untuk akun Anda.
            </Text>
          </VStack>

          <ToggleButtonGroup
            label="Tema Tampilan"
            type="single"
            value={mode}
            onChange={(value) => {
              if (value && value !== mode) {
                toggleMode();
              }
            }}
          >
            <ToggleButton value="light" label="Light" icon={<FaSun />} />
            <ToggleButton value="dark" label="Dark" icon={<FaMoon />} />
          </ToggleButtonGroup>
        </HStack>
      </Card>
    </VStack>
  );
}

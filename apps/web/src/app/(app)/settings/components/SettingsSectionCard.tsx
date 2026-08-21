import type { ReactNode } from "react";

import { Card } from "@astryxdesign/core/Card";
import { Section } from "@astryxdesign/core/Section";

/**
 * Wrapper konten bersama untuk tiap halaman Settings — sebelumnya blok ini
 * disalin identik di ProfileForm/MembersTable/ConnectedAccountsList (code
 * review PR #88). `Card` di dalam `Section` (bukan sebaliknya) karena
 * `Section` tidak bisa diberi border/radius/bg sendiri tanpa `xstyle`
 * (dilarang, ADR-082) — lihat ADR-085 untuk alasan lengkap kenapa Table/List
 * dense data di sini tetap dibungkus `Card`.
 */
export function SettingsSectionCard({ children }: { children: ReactNode }) {
  return (
    <Section padding={0}>
      <Card padding={4}>{children}</Card>
    </Section>
  );
}

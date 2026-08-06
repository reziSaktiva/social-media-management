import { Section } from "@astryxdesign/core/Section";

export default function Layout({ children }: { children: React.ReactNode }) {
  // settings layout shell — sidebar/nav internal direncanakan di T-016.1.
  // Section dipakai (bukan AppShell kedua — route ini sudah dibungkus
  // AppShell di [slug]/layout.tsx, dan menumpuk AppShell dilarang) hanya
  // untuk memberi surface/background token yang benar (fix kontras
  // ScaffoldPlaceholder di dark mode).
  return (
    <Section variant="section" minHeight="100%">
      {children}
    </Section>
  );
}

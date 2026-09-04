import { PublishPageHeader } from "./components/PublishPageHeader";
import { PublishTabbar } from "./components/PublishTabbar";

/**
 * Layout halaman Publish — composition murni (PublishPageHeader +
 * PublishTabbar + children), tanpa business logic (aturan keras #5
 * AGENTS.md). Migrasi shadcn/ui (T-101.4, ADR-097): `VStack` Astryx →
 * Tailwind flex.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- T-101.4: file ini sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097), bukan lagi VStack Astryx.
    <div className="flex flex-col gap-4">
      <PublishPageHeader />
      <PublishTabbar />
      {children}
    </div>
  );
}

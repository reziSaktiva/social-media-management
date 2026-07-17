import { ContentStatus } from "@social/shared";

/**
 * Root entry — nanti redirect ke workspace aktif atau onboarding.
 * Sementara: halaman bootstrap + smoke import @social/shared.
 */
export default function RootPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-8">
      <p className="text-sm uppercase tracking-wide text-zinc-500">
        Social Media Management
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Monorepo scaffold siap
      </h1>
      <p className="max-w-md text-center text-sm text-zinc-600">
        Hybrid monorepo (`apps/web` + `packages/shared`). DX tooling, Prisma,
        Better Auth, dan CI menyusul di sisa M7.
      </p>
      <p className="rounded-md bg-white px-3 py-1.5 text-xs text-zinc-500 shadow-sm">
        shared smoke: ContentStatus.Draft ={" "}
        <code className="text-zinc-800">{ContentStatus.Draft}</code>
      </p>
    </main>
  );
}

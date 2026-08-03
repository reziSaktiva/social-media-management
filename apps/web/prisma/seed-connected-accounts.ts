/**
 * Seed manual — mock WorkspaceConnectedAccount (ADR-059).
 *
 * BUKAN bagian dari `bun run db:migrate`/`postinstall` otomatis. Jalankan
 * manual saat butuh akun terkoneksi mock untuk verifikasi Draft Editor →
 * Schedule end-to-end, karena Outstand OAuth asli (ADR-040) belum tersedia
 * (OUTSTAND_API_KEY kosong → Fake OutstandAdapter, lihat
 * `src/lib/adapters/outstand/`).
 *
 * Idempotent — aman dijalankan berulang (upsert by `[workspaceId, outstandAccountId]`).
 *
 * Usage (dari root repo, dengan env lokal `apps/web/.env.local`):
 *   bun --env-file=apps/web/.env.local run apps/web/prisma/seed-connected-accounts.ts <workspace-slug>
 * atau set env WORKSPACE_SLUG:
 *   WORKSPACE_SLUG=<slug> bun --env-file=apps/web/.env.local run apps/web/prisma/seed-connected-accounts.ts
 *
 * Tidak ada default slug hardcoded — `project-manager/QA_TEST_ACCOUNTS.md`
 * hanya mencatat email akun test (Raka Pratama), bukan slug workspace-nya.
 * Cek slug workspace test yang aktif (mis. via browser setelah login, URL
 * `/{slug}/...`) sebelum menjalankan script ini.
 */
import { SocialPlatform } from "@social/shared";
import { prisma } from "@/lib/prisma/client";

const MOCK_ACCOUNTS = [
  {
    platform: SocialPlatform.Instagram,
    outstandAccountId: "mock-ig-001",
    handle: "@insvire.demo",
  },
  {
    platform: SocialPlatform.Facebook,
    outstandAccountId: "mock-fb-001",
    handle: "Insvire Demo",
  },
] as const;

async function main() {
  const workspaceSlug = process.argv[2] ?? process.env.WORKSPACE_SLUG;

  if (!workspaceSlug) {
    console.error(
      "Missing workspace slug. Usage: bun run apps/web/prisma/seed-connected-accounts.ts <workspace-slug> " +
        "(atau set env WORKSPACE_SLUG). Cek slug workspace test yang aktif — tidak ada default hardcoded.",
    );
    process.exitCode = 1;
    return;
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: { id: true, slug: true, name: true },
  });

  if (!workspace) {
    console.error(
      `Workspace dengan slug "${workspaceSlug}" tidak ditemukan. Pastikan slug benar.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `Seeding mock connected accounts untuk workspace "${workspace.name}" (${workspace.slug})...`,
  );

  for (const account of MOCK_ACCOUNTS) {
    const result = await prisma.workspaceConnectedAccount.upsert({
      where: {
        workspaceId_outstandAccountId: {
          workspaceId: workspace.id,
          outstandAccountId: account.outstandAccountId,
        },
      },
      update: {
        handle: account.handle,
        platform: account.platform,
        status: "active",
      },
      create: {
        workspaceId: workspace.id,
        platform: account.platform,
        outstandAccountId: account.outstandAccountId,
        handle: account.handle,
        status: "active",
      },
    });

    console.log(
      `  - ${result.platform} (${result.handle}) → outstandAccountId=${result.outstandAccountId}, id=${result.id}`,
    );
  }

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

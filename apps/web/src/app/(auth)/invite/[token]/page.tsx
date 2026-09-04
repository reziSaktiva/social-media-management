import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceService } from "@/domains/workspace";
import { workspaceRepository } from "@/lib/repositories/workspace";

import { AcceptInvitePageClient } from "./components/AcceptInvitePageClient";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // RSC boleh memanggil Application Service langsung (AGENTS.md #5) — tidak
  // ada composition root cross-domain di sini, jadi tidak perlu lewat
  // Server Action dulu (beda dengan mutasi di AcceptInviteForm/actions.ts).
  //
  // PENTING: hasil `getInviteToAccept` diteruskan HANYA SEKALI sebagai
  // `initialInvite` ke `<AcceptInvitePageClient>` — component ini SELALU
  // dirender di posisi yang sama terlepas dari `invite.state` (tidak ada
  // percabangan kondisional di level Server Component). Lihat doc comment
  // panjang di `AcceptInvitePageClient.tsx` untuk alasan strukturalnya: kalau
  // percabangan 5-state dilakukan di sini, refresh RSC otomatis yang dipicu
  // Server Action `acceptInviteAction` (dipanggil dari client setelah
  // sign-up/sign-in sukses) akan mem-fetch ulang `getInviteToAccept` — yang
  // saat itu SUDAH `accepted`, bukan lagi `pending` — dan mengganti seluruh
  // subtree ini dengan state "invalid" tepat saat seharusnya menampilkan
  // "Success", walau backend-nya sendiri sudah berhasil.
  const workspaceService = new WorkspaceService(workspaceRepository);
  const invite = await workspaceService.getInviteToAccept(token);

  return (
    <Card>
      <CardContent>
        <AcceptInvitePageClient token={token} initialInvite={invite} />
      </CardContent>
    </Card>
  );
}

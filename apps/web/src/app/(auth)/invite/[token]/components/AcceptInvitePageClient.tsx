"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { Icon } from "@astryxdesign/core/Icon";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import {
  MEMBER_ROLE_LABEL,
  type WorkspaceInviteAcceptView,
} from "@/domains/workspace";

import { AcceptInviteForm } from "./AcceptInviteForm";

/**
 * Delay tampilan state "Success" (Claude Design `templates/accept-invite.html`)
 * sebelum auto-redirect ke workspace — cukup lama untuk terbaca, cukup
 * singkat supaya tidak terasa lambat.
 */
const SUCCESS_REDIRECT_DELAY_MS = 1500;

/**
 * Client wrapper untuk SELURUH 5 state halaman accept-invite (T-093.1/.2/.3) —
 * dipisah dari `page.tsx` (Server Component) karena satu bug nyata yang
 * ditemukan saat verifikasi browser: memanggil Server Action
 * (`acceptInviteAction`) dari Client Component membuat Next.js me-refresh
 * RSC payload route `/invite/[token]` saat ini secara otomatis begitu action
 * itu resolve. Kalau percabangan valid/expired/invalid masih dilakukan di
 * `page.tsx` berdasarkan `WorkspaceService.getInviteToAccept` yang dipanggil
 * ULANG saat refresh itu, hasilnya SELALU "invalid" tepat setelah accept
 * berhasil (invitation sudah pindah dari `pending` ke `accepted`) —
 * menggantikan `<AcceptInviteForm>` (yang sedang menampilkan state
 * "Success") dengan EmptyState "Link Undangan Tidak Valid" sebelum sempat
 * kebaca sama sekali, padahal backend-nya sudah benar (workspace_members
 * sudah ke-insert). Ditemukan dengan mengecek DB langsung — commit
 * transaksinya sukses, tapi UI keburu di-unmount oleh refresh.
 *
 * Fix: `page.tsx` HANYA memanggil `getInviteToAccept` SEKALI dan selalu
 * merender `<AcceptInvitePageClient>` yang SAMA di posisi yang sama
 * (tidak ada percabangan kondisional di server) — component ini membekukan
 * hasil awal itu lewat `useState(initialInvite)` (React sengaja
 * mengabaikan initializer `useState` pada re-render berikutnya), jadi
 * refresh RSC yang dipicu Server Action tidak pernah bisa mengganti hasil
 * yang sudah dibekukan di sini, dan instance component ini juga tidak
 * pernah di-unmount karena tipe elemen yang dirender `page.tsx` tidak lagi
 * berubah berdasarkan state token.
 */
export function AcceptInvitePageClient({
  token,
  initialInvite,
}: {
  token: string;
  initialInvite: WorkspaceInviteAcceptView;
}) {
  const router = useRouter();
  const [invite] = useState(initialInvite);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isSuccess) {
      return;
    }
    const timer = setTimeout(() => {
      router.push("/");
      router.refresh();
    }, SUCCESS_REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isSuccess, router]);

  if (isSuccess) {
    return (
      <EmptyState
        icon={<Icon icon="success" size="lg" color="success" />}
        title="Berhasil Bergabung!"
        description="Anda akan diarahkan ke workspace sebentar lagi."
      />
    );
  }

  if (invite.state === "expired") {
    return (
      <EmptyState
        icon={<Icon icon="clock" size="lg" color="warning" />}
        title="Undangan Kedaluwarsa"
        description="Link undangan ini sudah lewat 7 hari sejak dibuat. Minta Owner atau Admin workspace untuk mengirim undangan baru."
        actions={
          <Link href="/login" isStandalone>
            Kembali ke halaman login
          </Link>
        }
      />
    );
  }

  if (invite.state === "invalid") {
    return (
      <EmptyState
        icon={<Icon icon="warning" size="lg" color="error" />}
        title="Link Undangan Tidak Valid"
        description="Link ini rusak, sudah pernah dipakai, atau sudah dibatalkan. Minta Owner atau Admin workspace untuk mengirim undangan baru."
        actions={
          <Link href="/login" isStandalone>
            Kembali ke halaman login
          </Link>
        }
      />
    );
  }

  const { details } = invite;

  return (
    <VStack gap={6}>
      <VStack gap={1}>
        <Heading level={1}>Undangan Bergabung</Heading>
        <Text type="supporting">
          <strong>{details.invitedByName}</strong> mengundang Anda bergabung ke
          workspace <strong>{details.workspaceName}</strong> sebagai{" "}
          <strong>{MEMBER_ROLE_LABEL[details.role]}</strong>.
        </Text>
      </VStack>

      <AcceptInviteForm
        token={token}
        email={details.email}
        isExistingUser={details.isExistingUser}
        onAccepted={() => setIsSuccess(true)}
      />

      <Text type="supporting">
        Bukan Anda yang dimaksud? <Link href="/login">Kembali ke login</Link>
      </Text>
    </VStack>
  );
}

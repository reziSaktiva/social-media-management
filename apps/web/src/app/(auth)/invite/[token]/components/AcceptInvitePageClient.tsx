"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Text } from "@/components/ui/text";
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
 *
 * T-097.3: EmptyState Astryx -> `Empty`/`EmptyHeader`/`EmptyMedia`/
 * `EmptyTitle`/`EmptyDescription` shadcn (registry:ui `empty`). Warna icon
 * status (success/warning/error) Astryx (`color="success"|"warning"|"error"`)
 * TIDAK punya padanan token di Stone theme shadcn saat ini — hanya
 * `--destructive` yang tersedia (tidak ada `--success`/`--warning`).
 * Sengaja TIDAK mengarang hex/token baru (aturan CLAUDE.md): "success"
 * dibiarkan netral (default `EmptyMedia variant="icon"` = bg-muted/
 * text-foreground) karena tidak ada token hijau, sedangkan "expired" dan
 * "invalid" sama-sama diberi `text-destructive` — keduanya berarti outcome
 * yang identik bagi user (link tidak bisa dipakai, minta undangan baru),
 * jadi disamakan severity-nya alih-alih dibedakan hanya karena kebetulan
 * salah satu tokennya sudah ada. Gap token success/warning tetap dilaporkan
 * ke King Rezi (KI-041), bukan diputuskan sepihak.
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
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              strokeWidth={2}
              aria-hidden="true"
            />
          </EmptyMedia>
          <EmptyTitle>Berhasil Bergabung!</EmptyTitle>
          <EmptyDescription>
            Anda akan diarahkan ke workspace sebentar lagi.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (invite.state === "expired") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon" className="text-destructive">
            <HugeiconsIcon
              icon={Clock01Icon}
              strokeWidth={2}
              aria-hidden="true"
            />
          </EmptyMedia>
          <EmptyTitle>Undangan Kedaluwarsa</EmptyTitle>
          <EmptyDescription>
            Link undangan ini sudah lewat 7 hari sejak dibuat. Minta Owner atau
            Admin workspace untuk mengirim undangan baru.
          </EmptyDescription>
        </EmptyHeader>
        <Link
          href="/login"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Kembali ke halaman login
        </Link>
      </Empty>
    );
  }

  if (invite.state === "invalid") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon" className="text-destructive">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              strokeWidth={2}
              aria-hidden="true"
            />
          </EmptyMedia>
          <EmptyTitle>Link Undangan Tidak Valid</EmptyTitle>
          <EmptyDescription>
            Link ini rusak, sudah pernah dipakai, atau sudah dibatalkan. Minta
            Owner atau Admin workspace untuk mengirim undangan baru.
          </EmptyDescription>
        </EmptyHeader>
        <Link
          href="/login"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Kembali ke halaman login
        </Link>
      </Empty>
    );
  }

  const { details } = invite;

  return (
    /* eslint-disable-next-line no-restricted-syntax -- T-097.3: file ini
       sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097), bukan lagi
       VStack Astryx. */
    <div className="flex flex-col gap-6">
      {/* eslint-disable-next-line no-restricted-syntax -- T-097.3, sama seperti di atas */}
      <div className="flex flex-col gap-1">
        <Text variant="h3">Undangan Bergabung</Text>
        <Text variant="muted">
          <strong>{details.invitedByName}</strong> mengundang Anda bergabung ke
          workspace <strong>{details.workspaceName}</strong> sebagai{" "}
          <strong>{MEMBER_ROLE_LABEL[details.role]}</strong>.
        </Text>
      </div>

      <AcceptInviteForm
        token={token}
        email={details.email}
        isExistingUser={details.isExistingUser}
        onAccepted={() => setIsSuccess(true)}
      />

      <Text variant="muted">
        Bukan Anda yang dimaksud?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Kembali ke login
        </Link>
      </Text>
    </div>
  );
}

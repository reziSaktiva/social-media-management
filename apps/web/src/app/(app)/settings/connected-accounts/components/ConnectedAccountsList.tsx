"use client";

import { useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";

import {
  getConnectionStatusLabel,
  resolveConnectionDisplayStatus,
  type ConnectedAccountRecord,
  type ConnectionDisplayStatus,
} from "@/domains/workspace";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";
import { formatConnectedDate } from "@/lib/utils/format-date";
import { cn, getInitials } from "@/lib/utils";

import { PLATFORM_ICON } from "../../../components/platform-icons";
import {
  SETTINGS_BREADCRUMB_GROUP,
  SettingsPageHead,
} from "../../components/SettingsPageHead";
import {
  disconnectAccountAction,
  initiateReconnectAccountAction,
} from "../actions";
import { ConnectPlatformMenu } from "./ConnectPlatformMenu";

// KI-041 (Stone theme shadcn belum punya token --success/--warning, dicatat
// saat T-097.3): `Badge` shadcn cuma varian default/secondary/destructive/
// outline/ghost/link. "disconnected" (dulu "error") tetap punya padanan
// asli ("destructive"). "reconnect-required" (dulu "warning", tanpa token)
// dipetakan ke "outline" supaya beda dari "active" ("secondary") tanpa
// mengarang warna baru — perluasan gap yang sama, dilaporkan ke King Rezi,
// bukan keputusan final.
const STATUS_BADGE_VARIANT: Record<
  ConnectionDisplayStatus,
  "secondary" | "outline" | "destructive"
> = {
  active: "secondary",
  "reconnect-required": "outline",
  disconnected: "destructive",
};

/**
 * Badge ikon brand kecil di pojok Avatar. Sebelumnya (Astryx) dikomposisi
 * dari `HStack` + nilai bayangan arbitrary (Tailwind arbitrary-value box
 * shadow) untuk meniru border tipis; shadcn `Avatar` (`group/avatar
 * relative ...`) sudah `position: relative` bawaan, jadi span absolute ini
 * bisa jadi child langsung `Avatar` tanpa wrapper tambahan, dan border-nya
 * cukup utility asli `ring-1 ring-border` — tidak perlu lagi arbitrary
 * shadow value seperti sebelumnya.
 */
function PlatformStatusDot({
  platform,
}: {
  platform: ConnectedAccountRecord["platform"];
}) {
  const entry = PLATFORM_ICON[platform];
  if (!entry) {
    return null;
  }
  const PlatformGlyph = entry.Icon;
  return (
    <span
      aria-hidden
      className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-background ring-1 ring-border"
    >
      {/* Warna brand asli (bukan token) — sama seperti PlatformBadge di
          sidebar-channels/ChannelsSection.tsx (ADR-058 poin 6 & 10). */}
      <PlatformGlyph size={9} color={entry.color} />
    </span>
  );
}

/**
 * Tombol "Reconnect" (T-015.3, ADR-105) — memicu
 * `initiateReconnectAccountAction` (Server Action → `WorkspaceService.
 * initiateConnectAccount` dengan `redirectAccountId` terisi →
 * `OutstandAdapter.connectAccount`, Fake loopback). Bukan aksi destruktif
 * (tidak menghapus apa pun, sebaliknya MEMULIHKAN koneksi), jadi klik
 * langsung memicu aksi tanpa dialog konfirmasi Tier 2 — beda dari
 * Disconnect. Sukses: Server Action `redirect()` ke `redirectUrl` OAuth,
 * komponen ini unmount. Gagal: `toast.error` (pola sama
 * `RetryTargetButton`).
 */
function ReconnectButton({ account }: { account: ConnectedAccountRecord }) {
  const [isPending, startTransition] = useTransition();

  function handleReconnect() {
    startTransition(async () => {
      const result = await initiateReconnectAccountAction(
        account.id,
        account.platform,
      );
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={handleReconnect}
    >
      Reconnect
    </Button>
  );
}

/**
 * Tombol aksi per baris ditentukan dari `displayStatus` penuh (3 state),
 * bukan cuma boolean `reconnectRequired` — akun yang sudah `disconnected`
 * (bukan `reconnect-required`) tidak punya aksi yang relevan untuk
 * ditampilkan di sini (bukan "Disconnect" lagi, karena sudah disconnected).
 *
 * T-014.3: "Disconnect" (state `active`) — membuka dialog konfirmasi Tier 2
 * (ADR-049) lewat `onRequestDisconnect`, pola persis `QueueScreen.tsx`
 * (Cancel Schedule) / `MembersTable.tsx` (Remove member).
 * T-015.3: "Reconnect" (state `reconnect-required`) sekarang aktif —
 * lihat `ReconnectButton` di atas.
 */
function ConnectedAccountAction({
  account,
  displayStatus,
  onRequestDisconnect,
}: {
  account: ConnectedAccountRecord;
  displayStatus: ConnectionDisplayStatus;
  onRequestDisconnect: () => void;
}) {
  switch (displayStatus) {
    case "reconnect-required":
      return <ReconnectButton account={account} />;
    case "active":
      return (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onRequestDisconnect}
        >
          Disconnect
        </Button>
      );
    case "disconnected":
      return null;
  }
}

/**
 * KI-055 (poin 5, mengikuti pola final poin 1 & 3 — Drafts/Workspaces):
 * `Card`+`Item`/`ItemGroup` diganti `Table` shadcn tanpa header kolom,
 * dibungkus `<div>` border+rounded manual (bukan `Card`). Baris di sini
 * TIDAK diklik penuh (beda dari Drafts/Workspaces) — badge status dan
 * tombol aksi (Disconnect/Reconnect) tetap elemen interaktif tersendiri
 * di dalam baris, bukan trigger navigasi baris.
 */
function ConnectedAccountRow({
  account,
  onRequestDisconnect,
}: {
  account: ConnectedAccountRecord;
  onRequestDisconnect: (account: ConnectedAccountRecord) => void;
}) {
  const displayStatus = resolveConnectionDisplayStatus(account);
  const entry = PLATFORM_ICON[account.platform];
  const platformLabel = entry?.label ?? account.platform;

  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        {/* eslint-disable-next-line no-restricted-syntax -- T-099.3: file ini sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097) */}
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(account.handle)}</AvatarFallback>
            <PlatformStatusDot platform={account.platform} />
          </Avatar>
          {/* eslint-disable-next-line no-restricted-syntax -- T-099.3, sama seperti di atas */}
          <div className="flex flex-col">
            <Text variant="small">{account.handle}</Text>
            <Text variant="muted">
              {platformLabel} · Terhubung sejak{" "}
              {formatConnectedDate(account.connectedAt)}
            </Text>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        {/* eslint-disable-next-line no-restricted-syntax -- T-099.3, sama seperti di atas */}
        <div className="flex items-center justify-end gap-2">
          <Badge variant={STATUS_BADGE_VARIANT[displayStatus]}>
            {getConnectionStatusLabel(account)}
          </Badge>
          <ConnectedAccountAction
            account={account}
            displayStatus={displayStatus}
            onRequestDisconnect={() => onRequestDisconnect(account)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

/**
 * `ConnectedAccountsList` (T-099.3, migrasi shadcn/ui; KI-055 poin 5,
 * 2026-09-10: `Card`+`Item`/`ItemGroup` diganti `Table` tanpa header
 * kolom — lihat docstring `ConnectedAccountRow` di atas).
 */
export function ConnectedAccountsList({
  accounts,
  connectResult = null,
}: {
  accounts: ConnectedAccountRecord[];
  /**
   * Hasil Connect/Reconnect Account (T-013.1/T-013.2, T-015.3, ADR-105) —
   * diteruskan dari `page.tsx` (dibaca dari `?connect=` yang diset Route
   * Handler callback). Ditampilkan sekali sebagai toast saat mount, lalu
   * query param dibersihkan dari URL (`router.replace`, tanpa menumpuk
   * history) supaya refresh halaman tidak menampilkan toast yang sama
   * berulang.
   */
  connectResult?: "success" | "error" | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!connectResult) return;
    if (connectResult === "success") {
      toast("Akun berhasil terhubung");
    } else {
      toast.error("Gagal menghubungkan akun. Coba lagi.");
    }
    router.replace(pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hanya perlu re-run saat `connectResult` (query param) berubah, bukan tiap render `router`/`pathname` (referensi baru tiap render Next.js).
  }, [connectResult]);

  const disconnectConfirm = useConfirmAction<ConnectedAccountRecord>(
    (account) => disconnectAccountAction(account.id),
    () => toast("Akun berhasil diputus koneksinya"),
  );

  const target = disconnectConfirm.target;
  const targetPlatformLabel = target
    ? (PLATFORM_ICON[target.platform]?.label ?? target.platform)
    : "";

  return (
    /* eslint-disable-next-line no-restricted-syntax -- T-099.3: file ini
       sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097), bukan lagi
       VStack Astryx. */
    <div className="flex flex-col gap-4 p-4">
      <SettingsPageHead
        pageName="Connected Accounts"
        breadcrumb={`${SETTINGS_BREADCRUMB_GROUP.organization} / Connected Accounts`}
        action={<ConnectPlatformMenu />}
      />

      {disconnectConfirm.error ? (
        <Alert variant="destructive">
          <AlertTitle>{disconnectConfirm.error}</AlertTitle>
        </Alert>
      ) : null}

      {/* eslint-disable-next-line no-restricted-syntax -- T-099.3: file ini sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097) */}
      <div
        className={cn(
          "rounded-xl border border-border",
          accounts.length === 0 ? "p-6" : "py-2",
        )}
      >
        {accounts.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Belum ada akun terhubung</EmptyTitle>
              <EmptyDescription>
                Hubungkan akun media sosial pertama lewat tombol Connect Account
                di atas.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableBody>
              {accounts.map((account) => (
                <ConnectedAccountRow
                  key={account.id}
                  account={account}
                  onRequestDisconnect={(requested) =>
                    disconnectConfirm.open(requested)
                  }
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ConfirmActionDialog
        isOpen={disconnectConfirm.isOpen}
        onClose={disconnectConfirm.close}
        title={`Putuskan koneksi ${targetPlatformLabel} ${target?.handle ?? ""}?`}
        description="Post yang sudah terjadwal untuk akun ini akan tetap di antrean — tidak otomatis dibatalkan. Post baru tidak bisa dijadwalkan ke akun ini sampai disambungkan kembali."
        confirmLabel="Putuskan Koneksi"
        isLoading={disconnectConfirm.isLoading}
        onConfirm={() => void disconnectConfirm.confirm()}
        variant="destructive"
      />
    </div>
  );
}

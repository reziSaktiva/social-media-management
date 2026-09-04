import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  getConnectionStatusLabel,
  resolveConnectionDisplayStatus,
  type ConnectedAccountRecord,
  type ConnectionDisplayStatus,
} from "@/domains/workspace";
import { formatConnectedDate } from "@/lib/utils/format-date";
import { getInitials } from "@/lib/utils";

import { PLATFORM_ICON } from "../../../components/platform-icons";
import {
  SETTINGS_BREADCRUMB_GROUP,
  SettingsPageHead,
} from "../../components/SettingsPageHead";
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
 * Tombol aksi per baris ditentukan dari `displayStatus` penuh (3 state),
 * bukan cuma boolean `reconnectRequired` — akun yang sudah `disconnected`
 * (bukan `reconnect-required`) tidak punya aksi yang relevan untuk
 * ditampilkan di sini (bukan "Disconnect" lagi, karena sudah disconnected).
 *
 * Tooltip pada Button `disabled` dibungkus `<span tabIndex={0}>` — native
 * `disabled` (dan class `disabled:pointer-events-none` bawaan `Button`)
 * membuat elemen itu sendiri tidak menerima event hover, jadi `Tooltip`
 * radix butuh elemen pembungkus yang BISA menerima hover sebagai trigger.
 */
function ConnectedAccountAction({
  displayStatus,
}: {
  displayStatus: ConnectionDisplayStatus;
}) {
  switch (displayStatus) {
    case "reconnect-required":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="inline-flex">
              <Button type="button" variant="secondary" size="sm" disabled>
                Reconnect
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Tersedia setelah T-015 (Reconnect akun) selesai
          </TooltipContent>
        </Tooltip>
      );
    case "active":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="inline-flex">
              <Button type="button" variant="secondary" size="sm" disabled>
                Disconnect
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Tersedia setelah T-014 (Disconnect akun) selesai
          </TooltipContent>
        </Tooltip>
      );
    case "disconnected":
      return null;
  }
}

function ConnectedAccountRow({ account }: { account: ConnectedAccountRecord }) {
  const displayStatus = resolveConnectionDisplayStatus(account);
  const entry = PLATFORM_ICON[account.platform];
  const platformLabel = entry?.label ?? account.platform;

  return (
    <Item>
      <ItemMedia>
        <Avatar>
          <AvatarFallback>{getInitials(account.handle)}</AvatarFallback>
          <PlatformStatusDot platform={account.platform} />
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{account.handle}</ItemTitle>
        <ItemDescription>
          {platformLabel} · Terhubung sejak{" "}
          {formatConnectedDate(account.connectedAt)}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Badge variant={STATUS_BADGE_VARIANT[displayStatus]}>
          {getConnectionStatusLabel(account)}
        </Badge>
        <ConnectedAccountAction displayStatus={displayStatus} />
      </ItemActions>
    </Item>
  );
}

/**
 * `ConnectedAccountsList` (T-099.3, migrasi shadcn/ui). `List`/`ListItem`
 * Astryx diganti `Item`/`ItemGroup` (registry:ui `item`) — primitive resmi
 * shadcn untuk baris "media + content + actions", padanan paling dekat
 * dengan pola `startContent`/`label`/`description`/`endContent` Astryx
 * (ditemukan lewat MCP `search_items_in_registries`, dicek contoh pakai
 * `item-avatar`/`item-demo`). Divider antar baris cukup `divide-y` pada
 * `ItemGroup` (bukan `ItemSeparator` manual per baris, supaya tidak perlu
 * `.map` dengan index khusus untuk baris terakhir).
 */
export function ConnectedAccountsList({
  accounts,
}: {
  accounts: ConnectedAccountRecord[];
}) {
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

      <Card>
        <CardContent className={accounts.length === 0 ? undefined : "px-0"}>
          {accounts.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Belum ada akun terhubung</EmptyTitle>
                <EmptyDescription>
                  Hubungkan akun media sosial pertama lewat tombol Connect
                  Account di atas.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ItemGroup className="gap-0 divide-y divide-border">
              {accounts.map((account) => (
                <ConnectedAccountRow key={account.id} account={account} />
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

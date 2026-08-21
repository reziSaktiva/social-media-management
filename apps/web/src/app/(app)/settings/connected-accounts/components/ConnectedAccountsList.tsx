import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { HStack } from "@astryxdesign/core/HStack";
import { List, ListItem } from "@astryxdesign/core/List";
import { Section } from "@astryxdesign/core/Section";
import { VStack } from "@astryxdesign/core/VStack";

import {
  getConnectionStatusLabel,
  resolveConnectionDisplayStatus,
  type ConnectedAccountRecord,
  type ConnectionDisplayStatus,
} from "@/domains/workspace";
import { formatConnectedDate } from "@/lib/utils/format-date";

import { PLATFORM_ICON } from "../../../components/platform-icons";
import { SettingsPageHead } from "../../components/SettingsPageHead";

import { ConnectPlatformMenu } from "./ConnectPlatformMenu";

const STATUS_BADGE_VARIANT: Record<
  ConnectionDisplayStatus,
  "neutral" | "warning" | "error"
> = {
  active: "neutral",
  "reconnect-required": "warning",
  disconnected: "error",
};

/** Small brand-icon badge shown in the corner of the account Avatar. */
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
    <HStack
      hAlign="center"
      vAlign="center"
      className="absolute -inset-e-1 -bottom-1 size-4 rounded-full bg-surface shadow-[0_0_0_var(--border-width)_var(--color-border)]"
      aria-hidden
    >
      {/* Warna brand asli (bukan token) — sama seperti PlatformBadge di
          sidebar-channels/ChannelsSection.tsx (ADR-058 poin 6 & 10). */}
      <PlatformGlyph size={9} color={entry.color} />
    </HStack>
  );
}

/**
 * Tombol aksi per baris ditentukan dari `displayStatus` penuh (3 state),
 * bukan cuma boolean `reconnectRequired` — akun yang sudah `disconnected`
 * (bukan `reconnect-required`) tidak punya aksi yang relevan untuk
 * ditampilkan di sini (bukan "Disconnect" lagi, karena sudah disconnected).
 */
function ConnectedAccountAction({
  displayStatus,
}: {
  displayStatus: ConnectionDisplayStatus;
}) {
  switch (displayStatus) {
    case "reconnect-required":
      return (
        <Button
          label="Reconnect"
          variant="secondary"
          size="sm"
          isDisabled
          tooltip="Tersedia setelah T-015 (Reconnect akun) selesai"
        />
      );
    case "active":
      return (
        <Button
          label="Disconnect"
          variant="secondary"
          size="sm"
          isDisabled
          tooltip="Tersedia setelah T-014 (Disconnect akun) selesai"
        />
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
    <ListItem
      className="[&:last-child]:border-b-0!"
      startContent={
        <Avatar
          name={account.handle}
          size="md"
          status={<PlatformStatusDot platform={account.platform} />}
        />
      }
      label={account.handle}
      description={`${platformLabel} · Terhubung sejak ${formatConnectedDate(account.connectedAt)}`}
      endContent={
        <HStack gap={2} align="center">
          <Badge
            variant={STATUS_BADGE_VARIANT[displayStatus]}
            label={getConnectionStatusLabel(account)}
          />
          <ConnectedAccountAction displayStatus={displayStatus} />
        </HStack>
      }
    />
  );
}

export function ConnectedAccountsList({
  accounts,
}: {
  accounts: ConnectedAccountRecord[];
}) {
  return (
    <VStack gap={4} padding={4}>
      <SettingsPageHead
        pageName="Connected Accounts"
        breadcrumb="Organization / Connected Accounts"
        action={<ConnectPlatformMenu />}
      />

      <Section padding={0}>
        <Card padding={4}>
          {accounts.length === 0 ? (
            <EmptyState
              title="Belum ada akun terhubung"
              description="Hubungkan akun media sosial pertama lewat tombol Connect Account di atas."
              isCompact
            />
          ) : (
            <List hasDividers density="balanced">
              {accounts.map((account) => (
                <ConnectedAccountRow key={account.id} account={account} />
              ))}
            </List>
          )}
        </Card>
      </Section>
    </VStack>
  );
}

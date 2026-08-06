import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
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

function ConnectedAccountRow({ account }: { account: ConnectedAccountRecord }) {
  const displayStatus = resolveConnectionDisplayStatus(account);
  const entry = PLATFORM_ICON[account.platform];
  const platformLabel = entry?.label ?? account.platform;

  return (
    <ListItem
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
          {account.reconnectRequired ? (
            <Button
              label="Reconnect"
              variant="secondary"
              size="sm"
              isDisabled
              tooltip="Tersedia setelah T-015 (Reconnect akun) selesai"
            />
          ) : (
            <Button
              label="Disconnect"
              variant="secondary"
              size="sm"
              isDisabled
              tooltip="Tersedia setelah T-014 (Disconnect akun) selesai"
            />
          )}
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
    <Section>
      <VStack gap={4}>
        <HStack justify="between" align="center">
          <Heading level={2}>Connected Accounts</Heading>
          <ConnectPlatformMenu />
        </HStack>

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
      </VStack>
    </Section>
  );
}

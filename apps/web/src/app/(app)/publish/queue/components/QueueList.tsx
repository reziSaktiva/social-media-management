"use client";

import { useMemo, useState } from "react";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Selector } from "@astryxdesign/core/Selector";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { FaPaperPlane, FaPen, FaXmark } from "react-icons/fa6";

import type { ConnectedAccountId, PostId } from "@social/shared";
import type { QueueGroup } from "@/domains/publishing";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

import { PLATFORM_ICON } from "../../../components/platform-icons";
import { useDraftEditor } from "../../../components/draft-editor/Context";

const DATE_HEADING_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** `group.date` adalah kalender UTC "YYYY-MM-DD" — format tampilan lengkap
 * (mis. "Senin, 14 Juli", mengikuti mockup Claude Design KSP-03) adalah
 * tanggung jawab UI (T-032.3). Parse manual dengan `Date.UTC` supaya tidak
 * kena pergeseran timezone browser. */
function formatGroupDateHeading(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return DATE_HEADING_FORMATTER.format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

function formatScheduledTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ALL_ACCOUNTS_FILTER_VALUE = "all";

interface AccountFilterOption {
  value: string;
  label: string;
}

export interface QueueListProps {
  groups: QueueGroup[];
  /**
   * Cancel Schedule (T-030, T-032.4) — dipass dari `QueueScreen.tsx`, yang
   * memiliki state dialog konfirmasi Tier 2 (AlertDialog) + memanggil
   * `cancelScheduleAction`. Opsional (bukan wajib) supaya `QueueList` tetap
   * bisa dipakai standalone (mis. di test) tanpa wrapper dialog.
   */
  onCancelSchedule?: (postId: PostId) => void;
}

export function QueueList({ groups, onCancelSchedule }: QueueListProps) {
  const { openEditDraft } = useDraftEditor();
  const [accountFilter, setAccountFilter] = useState<string>(
    ALL_ACCOUNTS_FILTER_VALUE,
  );

  const accountOptions = useMemo<AccountFilterOption[]>(() => {
    const seen = new Map<ConnectedAccountId, AccountFilterOption>();
    for (const group of groups) {
      for (const item of group.items) {
        for (const target of item.targets) {
          if (!seen.has(target.connectedAccountId)) {
            seen.set(target.connectedAccountId, {
              value: target.connectedAccountId,
              label: target.accountHandle,
            });
          }
        }
      }
    }
    return Array.from(seen.values());
  }, [groups]);

  const filteredGroups = useMemo<QueueGroup[]>(() => {
    if (accountFilter === ALL_ACCOUNTS_FILTER_VALUE) {
      return groups;
    }
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.targets.some(
            (target) => target.connectedAccountId === accountFilter,
          ),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, accountFilter]);

  return (
    <VStack gap={4}>
      <HStack justify="end">
        <Selector
          label="Filter akun"
          isLabelHidden
          placeholder="Semua akun"
          value={accountFilter}
          onChange={(value) => setAccountFilter(value)}
          options={[
            { value: ALL_ACCOUNTS_FILTER_VALUE, label: "Semua akun" },
            ...accountOptions,
          ]}
          width={180}
          size="sm"
        />
      </HStack>

      {filteredGroups.length === 0 ? (
        <Card padding={4}>
          <EmptyState
            title="Belum ada jadwal"
            description="Post yang dijadwalkan akan muncul di sini, dikelompokkan per tanggal."
          />
        </Card>
      ) : (
        <VStack gap={6}>
          {filteredGroups.map((group) => (
            <VStack gap={3} key={group.date}>
              <VStack gap={1}>
                <Heading level={3}>
                  {formatGroupDateHeading(group.date)}
                </Heading>
                <Divider variant="strong" />
              </VStack>

              <VStack gap={3}>
                {group.items.map((item) => (
                  <Card padding={4} key={item.id}>
                    <VStack gap={2}>
                      <HStack justify="between" align="start" gap={2}>
                        <VStack gap={1}>
                          <Text maxLines={2}>
                            {item.caption || "(Tanpa caption)"}
                          </Text>
                          <HStack gap={1} align="center">
                            <Icon icon="clock" size="sm" color="secondary" />
                            <Text type="supporting">
                              {formatScheduledTime(item.scheduledAt)}
                            </Text>
                          </HStack>
                        </VStack>

                        <HStack gap={1}>
                          <IconButton
                            label="Publish Now"
                            tooltip="Publish Now"
                            icon={<FaPaperPlane />}
                            variant="ghost"
                            onClick={() =>
                              openEditDraft(item.id, "publish-now")
                            }
                          />
                          <IconButton
                            label="Edit"
                            tooltip="Edit"
                            icon={<FaPen />}
                            variant="ghost"
                            onClick={() => openEditDraft(item.id)}
                          />
                          <IconButton
                            label="Cancel Schedule"
                            tooltip="Cancel Schedule"
                            icon={<FaXmark />}
                            variant="destructive"
                            onClick={() => onCancelSchedule?.(item.id)}
                          />
                        </HStack>
                      </HStack>

                      <HStack gap={3} wrap="wrap">
                        {item.targets.map((target) => {
                          const PlatformGlyph =
                            PLATFORM_ICON[target.platform].Icon;
                          return (
                            <HStack gap={1} align="center" key={target.id}>
                              <PlatformGlyph
                                size={12}
                                color={PLATFORM_ICON[target.platform].color}
                              />
                              <Text type="supporting">
                                {target.accountHandle}
                              </Text>
                            </HStack>
                          );
                        })}
                      </HStack>

                      <Text type="supporting" size="xsm">
                        Dibuat {formatRelativeTime(item.createdAt)}
                      </Text>
                    </VStack>
                  </Card>
                ))}
              </VStack>
            </VStack>
          ))}
        </VStack>
      )}
    </VStack>
  );
}

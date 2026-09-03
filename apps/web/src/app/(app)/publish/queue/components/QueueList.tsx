"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Clock01Icon,
  PencilEdit01Icon,
  SentIcon,
} from "@hugeicons/core-free-icons";

import type { ConnectedAccountId, PostId } from "@social/shared";
import type { QueueGroup } from "@/domains/publishing";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

/**
 * T-101.2: migrasi ke shadcn — Astryx `Selector`/`Card`/`Divider`/
 * `EmptyState`/`Heading`/`IconButton`/`Icon`/`Text`/`HStack`/`VStack`
 * diganti komponen shadcn (`Select`, `Card`, `Separator`, `Empty`, `Text`,
 * `Button` variant `ghost`/`destructive` size `icon-sm` dibungkus
 * `Tooltip`) + Tailwind `flex`/`grid` layout-only. Ikon aksi
 * (Publish Now/Edit/Cancel Schedule) & jam pindah dari `react-icons` ke
 * `hugeicons` (preset Maia) — `PLATFORM_ICON` (ikon brand) SENGAJA tetap
 * `react-icons`, dikecualikan ADR-058 (sama seperti `CalendarToolbar.tsx`
 * T-101.1).
 */
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
    // eslint-disable-next-line no-restricted-syntax -- T-101.2: layout-only, file sudah dimigrasi shadcn
    <div className="flex flex-col gap-4">
      {/* eslint-disable-next-line no-restricted-syntax -- T-101.2: layout-only */}
      <div className="flex justify-end">
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger size="sm" aria-label="Filter akun" className="w-44">
            <SelectValue placeholder="Semua akun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ACCOUNTS_FILTER_VALUE}>
              Semua akun
            </SelectItem>
            {accountOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Belum ada jadwal</EmptyTitle>
                <EmptyDescription>
                  Post yang dijadwalkan akan muncul di sini, dikelompokkan per
                  tanggal.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        // eslint-disable-next-line no-restricted-syntax -- T-101.2: layout-only
        <div className="flex flex-col gap-6">
          {filteredGroups.map((group) => (
            // eslint-disable-next-line no-restricted-syntax -- T-101.2: layout-only
            <div className="flex flex-col gap-3" key={group.date}>
              {/* eslint-disable-next-line no-restricted-syntax -- T-101.2: layout-only */}
              <div className="flex flex-col gap-1">
                <Text variant="h4" as="h3">
                  {formatGroupDateHeading(group.date)}
                </Text>
                <Separator />
              </div>

              {/* eslint-disable-next-line no-restricted-syntax -- T-101.2: layout-only */}
              <div className="flex flex-col gap-3">
                {group.items.map((item) => (
                  <Card size="sm" key={item.id}>
                    <CardContent>
                      {/* eslint-disable-next-line no-restricted-syntax -- T-101.2: layout-only */}
                      <div className="flex flex-col gap-2">
                        {/* eslint-disable-next-line no-restricted-syntax -- T-101.2: layout-only */}
                        <div className="flex items-start justify-between gap-2">
                          {/* eslint-disable-next-line no-restricted-syntax -- T-101.2: layout-only */}
                          <div className="flex flex-col gap-1">
                            <Text variant="p" className="line-clamp-2 text-sm">
                              {item.caption || "(Tanpa caption)"}
                            </Text>
                            {/* eslint-disable-next-line no-restricted-syntax -- T-101.2: layout-only */}
                            <div className="flex items-center gap-1">
                              <HugeiconsIcon
                                icon={Clock01Icon}
                                size={14}
                                className="text-muted-foreground"
                              />
                              <Text
                                variant="muted"
                                as="span"
                                className="text-xs"
                              >
                                {formatScheduledTime(item.scheduledAt)}
                              </Text>
                            </div>
                          </div>

                          {/* eslint-disable-next-line no-restricted-syntax -- T-101.2: layout-only */}
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Publish Now"
                                  onClick={() =>
                                    openEditDraft(item.id, "publish-now")
                                  }
                                >
                                  <HugeiconsIcon icon={SentIcon} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Publish Now</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Edit"
                                  onClick={() => openEditDraft(item.id)}
                                >
                                  <HugeiconsIcon icon={PencilEdit01Icon} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="icon-sm"
                                  aria-label="Cancel Schedule"
                                  onClick={() => onCancelSchedule?.(item.id)}
                                >
                                  <HugeiconsIcon icon={Cancel01Icon} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cancel Schedule</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>

                        {/* eslint-disable-next-line no-restricted-syntax -- T-101.2: layout-only */}
                        <div className="flex flex-wrap gap-3">
                          {item.targets.map((target) => {
                            const PlatformGlyph =
                              PLATFORM_ICON[target.platform].Icon;
                            return (
                              // eslint-disable-next-line no-restricted-syntax -- T-101.2: layout-only
                              <div
                                className="flex items-center gap-1"
                                key={target.id}
                              >
                                <PlatformGlyph
                                  size={12}
                                  color={PLATFORM_ICON[target.platform].color}
                                />
                                <Text
                                  variant="muted"
                                  as="span"
                                  className="text-xs"
                                >
                                  {target.accountHandle}
                                </Text>
                              </div>
                            );
                          })}
                        </div>

                        <Text variant="muted" as="span" className="text-xs">
                          Dibuat {formatRelativeTime(item.createdAt)}
                        </Text>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

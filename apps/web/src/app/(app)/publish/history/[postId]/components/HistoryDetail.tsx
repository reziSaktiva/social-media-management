import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { ContentStatus } from "@social/shared";
import type { HistoryItemRecord } from "@/domains/publishing";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PLATFORM_ICON } from "../../../../components/platform-icons";
import {
  HISTORY_STATUS_BADGE_VARIANT,
  HISTORY_STATUS_LABEL,
  TARGET_STATUS_BADGE_VARIANT,
  TARGET_STATUS_LABEL,
} from "../../history-status";
import { RetryTargetButton } from "./RetryTargetButton";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Label "kapan" ringkasan post (T-034.3) — Published pakai `publishedAt`;
 * Failed pakai `scheduledAt` kalau ada (post yang gagal padahal sempat
 * dijadwalkan), fallback `updatedAt` (Publish Now yang gagal, tidak pernah
 * punya `scheduledAt` — lihat `IPublishingRepository.publishNow`).
 */
function formatWhenLabel(item: HistoryItemRecord): string {
  if (item.status === ContentStatus.Published) {
    const date = item.publishedAt ?? item.updatedAt;
    return `Dipublikasikan ${DATE_TIME_FORMATTER.format(date)}`;
  }
  if (item.scheduledAt) {
    return `Dijadwalkan ${DATE_TIME_FORMATTER.format(item.scheduledAt)}`;
  }
  return `Percobaan publish ${DATE_TIME_FORMATTER.format(item.updatedAt)}`;
}

/**
 * Link "Lihat post asli" (T-034.3) — kalau `platformPostUrl` kosong
 * (Published tapi Fake OutstandAdapter, ADR-059, belum tentu mengisi URL
 * nyata), King Rezi mengonfirmasi (2026-09-08) link tetap TAMPIL tapi
 * disabled/non-interaktif — bukan disembunyikan, bukan link mati yang bisa
 * diklik.
 */
function ViewOriginalPostLink({ url }: { url: string | null }) {
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Button type="button" variant="link" size="sm" className="px-0">
          Lihat post asli
        </Button>
      </a>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex">
          <Button
            type="button"
            variant="link"
            size="sm"
            className="px-0"
            disabled
          >
            Lihat post asli
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>URL post asli belum tersedia</TooltipContent>
    </Tooltip>
  );
}

export interface HistoryDetailProps {
  item: HistoryItemRecord;
}

/**
 * Detail satu History item (T-034.3, KSP-D10) — ringkasan post + "Hasil per
 * Akun" per target. Acuan visual `templates/publish-history-detail.html`
 * (Claude Design, sudah dikonfirmasi King Rezi 2026-09-08), diterjemahkan
 * ke shadcn/ui (ADR-097) — bukan menyalin class Astryx-era.
 *
 * **Gap dilaporkan (bukan diputuskan sepihak):** mockup asli menyebut meta
 * "dibuat oleh siapa" di ringkasan post, tapi `HistoryItemRecord` (T-034.1,
 * sudah direview) tidak membawa `authorId`/nama author sama sekali — sesuai
 * instruksi task ini, field baru TIDAK ditambahkan ke domain type di luar
 * scope T-034.2/.3, jadi bagian "oleh siapa" sengaja dihilangkan dari meta
 * (tetap menampilkan "dibuat X lalu" tanpa nama). Perlu konfirmasi King
 * Rezi kalau nama author memang wajib tampil — itu perubahan repository/
 * service terpisah (join ke `WorkspaceMember`/`User`), bukan T-034.2/.3.
 */
export function HistoryDetail({ item }: HistoryDetailProps) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- layout-only, konsisten pola shadcn+Tailwind lain di publish/
    <div className="flex flex-col gap-4">
      <Link
        href="/publish/history"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
        Kembali ke History
      </Link>

      <Card>
        <CardContent>
          {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
          <div className="flex flex-col gap-2">
            {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
            <div className="flex items-start justify-between gap-2">
              <Text variant="p" className="mt-0! text-sm">
                {item.caption || "(Tanpa caption)"}
              </Text>
              <Badge variant={HISTORY_STATUS_BADGE_VARIANT[item.status]}>
                {HISTORY_STATUS_LABEL[item.status]}
              </Badge>
            </div>
            <Text variant="muted" as="span" className="text-xs">
              {formatWhenLabel(item)} · Dibuat{" "}
              {formatRelativeTime(item.createdAt)}
            </Text>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
          <div className="flex flex-col gap-3">
            <Text variant="h4" as="h2" className="mt-0!">
              Hasil per Akun
            </Text>
            <Separator />

            {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
            <div className="flex flex-col gap-4">
              {item.targets.map((target) => {
                const PlatformGlyph = PLATFORM_ICON[target.platform].Icon;
                return (
                  // eslint-disable-next-line no-restricted-syntax -- layout-only
                  <div className="flex flex-col gap-1.5" key={target.id}>
                    {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
                    <div className="flex items-center justify-between gap-2">
                      {/* eslint-disable-next-line no-restricted-syntax -- layout-only */}
                      <div className="flex items-center gap-1.5">
                        <PlatformGlyph
                          size={14}
                          color={PLATFORM_ICON[target.platform].color}
                        />
                        <Text variant="small" as="span" className="font-medium">
                          {target.accountHandle}
                        </Text>
                      </div>
                      <Badge
                        variant={TARGET_STATUS_BADGE_VARIANT[target.status]}
                      >
                        {TARGET_STATUS_LABEL[target.status]}
                      </Badge>
                    </div>

                    {target.status === "published" && (
                      <ViewOriginalPostLink url={target.platformPostUrl} />
                    )}

                    {target.status === "failed" && (
                      // eslint-disable-next-line no-restricted-syntax -- layout-only
                      <div className="flex items-center justify-between gap-2">
                        <Text
                          variant="muted"
                          as="span"
                          className="text-xs text-destructive"
                        >
                          {target.error ?? "Gagal dipublikasikan."}
                        </Text>
                        <RetryTargetButton
                          postId={item.id}
                          targetId={target.id}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

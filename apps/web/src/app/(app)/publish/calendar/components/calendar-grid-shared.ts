import { useCallback, useState } from "react";
import type { StatusDotVariant } from "@astryxdesign/core/StatusDot";
import type { IconType } from "react-icons";
import { FaFilm, FaRegClock, FaRegImage, FaThumbtack } from "react-icons/fa6";

import type {
  ConnectedAccountId,
  PostId,
  SocialPlatform,
} from "@social/shared";
import { ContentFormat, ContentStatus } from "@social/shared";

import type { PostMetricsRecord } from "@/domains/analytics";
import {
  effectiveCalendarDate,
  type CalendarPostItem,
} from "@/domains/publishing";

/**
 * Util bersama untuk grid Week (T-033.3) & Month (T-033.4) — acuan visual
 * `templates/publish-calendar.html` (Claude Design). Kalender **UTC**
 * (`toUtcDateKey`/`addDays` pakai `Date.UTC`/epoch ms), konsisten dengan
 * `getWeekRange`/`getMonthRange` (`@/domains/publishing`) dan pola
 * `formatGroupDateHeading` di `QueueList.tsx`.
 */

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Jumlah kolom hari grid Week & Month — 7 kolom sama lebar, responsive
 * mengikuti lebar container (`Grid columns={CALENDAR_DAY_COLUMNS}`, bukan
 * lagi lebar fixed px). Dipakai `CalendarWeekGrid`/`CalendarMonthGrid`
 * untuk header + body grid supaya kolom header dan body selalu sejajar
 * (revisi kedua T-033 — membatalkan `CALENDAR_COLUMN_WIDTH` fixed 200px
 * dari revisi sebelumnya).
 */
export const CALENDAR_DAY_COLUMNS = 7;

/**
 * Maks kartu tampil langsung per sel sebelum "+N More" (mockup: 3 +
 * "+1 More") — sama untuk grid Week & Month.
 */
export const MAX_VISIBLE_PER_CELL = 3;

/**
 * `ContentFormat` → label singkat untuk indikator compact di card Calendar
 * (revisi ketiga T-033, Month poin 7 / Week poin 5) — belum ada mapping
 * label existing untuk enum ini di codebase manapun, pola sama
 * `CONTENT_STATUS_LABEL` (`components/draft-editor/status-badge.ts`).
 */
export const CONTENT_FORMAT_LABEL: Record<ContentFormat, string> = {
  [ContentFormat.Post]: "Post",
  [ContentFormat.Reel]: "Reel",
  [ContentFormat.Story]: "Story",
  [ContentFormat.Pin]: "Pin",
};

/**
 * `ContentFormat` → icon untuk indikator compact footer card Calendar di
 * layar ≤768px (revisi keempat T-033, poin 3) — pengganti `Badge
 * variant="neutral"` yang overflow di card sempit mobile (`Badge` Astryx
 * tidak punya prop size/truncation, sudah dicek CLI sebelumnya). Set icon
 * dari `react-icons/fa6`, mengikuti pola `PLATFORM_ICON`
 * (`../../../components/platform-icons.tsx`) — satu-satunya library icon
 * non-semantik yang sudah dipakai di codebase ini (bukan dependency baru).
 * Dibungkus Astryx `Icon` di pemanggil (bukan render langsung seperti
 * `PLATFORM_ICON`) supaya dapat token color (`secondary`) dan `label`
 * accessible bawaan Icon — beda dari brand icon platform yang sengaja pakai
 * warna brand mentah (ADR-058 poin 6/10).
 */
export const CONTENT_FORMAT_ICON: Record<ContentFormat, IconType> = {
  [ContentFormat.Post]: FaRegImage,
  [ContentFormat.Reel]: FaFilm,
  [ContentFormat.Story]: FaRegClock,
  [ContentFormat.Pin]: FaThumbtack,
};

/**
 * `ContentStatus` → `StatusDot` variant untuk indikator compact footer card
 * Calendar di layar ≤768px (revisi keempat T-033, poin 2) — pengganti
 * `Badge` status yang overflow di card sempit mobile (Badge "Scheduled"
 * lebar 77px vs ruang card ~22-39px di 375px). `StatusDot` cuma punya 5
 * variant (`success|warning|error|accent|neutral`) vs 6 `ContentStatus`,
 * jadi tidak bisa 1:1 seperti `CONTENT_STATUS_BADGE_VARIANT`
 * (`../../../components/draft-editor/status-badge.ts`, 6 Badge variant).
 * `Draft` & `ReadyToSchedule` sengaja ditumpuk ke `neutral` — grid Calendar
 * per definisi hanya PERNAH menampilkan `Scheduled`/`Published`/`Failed`
 * (lihat catatan "status yang muncul di grid Calendar" di
 * `project-manager/tasks/v02-publishing-mvp.md`, T-033), jadi 3 status itu
 * yang dijaga tetap unik & semantik (`accent`/`success`/`error`); tumpukan
 * di 2 status yang tidak pernah dirender di Calendar tidak berdampak visual.
 */
export const CONTENT_STATUS_DOT_VARIANT: Record<
  ContentStatus,
  StatusDotVariant
> = {
  [ContentStatus.Draft]: "neutral",
  [ContentStatus.InReview]: "warning",
  [ContentStatus.ReadyToSchedule]: "neutral",
  [ContentStatus.Scheduled]: "accent",
  [ContentStatus.Published]: "success",
  [ContentStatus.Failed]: "error",
};

/** Senin di index 0 — minggu mulai Senin (sama seperti `getWeekRange`). */
export const DAY_LABELS = [
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
  "Ming",
] as const;

/**
 * 24 label baris jam grid Week (revisi kedua T-033 — satu baris PER JAM,
 * bukan lagi di-bucket per 2 jam). Index = jam UTC 0-23 (`entry.hour`
 * langsung, tanpa `Math.floor(hour / 2)`). Label teks cuma diisi di index
 * genap (jam genap); index ganjil string kosong `""` — barisnya tetap
 * render (bukan dihilangkan), cuma kolom label waktunya kosong, supaya
 * post jam ganjil (1 AM, 3 AM, dst) tidak numpuk 1 baris dengan jam genap
 * sebelumnya seperti sebelum revisi ini.
 */
export const WEEK_HOUR_LABELS = [
  "12 AM",
  "",
  "2 AM",
  "",
  "4 AM",
  "",
  "6 AM",
  "",
  "8 AM",
  "",
  "10 AM",
  "",
  "12 PM",
  "",
  "2 PM",
  "",
  "4 PM",
  "",
  "6 PM",
  "",
  "8 PM",
  "",
  "10 PM",
  "",
] as const;

/**
 * Class Tailwind border-kanan token-backed untuk pemisah vertikal antar
 * kolom hari grid Week & Month (revisi keenam T-033 — sebelumnya grid cuma
 * punya garis horizontal via `Divider variant="strong"` antar baris, tanpa
 * pemisah vertikal apapun antar kolom Sen/Sel/Rab/dst). `VStack`/`Card`
 * Astryx tidak punya prop border per-sisi (`astryx component VStack/Card
 * --dense` sudah dicek, tidak ada), jadi fallback Tailwind utility
 * token-backed sesuai urutan aturan `apps/web/.claude/CLAUDE.md`
 * ("component props first; else Tailwind utilities backed by tokens").
 *
 * Warna diganti di revisi ketujuh T-033 (poin 2) — sebelumnya
 * `border-border-strong` (`--color-border-emphasized`, sama dengan
 * `Divider variant="strong"` horizontal) terlihat terlalu tegas dibanding
 * border `Card`/`ClickableCard` post. Sekarang pakai `border-border` (tanpa
 * suffix) → `--color-border` di `tailwind-theme.css`
 * (`node_modules/@astryxdesign/core/src/tailwind-theme.css:87`,
 * `--color-border: var(--color-border)`), token PERSIS sama yang dipakai
 * `Card` untuk `borderColor` default
 * (`node_modules/@astryxdesign/core/src/Card/Card.tsx:93`,
 * `colorVars['--color-border']`) — diverifikasi lewat source CLI-terpin,
 * bukan tebakan. Garis HORIZONTAL (`Divider variant="strong"`) sengaja
 * TIDAK ikut berubah, tetap `--color-border-emphasized` seperti sebelumnya.
 *
 * Dipakai di HEADER (`DAY_LABELS`/hari) **dan** tiap baris body (week-row
 * Month, hour-row Week) dengan index kolom yang sama, supaya garis vertikal
 * tersambung dari atas ke bawah — bukan cuma sebagian baris. Kolom terakhir
 * (`CALENDAR_DAY_COLUMNS - 1`, kolom Minggu) sengaja `undefined` (tanpa
 * border kanan) supaya tidak ada garis nempel di tepi kanan card/grid.
 */
export function columnDividerClassName(
  columnIndex: number,
): string | undefined {
  return columnIndex === CALENDAR_DAY_COLUMNS - 1
    ? undefined
    : "border-r border-border";
}

/** Format jam LOKAL browser (0-23) jadi label "HH:00" (mis. 7 → "07:00") — dipakai kartu Month (poin M2). */
export function formatCalendarHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/**
 * Geser `date` sejumlah bulan kalender UTC, dipatok ke tanggal 1 (bukan
 * mempertahankan `date.getUTCDate()`) supaya aman dari overflow bulan
 * pendek — 31 Jan + 1 bulan via `Date.UTC` day-preserving akan lompat ke
 * 3 Maret, bukan akhir Februari. Anchor Calendar hanya perlu jatuh di
 * bulan yang benar (`getMonthRange`/`getWeekRange` yang menghitung rentang
 * sebenarnya), jadi tanggal-di-dalam-bulan tidak relevan di sini.
 */
export function addMonths(date: Date, months: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
}

/**
 * Satu kartu post di grid — **satu kartu per target** (bukan per post),
 * supaya post multi-platform tampil sebagai beberapa kartu granular sesuai
 * mockup (`item.targets.map(...)` per kartu).
 */
export interface CalendarCardEntry {
  key: string;
  postId: PostId;
  connectedAccountId: ConnectedAccountId;
  caption: string;
  status: ContentStatus;
  platform: SocialPlatform;
  /** Post/Reel/Story/Pin (revisi ketiga T-033) — label lewat `CONTENT_FORMAT_LABEL`. */
  contentFormat: ContentFormat;
  accountHandle: string;
  /** Kalender UTC "YYYY-MM-DD" dari tanggal efektif (`scheduledAt ?? publishedAt`). */
  dateKey: string;
  /** Jam LOKAL browser (0-23) dari tanggal efektif — dipakai grid Week untuk bucket per jam. */
  hour: number;
  /**
   * Metrik untuk TARGET INI SAJA (T-033.8, Popover KSP-02-F08) — dicocokkan
   * dari `CalendarPostItem.metrics` (array per akun/platform milik post)
   * lewat `connectedAccountId`, bukan array mentah. `null` untuk post
   * non-Published (`item.metrics === null`, tidak pernah di-fetch) MAUPUN
   * post Published yang belum punya baris metrik untuk target ini
   * (`item.metrics` ada tapi tidak match) — Popover membedakan status lewat
   * `entry.status`, bukan lewat `metrics`.
   */
  metrics: PostMetricsRecord | null;
  /** `PublishingPostTarget.platformPostUrl` — tautan "Go to post" (Popover), null kalau belum dilaporkan Outstand. */
  platformPostUrl: string | null;
}

/**
 * Ratakan `CalendarPostItem[]` jadi kartu per target, dengan tanggal
 * efektif dihitung lewat `effectiveCalendarDate` (`@/domains/publishing`
 * — satu-satunya sumber aturan "tanggal efektif", sama yang dipakai
 * `sortCalendarItemsByEffectiveDate`, termasuk fallback `createdAt`-nya).
 * Item tanpa target dilewati (post tanpa `targets` tidak punya kartu untuk
 * ditampilkan).
 *
 * `connectedAccountIds` (opsional, array kosong = tanpa filter) dicocokkan
 * ULANG per target di sini — filter Channels di repository (`listCalendarPosts`)
 * hanya mensyaratkan post punya SALAH SATU target yang cocok (`targets: {
 * some: {...} }`), jadi tanpa re-filter ini target lain milik post yang sama
 * (mis. akun Facebook post multi-platform) tetap ikut tampil walau tidak
 * dipilih di filter Channels.
 */
export function flattenCalendarItemsToEntries(
  items: CalendarPostItem[],
  connectedAccountIds: readonly ConnectedAccountId[] = [],
): CalendarCardEntry[] {
  const entries: CalendarCardEntry[] = [];

  for (const item of items) {
    const effectiveDate = effectiveCalendarDate(item);
    const dateKey = toUtcDateKey(effectiveDate);
    // Jam LOKAL browser (bukan UTC) — jadwal diinput sebagai waktu lokal lalu
    // dikonversi ke UTC saat disimpan (`draft-editor/Modal.tsx`), jadi jam
    // yang ditampilkan ke user harus dikonversi balik ke lokal supaya cocok
    // dengan yang mereka ketik.
    const hour = effectiveDate.getHours();

    for (const target of item.targets) {
      if (
        connectedAccountIds.length > 0 &&
        !connectedAccountIds.includes(target.connectedAccountId)
      ) {
        continue;
      }

      entries.push({
        key: `${item.id}-${target.id}`,
        postId: item.id,
        connectedAccountId: target.connectedAccountId,
        caption: item.caption,
        status: item.status,
        platform: target.platform,
        contentFormat: target.contentFormat,
        accountHandle: target.accountHandle,
        dateKey,
        hour,
        metrics:
          item.metrics?.find(
            (metric) => metric.connectedAccountId === target.connectedAccountId,
          ) ?? null,
        platformPostUrl: target.platformPostUrl,
      });
    }
  }

  return entries;
}

/**
 * State expand/collapse "+N More" per sel (Month: `dateKey`, Week: `cellKey`)
 * — logic identik dipakai `CalendarMonthGrid`/`CalendarWeekGrid`, sebelumnya
 * duplikat verbatim di kedua file (beda cuma nama variabel).
 */
export function useExpandableKeys() {
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const toggle = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  return { expandedKeys, toggle };
}

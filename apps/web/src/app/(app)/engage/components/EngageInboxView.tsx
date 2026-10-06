"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Refresh01Icon } from "@hugeicons/core-free-icons";

import { SocialPlatform } from "@social/shared";
import type { ConnectedAccountRecord } from "@/domains/workspace";
import type {
  EngagementInboxItemRecord,
  InboxItemStatus,
} from "@/domains/engagement";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";

import { PLATFORM_ICON } from "../../components/platform-icons";
import {
  getInboxItemDetailAction,
  listInboxAction,
  markAsDoneAction,
  refreshInboxAction,
  replyToCommentAction,
  type InboxItemDetailDto,
  type ListInboxActionFilter,
} from "../actions";

const ALL_ACCOUNTS_FILTER_VALUE = "all";
const ALL_PLATFORMS_FILTER_VALUE = "all";
const ALL_STATUS_FILTER_VALUE = "all";

/** `.inbox-shell` (Claude Design `templates/engage-inbox.html`) — grid dua
 * kolom tetap (thread-list 340px + thread-detail sisanya). Dimensi
 * struktural ini bukan design token (tidak ada padanan spacing scale untuk
 * lebar panel list), jadi diterapkan lewat inline `style` (pola sama
 * `POPOVER_WIDTH` di `CalendarPostPopover.tsx`) — Tailwind arbitrary-value
 * (`grid-cols-[340px_1fr]`) akan kena `tailwindcss/no-arbitrary-value`
 * (ADR-095) di file luar `components/ui/**`. */
const THREAD_LIST_WIDTH_PX = 340;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: ALL_STATUS_FILTER_VALUE, label: "Semua Status" },
  { value: "unread", label: "Unread" },
  { value: "done", label: "Done" },
];

function formatUpdatedAtLabel(date: Date): string {
  return `${date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  })} WIB`;
}

export interface EngageInboxViewProps {
  /** Hasil `EngagementService.listInbox` tanpa filter (state default) — T-053. */
  initialItems: EngagementInboxItemRecord[];
  /** Daftar akun terkoneksi workspace (opsi filter Akun) — dari `WorkspaceService.listConnectedAccounts`, bukan derive dari `initialItems`, pola sama `CalendarToolbar`/`HistoryList`. */
  accounts: ConnectedAccountRecord[];
}

/**
 * Comments Inbox (T-053, KSP-06) — acuan visual `templates/engage-inbox.html`
 * (Claude Design). Struktur mengikuti keputusan King Rezi via
 * `AskUserQuestion` (T-103.2 gate): baris thread dibangun dari `Item`/
 * `ItemGroup` shadcn (bukan `Table`) — mockup-nya satu blok teks per baris
 * (nama pengirim bold + cuplikan komentar dalam satu teks, meta line
 * platform/waktu/status), bukan tabular.
 *
 * **Filter (Akun/Platform/Status)** re-fetch server-side lewat
 * `listInboxAction` setiap kali salah satu filter berubah (bukan filter
 * client-side seperti `HistoryList`/`QueueList`) — mengikuti instruksi
 * task T-053 secara eksplisit, memanfaatkan filtering yang sudah jadi
 * tanggung jawab repository (T-050) alih-alih mendownload seluruh inbox
 * lalu memfilter di client.
 *
 * **Tidak ada Supabase Realtime** (ADR-023) — state `items` dikelola penuh
 * di client lewat 3 sumber: (1) `initialItems` dari `page.tsx` saat mount,
 * (2) re-fetch `listInboxAction` saat filter berubah/tombol Refresh
 * diklik, (3) patch lokal hasil `markAsDoneAction` (server sudah
 * `revalidatePath` sendiri, tapi itu hanya memengaruhi re-render Server
 * Component berikutnya — state list di client ini dipatch langsung dari
 * `data` yang dikembalikan action, pola sama `ConnectedAccountsList`).
 *
 * **Kotak "Post asal" (T-056, KI-065, resolved 2026-10-06):** sebelumnya
 * hanya label generik ("Komentar ini terhubung ke post terjadwal/
 * terpublish") karena `InboxItemDetail` (T-050) tidak membawa snapshot
 * caption/media post asli. Sekarang `InboxItemDetailDto.postSnapshot`
 * (`getInboxItemDetailAction`, join `engagement` → `publishing` lewat
 * public API module + resolve thumbnail lewat `MediaService`) mengisi
 * caption (truncate 1 baris), thumbnail (di-omit sepenuhnya kalau post
 * tidak bermedia — bukan kotak kosong), dan link **"Go to post →"**
 * (`platformPostUrl`, reuse gaya `.popover-link` dari Post Preview Popover
 * Calendar, LOCKED PATTERN Claude Design `templates/engage-inbox.html`).
 */
export function EngageInboxView({
  initialItems,
  accounts,
}: EngageInboxViewProps) {
  const [items, setItems] = useState(initialItems);
  const [accountFilter, setAccountFilter] = useState(ALL_ACCOUNTS_FILTER_VALUE);
  const [platformFilter, setPlatformFilter] = useState(
    ALL_PLATFORMS_FILTER_VALUE,
  );
  const [statusFilter, setStatusFilter] = useState(ALL_STATUS_FILTER_VALUE);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => new Date());

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<InboxItemDetailDto | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const detailRequestSeqRef = useRef(0);

  const buildFilter = useCallback((): ListInboxActionFilter => {
    const filter: ListInboxActionFilter = {};
    if (accountFilter !== ALL_ACCOUNTS_FILTER_VALUE) {
      filter.connectedAccountId = accountFilter;
    }
    if (platformFilter !== ALL_PLATFORMS_FILTER_VALUE) {
      filter.platform = platformFilter;
    }
    if (statusFilter !== ALL_STATUS_FILTER_VALUE) {
      filter.status = statusFilter as InboxItemStatus;
    }
    return filter;
  }, [accountFilter, platformFilter, statusFilter]);

  // Skip fetch pertama — `initialItems` dari `page.tsx` sudah merepresentasikan
  // state filter default ("Semua Akun"/"Semua Platform"/"Semua Status").
  const skipNextFilterFetchRef = useRef(true);

  useEffect(() => {
    if (skipNextFilterFetchRef.current) {
      skipNextFilterFetchRef.current = false;
      return;
    }

    let cancelled = false;
    setIsLoadingList(true);

    void (async () => {
      const result = await listInboxAction(buildFilter());
      if (cancelled) {
        return;
      }
      if (result.error) {
        toast.error(result.error);
      } else {
        setItems(result.data ?? []);
      }
      setIsLoadingList(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [accountFilter, platformFilter, statusFilter, buildFilter]);

  // Selection "efektif" — dihitung SAAT RENDER (bukan `useEffect` +
  // `setState`, pola sama `useSyncedState`) dari `selectedId` + `items`
  // yang sedang berlaku: kalau `selectedId` masih ada di `items`, pakai
  // itu; kalau tidak (belum pernah memilih, atau item yang dipilih hilang
  // karena filter berubah/`markAsDoneAction` mengeluarkannya dari list),
  // fallback ke item pertama (mockup selalu menampilkan baris pertama
  // sebagai "active" dengan detail terisi). Tidak pernah `null` selama
  // `items` tidak kosong.
  const effectiveSelectedId = items.some((item) => item.id === selectedId)
    ? selectedId
    : (items[0]?.id ?? null);

  // Fetch detail HANYA saat `effectiveSelectedId` berubah (klik item lain,
  // atau fallback pindah ke item pertama di atas) — bukan setiap kali
  // `items` berubah referensinya (mis. re-fetch filter yang hasilnya
  // masih memuat id yang sama). Semua `setState` di sini terjadi di dalam
  // IIFE async (efek async yang menyinkronkan ke sistem luar/Server
  // Action — bukan derive-state sinkron, jadi tidak kena
  // `react-hooks/set-state-in-effect`).
  useEffect(() => {
    let cancelled = false;
    const seq = detailRequestSeqRef.current + 1;
    detailRequestSeqRef.current = seq;

    void (async () => {
      if (!effectiveSelectedId) {
        if (!cancelled) {
          setDetail(null);
          setIsLoadingDetail(false);
        }
        return;
      }

      setIsLoadingDetail(true);
      const result = await getInboxItemDetailAction(effectiveSelectedId);
      if (cancelled || detailRequestSeqRef.current !== seq) {
        // Sudah disusul selection lain (out-of-order response) — buang.
        return;
      }
      if (result.error) {
        toast.error(result.error);
        setDetail(null);
      } else {
        setDetail(result.data ?? null);
      }
      setIsLoadingDetail(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [effectiveSelectedId]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const refreshResult = await refreshInboxAction();
    if (refreshResult.error) {
      toast.error(refreshResult.error);
      setIsRefreshing(false);
      return;
    }

    const listResult = await listInboxAction(buildFilter());
    if (listResult.error) {
      toast.error(listResult.error);
    } else {
      setItems(listResult.data ?? []);
    }

    setLastUpdatedAt(new Date());
    setIsRefreshing(false);

    const newCommentsCount = refreshResult.newCommentsCount ?? 0;
    toast(
      newCommentsCount > 0
        ? `${newCommentsCount} komentar baru`
        : "Tidak ada komentar baru",
    );
  }, [buildFilter]);

  const handleMarkAsDone = useCallback(async () => {
    if (!detail) {
      return;
    }
    const result = await markAsDoneAction(detail.id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const updated = result.data;
    if (!updated) {
      return;
    }

    setItems((prev) => {
      const stillMatchesFilter =
        statusFilter === ALL_STATUS_FILTER_VALUE ||
        updated.status === statusFilter;
      if (!stillMatchesFilter) {
        return prev.filter((item) => item.id !== updated.id);
      }
      return prev.map((item) => (item.id === updated.id ? updated : item));
    });
    setDetail((prev) =>
      prev && prev.id === updated.id ? { ...prev, ...updated } : prev,
    );
    toast("Komentar ditandai selesai");
  }, [detail, statusFilter]);

  const handleSendReply = useCallback(async () => {
    if (!detail || !replyDraft.trim()) {
      return;
    }
    setIsSendingReply(true);
    const result = await replyToCommentAction(detail.id, replyDraft);
    setIsSendingReply(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const sentReply = result.data;
    setReplyDraft("");
    if (sentReply) {
      setDetail((prev) =>
        prev && prev.id === sentReply.inboxItemId
          ? { ...prev, replies: [...prev.replies, sentReply] }
          : prev,
      );
    }
    toast("Balasan terkirim");
  }, [detail, replyDraft]);

  const accountOptions = [
    { value: ALL_ACCOUNTS_FILTER_VALUE, label: "Semua Akun" },
    ...accounts.map((account) => ({
      value: account.id as string,
      label: account.handle,
    })),
  ];

  const platformOptions = [
    { value: ALL_PLATFORMS_FILTER_VALUE, label: "Semua Platform" },
    ...Object.values(SocialPlatform).map((platform) => ({
      value: platform as string,
      label: PLATFORM_ICON[platform].label,
    })),
  ];

  return (
    // eslint-disable-next-line no-restricted-syntax -- T-053: file baru, dikomposisi Tailwind langsung (ADR-097)
    <div className="flex h-full flex-col gap-4">
      {/* eslint-disable-next-line no-restricted-syntax -- T-053: layout-only */}
      <div className="flex items-center justify-between gap-4">
        {/* eslint-disable-next-line no-restricted-syntax -- T-053: layout-only */}
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Engage
          </h1>
          <Text variant="muted">
            Diperbarui {formatUpdatedAtLabel(lastUpdatedAt)} · sinkronisasi tiap
            30 menit
          </Text>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleRefresh()}
          disabled={isRefreshing}
        >
          <HugeiconsIcon
            icon={Refresh01Icon}
            strokeWidth={2}
            className={cn(isRefreshing && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* eslint-disable-next-line no-restricted-syntax -- T-053: layout-only, `.inbox-filter` */}
      <div className="flex flex-wrap gap-2">
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger size="sm" aria-label="Filter akun" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {accountOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger
            size="sm"
            aria-label="Filter platform"
            className="w-44"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {platformOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger size="sm" aria-label="Filter status" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Belum ada komentar</EmptyTitle>
            <EmptyDescription>
              Komentar dari akun terkoneksi akan muncul di sini setelah
              sinkronisasi.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        // eslint-disable-next-line no-restricted-syntax -- T-053: `.inbox-shell`, grid 2 kolom (lebar list = konstanta struktural, bukan token, lihat komentar THREAD_LIST_WIDTH_PX)
        <div
          className={cn(
            "grid min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card",
            isLoadingList && "opacity-60",
          )}
          style={{
            gridTemplateColumns: `${THREAD_LIST_WIDTH_PX}px 1fr`,
          }}
        >
          {/* eslint-disable-next-line no-restricted-syntax -- T-053: `.thread-list` */}
          <div className="h-full min-h-0 overflow-y-auto border-r border-border">
            <ItemGroup className="gap-0 has-data-[size=sm]:gap-0">
              {items.map((item) => {
                const isSelected = item.id === effectiveSelectedId;
                const isDone = item.status === "done";
                return (
                  <Item
                    key={item.id}
                    asChild
                    variant={isSelected ? "muted" : "default"}
                    size="sm"
                    className="cursor-pointer items-start gap-2 rounded-none border-b border-border p-3 text-left last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      aria-current={isSelected ? "true" : undefined}
                    >
                      <ItemMedia className="mt-1.5 items-start justify-start">
                        <span
                          className={cn(
                            "block size-1.5 shrink-0 rounded-full",
                            isDone ? "bg-transparent" : "bg-primary",
                          )}
                        />
                      </ItemMedia>
                      <ItemContent className="min-w-0 gap-0.5">
                        <ItemTitle className="line-clamp-none block w-full font-normal whitespace-normal">
                          <span className="font-semibold text-foreground">
                            {item.authorHandle}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            — {item.content}
                          </span>
                        </ItemTitle>
                        <Text variant="muted" as="span" className="text-xs">
                          {PLATFORM_ICON[item.platform].label} ·{" "}
                          {formatRelativeTime(item.receivedAt)}
                          {isDone ? " · Done" : ""}
                        </Text>
                      </ItemContent>
                    </button>
                  </Item>
                );
              })}
            </ItemGroup>
          </div>

          {/* eslint-disable-next-line no-restricted-syntax -- T-053: `.thread-detail` */}
          <div className="flex min-w-0 flex-col gap-4 p-5">
            {isLoadingDetail ? (
              // eslint-disable-next-line no-restricted-syntax -- T-053: layout-only
              <div className="flex flex-1 items-center justify-center">
                <Spinner />
              </div>
            ) : detail ? (
              <>
                {detail.postId && detail.postSnapshot ? (
                  // eslint-disable-next-line no-restricted-syntax -- T-056, KI-065: `.post-context` (Claude Design `templates/engage-inbox.html`, LOCKED PATTERN T-056 2026-10-06) — thumbnail di-omit sepenuhnya kalau post tidak bermedia (bukan kotak kosong), kolom teks full width.
                  <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-muted p-3">
                    {detail.postSnapshot.thumbnail ? (
                      // eslint-disable-next-line no-restricted-syntax -- T-056, KI-065: `.thumb` — thumbnail media post asli, size tetap sama placeholder lama (size-11).
                      <div className="size-11 shrink-0 overflow-hidden rounded-md bg-muted-foreground/20">
                        {detail.postSnapshot.thumbnail.type === "video" ? (
                          <video
                            src={detail.postSnapshot.thumbnail.url}
                            className="size-full object-cover"
                            muted
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element -- T-056, KI-065: URL Supabase Storage (MediaItemRecord.url), pola sama draft-editor/Modal.tsx — tidak cocok next/image remote pattern statis.
                          <img
                            src={detail.postSnapshot.thumbnail.url}
                            alt="Media post asal"
                            className="size-full object-cover"
                          />
                        )}
                      </div>
                    ) : null}
                    {/* eslint-disable-next-line no-restricted-syntax -- T-056, KI-065: `.post-context-body` */}
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <Text variant="muted" as="span" className="text-xs">
                        Post asal
                      </Text>
                      {/* `.post-context-cap` — truncate 1 baris */}
                      <Text
                        as="span"
                        className="truncate text-sm font-semibold"
                      >
                        {detail.postSnapshot.caption || "(Tanpa caption)"}
                      </Text>
                      {detail.postSnapshot.platformPostUrl ? (
                        <a
                          href={detail.postSnapshot.platformPostUrl}
                          target="_blank"
                          rel="noopener"
                        >
                          <Text
                            variant="muted"
                            as="span"
                            className="text-xs text-primary"
                          >
                            Go to post →
                          </Text>
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <Text as="p" className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {detail.authorHandle}:
                  </span>{" "}
                  {detail.content}
                </Text>

                {detail.replies.length > 0 ? (
                  // eslint-disable-next-line no-restricted-syntax -- bugfix: riwayat balasan tim, layout-only
                  <div className="flex flex-col gap-2">
                    {detail.replies.map((reply) => (
                      // eslint-disable-next-line no-restricted-syntax -- bugfix: `.reply-history-item`, dibedakan dari komentar customer lewat bg-muted + indent
                      <div
                        key={reply.id}
                        className="ml-4 flex flex-col gap-0.5 rounded-lg bg-muted p-3"
                      >
                        <Text variant="muted" as="span" className="text-xs">
                          Balasan tim · {formatRelativeTime(reply.sentAt)}
                        </Text>
                        <Text as="p" className="text-sm text-foreground">
                          {reply.content}
                        </Text>
                      </div>
                    ))}
                  </div>
                ) : null}

                {detail.status !== "done" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="self-start"
                    onClick={() => void handleMarkAsDone()}
                  >
                    Mark as Done
                  </Button>
                ) : null}

                {/* eslint-disable-next-line no-restricted-syntax -- T-053: `.reply-box` */}
                <div className="mt-auto flex flex-col gap-2">
                  <Textarea
                    placeholder="Balas komentar..."
                    rows={2}
                    value={replyDraft}
                    onChange={(event) => setReplyDraft(event.target.value)}
                    disabled={isSendingReply}
                  />
                  <Button
                    type="button"
                    className="self-end"
                    disabled={isSendingReply || !replyDraft.trim()}
                    onClick={() => void handleSendReply()}
                  >
                    Kirim
                  </Button>
                </div>
              </>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>Pilih komentar</EmptyTitle>
                  <EmptyDescription>
                    Pilih salah satu komentar di daftar untuk melihat detail.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { DateInput } from "@astryxdesign/core/DateInput";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Divider } from "@astryxdesign/core/Divider";
import { FileInput } from "@astryxdesign/core/FileInput";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Layout, LayoutContent, LayoutFooter } from "@astryxdesign/core/Layout";
import { Link } from "@astryxdesign/core/Link";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TimeInput } from "@astryxdesign/core/TimeInput";
import { VStack } from "@astryxdesign/core/VStack";

import { ContentFormat, ContentStatus, SocialPlatform } from "@social/shared";

import { formatRelativeTime } from "@/lib/utils/format-relative-time";

import type { ConnectedAccountDto } from "./actions";
import {
  getConnectedAccountsAction,
  getDraftAction,
  publishNowAction,
  saveDraftAction,
  scheduleDraftAction,
  updateDraftAction,
} from "./actions";
import type { UnsavedNewPost } from "./Context";
import { useDraftEditor } from "./Context";
import {
  CONTENT_STATUS_BADGE_VARIANT,
  CONTENT_STATUS_LABEL,
} from "./status-badge";
import type { TerminalAction } from "./terminal-destination";
import {
  isAlreadyAtDestination,
  resolveTerminalDestination,
} from "./terminal-destination";

/** Akun terhubung dari `WorkspaceConnectedAccount` (ADR-059) — bukan lagi mock. */
type ConnectedAccount = ConnectedAccountDto;

function isAccountDisconnected(account: ConnectedAccount): boolean {
  return account.status !== "active";
}

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  [SocialPlatform.Instagram]: "Instagram",
  [SocialPlatform.Facebook]: "Facebook",
  [SocialPlatform.Twitter]: "X (Twitter)",
  [SocialPlatform.LinkedIn]: "LinkedIn",
  [SocialPlatform.TikTok]: "TikTok",
  [SocialPlatform.YouTube]: "YouTube",
  [SocialPlatform.Threads]: "Threads",
  [SocialPlatform.Pinterest]: "Pinterest",
};

const FORMAT_LABEL: Record<ContentFormat, string> = {
  [ContentFormat.Post]: "Post",
  [ContentFormat.Reel]: "Reel",
  [ContentFormat.Story]: "Story",
  [ContentFormat.Pin]: "Pin",
};

/** Matriks Content Format per platform — ADR-039. */
function getSelectableFormats(
  platform: SocialPlatform,
): ContentFormat[] | null {
  if (
    platform === SocialPlatform.Instagram ||
    platform === SocialPlatform.Facebook
  ) {
    return [ContentFormat.Post, ContentFormat.Reel, ContentFormat.Story];
  }
  return null;
}

function getDefaultFormat(platform: SocialPlatform): ContentFormat {
  return platform === SocialPlatform.Pinterest
    ? ContentFormat.Pin
    : ContentFormat.Post;
}

function ResumeDialog({
  isOpen,
  unsaved,
  onDiscard,
  onResume,
}: {
  isOpen: boolean;
  unsaved: UnsavedNewPost | null;
  onDiscard: () => void;
  onResume: () => void;
}) {
  const preview = unsaved
    ? unsaved.caption.length > 60
      ? `${unsaved.caption.slice(0, 60)}…`
      : unsaved.caption
    : "";

  return (
    <Dialog isOpen={isOpen} onOpenChange={() => undefined} purpose="required">
      <DialogHeader
        title="Resume unfinished post?"
        subtitle="Ada draft New Post yang belum disimpan dari sesi sebelumnya (KSP-05-F13, ADR-052). Hanya berlaku untuk New Post — Edit Draft tidak punya dialog ini."
      />
      <VStack gap={3}>
        <VStack gap={1}>
          <Text type="supporting">Caption</Text>
          <Text>{preview || "(kosong)"}</Text>
        </VStack>
        <VStack gap={1}>
          <Text type="supporting">Terakhir diedit</Text>
          <Text>
            {unsaved ? formatRelativeTime(new Date(unsaved.savedAt)) : "-"}
          </Text>
        </VStack>
        <HStack gap={3} justify="end">
          <Button label="Mulai Baru" variant="secondary" onClick={onDiscard} />
          <Button label="Resume" variant="primary" onClick={onResume} />
        </HStack>
      </VStack>
    </Dialog>
  );
}

interface LatestFormSnapshot {
  mode: "create" | "edit";
  caption: string;
  savedPostId: string | undefined;
}

/**
 * Owns all editor form state for one New Post / Edit Draft session. Mounted
 * fresh (via `key` on the caller) whenever a new session starts, so state
 * resets naturally on mount instead of being imperatively reset in an effect.
 */
function DraftEditorForm({
  mode,
  postId,
  prefillCaption,
  preSelectedAccountId,
  initialPendingAction,
  onOpenChange,
  onLatestChange,
  dialogVariant,
  onToggleDialogVariant,
}: {
  mode: "create" | "edit";
  postId?: string;
  prefillCaption?: string;
  /**
   * Set only when the editor was opened from an entry point scoped to a
   * specific connected account (sidebar Channels "+" — T-012, ADR-058
   * addendum poin 9). The Account Selector below pre-checks this account as
   * soon as `getConnectedAccountsAction` resolves.
   */
  preSelectedAccountId?: string;
  /**
   * Publish Now dari Queue (T-032.4) — lihat effect di bawah yang
   * memanfaatkan nilai ini begitu data selesai dimuat.
   */
  initialPendingAction?: "publish-now";
  onOpenChange: (open: boolean) => void;
  onLatestChange: (snapshot: LatestFormSnapshot) => void;
  dialogVariant: "standard" | "fullscreen";
  onToggleDialogVariant: () => void;
}) {
  const { close, clearUnsavedNewPost } = useDraftEditor();
  const router = useRouter();
  const pathname = usePathname();

  const isEdit = mode === "edit";

  const [caption, setCaption] = useState(prefillCaption ?? "");
  const [status, setStatus] = useState<ContentStatus>(ContentStatus.Draft);
  const [savedPostId, setSavedPostId] = useState<string | undefined>(postId);
  const [isLoadingDraft, setIsLoadingDraft] = useState(isEdit);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(
    preSelectedAccountId ? [preSelectedAccountId] : [],
  );
  const [formatByAccount, setFormatByAccount] = useState<
    Record<string, ContentFormat>
  >({});
  const [pinTitle, setPinTitle] = useState("");
  const [pinLink, setPinLink] = useState("");
  const [scheduleDate, setScheduleDate] = useState<string | undefined>();
  const [scheduleTime, setScheduleTime] = useState<string | undefined>();
  // A step *within* this same Dialog (regardless of variant) — NOT a
  // second nested Dialog. Astryx's own component docs explicitly disallow
  // nesting Dialogs ("restructure the flow into steps within a single
  // dialog instead"); a previous version of this file did nest a confirm
  // Dialog inside this one, which QA found silently never opened in real
  // usage.
  //
  // `null` = form step. Confirmation Summary (UXP-04) is shared between
  // Schedule and Publish Now (KSP-05-F12, ADR-047) — only the "Waktu" row
  // and the confirm button label differ between the two variants.
  const [pendingAction, setPendingAction] = useState<
    "schedule" | "publish-now" | null
  >(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isPublishingNow, setIsPublishingNow] = useState(false);
  const [notice, setNotice] = useState<{
    status: "success" | "info" | "error";
    title: string;
  } | null>(null);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  useEffect(() => {
    if (!isEdit) {
      return;
    }
    let cancelled = false;
    getDraftAction(postId as string)
      .then((draft) => {
        if (cancelled) return;
        setCaption(draft.caption);
        setStatus(draft.status as ContentStatus);
      })
      .catch(() => {
        if (!cancelled) close();
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDraft(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch-once-per-mount by design (component remounts via `key` per session)
  }, []);

  // Load connected accounts for the Account Selector — runs for both
  // "create" and "edit" mode (unlike the draft-loading effect above, which
  // is edit-only), since a brand-new post still needs real accounts to pick.
  useEffect(() => {
    let cancelled = false;
    getConnectedAccountsAction()
      .then((result) => {
        if (cancelled) return;
        setAccounts(result);
        // Pre-selected account (Channels "+", T-012) is only known by id
        // before this resolves — `selectedAccountIds` already has it, but
        // it still needs a default Content Format the same way
        // `toggleAccount` would set one on manual check.
        if (preSelectedAccountId) {
          const preSelected = result.find(
            (account) => account.id === preSelectedAccountId,
          );
          if (preSelected) {
            setFormatByAccount((prev) =>
              prev[preSelected.id]
                ? prev
                : {
                    ...prev,
                    [preSelected.id]: getDefaultFormat(preSelected.platform),
                  },
            );
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotice({
            status: "error",
            title: "Gagal memuat daftar akun terhubung. Coba muat ulang.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAccounts(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch-once-per-mount by design (component remounts via `key` per session)
  }, []);

  // Report the live snapshot on every render so the parent's Dialog
  // onOpenChange (Escape/backdrop/close-button) can decide what to persist
  // without needing this state lifted up.
  onLatestChange({ mode, caption, savedPostId });

  const selectedAccounts = useMemo(
    () => accounts.filter((account) => selectedAccountIds.includes(account.id)),
    [accounts, selectedAccountIds],
  );

  const isReadyToSchedule =
    caption.trim().length > 0 &&
    selectedAccounts.length > 0 &&
    Boolean(scheduleDate) &&
    Boolean(scheduleTime);

  // Publish Now (KSP-05-F12) skips the Schedule Picker entirely — tanggal/
  // waktu tidak relevan sama sekali, beda dari `isReadyToSchedule`.
  const isReadyToPublishNow =
    caption.trim().length > 0 && selectedAccounts.length > 0;

  // Publish Now dari Queue (T-032.4) — lompat otomatis ke step konfirmasi
  // begitu draft (caption/status) DAN daftar akun terhubung selesai dimuat,
  // supaya `isReadyToPublishNow` di atas sudah final saat pengecekan ini
  // berjalan. Diadaptasi selama render (bukan di dalam `useEffect`) —
  // pola yang sama dengan penyesuaian `resumeData`/`dialogVariant` di
  // `DraftEditorModal` di bawah, supaya tidak memicu render effect
  // tambahan (`react-hooks/set-state-in-effect`) untuk state turunan
  // sederhana seperti ini. `hasCheckedAutoAdvance` memastikan ini hanya
  // dievaluasi sekali per sesi (component ini remount penuh per sesi lewat
  // `key={sessionKey}` di `DraftEditorModal`), jadi tidak memaksa balik ke
  // step konfirmasi kalau user sengaja kembali ke form setelah itu. Kalau
  // belum ready (mis. akun target belum valid — Edit Draft saat ini tidak
  // preload akun yang sebelumnya dijadwalkan, KI-032), pengecekan ini
  // sengaja TIDAK memaksa — dibiarkan fallback ke form biasa. Supaya
  // fallback ini tidak terasa seperti klik "Publish Now" tidak berefek sama
  // sekali, tampilkan notice info yang menjelaskan kenapa (bukan gagal diam
  // tanpa sinyal apapun) sambil user memilih ulang akun secara manual.
  const [hasCheckedAutoAdvance, setHasCheckedAutoAdvance] = useState(false);
  if (
    !hasCheckedAutoAdvance &&
    isEdit &&
    initialPendingAction === "publish-now" &&
    !isLoadingDraft &&
    !isLoadingAccounts
  ) {
    setHasCheckedAutoAdvance(true);
    if (isReadyToPublishNow) {
      setPendingAction("publish-now");
    } else {
      setNotice({
        status: "info",
        title:
          "Publish Now belum bisa langsung dikonfirmasi — pilih ulang akun tujuan untuk melanjutkan (akun yang sebelumnya dijadwalkan belum otomatis dimuat).",
      });
    }
  }

  function toggleAccount(account: ConnectedAccount, checked: boolean) {
    setSelectedAccountIds((prev) =>
      checked ? [...prev, account.id] : prev.filter((id) => id !== account.id),
    );
    setFormatByAccount((prev) => {
      if (checked && !prev[account.id]) {
        return { ...prev, [account.id]: getDefaultFormat(account.platform) };
      }
      return prev;
    });
  }

  /**
   * Aksi terminal (ADR-054, NP-D13): tutup editor lalu antar pengguna ke
   * sub-screen tujuan konten — bukan kembali ke section asal seperti tombol
   * Close. Sejak CTA sidebar aktif (ADR-053) asalnya bisa Home/Engage/Analyze,
   * yang tidak menampilkan hasil aksi sama sekali.
   */
  function finishTerminalAction(action: TerminalAction) {
    const destination = resolveTerminalDestination(action);
    close();
    if (isAlreadyAtDestination(pathname, destination)) {
      router.refresh();
    } else {
      router.push(destination);
    }
  }

  async function handleSaveDraft() {
    setIsSavingDraft(true);
    try {
      if (savedPostId) {
        await updateDraftAction(savedPostId, caption);
      } else {
        const result = await saveDraftAction(caption);
        setSavedPostId(result.postId);
      }
      if (mode === "create") {
        clearUnsavedNewPost();
      }
      setStatus(ContentStatus.Draft);
      // Save as Draft → Publish > Drafts (ADR-054, T-031.1). Draft yang muncul
      // di daftar itulah umpan baliknya, menggantikan banner sukses yang tidak
      // akan sempat terbaca karena editor ditutup.
      finishTerminalAction("save-draft");
    } finally {
      setIsSavingDraft(false);
    }
  }

  /**
   * Dipakai bersama oleh Schedule dan Publish Now — dulu masing-masing
   * handler menulis ulang `selectedAccounts.map(...)` sendiri-sendiri
   * (termasuk cabang `platformOptions` khusus Pinterest), berisiko
   * divergen diam-diam kalau salah satu diubah tapi yang lain terlewat.
   */
  function buildTargetsPayload() {
    return selectedAccounts.map((account) => ({
      connectedAccountId: account.id,
      contentFormat:
        formatByAccount[account.id] ?? getDefaultFormat(account.platform),
      platformOptions:
        account.platform === SocialPlatform.Pinterest
          ? { pinTitle, pinLink }
          : undefined,
    }));
  }

  async function handleConfirmSchedule() {
    setIsScheduling(true);
    try {
      const scheduledAt = new Date(
        `${scheduleDate}T${scheduleTime}`,
      ).toISOString();

      const result = await scheduleDraftAction({
        postId: savedPostId,
        caption,
        scheduledAt,
        targets: buildTargetsPayload(),
      });

      setSavedPostId(result.postId);
      setStatus(ContentStatus.Scheduled);
      setPendingAction(null);
      // Schedule → Publish > Queue (ADR-054). Queue sendiri masih placeholder
      // sampai T-032; tujuannya tetap dipakai karena ADR-054 sudah menetapkan
      // destinasi ini, dan mendarat di Queue lebih masuk akal daripada
      // tertinggal di Analyze/Home tanpa jejak aksi.
      finishTerminalAction("schedule");
    } catch (error) {
      setNotice({
        status: "error",
        title:
          error instanceof Error
            ? error.message
            : "Gagal menjadwalkan post. Coba lagi.",
      });
    } finally {
      setIsScheduling(false);
    }
  }

  async function handleConfirmPublishNow() {
    setIsPublishingNow(true);
    try {
      const result = await publishNowAction({
        postId: savedPostId,
        caption,
        targets: buildTargetsPayload(),
      });

      setSavedPostId(result.postId);
      setStatus(ContentStatus.Published);
      setPendingAction(null);
      // Publish Now → Publish > Calendar (T-029, ADR-054) — History belum
      // jadi layar terdokumentasi, Calendar dipakai sementara sampai T-034.
      finishTerminalAction("publish-now");
    } catch (error) {
      setNotice({
        status: "error",
        title:
          error instanceof Error
            ? error.message
            : "Gagal mempublikasikan post. Coba lagi.",
      });
    } finally {
      setIsPublishingNow(false);
    }
  }

  return (
    <Layout
      header={
        <DialogHeader
          title={
            pendingAction === "schedule"
              ? "Konfirmasi Jadwal"
              : pendingAction === "publish-now"
                ? "Konfirmasi Publish"
                : isEdit
                  ? "Edit Draft"
                  : "New Post"
          }
          endContent={
            pendingAction ? undefined : (
              <HStack gap={2} align="center">
                <Badge
                  label={CONTENT_STATUS_LABEL[status]}
                  variant={CONTENT_STATUS_BADGE_VARIANT[status]}
                  icon={
                    <span
                      aria-hidden="true"
                      className="inline-block size-1.5 rounded-full bg-current"
                    />
                  }
                />
                <Button
                  label={
                    dialogVariant === "fullscreen" ? "Standard" : "Fullscreen"
                  }
                  variant="ghost"
                  size="sm"
                  onClick={onToggleDialogVariant}
                />
              </HStack>
            )
          }
          onOpenChange={onOpenChange}
        />
      }
      content={
        <LayoutContent>
          {pendingAction ? (
            <VStack gap={3}>
              {notice?.status === "error" ? (
                <Banner status="error" title={notice.title} />
              ) : null}
              <Text>Caption: {caption || "(kosong)"}</Text>
              <VStack gap={1}>
                <Text type="supporting">Akun:</Text>
                {selectedAccounts.map((account) => (
                  <Text key={account.id}>
                    · {PLATFORM_LABEL[account.platform]} {account.handle} —{" "}
                    {
                      FORMAT_LABEL[
                        formatByAccount[account.id] ??
                          getDefaultFormat(account.platform)
                      ]
                    }
                  </Text>
                ))}
              </VStack>
              {pendingAction === "publish-now" ? (
                <Text>Waktu: Sekarang</Text>
              ) : (
                <Text>
                  Waktu: {scheduleDate ?? "-"} {scheduleTime ?? ""}
                </Text>
              )}
            </VStack>
          ) : (
            <VStack gap={4}>
              {notice ? (
                <Banner status={notice.status} title={notice.title} />
              ) : null}

              {isLoadingDraft ? (
                <Text type="supporting">Memuat draft…</Text>
              ) : (
                <HStack gap={6} align="start" wrap="wrap">
                  <VStack gap={5} width="100%" maxWidth={500}>
                    <VStack gap={3}>
                      <Heading level={2}>Caption</Heading>
                      <TextArea
                        label="Caption"
                        isLabelHidden
                        value={caption}
                        onChange={setCaption}
                        placeholder="Tulis caption di sini..."
                        description="AI Caption Assist belum termasuk revisi ini."
                      />
                    </VStack>

                    <VStack gap={3}>
                      <Heading level={2}>Media</Heading>
                      <FileInput
                        label="Media"
                        isLabelHidden
                        mode="dropzone"
                        value={null}
                        onChange={() => undefined}
                        isDisabled
                        disabledMessage="Lampiran media akan tersedia setelah OutstandAdapter Media API siap."
                      />
                    </VStack>
                  </VStack>

                  <VStack gap={4} width="100%" maxWidth={340}>
                    <VStack gap={3}>
                      <Heading level={2}>Account Selector</Heading>
                      {isLoadingAccounts ? (
                        <Text type="supporting">Memuat akun terhubung…</Text>
                      ) : accounts.length === 0 ? (
                        <Text type="supporting">
                          Belum ada akun terhubung untuk workspace ini.
                        </Text>
                      ) : (
                        accounts.map((account) => {
                          const isChecked = selectedAccountIds.includes(
                            account.id,
                          );
                          const formats = getSelectableFormats(
                            account.platform,
                          );
                          const currentFormat = formatByAccount[account.id];
                          const isDisconnected = isAccountDisconnected(account);

                          return (
                            <VStack key={account.id} gap={2}>
                              <HStack justify="between" align="center">
                                <CheckboxInput
                                  label={`${PLATFORM_LABEL[account.platform]} ${account.handle}`}
                                  value={isChecked}
                                  onChange={(checked) =>
                                    toggleAccount(account, checked)
                                  }
                                />
                                {isDisconnected ? (
                                  <Badge
                                    label="Disconnected"
                                    variant="warning"
                                  />
                                ) : null}
                              </HStack>

                              {isDisconnected ? (
                                <Text type="supporting">
                                  Akun ini terputus —{" "}
                                  <Link href="/settings/connected-accounts">
                                    Reconnect
                                  </Link>
                                  .
                                </Text>
                              ) : null}

                              {isChecked && formats ? (
                                <RadioList
                                  label="Content Format"
                                  isLabelHidden
                                  orientation="horizontal"
                                  value={
                                    currentFormat ??
                                    getDefaultFormat(account.platform)
                                  }
                                  onChange={(value) =>
                                    setFormatByAccount((prev) => ({
                                      ...prev,
                                      [account.id]: value as ContentFormat,
                                    }))
                                  }
                                >
                                  {formats.map((format) => (
                                    <RadioListItem
                                      key={format}
                                      label={FORMAT_LABEL[format]}
                                      value={format}
                                    />
                                  ))}
                                </RadioList>
                              ) : null}

                              {isChecked &&
                              account.platform === SocialPlatform.Pinterest ? (
                                <VStack gap={2}>
                                  <Text type="supporting">Format: Pin</Text>
                                  <TextInput
                                    label="Pin Title"
                                    value={pinTitle}
                                    onChange={setPinTitle}
                                    isOptional
                                  />
                                  <TextInput
                                    label="Destination Link"
                                    value={pinLink}
                                    onChange={setPinLink}
                                    isOptional
                                  />
                                </VStack>
                              ) : null}

                              {isChecked &&
                              !formats &&
                              account.platform !== SocialPlatform.Pinterest ? (
                                <Text type="supporting">Format: Post</Text>
                              ) : null}

                              <Divider />
                            </VStack>
                          );
                        })
                      )}
                    </VStack>

                    <VStack gap={3}>
                      <Heading level={2}>Jadwal</Heading>
                      <HStack gap={2}>
                        <DateInput
                          label="Tanggal"
                          isLabelHidden
                          placeholder="Pilih tanggal"
                          size="sm"
                          value={scheduleDate as never}
                          onChange={(value) => setScheduleDate(value)}
                        />
                        <TimeInput
                          label="Waktu"
                          isLabelHidden
                          placeholder="Pilih waktu"
                          size="sm"
                          hourFormat="24h"
                          increment={15}
                          value={scheduleTime as never}
                          onChange={(value) => setScheduleTime(value)}
                        />
                      </HStack>
                    </VStack>
                  </VStack>
                </HStack>
              )}
            </VStack>
          )}
        </LayoutContent>
      }
      footer={
        isLoadingDraft ? undefined : (
          <LayoutFooter>
            {pendingAction === "schedule" ? (
              <HStack gap={3} justify="end" width="100%">
                <Button
                  label="Batal"
                  variant="secondary"
                  onClick={() => setPendingAction(null)}
                  isDisabled={isScheduling}
                />
                <Button
                  label="Konfirmasi & Jadwalkan"
                  variant="primary"
                  onClick={handleConfirmSchedule}
                  isLoading={isScheduling}
                />
              </HStack>
            ) : pendingAction === "publish-now" ? (
              <HStack gap={3} justify="end" width="100%">
                <Button
                  label="Batal"
                  variant="secondary"
                  onClick={() => setPendingAction(null)}
                  isDisabled={isPublishingNow}
                />
                <Button
                  label="Konfirmasi & Publish"
                  variant="primary"
                  onClick={handleConfirmPublishNow}
                  isLoading={isPublishingNow}
                />
              </HStack>
            ) : (
              <HStack gap={2} width="100%">
                <StackItem size="fill">
                  <Button
                    label="Save as Draft"
                    variant="secondary"
                    width="100%"
                    onClick={handleSaveDraft}
                    isLoading={isSavingDraft}
                  />
                </StackItem>
                <StackItem size="fill">
                  <Button
                    label="Publish Now"
                    variant="secondary"
                    width="100%"
                    isDisabled={!isReadyToPublishNow}
                    onClick={() => setPendingAction("publish-now")}
                  />
                </StackItem>
                <StackItem size="fill">
                  <Button
                    label="Schedule"
                    variant="primary"
                    width="100%"
                    isDisabled={!isReadyToSchedule}
                    onClick={() => setPendingAction("schedule")}
                  />
                </StackItem>
              </HStack>
            )}
          </LayoutFooter>
        )
      }
    />
  );
}

// Standard variant's floating card + backdrop margins waste too much of a
// small phone's screen (ADR-065 only decided the desktop default; it never
// addressed small viewports). Below this breakpoint the Dialog always
// renders Fullscreen regardless of the user's toggle choice, restoring the
// edge-to-edge editing surface mobile needs.
const MOBILE_VIEWPORT_QUERY = "(max-width: 640px)";

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(MOBILE_VIEWPORT_QUERY).matches,
  );
  useEffect(() => {
    const query = window.matchMedia(MOBILE_VIEWPORT_QUERY);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

export function DraftEditorModal() {
  const {
    state,
    resume,
    discardAndStartNew,
    close,
    persistUnsavedNewPost,
    clearUnsavedNewPost,
  } = useDraftEditor();

  const isEditorOpen = state.mode === "create" || state.mode === "edit";
  const sessionKey =
    state.mode === "edit"
      ? `edit:${state.postId}`
      : state.mode === "create"
        ? "create"
        : "none";

  // Remembers the last resume-check payload, and the currently-mounted
  // form's live caption/savedPostId — both adjusted during render (not in
  // an effect) purely so exit animations / close handling have data to work
  // with after `state` has already moved on.
  const [resumeData, setResumeData] = useState<UnsavedNewPost | null>(null);
  if (state.mode === "resume-check" && state.unsaved !== resumeData) {
    setResumeData(state.unsaved);
  }

  // Fullscreen/Standard toggle (ADR-065): official, user-switchable, never
  // persisted — reset to the default (Standard) every time a new session
  // starts. `DraftEditorForm` itself remounts per session via `key=
  // {sessionKey}`, but this state has to live here because it drives the
  // wrapping `Dialog`'s own `variant`/`width`, so it's reset the same way
  // `resumeData` above is: adjusted during render when `sessionKey` changes,
  // not in an effect.
  const [dialogVariant, setDialogVariant] = useState<"standard" | "fullscreen">(
    "standard",
  );
  const [prevSessionKey, setPrevSessionKey] = useState(sessionKey);
  if (prevSessionKey !== sessionKey) {
    setPrevSessionKey(sessionKey);
    if (dialogVariant !== "standard") {
      setDialogVariant("standard");
    }
  }
  function toggleDialogVariant() {
    setDialogVariant((current) =>
      current === "standard" ? "fullscreen" : "standard",
    );
  }
  const isMobileViewport = useIsMobileViewport();
  const effectiveDialogVariant = isMobileViewport
    ? "fullscreen"
    : dialogVariant;

  const latestFormRef = useRef<LatestFormSnapshot>({
    mode: "create",
    caption: "",
    savedPostId: undefined,
  });

  function handleOpenChange(open: boolean) {
    if (open) {
      return;
    }
    const { mode, caption, savedPostId } = latestFormRef.current;
    if (mode === "create") {
      const trimmed = caption.trim();
      if (trimmed && !savedPostId) {
        persistUnsavedNewPost(trimmed);
      } else {
        clearUnsavedNewPost();
      }
    }
    close();
  }

  return (
    <>
      <ResumeDialog
        isOpen={state.mode === "resume-check"}
        unsaved={resumeData}
        onDiscard={discardAndStartNew}
        onResume={resume}
      />

      <Dialog
        isOpen={isEditorOpen}
        onOpenChange={handleOpenChange}
        variant={effectiveDialogVariant}
        width="min(960px, 94vw)"
        maxHeight="90vh"
        purpose="form"
      >
        {isEditorOpen ? (
          <DraftEditorForm
            key={sessionKey}
            mode={state.mode === "edit" ? "edit" : "create"}
            postId={state.mode === "edit" ? state.postId : undefined}
            prefillCaption={
              state.mode === "create" ? state.prefillCaption : undefined
            }
            preSelectedAccountId={
              state.mode === "create" ? state.preSelectedAccountId : undefined
            }
            initialPendingAction={
              state.mode === "edit" ? state.initialPendingAction : undefined
            }
            onOpenChange={handleOpenChange}
            dialogVariant={dialogVariant}
            onToggleDialogVariant={toggleDialogVariant}
            onLatestChange={(snapshot) => {
              latestFormRef.current = snapshot;
            }}
          />
        ) : null}
      </Dialog>
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { DateInput } from "@astryxdesign/core/DateInput";
import { Dialog } from "@astryxdesign/core/Dialog";
import { DialogHeader } from "@astryxdesign/core/Dialog";
import { Divider } from "@astryxdesign/core/Divider";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TimeInput } from "@astryxdesign/core/TimeInput";
import { VStack } from "@astryxdesign/core/VStack";

import { ContentFormat, SocialPlatform } from "@social/shared";

type MockAccountStatus = "active" | "disconnected";

interface MockAccount {
  id: string;
  platform: SocialPlatform;
  handle: string;
  status: MockAccountStatus;
}

/**
 * Mock connected accounts — OUTSTAND_API_KEY/OUTSTAND_WEBHOOK_SECRET belum
 * tersedia, jadi Account Selector memakai data dummy sampai integrasi
 * Outstand nyata (ADR-040) siap. Bukan data dari database.
 */
const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: "acc-ig",
    platform: SocialPlatform.Instagram,
    handle: "@brandname",
    status: "active",
  },
  {
    id: "acc-fb",
    platform: SocialPlatform.Facebook,
    handle: "@brandname",
    status: "active",
  },
  {
    id: "acc-tiktok",
    platform: SocialPlatform.TikTok,
    handle: "@brandname",
    status: "active",
  },
  {
    id: "acc-pin",
    platform: SocialPlatform.Pinterest,
    handle: "@brandname",
    status: "active",
  },
  {
    id: "acc-li",
    platform: SocialPlatform.LinkedIn,
    handle: "Company Page",
    status: "disconnected",
  },
];

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

export default function NewDraftPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [status, setStatus] = useState<"draft" | "scheduled">("draft");
  const [caption, setCaption] = useState("");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [formatByAccount, setFormatByAccount] = useState<
    Record<string, ContentFormat>
  >({});
  const [pinTitle, setPinTitle] = useState("");
  const [pinLink, setPinLink] = useState("");
  const [scheduleDate, setScheduleDate] = useState<string | undefined>();
  const [scheduleTime, setScheduleTime] = useState<string | undefined>();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [mockNotice, setMockNotice] = useState<string | null>(null);

  const selectedAccounts = useMemo(
    () =>
      MOCK_ACCOUNTS.filter((account) =>
        selectedAccountIds.includes(account.id),
      ),
    [selectedAccountIds],
  );

  const isReadyToSchedule =
    caption.trim().length > 0 &&
    selectedAccounts.length > 0 &&
    Boolean(scheduleDate) &&
    Boolean(scheduleTime);

  function toggleAccount(account: MockAccount, checked: boolean) {
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

  function handleSaveDraft() {
    setStatus("draft");
    setMockNotice(
      "Draft disimpan (mock) — belum tersambung ke database. Persistensi nyata menyusul.",
    );
  }

  function handleConfirmSchedule() {
    setIsConfirmOpen(false);
    setStatus("scheduled");
    setMockNotice(
      "Jadwal dikonfirmasi (mock) — publish sebenarnya menunggu OUTSTAND_API_KEY & OUTSTAND_WEBHOOK_SECRET.",
    );
  }

  return (
    <VStack gap={4}>
      <HStack justify="between" align="center">
        <Button
          label="Kembali"
          variant="ghost"
          onClick={() => router.push(`/${slug}/publish/drafts`)}
        />
        <Badge
          label={status === "draft" ? "Draft" : "Scheduled"}
          variant={status === "draft" ? "neutral" : "info"}
        />
      </HStack>

      {mockNotice ? <Banner status="info" title={mockNotice} /> : null}

      <HStack gap={6} align="start" wrap="wrap">
        <VStack gap={4} width="100%" maxWidth={560}>
          <Card padding={4}>
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
          </Card>

          <Card padding={4}>
            <VStack gap={3}>
              <Heading level={2}>Media Attachment</Heading>
              <Button label="+ Tambah Media" variant="secondary" isDisabled />
              <Text type="supporting">
                Lampiran media akan tersedia setelah OutstandAdapter Media API
                siap.
              </Text>
            </VStack>
          </Card>
        </VStack>

        <VStack gap={4} width="100%" maxWidth={380}>
          <Card padding={4}>
            <VStack gap={3}>
              <Heading level={2}>Account Selector</Heading>
              {MOCK_ACCOUNTS.map((account) => {
                const isChecked = selectedAccountIds.includes(account.id);
                const formats = getSelectableFormats(account.platform);
                const currentFormat = formatByAccount[account.id];

                return (
                  <VStack key={account.id} gap={2}>
                    <HStack justify="between" align="center">
                      <CheckboxInput
                        label={`${PLATFORM_LABEL[account.platform]} ${account.handle}`}
                        value={isChecked}
                        onChange={(checked) => toggleAccount(account, checked)}
                      />
                      {account.status === "disconnected" ? (
                        <Badge label="Disconnected" variant="warning" />
                      ) : null}
                    </HStack>

                    {account.status === "disconnected" ? (
                      <Text type="supporting">
                        Akun ini terputus —{" "}
                        <Link href={`/${slug}/settings/connected-accounts`}>
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
                          currentFormat ?? getDefaultFormat(account.platform)
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
              })}
            </VStack>
          </Card>

          <Card padding={4}>
            <VStack gap={3}>
              <Heading level={2}>Schedule Picker</Heading>
              <DateInput
                label="Tanggal"
                value={scheduleDate as never}
                onChange={(value) => setScheduleDate(value)}
              />
              <TimeInput
                label="Waktu"
                value={scheduleTime as never}
                onChange={(value) => setScheduleTime(value)}
              />
            </VStack>
          </Card>

          <HStack gap={3} justify="end">
            <Button
              label="Save as Draft"
              variant="secondary"
              onClick={handleSaveDraft}
            />
            <Button
              label="Schedule"
              variant="primary"
              isDisabled={!isReadyToSchedule}
              onClick={() => setIsConfirmOpen(true)}
            />
          </HStack>
        </VStack>
      </HStack>

      <Dialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        purpose="form"
      >
        <DialogHeader title="Konfirmasi Jadwal" />
        <VStack gap={3}>
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
          <Text>
            Waktu: {scheduleDate ?? "-"} {scheduleTime ?? ""}
          </Text>
          <HStack gap={3} justify="end">
            <Button
              label="Batal"
              variant="secondary"
              onClick={() => setIsConfirmOpen(false)}
            />
            <Button
              label="Konfirmasi & Jadwalkan"
              variant="primary"
              onClick={handleConfirmSchedule}
            />
          </HStack>
        </VStack>
      </Dialog>
    </VStack>
  );
}

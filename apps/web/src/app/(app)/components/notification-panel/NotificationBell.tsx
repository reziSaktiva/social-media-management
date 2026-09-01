"use client";

import { useRef, useState } from "react";

import { FaBell } from "react-icons/fa6";

import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Center } from "@astryxdesign/core/Center";
import { DialogHeader } from "@astryxdesign/core/Dialog";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import { List, ListItem } from "@astryxdesign/core/List";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import type { NotificationId } from "@social/shared";
import type { NotificationRecord } from "@/domains/notification";

import { Drawer } from "@/components/ui/Drawer";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "./actions";
import { useNotificationRealtime } from "@/lib/hooks/use-notification-realtime";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

/**
 * T-036.4 (NP-D08) — bell trigger + panel notifikasi di sidebar footer.
 * Gap desain vs Astryx (dilaporkan & disetujui King Rezi 2026-08-31): spec
 * Claude Design menyebut "Drawer", tapi Astryx v0.4.3 tidak punya komponen
 * bernama itu. Percobaan pertama (`Dialog` + prop `position`) ternyata tidak
 * bisa full-height (base style `Dialog` hardcode `height: fit-content`) —
 * diganti wrapper selektif `Drawer` (`@/components/ui/Drawer`, ADR-041)
 * yang dirakit dari primitive Astryx murni (`useLayer`/`useFocusTrap`/
 * `useScrollLock`). Header/body di bawah ini tidak berubah dari percobaan
 * pertama, cuma dipindah ke wrapper baru.
 */

function isErrorType(type: string): boolean {
  return (
    type.toLowerCase().includes("error") ||
    type.toLowerCase().includes("failed")
  );
}

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: NotificationRecord;
  onMarkRead: (id: NotificationId) => void;
}) {
  const markReadButtonRef = useRef<HTMLButtonElement>(null);
  const isUnread = !notification.isRead;
  const isError = isErrorType(notification.type);

  return (
    <ListItem
      // Gap desain #4 (temuan King Rezi 2026-09-01 vs spec Claude Design
      // `.notif-item .title`, dibandingkan langsung ke styles.css): title
      // unread = semibold + `--color-text-primary`, title sudah dibaca =
      // regular + `--color-text-secondary`. `ListItem.label` sebagai string
      // biasa selalu ikut satu style baku dari `Item` (lihat `styles.label`
      // di Item.js, tidak beda per state) — dipakai `Text` (bukan string)
      // supaya bisa set `weight`/`color` per kondisi. `type="inherit"` supaya
      // ukuran/line-height tetap ikut wrapper label bawaan Item, cuma
      // weight+color yang di-override. `maxLines={1}` dipertahankan karena
      // `Item` hanya auto-truncate label kalau propnya string (lihat
      // ListItem.d.ts), bukan ReactNode seperti ini.
      label={
        <Text
          type="inherit"
          weight={isUnread ? "semibold" : "normal"}
          color={isUnread ? "primary" : "secondary"}
          maxLines={1}
        >
          {notification.title}
        </Text>
      }
      // Gap desain #5 (spec `.notif-item .description { overflow:hidden;
      // text-overflow:ellipsis; white-space:nowrap }`). Sempat dicoba set
      // eksplisit `descriptionLines={1}` (prop `Item` yang diteruskan
      // `ListItem` lewat `...restProps`, lihat ListItem.js) supaya tidak
      // bergantung diam-diam ke default — tapi `ListItemProps` (ListItem.d.ts)
      // TIDAK mendeklarasikan `descriptionLines` di tipenya (beda dari
      // `ItemProps` yang punya), jadi `tsc` menolak walau valid di runtime.
      // Tidak jadi dipaksakan (hindari `as any`/type-unsafe cast) — `body`
      // di sini SELALU string (`NotificationRecord.body: string`, lihat
      // `@/domains/notification`), dan `ListItem.description` string sudah
      // auto single-line-truncate secara default (ListItem.d.ts: "Accepts a
      // plain string (single-line truncation applied automatically)"), jadi
      // gap ini tertutup oleh default Astryx tanpa prop tambahan.
      description={notification.body}
      startContent={
        // Gap desain #3 (`.notif-icon` + `.is-success`/`.is-error`): icon
        // status harus dibungkus circle 34x34 dengan background muted sesuai
        // status. Tidak ada prop bawaan `Icon`/`ListItem` untuk circle
        // wrapper begini — dipakai `Center` (komponen asli Astryx untuk
        // flex-center, BUKAN <div> mentah) dengan `width`/`height` numerik
        // 34 (SizeValue = number|string, lihat utils/types.d.ts; tidak ada
        // token spacing yang pas persis di 34px — --spacing-8/9 = 32/36px)
        // + fallback className token-backed `rounded-full` (radius-full) dan
        // `bg-success-muted`/`bg-error-muted` (token warna status yang sudah
        // dipetakan di tailwind-theme.css).
        <Center
          width={34}
          height={34}
          className={
            isError
              ? "rounded-full bg-error-muted"
              : "rounded-full bg-success-muted"
          }
        >
          <Icon
            icon={isError ? "error" : "success"}
            size="sm"
            color={isError ? "error" : "success"}
          />
        </Center>
      }
      endContent={
        <HStack gap={2} align="center">
          <Text type="supporting" color="secondary">
            {formatRelativeTime(notification.createdAt)}
          </Text>
          {isUnread ? (
            <Button
              ref={markReadButtonRef}
              label="Tandai dibaca"
              variant="ghost"
              size="sm"
              onClick={() => onMarkRead(notification.id)}
            />
          ) : null}
          {isUnread ? (
            // Gap desain #2 (`.notif-dot`): dot indikator kecil di pojok
            // kanan-atas item unread. Tidak ada slot "corner" di
            // ListItem/Item untuk ini — dipakai `StatusDot` (komponen asli
            // Astryx untuk indikator status, lihat aturan CLAUDE.md "Status =
            // StatusDot/Token", bukan Badge yang khusus untuk counts) dengan
            // `variant="accent"` (match `--color-accent`), diposisikan lepas
            // dari flow lewat fallback className token-backed `absolute
            // top-4 right-3` (persis `--spacing-4`/`--spacing-3` di spec).
            // Posisi absolute ini nempel ke ancestor `position:relative`
            // terdekat, yaitu root `<li>` ListItem sendiri (lihat className
            // "relative" di bawah, cuma di-set saat unread). `StatusDot`
            // fixed 8px (tidak ada prop size) vs spec 7px — beda 1px,
            // dipakai apa adanya karena ini komponen asli, bukan span
            // arbitrary-size.
            <StatusDot
              variant="accent"
              label="Belum dibaca"
              className="absolute top-4 right-3"
            />
          ) : null}
        </HStack>
      }
      // Klik di mana pun pada baris didelegasikan ke tombol "Tandai dibaca"
      // (satu-satunya tab stop, pola sanksi Astryx `interactiveRef` — lihat
      // Item.test.tsx "delegation mode") supaya "klik item" dan "klik
      // tombol" sama-sama menandai dibaca tanpa nested-interactive
      // anti-pattern. Item sudah dibaca tidak punya aksi apa pun.
      interactiveRef={isUnread ? markReadButtonRef : undefined}
      // Fix regresi styling (dilaporkan King Rezi): `Item` (dipakai internal
      // oleh `ListItem`) selalu punya gap tetap `--spacing-2` (8px) antara
      // start/label/end content, tidak ada prop untuk mengubahnya — dicek di
      // `node_modules/.../@astryxdesign/core/dist/Item/Item.js` (density
      // hanya mengubah padding-block/inline, bukan gap). Spec Claude Design
      // minta `.notif-item { gap: var(--spacing-3) }` (12px), jadi dipakai
      // fallback Tailwind token-backed `gap-3` (menang atas default astryx
      // karena layer `utilities` > `astryx-base` di globals.css).
      //
      // Gap desain #1 (`.notif-item.is-unread { background:
      // var(--color-accent-muted) }`): tint background item unread, juga
      // fallback className token-backed (`bg-accent-muted`, sudah dipetakan
      // tailwind-theme.css ke token yang sama). `relative` cuma ditambah
      // saat unread — jadi ancestor posisi untuk dot (#2) di atas.
      className={isUnread ? "relative gap-3 bg-accent-muted" : "gap-3"}
    />
  );
}

export function NotificationBell({
  initialNotifications,
  userId,
}: {
  initialNotifications: NotificationRecord[];
  userId: string;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useNotificationRealtime(userId, (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  });

  async function handleMarkRead(id: NotificationId) {
    const previous = notifications;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await markNotificationReadAction(id);
    } catch {
      setNotifications(previous);
    }
  }

  async function handleMarkAllRead() {
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllNotificationsReadAction();
    } catch {
      setNotifications(previous);
    }
  }

  return (
    <>
      <HStack className="relative" gap={0}>
        <IconButton
          label="Notifikasi"
          icon={<FaBell />}
          variant="ghost"
          tooltip="Notifikasi"
          onClick={() => setIsOpen(true)}
        />
        {unreadCount > 0 ? (
          <Badge
            label={unreadCount > 99 ? "99+" : String(unreadCount)}
            variant="error"
            className="absolute -top-1 -right-1"
          />
        ) : null}
      </HStack>

      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        aria-label="Notifications"
      >
        <Layout
          header={
            // Fix regresi styling (dilaporkan King Rezi): tanpa `hasDivider`,
            // `LayoutHeader` (dipakai `DialogHeader`) tidak dapat atribut
            // `data-divider` — ini bikin `LayoutContent` di bawahnya
            // otomatis nge-collapse padding-top jadi 0 (lihat CSS selector
            // `:has(> .astryx-layout-header:not([data-divider]))` di
            // astryx.css), jadi konten nempel langsung ke header TANPA
            // border pemisah sama sekali. Spec Claude Design minta
            // `.notif-header { border-bottom: 1px solid var(--color-border) }`.
            //
            // Ronde 2 (temuan King Rezi dari screenshot browser asli): garis
            // border SUDAH ada di DOM (`hasDivider` benar), tapi warna
            // default `--color-border` Stone theme dark cuma alpha ~10%
            // (`#F2F4F619` di astryx.css / `#f3f3f51a` di theme-stone) —
            // nyaris tidak kelihatan di atas surface gelap (#1F1F22).
            // `LayoutHeader`/`DialogHeader` tidak punya prop untuk pilih
            // token border lain (hardcode `--color-border` di source),
            // jadi dipakai fallback Tailwind token-backed
            // `border-b-border-strong` (dari tailwind-theme.css:
            // `--color-border-strong` → `var(--color-border-emphasized)`,
            // token semantik Astryx yang sama, BUKAN warna custom baru)
            // untuk menang atas border-bottom-color bawaan lewat layer
            // `utilities` — border-bottom-width/style dari `hasDivider`
            // tetap dipakai, cuma warnanya yang di-override.
            <DialogHeader
              title="Notifications"
              hasDivider
              className="border-b-border-strong"
              onOpenChange={setIsOpen}
              endContent={
                <Button
                  label="Mark all as read"
                  variant="ghost"
                  size="sm"
                  isDisabled={unreadCount === 0}
                  onClick={handleMarkAllRead}
                />
              }
            />
          }
          content={
            // `padding={2}` (8px = --spacing-2) sesuai spec `.notif-list`.
            // Diisi eksplisit (bukan andalkan default) supaya juga tidak
            // kena collapse padding-top di atas walau header sudah
            // `hasDivider`.
            <LayoutContent isScrollable padding={2}>
              {notifications.length === 0 ? (
                // Fix regresi styling (temuan King Rezi ronde 2): tanpa
                // wrapper ini, `EmptyState` cuma block biasa di dalam
                // `LayoutContent` (yang punya height:100% tapi BUKAN flex
                // container — dicek di LayoutContent.js, tidak ada
                // display:flex di style-nya) jadi dia nempel di atas, bukan
                // center. Spec Claude Design eksplisit minta wrapper
                // `.notif-empty-wrap { height:100%; display:flex;
                // align-items:center; justify-content:center }` terpisah
                // dari `.empty` (padding internal EmptyState itu sendiri).
                // `VStack` dipakai sebagai flex container pengganti wrapper
                // itu — `height="100%"` isi penuh sisa ruang LayoutContent,
                // `justify`/`align="center"` center dua arah.
                <VStack height="100%" justify="center" align="center">
                  <EmptyState
                    isCompact
                    title="Belum ada notifikasi"
                    description="Notifikasi hasil publish akan muncul di sini."
                    // `isCompact` cuma py/px tetap 16px/16px (2 preset baku,
                    // lihat EmptyState.js) — spec Claude Design minta
                    // `.empty { padding: var(--spacing-6) var(--spacing-2) }`
                    // (24px vertikal, 8px horizontal), tidak match preset
                    // manapun. Fallback Tailwind token-backed py-6/px-2
                    // (menang lewat layer `utilities` > `astryx-base`).
                    className="px-2 py-6"
                  />
                </VStack>
              ) : (
                // TANPA `hasDividers`: kalau di-set, `ListItem` otomatis
                // border-radius:0 (lihat `embeddedStyles.noRadius` di
                // ListItem.js) — spec `.notif-item` minta
                // `border-radius: var(--radius-element)` dan TIDAK
                // menyebut divider/border apa pun untuk item (beda dari
                // `.notif-header` yang eksplisit minta border-bottom).
                // `density="spacious"` = padding-block DAN padding-inline
                // sama-sama --spacing-3 (12px), match `.notif-item`.
                <List density="spacious">
                  {notifications.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
                </List>
              )}
            </LayoutContent>
          }
        />
      </Drawer>
    </>
  );
}

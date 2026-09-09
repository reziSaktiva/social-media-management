"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

/**
 * Scaffold AlertDialog konfirmasi bersama, dipakai berpasangan dengan
 * `useConfirmAction` (`@/lib/hooks/use-confirm-action`) — sebelumnya
 * diduplikasi identik di `MembersTable.tsx` (Remove member, Change role,
 * Cancel invitation — code review PR #108) dan lalu re-inline lagi di
 * `ConnectedAccountsList.tsx` (Disconnect account, T-014.3). Dipindah ke
 * sini supaya perubahan pada scaffold-nya (padding, a11y, penempatan
 * spinner) hanya perlu dilakukan satu tempat.
 */
export function ConfirmActionDialog({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel,
  isLoading,
  onConfirm,
  variant,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  isLoading: boolean;
  onConfirm: () => void;
  variant?: "destructive";
}) {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant={variant}
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {isLoading ? <Spinner /> : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

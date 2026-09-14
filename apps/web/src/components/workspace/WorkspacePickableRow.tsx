import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { formatRoleLabel, getInitials } from "@/lib/utils";

interface Props {
  name: string;
  role: string;
  pendingLabel: string | null;
  disabled: boolean;
  onClick: () => void;
}

/**
 * Baris workspace yang bisa diklik (bukan "Aktif" — itu tetap kasus khusus
 * `WorkspacesSettingsView`), dipakai oleh `WorkspacePicker` (onboarding,
 * T-039.4) dan `WorkspacesSettingsView` (Settings → Account → Workspaces,
 * T-089) supaya markup baris tidak divergen di dua tempat. Perilaku klik
 * (langsung pilih vs buka dialog konfirmasi) tetap di komponen pemanggil
 * lewat `onClick` — komponen ini murni presentasi.
 */
export function WorkspacePickableRow({
  name,
  role,
  pendingLabel,
  disabled,
  onClick,
}: Props) {
  return (
    <Item
      asChild
      variant="outline"
      className="cursor-pointer hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
    >
      <button type="button" onClick={onClick} disabled={disabled}>
        <ItemMedia>
          <Avatar>
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{name}</ItemTitle>
          <ItemDescription>
            {pendingLabel ?? formatRoleLabel(role)}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            className="size-4 text-muted-foreground"
          />
        </ItemActions>
      </button>
    </Item>
  );
}

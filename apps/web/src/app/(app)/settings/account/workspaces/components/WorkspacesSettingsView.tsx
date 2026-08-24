"use client";

import { useState, useTransition } from "react";

import { FaPlus } from "react-icons/fa6";

import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Layout, LayoutContent, LayoutFooter } from "@astryxdesign/core/Layout";
import { List, ListItem } from "@astryxdesign/core/List";
import { Section } from "@astryxdesign/core/Section";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

import {
  SETTINGS_BREADCRUMB_GROUP,
  SettingsPageHead,
} from "../../../components/SettingsPageHead";
import { createWorkspaceAction, switchWorkspaceAction } from "../actions";

export interface WorkspaceSummary {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface Props {
  workspaces: WorkspaceSummary[];
}

// Label role ditampilkan title-case terlepas dari casing mentah yang
// dikirim page.tsx (MemberRole enum di packages/shared bernilai lowercase
// "owner"/"admin"/"creator") — kontrak prop di sini sengaja `role: string`
// polos (bukan import MemberRole) supaya komponen ini tidak terikat ke
// shared enum, cukup format tampilan.
function formatRoleLabel(role: string): string {
  if (!role) return role;
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

/**
 * Baris "Aktif" — non-interactive, hanya menampilkan Badge status dengan
 * StatusDot sebagai leading icon (spek: "Chip/Badge Aktif dengan dot
 * indicator").
 */
function ActiveBadge() {
  return (
    <Badge
      variant="success"
      icon={<StatusDot variant="success" label="" />}
      label="Aktif"
    />
  );
}

function WorkspaceRow({
  workspace,
  isSwitchPending,
  onSwitch,
}: {
  workspace: WorkspaceSummary;
  isSwitchPending: boolean;
  onSwitch: (workspaceId: string) => void;
}) {
  if (workspace.isActive) {
    return (
      <ListItem
        label={workspace.name}
        description={formatRoleLabel(workspace.role)}
        startContent={<Avatar name={workspace.name} size="md" />}
        endContent={<ActiveBadge />}
      />
    );
  }

  return (
    <ListItem
      label={workspace.name}
      description={
        isSwitchPending
          ? "Memindahkan ke workspace ini..."
          : formatRoleLabel(workspace.role)
      }
      startContent={<Avatar name={workspace.name} size="md" />}
      endContent={<Icon icon="chevronRight" color="tertiary" size="sm" />}
      onClick={() => onSwitch(workspace.id)}
      isDisabled={isSwitchPending}
    />
  );
}

/**
 * View Settings → Account → Workspaces (T-089.3/.4, ADR-088). Client
 * Component murni presentasi + orkestrasi Server Action — semua validasi
 * membership/role tetap di `WorkspaceService` (dipanggil lewat
 * `switchWorkspaceAction`/`createWorkspaceAction` di `../actions`).
 */
export function WorkspacesSettingsView({ workspaces }: Props) {
  const [isSwitchPending, startSwitchTransition] = useTransition();
  const [switchingWorkspaceId, setSwitchingWorkspaceId] = useState<
    string | null
  >(null);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreatePending, startCreateTransition] = useTransition();
  const [createError, setCreateError] = useState<string | null>(null);

  function handleSwitch(targetWorkspaceId: string) {
    setSwitchError(null);
    setSwitchingWorkspaceId(targetWorkspaceId);
    startSwitchTransition(async () => {
      const result = await switchWorkspaceAction(targetWorkspaceId);
      if (result?.error) {
        setSwitchError(result.error);
        setSwitchingWorkspaceId(null);
      }
      // Kalau sukses: Server Action redirect("/") di server, komponen ini
      // akan unmount — tidak perlu reset state manual.
    });
  }

  function resetDialogState() {
    setNewWorkspaceName("");
    setCreateError(null);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    resetDialogState();
  }

  function handleCreate() {
    const name = newWorkspaceName.trim();
    if (!name) return;
    setCreateError(null);
    startCreateTransition(async () => {
      const result = await createWorkspaceAction(name);
      if (result?.error) {
        setCreateError(result.error);
      }
      // Sukses: Server Action redirect("/") di server.
    });
  }

  return (
    <VStack gap={4} padding={4}>
      <SettingsPageHead
        pageName="Workspaces"
        breadcrumb={`${SETTINGS_BREADCRUMB_GROUP.account} / Workspaces`}
        action={
          <Button
            label="Buat Workspace Baru"
            variant="primary"
            icon={<FaPlus />}
            onClick={() => setDialogOpen(true)}
          />
        }
      />

      {switchError ? <Banner status="error" title={switchError} /> : null}

      <Section>
        <List
          hasDividers
          density="balanced"
          header={<Heading level={3}>Workspace Anda</Heading>}
        >
          {workspaces.map((workspace) => (
            <WorkspaceRow
              key={workspace.id}
              workspace={workspace}
              isSwitchPending={
                isSwitchPending && switchingWorkspaceId === workspace.id
              }
              onSwitch={handleSwitch}
            />
          ))}
        </List>
      </Section>

      <Dialog
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetDialogState();
        }}
        purpose="form"
        width={400}
      >
        <Layout
          header={
            <DialogHeader
              title="Buat Workspace Baru"
              subtitle="Workspace baru akan langsung aktif dan Anda pindah ke sana setelah dibuat."
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetDialogState();
              }}
            />
          }
          content={
            <LayoutContent>
              <VStack gap={4}>
                {createError ? (
                  <Banner status="error" title={createError} />
                ) : null}

                <TextInput
                  label="Nama Workspace"
                  value={newWorkspaceName}
                  onChange={setNewWorkspaceName}
                  placeholder="Roti Selasar"
                  width="100%"
                  isRequired
                  isDisabled={isCreatePending}
                />
              </VStack>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Batal"
                  variant="secondary"
                  onClick={handleCloseDialog}
                  isDisabled={isCreatePending}
                />
                <Button
                  label="Buat Workspace"
                  variant="primary"
                  isDisabled={!newWorkspaceName.trim()}
                  isLoading={isCreatePending}
                  onClick={handleCreate}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
    </VStack>
  );
}

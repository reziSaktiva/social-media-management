"use client";

import { Button } from "@astryxdesign/core/Button";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Layout, LayoutContent, LayoutFooter } from "@astryxdesign/core/Layout";
import {
  proportional,
  Table,
  type TableColumn,
} from "@astryxdesign/core/Table";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import { useState } from "react";

type AccountRow = Record<string, unknown> & {
  id: string;
  platform: string;
  account: string;
  status: string;
};

const accounts: AccountRow[] = [
  {
    id: "1",
    platform: "Instagram",
    account: "@social-demo",
    status: "Connected",
  },
  {
    id: "2",
    platform: "LinkedIn",
    account: "Social Demo",
    status: "Needs review",
  },
];

const accountColumns: TableColumn<AccountRow>[] = [
  {
    key: "platform",
    header: "Platform",
    width: proportional(1),
  },
  {
    key: "account",
    header: "Account",
    width: proportional(2),
  },
  {
    key: "status",
    header: "Status",
    width: proportional(1),
  },
];

export function AstryxSmoke() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("Social Demo");

  return (
    <main className="min-h-screen bg-body p-6 text-primary sm:p-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-secondary">ADR-041 integration</p>
          <h1 className="text-3xl font-semibold">Astryx smoke test</h1>
          <p className="max-w-2xl text-secondary">
            Verifikasi komponen inti, Tailwind token bridge, dialog, form,
            table, dan mode gelap pada Next.js 16.
          </p>
        </header>

        <section className="grid gap-4 rounded-lg border border-border p-5 sm:grid-cols-2">
          <Theme mode="light" theme={neutralTheme}>
            <div className="flex flex-col gap-3 rounded-lg bg-surface p-4 text-primary">
              <p className="text-sm text-secondary">Light mode</p>
              <h2 className="text-lg font-semibold">Actions dan form</h2>
              <TextInput
                label="Workspace name"
                value={workspaceName}
                onChange={setWorkspaceName}
                width="100%"
                hasClear
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  label="Buka dialog"
                  variant="primary"
                  onClick={() => setDialogOpen(true)}
                />
                <Button label="Secondary action" variant="secondary" />
              </div>
            </div>
          </Theme>

          <Theme mode="dark" theme={neutralTheme}>
            <div className="flex min-h-44 flex-col justify-between gap-4 rounded-lg bg-surface p-4 text-primary">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-secondary">Dark mode</p>
                <p className="font-semibold">Neutral theme aktif</p>
              </div>
              <Button label="Dark action" variant="primary" />
            </div>
          </Theme>
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="p-5">
            <h2 className="text-lg font-semibold">Connected accounts</h2>
            <p className="text-sm text-secondary">
              Table data-driven dengan ukuran kolom eksplisit.
            </p>
          </div>
          <Table
            data={accounts}
            columns={accountColumns}
            idKey="id"
            hasHover
            dividers="rows"
          />
        </section>
      </div>

      <Dialog isOpen={dialogOpen} onOpenChange={setDialogOpen} purpose="info">
        <Layout
          height="auto"
          header={
            <DialogHeader
              title="Astryx Dialog"
              subtitle="Native dialog dan focus management berhasil dimuat."
              onOpenChange={setDialogOpen}
            />
          }
          content={
            <LayoutContent isScrollable={false}>
              Workspace aktif: <strong>{workspaceName || "Tanpa nama"}</strong>
            </LayoutContent>
          }
          footer={
            <LayoutFooter hasDivider>
              <div className="flex justify-end">
                <Button
                  label="Tutup"
                  variant="primary"
                  onClick={() => setDialogOpen(false)}
                />
              </div>
            </LayoutFooter>
          }
        />
      </Dialog>
    </main>
  );
}

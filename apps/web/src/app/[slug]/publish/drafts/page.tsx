"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <EmptyState
        title="Belum ada draft"
        description="Draft yang belum terjadwal akan muncul di sini."
        actions={
          <Button
            label="+ New Post"
            variant="primary"
            onClick={() => router.push(`/${params.slug}/publish/drafts/new`)}
          />
        }
      />
    </main>
  );
}

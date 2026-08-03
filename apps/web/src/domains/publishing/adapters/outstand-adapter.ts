import type { ContentFormat } from "@social/shared";

export interface ScheduleOutstandPostInput {
  outstandAccountId: string;
  caption: string;
  scheduledAt: Date;
  contentFormat: ContentFormat;
  platformOptions?: Record<string, unknown>;
}

export interface ScheduleOutstandPostResult {
  outstandJobId: string;
}

/**
 * Anti-Corruption Layer contract untuk Outstand (integration-layer.md,
 * ADR-040). Domain internal hanya mengenal interface ini — implementasi
 * konkret (real HTTP client maupun Fake) hidup di luar domain
 * (`src/lib/adapters/outstand/`), dipilih lewat factory `getOutstandAdapter`.
 *
 * Scope saat ini (ADR-059) hanya method Publishing (`schedulePost`).
 * Engagement, Analytics, dan connectAccount OAuth ditambahkan bertahap
 * nanti sesuai kebutuhan — bukan dibuat sekaligus dari awal.
 */
export interface IOutstandAdapter {
  schedulePost(
    input: ScheduleOutstandPostInput,
  ): Promise<ScheduleOutstandPostResult>;
}

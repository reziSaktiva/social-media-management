/** Domain-specific types for workspace. */

import type { SocialPlatform } from "@social/shared";

/**
 * Shape consumed by UI surfaces that render a quick-glance list of connected
 * accounts — currently the sidebar "Channels" section (T-012, ADR-058) and,
 * later, the Connected Accounts settings page (T-015). Kept in the workspace
 * domain's public API so both surfaces import one contract instead of
 * redefining it.
 *
 * `scheduledCount` is a stub — always 0 until T-012.2 (scheduled-posts count
 * across the Publishing domain) is implemented; this needs domain publishing
 * v0.2, which does not exist yet (see PROJECT_STATE.md / v01-foundation.md
 * T-012.2).
 */
export interface SidebarChannelAccount {
  id: string;
  platform: SocialPlatform;
  handle: string;
  status: string;
  reconnectRequired: boolean;
  scheduledCount: number;
}

/**
 * Maps a `WorkspaceConnectedAccount` (status, reconnectRequired) to a
 * user-facing label. Pure domain rule — no infrastructure dependency.
 *
 * Reused by the sidebar "Channels" section (T-012, ADR-058) and, later, the
 * Connected Accounts settings page (T-015.2 — "state visual 'perlu
 * reconnect' di Channels + Connected Accounts").
 *
 * `status` on `WorkspaceConnectedAccount` is a free-form string (default
 * `"active"`) rather than a closed enum today — Outstand's ACL hasn't yet
 * defined the full closed set of values it can emit (see
 * `integration-layer.md` / ADR-040). Until that's formalized, anything other
 * than `"active"` (with `reconnectRequired: false`) is treated as
 * disconnected for display purposes.
 */
export type ConnectionDisplayStatus =
  "active" | "reconnect-required" | "disconnected";

export interface ConnectionStatusInput {
  status: string;
  reconnectRequired: boolean;
}

const CONNECTION_STATUS_LABEL: Record<ConnectionDisplayStatus, string> = {
  active: "Active",
  "reconnect-required": "Perlu Reconnect",
  disconnected: "Disconnected",
};

export function resolveConnectionDisplayStatus(
  account: ConnectionStatusInput,
): ConnectionDisplayStatus {
  if (account.reconnectRequired) {
    return "reconnect-required";
  }
  return account.status === "active" ? "active" : "disconnected";
}

export function getConnectionStatusLabel(
  account: ConnectionStatusInput,
): string {
  return CONNECTION_STATUS_LABEL[resolveConnectionDisplayStatus(account)];
}

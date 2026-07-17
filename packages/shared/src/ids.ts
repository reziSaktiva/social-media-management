/** Opaque branded ID types — published for cross-context references. */

export type UserId = string & { readonly _brand: "UserId" };
export type WorkspaceId = string & { readonly _brand: "WorkspaceId" };
export type MemberId = string & { readonly _brand: "MemberId" };
export type ConnectedAccountId = string & {
  readonly _brand: "ConnectedAccountId";
};
export type PostId = string & { readonly _brand: "PostId" };
export type PostTargetId = string & { readonly _brand: "PostTargetId" };
export type QueueSlotId = string & { readonly _brand: "QueueSlotId" };
export type MediaId = string & { readonly _brand: "MediaId" };
export type InboxItemId = string & { readonly _brand: "InboxItemId" };
export type ReplyId = string & { readonly _brand: "ReplyId" };
export type AIRequestId = string & { readonly _brand: "AIRequestId" };
export type AIResultId = string & { readonly _brand: "AIResultId" };
export type PostMetricsId = string & { readonly _brand: "PostMetricsId" };
export type WorkspaceSnapshotId = string & {
  readonly _brand: "WorkspaceSnapshotId";
};
export type StartPageId = string & { readonly _brand: "StartPageId" };
export type PageLinkId = string & { readonly _brand: "PageLinkId" };
export type NotificationId = string & { readonly _brand: "NotificationId" };
export type SubscriptionId = string & { readonly _brand: "SubscriptionId" };

export function asUserId(value: string): UserId {
  return value as UserId;
}

export function asWorkspaceId(value: string): WorkspaceId {
  return value as WorkspaceId;
}

export function asPostId(value: string): PostId {
  return value as PostId;
}

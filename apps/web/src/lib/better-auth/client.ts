import { createAuthClient } from "better-auth/react";

/**
 * Browser-side Better Auth client (auth-strategy.md).
 * No baseURL — defaults to the current origin, same app as the server instance.
 */
export const authClient = createAuthClient();

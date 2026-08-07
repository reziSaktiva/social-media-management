import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "./auth";

/**
 * `auth.api.getSession` is a plain async function (a DB lookup), not
 * `fetch()` — Next.js's automatic per-request memoization only covers
 * `fetch()`, so calling it directly from both a layout and its child page
 * does two independent session-store round trips per render. Wrapping it in
 * `React.cache()` dedupes it to one call per request (code-review finding).
 */
export const getCachedSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

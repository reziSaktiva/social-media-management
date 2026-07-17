import { NextResponse } from "next/server";

/** Job runner (Railway Cron → X-Job-Secret) — wired later. */
export function POST() {
  return NextResponse.json(
    { error: "Job runner not bootstrapped yet" },
    { status: 501 },
  );
}

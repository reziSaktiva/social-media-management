import { NextResponse } from "next/server";

/** Better Auth catch-all — wired in later M7 bootstrap. */
export function GET() {
  return NextResponse.json(
    { error: "Better Auth not bootstrapped yet" },
    { status: 501 },
  );
}

export function POST() {
  return GET();
}

import { NextResponse } from "next/server";

/** Outstand webhook handler — wired in M8. */
export function POST() {
  return NextResponse.json(
    { error: "Outstand webhook not implemented yet" },
    { status: 501 },
  );
}

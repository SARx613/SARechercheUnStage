import { NextRequest, NextResponse } from "next/server";
import { runAllScrapers } from "@/lib/scrapers/run-all";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await runAllScrapers();
  return NextResponse.json(summary);
}

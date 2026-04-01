import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { searchCompanies } from "@/tools/jquants/company";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    await enforceRateLimit(`search:${request.headers.get("x-forwarded-for") ?? "local"}`, 30, 60);

    if (!q) {
      return NextResponse.json([]);
    }

    const companies = await searchCompanies(q);
    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 },
    );
  }
}

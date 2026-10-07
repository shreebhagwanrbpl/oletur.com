import { NextResponse } from "next/server";
import { fetchFullCatalog } from "@/lib/data-fetcher-server";

export const revalidate = 60;

const headers = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
};

export async function GET() {
  try {
    const products = await fetchFullCatalog();
    return NextResponse.json({ products }, { headers });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Catalog request failed" },
      { status: 500, headers }
    );
  }
}

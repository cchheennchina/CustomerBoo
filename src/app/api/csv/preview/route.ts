import { NextResponse } from "next/server";
import { parseCsvContent } from "@/lib/csv/parser";

export async function POST(request: Request) {
  const { content } = (await request.json()) as { content?: string };
  if (!content) {
    return NextResponse.json({ error: "content 必填" }, { status: 400 });
  }

  const result = parseCsvContent(content);
  return NextResponse.json({
    validCount: result.validRows.length,
    errorCount: result.errors.length,
    errors: result.errors,
    preview: result.validRows.slice(0, 5).map((r) => r.data),
  });
}

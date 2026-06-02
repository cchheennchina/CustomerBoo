import { NextResponse } from "next/server";
import { importCsvRows } from "@/lib/csv/importer";
import { parseCsvContent } from "@/lib/csv/parser";

export async function POST(request: Request) {
  const { content } = (await request.json()) as { content?: string };
  if (!content) {
    return NextResponse.json({ error: "content 必填" }, { status: 400 });
  }

  const result = parseCsvContent(content);
  if (result.errors.length > 0 && result.validRows.length === 0) {
    return NextResponse.json(
      { success: false, message: "没有可导入的有效行", errors: result.errors },
      { status: 400 }
    );
  }

  const created = await importCsvRows(result.validRows.map((r) => r.data));

  return NextResponse.json({
    success: true,
    message: `成功导入 ${created.length} 条机会${result.errors.length ? `，${result.errors.length} 行失败` : ""}`,
    created,
    errors: result.errors,
  });
}

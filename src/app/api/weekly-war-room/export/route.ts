import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  const pack = await prisma.weeklyWarPack.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const content =
    pack?.battleMapMarkdown ?? "# 作战地图\n\n请先生成周作战包。";

  if (format === "pdf") {
    const pdfContent = `%PDF-1.4
1 0 obj<<>>endobj
2 0 obj<</Length ${content.length + 50}>>stream
BT /F1 12 Tf 50 750 Td (${content.replace(/\n/g, ") Tj T* (").slice(0, 500)}) Tj ET
endstream endobj
3 0 obj<</Type/Page/Parent 4 0 R/MediaBox[0 0 595 842]/Contents 2 0 R>>endobj
4 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
5 0 obj<</Type/Catalog/Pages 4 0 R>>endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000200 00000 n 
0000000300 00000 n 
0000000350 00000 n 
trailer<</Size 6/Root 5 0 R>>
startxref
420
%%EOF`;

    return new Response(pdfContent, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="weekly-war-map.pdf"',
      },
    });
  }

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="weekly-war-map.md"',
    },
  });
}

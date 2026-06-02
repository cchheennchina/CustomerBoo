import { csvTemplate } from "@/lib/csv/parser";

export async function GET() {
  return new Response(csvTemplate(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}

import { z } from "zod";

export const CSV_HEADERS = [
  "companyName",
  "industry",
  "keywords",
  "contactName",
  "contactTitle",
  "isDecisionMaker",
  "opportunityName",
  "amount",
  "winProbability",
  "stage",
  "lastContactAt",
  "nextActivityAt",
  "deadlineAt",
  "proposalCount",
  "emailOpenCount",
  "meetingAttendRate",
  "requirementText",
  "competitorNotes",
  "personnelNotes",
] as const;

const rowSchema = z.object({
  companyName: z.string().min(1, "companyName 必填"),
  industry: z.string().optional().default(""),
  keywords: z.string().optional().default(""),
  contactName: z.string().min(1, "contactName 必填"),
  contactTitle: z.string().optional().default(""),
  isDecisionMaker: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((v) => {
      if (typeof v === "boolean") return v;
      const s = String(v ?? "").toLowerCase();
      return s === "true" || s === "1" || s === "yes" || s === "是";
    }),
  opportunityName: z.string().min(1, "opportunityName 必填"),
  amount: z.coerce.number().nonnegative().default(0),
  winProbability: z.coerce.number().min(0).max(1).default(0.5),
  stage: z.string().optional().default("初步接触"),
  lastContactAt: z.string().optional().default(""),
  nextActivityAt: z.string().optional().default(""),
  deadlineAt: z.string().optional().default(""),
  proposalCount: z.coerce.number().int().nonnegative().default(0),
  emailOpenCount: z.coerce.number().int().nonnegative().default(0),
  meetingAttendRate: z.coerce.number().min(0).max(1).default(1),
  requirementText: z.string().optional().default(""),
  competitorNotes: z.string().optional().default(""),
  personnelNotes: z.string().optional().default(""),
});

export type CsvRow = z.infer<typeof rowSchema>;

export interface CsvParseResult {
  validRows: Array<{ rowNumber: number; data: CsvRow }>;
  errors: Array<{ rowNumber: number; message: string; raw: Record<string, string> }>;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDate(value: string): Date | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseCsvContent(content: string): CsvParseResult {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { validRows: [], errors: [{ rowNumber: 0, message: "CSV 为空", raw: {} }] };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const validRows: CsvParseResult["validRows"] = [];
  const errors: CsvParseResult["errors"] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const raw: Record<string, string> = {};
    headers.forEach((header, idx) => {
      raw[header] = values[idx] ?? "";
    });

    const parsed = rowSchema.safeParse(raw);
    if (parsed.success) {
      validRows.push({ rowNumber: i + 1, data: parsed.data });
    } else {
      errors.push({
        rowNumber: i + 1,
        message: parsed.error.errors.map((e) => e.message).join("; "),
        raw,
      });
    }
  }

  return { validRows, errors };
}

export function csvTemplate() {
  return `${CSV_HEADERS.join(",")}\n示例科技,软件,SaaS;AI,张总,采购总监,true,张总-年度合作,500000,0.7,方案推进,2024-05-01,2024-05-20,2024-06-30,2,3,0.8,需要合规审计与数据整合,,`;
}

export { parseDate };

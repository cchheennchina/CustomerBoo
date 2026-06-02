import { prisma } from "@/lib/db";
import { refreshOpportunityHealth } from "@/lib/scoring/refresh-health";
import { parseDate, type CsvRow } from "@/lib/csv/parser";

export async function importCsvRows(rows: CsvRow[]) {
  const created: string[] = [];

  for (const row of rows) {
    const keywords = row.keywords
      ? row.keywords.split(/[;；,，]/).map((k) => k.trim()).filter(Boolean)
      : [];

    const customer = await prisma.customer.create({
      data: {
        companyName: row.companyName,
        industry: row.industry || null,
        keywords: JSON.stringify(keywords),
        contacts: {
          create: {
            name: row.contactName,
            title: row.contactTitle || null,
            isDecisionMaker: row.isDecisionMaker,
          },
        },
        opportunities: {
          create: {
            name: row.opportunityName,
            amount: row.amount,
            winProbability: row.winProbability,
            stage: row.stage,
            lastContactAt: parseDate(row.lastContactAt),
            nextActivityAt: parseDate(row.nextActivityAt),
            deadlineAt: parseDate(row.deadlineAt),
            proposalCount: row.proposalCount,
            emailOpenCount: row.emailOpenCount,
            meetingAttendRate: row.meetingAttendRate,
            requirementText: row.requirementText,
            competitorNotes: row.competitorNotes,
            personnelNotes: row.personnelNotes,
          },
        },
      },
      include: { opportunities: true },
    });

    const oppId = customer.opportunities[0]?.id;
    if (oppId) {
      await refreshOpportunityHealth(oppId);
      created.push(oppId);
    }
  }

  return created;
}

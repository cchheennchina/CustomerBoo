import { describe, expect, it } from "vitest";
import {
  calculateHealthScore,
  statusFromScore,
} from "@/lib/scoring/health-scorer";
import { parseCsvContent } from "@/lib/csv/parser";
import { buildMorningBrief } from "@/lib/scoring/refresh-health";

describe("health scorer", () => {
  it("marks low interaction as subhealthy or dangerous", () => {
    const result = calculateHealthScore({
      lastContactAt: new Date(Date.now() - 45 * 86400000),
      nextActivityAt: new Date(Date.now() - 10 * 86400000),
      deadlineAt: null,
      proposalCount: 3,
      emailOpenCount: 0,
      meetingAttendRate: 0.2,
      requirementText: "",
      decisionMakerCount: 0,
      totalContactCount: 1,
      keywords: ["合规"],
    });

    expect(result.totalScore).toBeLessThan(70);
    expect(["SUBHEALTHY", "DANGEROUS"]).toContain(result.status);
    expect(result.deductions.length).toBeGreaterThan(0);
  });

  it("maps score thresholds", () => {
    expect(statusFromScore(80)).toBe("HEALTHY");
    expect(statusFromScore(55)).toBe("SUBHEALTHY");
    expect(statusFromScore(20)).toBe("DANGEROUS");
  });
});

describe("csv parser", () => {
  it("parses valid template row", () => {
    const csv = `companyName,industry,keywords,contactName,contactTitle,isDecisionMaker,opportunityName,amount,winProbability,stage,lastContactAt,nextActivityAt,deadlineAt,proposalCount,emailOpenCount,meetingAttendRate,requirementText,competitorNotes,personnelNotes
示例科技,软件,SaaS,张总,总监,true,年度合作,500000,0.7,方案推进,2024-05-01,2024-05-20,2024-06-30,2,3,0.8,合规审计,,`;

    const result = parseCsvContent(csv);
    expect(result.validRows).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(result.validRows[0].data.amount).toBe(500000);
  });
});

describe("morning brief", () => {
  it("prioritizes subhealthy and dangerous opportunities", () => {
    const brief = buildMorningBrief([
      {
        id: "1",
        name: "A",
        healthScore: 35,
        healthStatus: "DANGEROUS",
        winProbability: 0.6,
        amount: 500000,
        customer: { companyName: "CoA" },
      },
      {
        id: "2",
        name: "B",
        healthScore: 80,
        healthStatus: "HEALTHY",
        winProbability: 0.9,
        amount: 1000000,
        customer: { companyName: "CoB" },
      },
    ]);

    expect(brief.dangerousCount).toBe(1);
    expect(brief.priority[0]?.id).toBe("1");
    expect(brief.summary).toContain("危险机会");
  });
});

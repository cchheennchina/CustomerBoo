import { NextResponse } from "next/server";
import { refreshOpportunityHealth } from "@/lib/scoring/refresh-health";

export async function POST(request: Request) {
  const { opportunityId } = (await request.json()) as {
    opportunityId?: string;
  };

  if (opportunityId) {
    const result = await refreshOpportunityHealth(opportunityId);
    return NextResponse.json({ result });
  }

  return NextResponse.json({ error: "opportunityId 必填" }, { status: 400 });
}

import { NextResponse } from "next/server";
import { generateFollowUpRecommendations } from "@/lib/follow-up/service";

export async function POST(request: Request) {
  const { opportunityId } = (await request.json()) as {
    opportunityId?: string;
  };
  if (!opportunityId) {
    return NextResponse.json({ error: "opportunityId 必填" }, { status: 400 });
  }

  const recs = await generateFollowUpRecommendations(opportunityId);
  return NextResponse.json({ script: recs[0]?.script ?? "" });
}

import { NextResponse } from "next/server";
import { pushDailyBrief } from "@/lib/notifications/service";
import { evaluateTriggerRules } from "@/lib/follow-up/service";

export async function POST() {
  const [brief] = await Promise.all([pushDailyBrief(), evaluateTriggerRules()]);
  return NextResponse.json({ success: true, brief });
}

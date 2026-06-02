import { NextResponse } from "next/server";
import { generateWeeklyWarPack } from "@/lib/weekly/war-pack";
import { pushWeeklyWarPackEmail } from "@/lib/notifications/service";

export async function POST() {
  const pack = await generateWeeklyWarPack();
  await pushWeeklyWarPackEmail(pack.id);
  return NextResponse.json({ success: true, pack });
}

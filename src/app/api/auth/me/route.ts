import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/request-session";

export async function GET(request: Request) {
  const user = await getSessionFromRequest(request);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}

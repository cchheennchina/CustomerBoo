import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  setSessionCookie,
  verifyPassword,
  type SessionUser,
} from "@/lib/auth/session";
import { createSessionToken } from "@/lib/auth/token";

export async function POST(request: Request) {
  const { username, password } = (await request.json()) as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return NextResponse.json({ error: "用户名和密码必填" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username: username.trim() },
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  const sessionUser: SessionUser = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role as SessionUser["role"],
  };

  const token = await createSessionToken(sessionUser);
  await setSessionCookie(sessionUser);

  return NextResponse.json({
    success: true,
    user: sessionUser,
    token,
  });
}

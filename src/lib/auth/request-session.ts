import { cookies } from "next/headers";
import { parseSessionToken, type SessionUser } from "@/lib/auth/token";

export type { SessionUser };

export async function getSessionFromRequest(
  request?: Request
): Promise<SessionUser | null> {
  if (request) {
    const auth = request.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      const user = await parseSessionToken(auth.slice(7));
      if (user) return user;
    }
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("butler_session")?.value;
  if (!token) return null;
  return parseSessionToken(token);
}

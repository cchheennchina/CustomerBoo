const SESSION_DAYS = 7;
const SECRET = process.env.AUTH_SECRET ?? "butler-dev-secret";

export interface SessionUser {
  userId: string;
  username: string;
  displayName: string;
  role: "MARKETER" | "ADMIN";
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string): string {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function getHmacKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signPayload(payload: string): Promise<string> {
  const key = await getHmacKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return bufferToBase64Url(signature);
}

async function verifyPayload(payload: string, signature: string): Promise<boolean> {
  const key = await getHmacKey();
  try {
    const sigBytes = new Uint8Array(base64UrlToBytes(signature));
    return crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(payload)
    );
  } catch {
    return false;
  }
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const payload = encodeBase64Url(
    JSON.stringify({
      ...user,
      exp: Date.now() + SESSION_DAYS * 86400000,
    })
  );
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
}

export async function parseSessionToken(token: string): Promise<SessionUser | null> {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const valid = await verifyPayload(payload, signature);
  if (!valid) return null;

  try {
    const data = JSON.parse(decodeBase64Url(payload)) as SessionUser & {
      exp: number;
    };
    if (data.exp < Date.now()) return null;
    return {
      userId: data.userId,
      username: data.username,
      displayName: data.displayName,
      role: data.role,
    };
  } catch {
    return null;
  }
}

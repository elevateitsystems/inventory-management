import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { ApiError } from "./api-error";
import { env } from "./env";

export const AUTH_COOKIE = "stockflow_session";
const ISSUER = "stockflow";

export interface Session {
  ownerId: number;
  name: string;
  email: string;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createToken(session: Session, remember: boolean) {
  return jwt.sign(
    { sub: String(session.ownerId), name: session.name, email: session.email },
    env().JWT_SECRET,
    {
      algorithm: "HS256",
      issuer: ISSUER,
      expiresIn: remember ? "30d" : "1d",
    },
  );
}

export function verifyToken(token: string): Session | null {
  try {
    const payload = jwt.verify(token, env().JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: ISSUER,
    }) as JwtPayload;
    const ownerId = Number(payload.sub);
    if (!Number.isSafeInteger(ownerId) || !payload.name || !payload.email)
      return null;
    return {
      ownerId,
      name: String(payload.name),
      email: String(payload.email),
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function requireSession() {
  const session = await getSession();
  if (!session)
    throw new ApiError(401, "UNAUTHORIZED", "Authentication is required.");
  return session;
}

export function sessionCookie(token: string, remember: boolean) {
  return {
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  };
}

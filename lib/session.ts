import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-local-key");

export interface SessionPayload {
  id: string;
  username: string;
  role: string;
  branch: string;
}

/**
 * extracts and verifies the active user session from cookies.
 */
export async function getSession(request: NextRequest): Promise<SessionPayload | null> {
  try {
    const token = request.cookies.get("workshop_session")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const safeDecode = (str: string) => {
      try {
        return decodeURIComponent(str).trim();
      } catch (e) {
        return str.trim();
      }
    };

    return {
      id: payload.id as string,
      username: payload.username as string,
      role: payload.role as string,
      branch: safeDecode((payload.branch as string) || "الحسوة"),
    };
  } catch (error) {
    return null;
  }
}

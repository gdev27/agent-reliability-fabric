import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { clearSession, createSession, getSession } from "../../_lib/workspace-store";

const OPERATOR_COOKIE = "gctl_operator";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  };
}

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const operatorId = cookieStore.get(OPERATOR_COOKIE)?.value;
  if (!operatorId) {
    return NextResponse.json({ session: null });
  }
  const session = await getSession(operatorId);
  if (!session) {
    cookieStore.delete(OPERATOR_COOKIE);
    return NextResponse.json({ session: null });
  }
  return NextResponse.json({ session });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const payload = (await request.json()) as { name?: string; email?: string };
  const name = payload.name?.trim() || "";
  const email = payload.email?.trim() || "";
  if (!name || !email.includes("@")) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Enter a display name and valid email to create an operator session."
      },
      { status: 400 }
    );
  }

  const session = await createSession({ name, email });
  const response = NextResponse.json({ session });
  response.cookies.set(OPERATOR_COOKIE, session.operatorId, cookieOptions());
  return response;
}

export async function DELETE(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const operatorId = cookieStore.get(OPERATOR_COOKIE)?.value;
  if (operatorId) {
    await clearSession(operatorId);
  }
  cookieStore.delete(OPERATOR_COOKIE);
  return NextResponse.json({ ok: true });
}

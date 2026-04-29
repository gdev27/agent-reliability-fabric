import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { pinRun } from "../../_lib/workspace-store";

const OPERATOR_COOKIE = "gctl_operator";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const operatorId = cookieStore.get(OPERATOR_COOKIE)?.value;
  if (!operatorId) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const payload = (await request.json()) as { runId?: string };
  const runId = payload.runId?.trim() ?? "";
  if (!runId) {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "runId is required." }, { status: 400 });
  }

  const session = await pinRun(operatorId, runId);
  if (!session) {
    return NextResponse.json({ error: "SESSION_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ session });
}

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { updateSessionPreferences } from "../../_lib/workspace-store";
import { WorkspacePreferences } from "../../../../lib/types";

const OPERATOR_COOKIE = "gctl_operator";

export const runtime = "nodejs";

async function getOperatorId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(OPERATOR_COOKIE)?.value ?? null;
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const operatorId = await getOperatorId();
  if (!operatorId) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const payload = (await request.json()) as { preferences?: Partial<WorkspacePreferences> };
  const session = await updateSessionPreferences(operatorId, payload.preferences || {});
  if (!session) {
    return NextResponse.json({ error: "SESSION_NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ session });
}

import { NextResponse } from "next/server";
import { loadConnectors } from "../_lib/data";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(await loadConnectors());
}

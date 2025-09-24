import { NextResponse } from "next/server";
import { syncJsonFromTeam } from "../../../../scripts/sync-json-from-team";

export async function GET() {
  try {
    await syncJsonFromTeam();
    return NextResponse.json({ success: true });
  } 
  catch (err) {
    let errorMessage = "Internal Server Error";
    if (err instanceof Error) errorMessage = err.message;
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
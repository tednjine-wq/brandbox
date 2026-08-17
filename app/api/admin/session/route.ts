import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  return NextResponse.json({ loggedIn: await requireAdmin() });
}
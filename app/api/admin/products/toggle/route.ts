import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const product = await prisma.product.findUnique({ where: { id: String(body.id ?? "") } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { active: !product.active },
  });
  return NextResponse.json({ product: updated });
}
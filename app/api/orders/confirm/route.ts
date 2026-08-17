import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const orderNumber = String(body.orderNumber ?? "");
  try {
    const order = await prisma.order.update({
      where: { orderNumber },
      data: { status: "confirmed", paymentRef: `SIM-${Date.now()}` },
    });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
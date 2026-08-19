import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [products, orders, enquiries, featured] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({ select: { status: true, totalAmount: true } }),
    prisma.enquiry.count(),
    prisma.product.count({ where: { featured: true } }),
  ]);

  const pending = orders.filter((o) => o.status === "pending").length;
  // Revenue = only orders that are confirmed or further (not pending)
  const revenue = orders
    .filter((o) => o.status !== "pending")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return NextResponse.json({
    products,
    orders: orders.length,
    revenue,
    pending,
    enquiries,
    featured,
  });
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    include: { category: true, priceTiers: { orderBy: { minQty: "asc" } } },
  });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();

  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  const moq = Math.max(1, Number(body.moq) || 1);
  if (!name || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Name and a positive price are required" }, { status: 400 });
  }

  const slug =
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
    (body.id ? `-${String(body.id).slice(-4)}` : "");

  const tiers = Array.isArray(body.tiers)
    ? body.tiers
        .map((t: { minQty: string | number; price: string | number }) => ({
          minQty: Number(t.minQty),
          price: Number(t.price),
        }))
        .filter(
          (t: { minQty: number; price: number }) =>
            Number.isFinite(t.minQty) && Number.isFinite(t.price) && t.minQty > 0 && t.price > 0
        )
        .sort((a: { minQty: number }, b: { minQty: number }) => a.minQty - b.minQty)
    : [];

  const data = {
    name,
    slug,
    description: String(body.description ?? "") || null,
    image: String(body.image ?? "") || null,
        images: String(body.images ?? "") || null,
    price,
    moq,
    buyType: body.buyType === "enquiry" ? "enquiry" : "checkout",
    colours: String(body.colours ?? "") || null,
    printingType: String(body.printingType ?? "") || null,
    featured: Boolean(body.featured),
    active: body.active === undefined ? true : Boolean(body.active),
    categoryId: String(body.categoryId ?? "") || null,
  };

  try {
    if (body.id) {
      const product = await prisma.product.update({
        where: { id: String(body.id) },
        data: { ...data, priceTiers: { deleteMany: {}, create: tiers } },
      });
      return NextResponse.json({ product });
    }
    const product = await prisma.product.create({
      data: { ...data, priceTiers: { create: tiers } },
    });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json(
      { error: "Save failed (a product with this slug may exist)" },
      { status: 400 }
    );
  }
}
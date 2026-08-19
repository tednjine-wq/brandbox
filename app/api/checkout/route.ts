import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customerName = String(body.customerName ?? "").trim();
    const customerPhone = String(body.customerPhone ?? "").trim();
    const items = Array.isArray(body.items) ? body.items : [];

    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // SECURITY: recalculate all prices server-side, never trust the browser
    let total = 0;
    const orderItems: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: String(item.productId) },
        include: { priceTiers: { orderBy: { minQty: "asc" } } },
      });
      if (!product || !product.active) {
        return NextResponse.json({ error: "A product in your cart is unavailable" }, { status: 400 });
      }
      const quantity = Math.max(Number(item.quantity) || product.moq, product.moq);
      let unitPrice = product.price;
      for (const tier of product.priceTiers) {
        if (quantity >= tier.minQty) unitPrice = tier.price;
      }
      const lineTotal = unitPrice * quantity;
      total += lineTotal;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice,
        totalPrice: lineTotal,
      });
    }

    // VAT: catalog prices are exclusive; 16% is added at checkout (UMBA quotation model)
    const vat = Math.round(total * 0.16);
    const grandTotal = total + vat;

    const orderNumber = `BB-${Date.now().toString().slice(-6)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        status: "pending",
        totalAmount: grandTotal,
        items: { create: orderItems },
      },
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      subtotal: total,
      vat,
      totalAmount: order.totalAmount,
      status: order.status,
      simulation: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
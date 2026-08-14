import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Tier = { minQty: number; price: number };

type SeedProduct = {
  name: string;
  slug: string;
  category: string;
  price: number;
  moq: number;
  buyType: string;
  printingType: string;
  colours: string;
  description: string;
  featured?: boolean;
  tiers?: Tier[];
};

const CATEGORIES = [
  { name: "Drinkware", slug: "drinkware", description: "Branded cups, mugs, water bottles and flasks for corporate gifting.", order: 1 },
  { name: "Apparel", slug: "apparel", description: "Custom printed t-shirts, caps and wearable promotional items.", order: 2 },
  { name: "Stationery", slug: "stationery", description: "Branded pens, notebooks and desk accessories.", order: 3 },
  { name: "Bags", slug: "bags", description: "Tote bags, backpacks and conference bags.", order: 4 },
  { name: "Tech Accessories", slug: "tech-accessories", description: "USB drives and tech-related branded items.", order: 5 },
  { name: "Event Items", slug: "event-items", description: "Lanyards, umbrellas, calendars and conference items.", order: 6 },
];

const PRODUCTS: SeedProduct[] = [
  { name: "Ceramic Mug", slug: "ceramic-mug", category: "drinkware", price: 350, moq: 50, buyType: "checkout", printingType: "Sublimation, UV Print", colours: "White, Black, Blue, Red", description: "Classic 350ml ceramic mug with glossy finish - ideal for office branding and corporate gifts.", featured: true },
  { name: "Water Bottle", slug: "water-bottle", category: "drinkware", price: 800, moq: 30, buyType: "checkout", printingType: "UV Print", colours: "Black, Blue, Silver, Green", description: "750ml reusable sports water bottle with screw cap and carry loop." },
  { name: "Travel Tumbler", slug: "travel-tumbler", category: "drinkware", price: 650, moq: 30, buyType: "enquiry", printingType: "Sublimation, UV Print", colours: "Black, Silver, Blue", description: "Double-wall insulated travel tumbler that keeps drinks hot or cold for hours." },
  { name: "T-Shirt (Round Neck)", slug: "t-shirt-round-neck", category: "apparel", price: 600, moq: 50, buyType: "checkout", printingType: "Screen Print, Embroidery", colours: "White, Black, Red, Blue, Green", description: "Comfortable cotton round-neck t-shirt for events, uniforms and campaigns.", featured: true },
  { name: "Polo Shirt", slug: "polo-shirt", category: "apparel", price: 1200, moq: 30, buyType: "enquiry", printingType: "Embroidery, Screen Print", colours: "White, Black, Navy, Grey", description: "Premium pique polo shirt with collar - a smart look for staff uniforms." },
  { name: "Tote Bag (Canvas)", slug: "tote-bag-canvas", category: "bags", price: 500, moq: 100, buyType: "checkout", printingType: "Screen Print, Heat Transfer", colours: "Natural, Black, Blue", description: "Durable canvas tote bag - a favourite for conferences and retail branding.", featured: true, tiers: [{ minQty: 100, price: 450 }, { minQty: 250, price: 400 }, { minQty: 500, price: 350 }] },
  { name: "Backpack", slug: "backpack", category: "bags", price: 900, moq: 20, buyType: "enquiry", printingType: "Screen Print, Heat Transfer", colours: "Black, Grey, Blue", description: "Padded laptop backpack with multiple compartments for daily use." },
  { name: "Ballpoint Pen", slug: "ballpoint-pen", category: "stationery", price: 150, moq: 100, buyType: "checkout", printingType: "Screen Print, UV Print", colours: "Black, Blue, Red, Silver", description: "Smooth-write ballpoint pen - the classic everyday brand carrier." },
  { name: "Notebook (A5)", slug: "notebook-a5", category: "stationery", price: 350, moq: 50, buyType: "checkout", printingType: "Screen Print, Debossing", colours: "Black, Blue, Brown", description: "A5 notebook with 200 lined pages and elastic closure." },
  { name: "Pen Set (3-Piece)", slug: "pen-set-3-piece", category: "stationery", price: 450, moq: 30, buyType: "checkout", printingType: "UV Print, Laser Engraving", colours: "Black, Silver, Gold", description: "Elegant 3-piece pen set in a gift box - perfect for executive gifting." },
  { name: "Journal (A5)", slug: "journal-a5", category: "stationery", price: 400, moq: 30, buyType: "enquiry", printingType: "Debossing, UV Print", colours: "Black, Brown, Green", description: "Hardcover A5 journal with premium paper and ribbon marker." },
  { name: "USB Flash Drive", slug: "usb-flash-drive", category: "tech-accessories", price: 800, moq: 20, buyType: "enquiry", printingType: "UV Print, Laser Engraving", colours: "Black, Silver, Blue", description: "16GB USB flash drive with swivel metal cover." },
  { name: "Umbrella", slug: "umbrella", category: "event-items", price: 900, moq: 20, buyType: "checkout", printingType: "Screen Print, Sublimation", colours: "Black, Blue, Red, Green", description: "Large automatic umbrella - your brand seen on every rainy day.", featured: true },
  { name: "Cap (Baseball)", slug: "cap-baseball", category: "event-items", price: 400, moq: 50, buyType: "checkout", printingType: "Screen Print, Embroidery", colours: "Black, Blue, Red, White", description: "Adjustable 6-panel baseball cap with embroidered branding." },
  { name: "Lanyard", slug: "lanyard", category: "event-items", price: 150, moq: 100, buyType: "checkout", printingType: "Sublimation, Screen Print", colours: "Blue, Red, Black, Green", description: "20mm polyester lanyard with safety buckle and metal hook." },
  { name: "Calendar (Wall)", slug: "calendar-wall", category: "event-items", price: 250, moq: 50, buyType: "checkout", printingType: "UV Print", colours: "White", description: "A3 wall calendar with 12-month full-colour branded pages." },
];

function defaultTiers(moq: number, price: number): Tier[] {
  return [
    { minQty: moq, price },
    { minQty: moq * 2, price: Math.round(price * 0.9) },
    { minQty: moq * 5, price: Math.round(price * 0.8) },
  ];
}

async function main() {
  console.log("Seeding BrandBox database...");

  // Dev-only seed: clear catalog tables so re-running is safe
  await prisma.priceTier.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  for (const c of CATEGORIES) {
    await prisma.category.create({ data: c });
  }

  for (const p of PRODUCTS) {
    const category = await prisma.category.findUnique({ where: { slug: p.category } });
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        moq: p.moq,
        buyType: p.buyType,
        printingType: p.printingType,
        colours: p.colours,
        featured: p.featured ?? false,
        categoryId: category?.id,
        priceTiers: { create: p.tiers ?? defaultTiers(p.moq, p.price) },
      },
    });
  }

  console.log("Seeding complete ✅ 6 categories + 16 products with price tiers.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
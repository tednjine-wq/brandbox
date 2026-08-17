import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NAMES = [
  "Notebooks",
  "Executive Notebooks",
  "Gift Sets",
  "Water Bottles",
  "Thermal Flask",
  "Thermal Mug",
  "Mugs",
  "Card Holders",
  "Pen Holders",
  "Plastic Pens",
  "Desk Organizers",
  "Flash Disks",
  "Power Banks",
  "Key Holders",
  "Jute Bags",
  "Executive Pens",
  "Metal Pens",
  "Event Wristbands",
  "Wooden Metallic Pens",
  "Umbrellas",
  "Lanyards & Badges",
  "Awards",
  "Thermal Tumblers",
  "Wall Clocks",
  "Aluminium Water Bottles",
  "Plastic Water Bottles",
  "Metallic Name Badges",
  "Media Banners",
  "Gift Bags (A5, A4, A3)",
  "Wooden Awards",
  "MDF Photo Frames",
  "Magnetic Gift Boxes",
  "Medals",
  "Gazebo Tents",
  "Engraving & Sublimation Sheets",
  "Lapel Pins",
  "Display Stands",
  "Brochure Holders",
  "Mousepads & Coasters",
  "T-Shirt Vinyls",
  "Pillow Cases (Sequin & Normal)",
  "Stanley Mugs",
  "Magnetic Stickers",
  "Sublimation Wooden Keyholders",
  "Button Badges",
  "Replaceable Nametags",
  "Flag Poles",
  "Hand Flag Poles",
  "New MDF",
  "USB Frames",
  "Rock Slates",
  "Spinning Wheels",
  "Corporate & Executive Trophies",
  "Tote Bags",
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const existing = await prisma.category.findMany({ select: { slug: true } });
  const taken = new Set(existing.map((c) => c.slug));
  const max = await prisma.category.aggregate({ _max: { order: true } });
  let order = max._max.order ?? 0;

  let added = 0;
  for (const name of NAMES) {
    const slug = slugify(name);
    if (taken.has(slug)) continue; // skip duplicates
    taken.add(slug);
    order += 1;
    await prisma.category.create({ data: { name, slug, order } });
    added++;
  }

  console.log(`Added ${added} new categories. Total is now ${taken.size}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
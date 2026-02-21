import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ─── Categories ──────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "flower" },
      update: {},
      create: {
        nameEn: "Flower",
        nameEs: "Flor",
        slug: "flower",
        icon: "Leaf",
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "concentrates" },
      update: {},
      create: {
        nameEn: "Concentrates",
        nameEs: "Concentrados",
        slug: "concentrates",
        icon: "Droplets",
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "pre-rolls" },
      update: {},
      create: {
        nameEn: "Pre-Rolls",
        nameEs: "Pre-Enrollados",
        slug: "pre-rolls",
        icon: "Cigarette",
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "edibles" },
      update: {},
      create: {
        nameEn: "Edibles",
        nameEs: "Comestibles",
        slug: "edibles",
        icon: "Cookie",
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "vapes" },
      update: {},
      create: {
        nameEn: "Vapes",
        nameEs: "Vaporizadores",
        slug: "vapes",
        icon: "Wind",
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: "tinctures" },
      update: {},
      create: {
        nameEn: "Tinctures & Oils",
        nameEs: "Tinturas y Aceites",
        slug: "tinctures",
        icon: "Pipette",
        sortOrder: 6,
      },
    }),
    prisma.category.upsert({
      where: { slug: "accessories" },
      update: {},
      create: {
        nameEn: "Accessories",
        nameEs: "Accesorios",
        slug: "accessories",
        icon: "Wrench",
        sortOrder: 7,
      },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // ─── Real Products from THC Plus inventory ─────────
  // TODO: Update prices when owner provides actual pricing
  const flower = categories[0];
  const concentrates = categories[1];
  const preRolls = categories[2];

  // Clear existing products for clean re-seed
  await prisma.product.deleteMany({});

  const products = await Promise.all([
    // ── Flower (9 products) ────────────────────────────
    prisma.product.create({
      data: {
        name: "Whiteboy Cookies",
        nameEs: "Whiteboy Cookies",
        categoryId: flower.id,
        descriptionEn: "A potent hybrid strain with a sweet, earthy aroma. Known for its relaxing effects and creamy cookie flavor profile. Perfect for evening relaxation.",
        descriptionEs: "Una cepa híbrida potente con aroma dulce y terroso. Conocida por sus efectos relajantes y perfil de sabor a galleta cremosa.",
        price: 0,
        thcPercentage: 28.0,
        strainType: "HYBRID",
        weight: "3.5g",
        imageUrl: "/images/products/White Boy Cookies.jpg",
        inStock: true,
        quantity: 50,
        isFeatured: true,
        sortOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        name: "Lemon Zkittlez",
        nameEs: "Lemon Zkittlez",
        categoryId: flower.id,
        descriptionEn: "Bright citrus notes meet sweet candy flavors in this sativa-dominant hybrid. Uplifting and energizing effects with a tangy lemon kick.",
        descriptionEs: "Notas cítricas brillantes se encuentran con sabores dulces de caramelo en este híbrido dominante sativa. Efectos elevadores y energizantes con un toque de limón.",
        price: 0,
        thcPercentage: 26.0,
        strainType: "SATIVA",
        weight: "3.5g",
        imageUrl: "/images/products/Lenon Zkittles.jpg",
        inStock: true,
        quantity: 40,
        isFeatured: true,
        sortOrder: 2,
      },
    }),
    prisma.product.create({
      data: {
        name: "Hi Berry Chew",
        nameEs: "Hi Berry Chew",
        categoryId: flower.id,
        descriptionEn: "Sweet berry flavors dominate this indica-leaning hybrid. Smooth smoke with relaxing body effects and a fruity berry finish.",
        descriptionEs: "Sabores dulces de bayas dominan este híbrido inclinado hacia indica. Humo suave con efectos corporales relajantes y un final frutal de bayas.",
        price: 0,
        thcPercentage: 25.0,
        strainType: "HYBRID",
        weight: "3.5g",
        imageUrl: "/images/products/Hi Berry Chew.jpg",
        inStock: true,
        quantity: 35,
        isFeatured: false,
        sortOrder: 3,
      },
    }),
    prisma.product.create({
      data: {
        name: "Mac Flurry",
        nameEs: "Mac Flurry",
        categoryId: flower.id,
        descriptionEn: "A premium hybrid with creamy vanilla notes and potent effects. Dense, frosty buds with exceptional bag appeal and powerful relaxation.",
        descriptionEs: "Un híbrido premium con notas de vainilla cremosa y efectos potentes. Cogollos densos y escarchados con atractivo excepcional.",
        price: 0,
        thcPercentage: 30.0,
        strainType: "HYBRID",
        weight: "3.5g",
        imageUrl: "/images/products/Mac Flurry.jpg",
        inStock: true,
        quantity: 30,
        isFeatured: true,
        sortOrder: 4,
      },
    }),
    prisma.product.create({
      data: {
        name: "Gelato 33",
        nameEs: "Gelato 33",
        categoryId: flower.id,
        descriptionEn: "The classic Gelato phenotype with sweet dessert flavors and balanced hybrid effects. Smooth, creamy smoke with hints of citrus and berries.",
        descriptionEs: "El fenotipo clásico Gelato con sabores dulces de postre y efectos híbridos equilibrados. Humo suave y cremoso con toques de cítricos y bayas.",
        price: 0,
        thcPercentage: 29.0,
        strainType: "HYBRID",
        weight: "3.5g",
        imageUrl: "/images/products/Gelato 33.jpg",
        inStock: true,
        quantity: 25,
        isFeatured: true,
        sortOrder: 5,
      },
    }),
    prisma.product.create({
      data: {
        name: "Donut Shop",
        nameEs: "Donut Shop",
        categoryId: flower.id,
        descriptionEn: "Indulgent bakery flavors with sweet dough and glaze notes. This indica-dominant strain delivers deep relaxation and stress relief.",
        descriptionEs: "Sabores indulgentes de panadería con notas de masa dulce y glaseado. Esta cepa dominante indica ofrece relajación profunda y alivio del estrés.",
        price: 0,
        thcPercentage: 27.0,
        strainType: "INDICA",
        weight: "3.5g",
        imageUrl: "/images/products/Donut Shop.jpg",
        inStock: true,
        quantity: 45,
        isFeatured: false,
        sortOrder: 6,
      },
    }),
    prisma.product.create({
      data: {
        name: "Ice Cream Cake",
        nameEs: "Ice Cream Cake",
        categoryId: flower.id,
        descriptionEn: "Rich, creamy vanilla and sweet dough flavors make this indica a dessert lover's dream. Heavy-hitting relaxation for evening use.",
        descriptionEs: "Sabores ricos de vainilla cremosa y masa dulce hacen de esta indica el sueño de los amantes del postre. Relajación intensa para uso nocturno.",
        price: 0,
        thcPercentage: 28.0,
        strainType: "INDICA",
        weight: "3.5g",
        imageUrl: "/images/products/Ice Cream Cake.jpg",
        inStock: true,
        quantity: 38,
        isFeatured: true,
        sortOrder: 7,
      },
    }),
    prisma.product.create({
      data: {
        name: "Motor Breath",
        nameEs: "Motor Breath",
        categoryId: flower.id,
        descriptionEn: "Powerful indica with diesel and earthy notes. Known for its strong sedative effects and pungent aroma. Perfect for deep relaxation.",
        descriptionEs: "Indica potente con notas diésel y terrosas. Conocida por sus fuertes efectos sedantes y aroma pungente. Perfecta para relajación profunda.",
        price: 0,
        thcPercentage: 32.0,
        strainType: "INDICA",
        weight: "3.5g",
        imageUrl: "/images/products/Motor Breath.jpg",
        inStock: true,
        quantity: 20,
        isFeatured: false,
        sortOrder: 8,
      },
    }),
    prisma.product.create({
      data: {
        name: "Mochi",
        nameEs: "Mochi",
        categoryId: flower.id,
        descriptionEn: "Exotic hybrid with sweet, fruity flavors and a smooth finish. Balanced effects provide both mental clarity and physical relaxation.",
        descriptionEs: "Híbrido exótico con sabores dulces y frutales y un acabado suave. Efectos equilibrados que proporcionan claridad mental y relajación física.",
        price: 0,
        thcPercentage: 29.0,
        strainType: "HYBRID",
        weight: "3.5g",
        imageUrl: "/images/products/mochi.jpg",
        inStock: true,
        quantity: 32,
        isFeatured: true,
        sortOrder: 9,
      },
    }),

    // ── Concentrates (4 products) ──────────────────────
    prisma.product.create({
      data: {
        name: "Pineapple Express",
        nameEs: "Pineapple Express",
        categoryId: concentrates.id,
        descriptionEn: "Tropical pineapple flavors with energizing sativa effects. Premium live resin concentrate with full terpene preservation.",
        descriptionEs: "Sabores tropicales de piña con efectos sativa energizantes. Concentrado premium de resina viva con preservación completa de terpenos.",
        price: 0,
        thcPercentage: 85.0,
        strainType: "SATIVA",
        weight: "1g",
        imageUrl: "/images/products/Pineapple Express.jpg",
        inStock: true,
        quantity: 25,
        isFeatured: true,
        sortOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        name: "MAC",
        nameEs: "MAC",
        categoryId: concentrates.id,
        descriptionEn: "Miracle Alien Cookies concentrate with complex flavors and potent effects. High-quality extraction with exceptional purity.",
        descriptionEs: "Concentrado Miracle Alien Cookies con sabores complejos y efectos potentes. Extracción de alta calidad con pureza excepcional.",
        price: 0,
        thcPercentage: 88.0,
        strainType: "HYBRID",
        weight: "1g",
        imageUrl: "/images/products/MAC.jpg",
        inStock: true,
        quantity: 18,
        isFeatured: true,
        sortOrder: 2,
      },
    }),
    prisma.product.create({
      data: {
        name: "Cookies N Creme",
        nameEs: "Cookies N Creme",
        categoryId: concentrates.id,
        descriptionEn: "Sweet vanilla cookie flavors in a smooth, potent concentrate. Hybrid effects provide balanced relaxation and euphoria.",
        descriptionEs: "Sabores dulces de galleta de vainilla en un concentrado suave y potente. Efectos híbridos proporcionan relajación equilibrada y euforia.",
        price: 0,
        thcPercentage: 86.0,
        strainType: "HYBRID",
        weight: "1g",
        imageUrl: "/images/products/Cookie N Creme.jpg",
        inStock: true,
        quantity: 22,
        isFeatured: false,
        sortOrder: 3,
      },
    }),
    prisma.product.create({
      data: {
        name: "Sour Tangie",
        nameEs: "Sour Tangie",
        categoryId: concentrates.id,
        descriptionEn: "Bright citrus and tangerine flavors with uplifting sativa effects. Premium concentrate with intense terpene profile.",
        descriptionEs: "Sabores brillantes de cítricos y mandarina con efectos sativa estimulantes. Concentrado premium con perfil intenso de terpenos.",
        price: 0,
        thcPercentage: 84.0,
        strainType: "SATIVA",
        weight: "1g",
        imageUrl: "/images/products/Sour Tanger.jpg",
        inStock: true,
        quantity: 15,
        isFeatured: false,
        sortOrder: 4,
      },
    }),

    // ── Pre-Rolls (1 product) ──────────────────────────
    prisma.product.create({
      data: {
        name: "Premium Pre-Roll",
        nameEs: "Pre-Roll Premium",
        categoryId: preRolls.id,
        descriptionEn: "Expertly rolled and ready to enjoy. Featuring our finest THCA flower in a convenient pre-roll format. Perfect for on-the-go relaxation.",
        descriptionEs: "Expertamente enrollado y listo para disfrutar. Con nuestra mejor flor THCA en un formato conveniente de pre-roll.",
        price: 0,
        thcPercentage: 28.0,
        strainType: "HYBRID",
        weight: "1g",
        imageUrl: "/images/products/Pre Roll.jpg",
        inStock: true,
        quantity: 60,
        isFeatured: true,
        sortOrder: 1,
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);

  // ─── Staff Users ─────────────────────────────────────
  const ownerPassword = await hash("thcplus2024", 12);
  const staffPassword = await hash("staff2024", 12);

  const staff = await Promise.all([
    prisma.staffUser.upsert({
      where: { email: "owner@thcplus.com" },
      update: {},
      create: {
        name: "Store Owner",
        email: "owner@thcplus.com",
        role: "OWNER",
        hashedPassword: ownerPassword,
        isActive: true,
      },
    }),
    prisma.staffUser.upsert({
      where: { email: "manager@thcplus.com" },
      update: {},
      create: {
        name: "Store Manager",
        email: "manager@thcplus.com",
        role: "MANAGER",
        hashedPassword: staffPassword,
        isActive: true,
      },
    }),
    prisma.staffUser.upsert({
      where: { email: "staff@thcplus.com" },
      update: {},
      create: {
        name: "Staff Member",
        email: "staff@thcplus.com",
        role: "STAFF",
        hashedPassword: staffPassword,
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${staff.length} staff users`);

  // ─── Hero Banner ─────────────────────────────────────
  await prisma.heroBanner.deleteMany({});
  await prisma.heroBanner.create({
    data: {
      titleEn: "Premium Hemp, Ready When You Are",
      titleEs: "Cáñamo Premium, Listo Cuando Tú Lo Estés",
      bodyEn: "Browse our curated selection, reserve your favorites, and pick up at your convenience. No payment required online.",
      bodyEs: "Explora nuestra selección curada, reserva tus favoritos y recoge a tu conveniencia. No se requiere pago en línea.",
      isActive: true,
      sortOrder: 1,
    },
  });

  console.log("Created hero banner");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

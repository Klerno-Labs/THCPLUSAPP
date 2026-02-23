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

  const flower = categories[0];
  const concentrates = categories[1];
  const preRolls = categories[2];

  // ─── Clear existing products for clean re-seed ─────
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});

  // ─── All 22 Products from THC Plus inventory ───────
  const products = await Promise.all([
    // ── Flower (15 products) ──────────────────────────
    prisma.product.create({
      data: {
        name: "White Boy Cookies",
        nameEs: "White Boy Cookies",
        categoryId: flower.id,
        descriptionEn: "Premium indica hybrid with sweet vanilla and creamy mint chocolate. Blissful euphoria with full relaxation.",
        descriptionEs: "Híbrido indica premium con vainilla dulce y menta chocolate cremosa. Euforia y relajación total.",
        price: 45,
        costPrice: 22,
        thcPercentage: 28.0,
        strainType: "INDICA",
        weight: "3.5g",
        imageUrl: "/products/White-Boy-Cookies.jpg",
        inStock: true,
        quantity: 50,
        isFeatured: true,
        sortOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        name: "Lemon Zkittles",
        nameEs: "Lemon Zkittles",
        categoryId: flower.id,
        descriptionEn: "Energizing sativa-leaning strain with bright lemon and citrus aromas. Uplifting and creative effects.",
        descriptionEs: "Cepa sativa energizante con aromas brillantes de limón y cítricos. Efectos estimulantes y creativos.",
        price: 45,
        costPrice: 22,
        thcPercentage: 26.0,
        strainType: "SATIVA",
        weight: "3.5g",
        imageUrl: "/products/Lenon-Zkittles.jpg",
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
        descriptionEn: "Indica-dominant with sweet bubblegum candy flavor. Cerebral euphoria followed by deep physical calm.",
        descriptionEs: "Indica dominante con sabor dulce a chicle. Euforia cerebral seguida de calma física profunda.",
        price: 30,
        costPrice: 14,
        thcPercentage: 25.0,
        strainType: "INDICA",
        weight: "3.5g",
        imageUrl: "/products/Hi-Berry-Chew.jpg",
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
        descriptionEn: "Balanced hybrid with sweet dessert flavors. Energizing focus combined with tingly body relaxation.",
        descriptionEs: "Híbrido equilibrado con sabores dulces de postre. Enfoque energizante con relajación corporal.",
        price: 30,
        costPrice: 14,
        thcPercentage: 30.0,
        strainType: "HYBRID",
        weight: "3.5g",
        imageUrl: "/products/Mac-Flurry.jpg",
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
        descriptionEn: "Premium indica-leaning hybrid with sweet sherbet and fruity flavors. Euphoric head high with gentle relaxation.",
        descriptionEs: "Híbrido premium inclinado indica con sabores de sorbete y frutas. Euforia cerebral con relajación suave.",
        price: 25,
        costPrice: 11,
        thcPercentage: 29.0,
        strainType: "INDICA",
        weight: "3.5g",
        imageUrl: "/products/Gelato-33.jpg",
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
        descriptionEn: "Balanced hybrid with sugary sweet glazed donut flavor. Uplifting buzz with smooth body relaxation.",
        descriptionEs: "Híbrido equilibrado con sabor dulce a dona glaseada. Vibra estimulante con relajación corporal suave.",
        price: 17.50,
        costPrice: 8,
        thcPercentage: 27.0,
        strainType: "HYBRID",
        weight: "3.5g",
        imageUrl: "/products/Donut-Shop.jpg",
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
        descriptionEn: "Potent indica hybrid with creamy vanilla and nutty flavors. Powerful relaxation perfect for evening use.",
        descriptionEs: "Híbrido indica potente con sabores de vainilla cremosa y nuez. Relajación poderosa perfecta para la noche.",
        price: 17.50,
        costPrice: 8,
        thcPercentage: 28.0,
        strainType: "INDICA",
        weight: "3.5g",
        imageUrl: "/products/Ice-Cream-Cake.jpg",
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
        descriptionEn: "Heavy indica with pungent diesel and citrus flavors. Deeply relaxing for stress relief and sleep.",
        descriptionEs: "Indica pesada con sabores pungentes de diésel y cítricos. Profundamente relajante para alivio del estrés.",
        price: 17.50,
        costPrice: 8,
        thcPercentage: 32.0,
        strainType: "INDICA",
        weight: "3.5g",
        imageUrl: "/products/Motor-Breath.jpg",
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
        descriptionEn: "Balanced hybrid with sweet fruity berry and sour mint flavors. Euphoric relaxation for any time of day.",
        descriptionEs: "Híbrido equilibrado con sabores de bayas frutales y menta agria. Relajación eufórica para cualquier momento.",
        price: 25,
        costPrice: 11,
        thcPercentage: 29.0,
        strainType: "HYBRID",
        weight: "3.5g",
        imageUrl: "/products/mochi.jpg",
        inStock: true,
        quantity: 32,
        isFeatured: true,
        sortOrder: 9,
      },
    }),
    prisma.product.create({
      data: {
        name: "Grease Monkey",
        nameEs: "Grease Monkey",
        categoryId: flower.id,
        descriptionEn: "Potent indica with sweet vanilla and earthy diesel flavors. Deep relaxation with calming body effects.",
        descriptionEs: "Indica potente con sabores dulces de vainilla y diésel terroso. Relajación profunda con efectos corporales calmantes.",
        price: 17.50,
        costPrice: 8,
        thcPercentage: 27.0,
        strainType: "INDICA",
        weight: "3.5g",
        imageUrl: "/products/Grease-Monkey.jpg",
        inStock: true,
        quantity: 30,
        isFeatured: false,
        sortOrder: 10,
      },
    }),
    prisma.product.create({
      data: {
        name: "Candy Cane",
        nameEs: "Candy Cane",
        categoryId: flower.id,
        descriptionEn: "Uplifting sativa with sweet peppermint and pine flavors. Energizing cerebral effects perfect for daytime.",
        descriptionEs: "Sativa estimulante con sabores dulces de menta y pino. Efectos cerebrales energizantes perfectos para el día.",
        price: 30,
        costPrice: 14,
        thcPercentage: 26.0,
        strainType: "SATIVA",
        weight: "3.5g",
        imageUrl: "/products/Candy-Cane.jpg",
        inStock: true,
        quantity: 28,
        isFeatured: false,
        sortOrder: 11,
      },
    }),
    prisma.product.create({
      data: {
        name: "Platinum Mac",
        nameEs: "Platinum Mac",
        categoryId: flower.id,
        descriptionEn: "Premium hybrid with creamy vanilla and fuel flavors. Balanced effects delivering both mental clarity and body relaxation.",
        descriptionEs: "Híbrido premium con sabores de vainilla cremosa y combustible. Efectos equilibrados con claridad mental y relajación.",
        price: 30,
        costPrice: 14,
        thcPercentage: 30.0,
        strainType: "HYBRID",
        weight: "3.5g",
        imageUrl: "/products/Platinum-Mac.jpg",
        inStock: true,
        quantity: 25,
        isFeatured: true,
        sortOrder: 12,
      },
    }),
    prisma.product.create({
      data: {
        name: "Pink Lemonade",
        nameEs: "Pink Lemonade",
        categoryId: flower.id,
        descriptionEn: "Refreshing sativa with sweet citrus and berry flavors. Uplifting effects that boost mood and creativity.",
        descriptionEs: "Sativa refrescante con sabores de cítricos dulces y bayas. Efectos estimulantes que mejoran el ánimo.",
        price: 17.50,
        costPrice: 8,
        thcPercentage: 24.0,
        strainType: "SATIVA",
        weight: "3.5g",
        imageUrl: "/products/Pink-Lemonade.jpg",
        inStock: true,
        quantity: 35,
        isFeatured: false,
        sortOrder: 13,
      },
    }),
    prisma.product.create({
      data: {
        name: "Blueberry Muffin",
        nameEs: "Blueberry Muffin",
        categoryId: flower.id,
        descriptionEn: "Sweet blueberry and fresh baked muffin flavors. Calming body high with gentle euphoric relaxation.",
        descriptionEs: "Sabores dulces de arándano y muffin recién horneado. Relajación corporal calmante con euforia suave.",
        price: 17.50,
        costPrice: 8,
        thcPercentage: 25.0,
        strainType: "INDICA",
        weight: "3.5g",
        imageUrl: "/products/Blueberry Muffin.JPG",
        inStock: true,
        quantity: 40,
        isFeatured: false,
        sortOrder: 14,
      },
    }),
    prisma.product.create({
      data: {
        name: "Sour Diesel",
        nameEs: "Sour Diesel",
        categoryId: flower.id,
        descriptionEn: "Classic sativa with pungent diesel and citrus flavors. Fast-acting energizing effects with dreamy cerebral buzz.",
        descriptionEs: "Sativa clásica con sabores pungentes de diésel y cítricos. Efectos energizantes rápidos con vibra cerebral soñadora.",
        price: 17.50,
        costPrice: 8,
        thcPercentage: 26.0,
        strainType: "SATIVA",
        weight: "3.5g",
        imageUrl: "/products/Sour Deisel.JPG",
        inStock: true,
        quantity: 35,
        isFeatured: false,
        sortOrder: 15,
      },
    }),
    prisma.product.create({
      data: {
        name: "Gush Mintz",
        nameEs: "Gush Mintz",
        categoryId: flower.id,
        descriptionEn: "Exotic hybrid with sweet fruity gusher and cool mint flavors. Balanced euphoria with full-body relaxation.",
        descriptionEs: "Híbrido exótico con sabores frutales dulces y menta fresca. Euforia equilibrada con relajación de cuerpo completo.",
        price: 17.50,
        costPrice: 8,
        thcPercentage: 28.0,
        strainType: "HYBRID",
        weight: "3.5g",
        imageUrl: "/products/Gush Mintz.JPG",
        inStock: true,
        quantity: 30,
        isFeatured: false,
        sortOrder: 16,
      },
    }),
    prisma.product.create({
      data: {
        name: "OG",
        nameEs: "OG",
        categoryId: flower.id,
        descriptionEn: "The legendary OG strain with earthy pine and lemon flavors. Heavy-hitting relaxation with classic potency.",
        descriptionEs: "La cepa OG legendaria con sabores terrosos de pino y limón. Relajación intensa con potencia clásica.",
        price: 35,
        costPrice: 17,
        thcPercentage: 30.0,
        strainType: "INDICA",
        weight: "3.5g",
        imageUrl: "/products/OG.JPG",
        inStock: true,
        quantity: 22,
        isFeatured: true,
        sortOrder: 17,
      },
    }),

    // ── Concentrates (4 products) ──────────────────────
    prisma.product.create({
      data: {
        name: "Pineapple Express",
        nameEs: "Pineapple Express",
        categoryId: concentrates.id,
        descriptionEn: "Famous sativa hybrid with tropical pineapple flavor. Energizing and creative with uplifting effects.",
        descriptionEs: "Famoso híbrido sativa con sabor tropical de piña. Energizante y creativo con efectos estimulantes.",
        price: 20,
        costPrice: 10,
        thcPercentage: 85.0,
        strainType: "SATIVA",
        weight: "1g",
        imageUrl: "/products/Pineapple-Express.jpg",
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
        descriptionEn: "Miracle Alien Cookies - perfectly balanced hybrid. Smooth orange flavor with creative, uplifting effects.",
        descriptionEs: "Miracle Alien Cookies - híbrido perfectamente equilibrado. Sabor suave a naranja con efectos creativos.",
        price: 20,
        costPrice: 10,
        thcPercentage: 88.0,
        strainType: "HYBRID",
        weight: "1g",
        imageUrl: "/products/MAC.jpg",
        inStock: true,
        quantity: 18,
        isFeatured: true,
        sortOrder: 2,
      },
    }),
    prisma.product.create({
      data: {
        name: "Cookie N Creme",
        nameEs: "Cookie N Creme",
        categoryId: concentrates.id,
        descriptionEn: "Award-winning balanced hybrid with sweet vanilla and nutty earth flavors. Relaxing without heavy sedation.",
        descriptionEs: "Híbrido equilibrado galardonado con sabores dulces de vainilla y tierra. Relajante sin sedación pesada.",
        price: 20,
        costPrice: 10,
        thcPercentage: 86.0,
        strainType: "HYBRID",
        weight: "1g",
        imageUrl: "/products/Cookie-N-Creme.jpg",
        inStock: true,
        quantity: 22,
        isFeatured: false,
        sortOrder: 3,
      },
    }),
    prisma.product.create({
      data: {
        name: "Sour Tanger",
        nameEs: "Sour Tanger",
        categoryId: concentrates.id,
        descriptionEn: "Energizing sativa with pungent sour citrus and diesel flavors. Motivated energy with focused effects.",
        descriptionEs: "Sativa energizante con sabores pungentes de cítricos agrios y diésel. Energía motivada con efectos enfocados.",
        price: 20,
        costPrice: 10,
        thcPercentage: 84.0,
        strainType: "SATIVA",
        weight: "1g",
        imageUrl: "/products/Sour-Tanger.jpg",
        inStock: true,
        quantity: 15,
        isFeatured: false,
        sortOrder: 4,
      },
    }),

    // ── Pre-Rolls (2 products) ─────────────────────────
    prisma.product.create({
      data: {
        name: "Pre Roll",
        nameEs: "Pre Roll",
        categoryId: preRolls.id,
        descriptionEn: "Premium pre-rolled joints packed with top-shelf THCA flower. Convenient and ready to enjoy.",
        descriptionEs: "Porros pre-enrollados premium con flor THCA de primera calidad. Convenientes y listos para disfrutar.",
        price: 10,
        costPrice: 4,
        thcPercentage: 28.0,
        strainType: "HYBRID",
        weight: "1g",
        imageUrl: "/products/Pre-Roll.jpg",
        inStock: true,
        quantity: 60,
        isFeatured: true,
        sortOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        name: "Infused Pre Roll",
        nameEs: "Pre Roll Infusionado",
        categoryId: preRolls.id,
        descriptionEn: "Premium flower pre-roll infused with concentrate for an extra-potent experience. Hits harder, lasts longer.",
        descriptionEs: "Pre-roll de flor premium infusionado con concentrado para una experiencia extra potente.",
        price: 15,
        costPrice: 7,
        thcPercentage: 40.0,
        strainType: "HYBRID",
        weight: "1g",
        imageUrl: "/products/Pre-Roll.jpg",
        inStock: true,
        quantity: 40,
        isFeatured: true,
        sortOrder: 2,
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

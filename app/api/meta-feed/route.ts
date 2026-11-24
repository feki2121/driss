
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/server/prisma'

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function csv(value: unknown): string {
  const text = String(value ?? "")
    .replace(/\r?\n|\r/g, " ")   // ← supprime les retours à la ligne
    .replace(/\s+/g, " ")         // ← normalise les espaces multiples
    .trim();
  return `"${text.replace(/"/g, '""')}"`;
}

// Supporte images sous forme de tableau de chaînes
// ou de tableau d'objets contenant url / src.
function getImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item: any) => {
      if (typeof item === "string") return item;
      if (item && typeof item.url === "string") return item.url;
      if (item && typeof item.src === "string") return item.src;
      return "";
    })
    .filter((url) => url.startsWith("https://"));
}

export async function GET(request: NextRequest) {
  const token = process.env.META_FEED_TOKEN;
  const siteUrl = process.env.SITE_URL;

  if (
    !token ||
    request.nextUrl.searchParams.get("token") !== token
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!siteUrl) {
    return new NextResponse("SITE_URL missing", { status: 500 });
  }

  try {
    const [products, settings] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.storeSettings.findFirst(),
    ]);

    const currency = settings?.currency || "TND";

    const headers = [
      "id",
      "title",
      "description",
      "availability",
      "condition",
      "price",
      "link",
      "image_link",
      "brand",
      "product_type",
    ];

    const rows = products.flatMap((product) => {
      const images = getImages(product.images);
      const image = images[0];

      // Meta exige une image principale publique.
      if (!image) return [];

      const finalPrice = product.promoPrice ?? product.price;

      const productUrl =
        `${siteUrl.replace(/\/$/, "")}/produits/${encodeURIComponent(product.id)}`;

      return [[
        product.id,
        product.nameFr,
        product.descriptionFr || product.nameFr,
        "in stock",
        "new",
        `${Number(finalPrice).toFixed(2)} ${currency}`,
        productUrl,
        image,
        "Espace Baya",
        product.category.nameFr,
      ].map(csv).join(",")];
    });

    const content = [
      headers.join(","),
      ...rows,
    ].join("\r\n");

    return new NextResponse("\uFEFF" + content, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Meta feed error:", error);

    return new NextResponse("Feed generation failed", {
      status: 500,
    });
  }
}

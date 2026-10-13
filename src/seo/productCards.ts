import type { Product } from "../types";
import { publicProductPath } from "./resolveSeo";
import { isSafeImageSrc } from "./safeUrl";

export const MAX_PRODUCT_CARDS = 3;
export const PRODUCT_CARDS_HEADING = "محصولات مرتبط";
export const PRODUCT_CARD_IMG = { width: 640, height: 360 };

export type ProductCard = { id: string; name: string; model?: string; spec?: string; image?: string; href: string };

const SKIP_SPEC = /^(مدل|برند|کد|قیمت|رنگ)/;

function keySpec(product: Product): string | undefined {
  const specs = (product as any).specs as { label?: string; value?: string }[] | undefined;
  const spec = (specs || []).find((s) => s?.label && s?.value && !SKIP_SPEC.test(s.label.trim()) && !/قیمت|تومان|ریال/.test(s.value));
  return spec ? `${spec.label!.trim()}: ${spec.value!.trim()}` : undefined;
}

/** Resolves `[PRODUCTS|id,id]` ids against live product data; unknown ids are skipped, max 3. */
export function resolveProductCards(ids: string[], products: Product[]): ProductCard[] {
  const cards: ProductCard[] = [];
  for (const raw of ids) {
    const id = raw.trim().toLowerCase();
    const product = products.find((p) => p.id === id || p.code?.toLowerCase() === id);
    if (!product || cards.some((c) => c.id === product.id)) continue;
    const model = ((product as any).specs || []).find((s: any) => /^مدل/.test(String(s?.label || "")))?.value;
    cards.push({
      id: product.id,
      name: product.name,
      model: model && !product.name.includes(model) ? model : undefined,
      spec: keySpec(product),
      image: product.image && isSafeImageSrc(product.image) ? product.image : undefined,
      href: publicProductPath(product),
    });
    if (cards.length >= MAX_PRODUCT_CARDS) break;
  }
  return cards;
}

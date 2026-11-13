import { products, type Product, type ProductImage } from '../data/products';

/** The photo that suits the black page best: a dark-surround shot if Shopify has one. */
export const moodImage = (p: Product): ProductImage =>
  p.images.find((im) => im.tone === 'dark') ?? p.images[0];

/** Cleanest studio shot (purest white surround) across the catalogue, for the bottle story. */
export function studioPick(): { product: Product; image: ProductImage } | null {
  let best: { product: Product; image: ProductImage } | null = null;
  for (const product of products) {
    // Each product's first Shopify image is its main shot, where the whole bottle is in frame.
    const image = product.images[0];
    if (image && (!best || image.border > best.image.border)) best = { product, image };
  }
  return best;
}

export const allNotes = (p: Product) => p.notes.flatMap((t) => t.items);

export const lowestPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));

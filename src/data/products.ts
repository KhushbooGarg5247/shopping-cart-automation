export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: "apparel" | "accessories" | "gear" | "books";
}

/**
 * Source of truth for expected catalogue data.
 * NOTE: names, prices, ids and slugs come from the page HTML. The CATEGORY of each product
 * is an educated guess - verify against the live category filter on the first run and
 * correct any entry that is wrong before treating a filter failure as a bug.
 */
export const PRODUCTS: Product[] = [
  { id: "1",  slug: "backpack",               name: "Trailmark Day Pack",      price: 29.99, category: "gear" },
  { id: "2",  slug: "bike-light",             name: "Nightline Safety Light",  price: 9.99,  category: "gear" },
  { id: "3",  slug: "bolt-t-shirt",           name: "Bolt T-Shirt",            price: 15.99, category: "apparel" },
  { id: "4",  slug: "fleece-jacket",          name: "Summit Fleece",           price: 49.99, category: "apparel" },
  { id: "5",  slug: "onesie",                 name: "Little Trek Bodysuit",    price: 7.99,  category: "apparel" },
  { id: "6",  slug: "all-the-things-t-shirt", name: "Side Quest Tee",          price: 15.99, category: "apparel" },
  { id: "7",  slug: "sauce-labs-mug",         name: "Daybreak Ceramic Mug",    price: 14.99, category: "accessories" },
  { id: "8",  slug: "sauce-labs-hoodie",      name: "After Hours Hoodie",      price: 44.99, category: "apparel" },
  { id: "9",  slug: "lab-notebook",           name: "Gridline Journal",        price: 12.99, category: "accessories" },
  { id: "10", slug: "qa-sticker-pack",        name: "Branch Point Decals",     price: 4.99,  category: "accessories" },
  { id: "11", slug: "automation-handbook",    name: "Signal Path Field Guide", price: 24.99, category: "books" },
  { id: "12", slug: "debug-socks",            name: "Bug Hunt Crew Socks",     price: 8.99,  category: "accessories" },
];

export const TOTAL_ITEMS = PRODUCTS.length;

export const bySlug = (slug: string): Product => {
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown product slug: ${slug}`);
  return p;
};

export const CATEGORIES = ["all", "apparel", "accessories", "gear", "books"] as const;

export const productsIn = (category: string): Product[] =>
  category === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

export const SORT_OPTIONS = ["name-az", "name-za", "price-low", "price-high"] as const;

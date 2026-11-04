export interface CartPick {
  slug: string;
  qty: number;
}

/** Top, middle and bottom of the default (A-Z) list, one with qty > 1. */
export const TOP_MIDDLE_BOTTOM: CartPick[] = [
  { slug: "sauce-labs-hoodie", qty: 1 }, // After Hours Hoodie  (first A-Z)
  { slug: "sauce-labs-mug", qty: 2 },    // Daybreak Ceramic Mug (middle)
  { slug: "backpack", qty: 1 },          // Trailmark Day Pack   (last A-Z)
];

export const PRICING_SCENARIOS: { name: string; picks: CartPick[] }[] = [
  { name: "single low-price item", picks: [{ slug: "qa-sticker-pack", qty: 1 }] },
  { name: "top, middle and bottom of the list", picks: TOP_MIDDLE_BOTTOM },
  {
    name: "mixed quantities",
    picks: [
      { slug: "debug-socks", qty: 3 },
      { slug: "onesie", qty: 2 },
      { slug: "lab-notebook", qty: 1 },
    ],
  },
  { name: "three of the same item", picks: [{ slug: "all-the-things-t-shirt", qty: 3 }] },
  {
    name: "every product once (except Bolt T-Shirt, see BUG-003)",
    picks: [
      "backpack", "bike-light", "fleece-jacket", "onesie", "all-the-things-t-shirt",
      "sauce-labs-mug", "sauce-labs-hoodie", "lab-notebook", "qa-sticker-pack",
      "automation-handbook", "debug-socks",
    ].map((slug) => ({ slug, qty: 1 })),
  },
];

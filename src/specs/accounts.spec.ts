import { expect } from "@wdio/globals";
import ProductsPage, { CardSnapshot } from "../pages/ProductsPage";
import CartPage from "../pages/CartPage";
import { loginAs } from "../utils/session";
import { LOGGABLE_USERS, USERS } from "../data/users";
import { CATEGORIES, PRODUCTS, TOTAL_ITEMS } from "../data/products";

/**
 * Every account that can log in runs the same checks, compared with the Shopper baseline.
 * The "Image variation" and "Cart badge" accounts exist to expose account-specific defects.
 */
describe("Per-account behaviour", () => {
  let baseline: CardSnapshot[] = [];

  before(async () => {
    await loginAs(USERS.shopper.username);
    baseline = await ProductsPage.snapshot();
  });

  for (const u of LOGGABLE_USERS) {
    describe(`${u.label} (${u.username})`, () => {
      beforeEach(async () => {
        await loginAs(u.username);
      });

      it("TC-A0: a fresh login shows an empty cart and no badge", async () => {
        expect(await ProductsPage.badgeCount()).toBe(0);
        await ProductsPage.openCart();
        expect(await CartPage.isEmpty()).toBe(true);
      });

      it("TC-A1: product names, prices and images match the Shopper baseline", async () => {
        const cards = await ProductsPage.snapshot();
        expect(cards).toHaveLength(TOTAL_ITEMS);
        const problems: string[] = [];
        for (const base of baseline) {
          const card = cards.find((c) => c.id === base.id);
          if (!card) { problems.push(`${base.name}: missing`); continue; }
          if (card.name !== base.name) problems.push(`${base.name}: name is "${card.name}"`);
          if (Math.abs(card.price - base.price) > 0.001) problems.push(`${base.name}: price is ${card.price}`);
          if (card.imageWidth <= 0) problems.push(`${base.name}: image not rendered`);
          if (card.imageSig !== base.imageSig) problems.push(`${base.name}: image differs`);
        }
        expect(problems).toEqual([]);
      });

      it("TC-A4: product images are correct when filtering by each category", async () => {
        const problems: string[] = [];
        for (const category of CATEGORIES.filter((c) => c !== "all")) {
          await ProductsPage.filterBy(category);
          for (const card of await ProductsPage.snapshot()) {
            const base = baseline.find((b) => b.id === card.id);
            if (!base) { problems.push(`${category}: unknown product "${card.name}"`); continue; }
            if (card.imageSig !== base.imageSig) problems.push(`${category}: wrong image for "${card.name}"`);
            if (card.imageWidth <= 0) problems.push(`${category}: image not rendered for "${card.name}"`);
          }
        }
        expect(problems).toEqual([]);
      });

      it("TC-A5: price sorting (high to low and low to high) is correct", async () => {
        const asc = PRODUCTS.map((p) => p.price).sort((a, b) => a - b);

        await ProductsPage.sortBy("price-high");
        expect(await ProductsPage.prices()).toEqual([...asc].reverse());

        await ProductsPage.sortBy("price-low");
        expect(await ProductsPage.prices()).toEqual(asc);
      });

      it("TC-A2: the cart badge counts up 1, 2, 3 as three different products are added", async () => {
        const slugs = ["backpack", "bike-light", "onesie"];
        for (let i = 0; i < slugs.length; i++) {
          await ProductsPage.addToCartOrFail(slugs[i]);
          await ProductsPage.waitForBadge(i + 1);
        }
      });

      it("TC-A3: the badge agrees with the cart after changing a quantity", async () => {
        await ProductsPage.addToCartOrFail("backpack");
        await ProductsPage.openCart();
        await CartPage.increase("1");
        const qty = await CartPage.quantity("1");
        const badge = await ProductsPage.badgeCount();
        expect([qty, 1]).toContain(badge); // units (2) or distinct lines (1)
      });
    });
  }
});

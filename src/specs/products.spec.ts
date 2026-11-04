import { expect } from "@wdio/globals";
import ProductsPage from "../pages/ProductsPage";
import { loginAs } from "../utils/session";
import { CATEGORIES, PRODUCTS, SORT_OPTIONS, TOTAL_ITEMS, productsIn } from "../data/products";

const byName = (a: string, b: string) => a.localeCompare(b);

describe("Products page", () => {
  beforeEach(async () => {
    await loginAs();
  });

  it("TC-P1: shows the expected total number of items", async () => {
    expect(await ProductsPage.count()).toBe(TOTAL_ITEMS);
  });

  it("TC-P5: every product shows the expected name and price", async () => {
    const cards = await ProductsPage.snapshot();
    expect(cards).toHaveLength(TOTAL_ITEMS);
    for (const p of PRODUCTS) {
      const card = cards.find((c) => c.id === p.id);
      expect(card).toBeDefined();
      expect(card!.name).toBe(p.name);
      expect(card!.price).toBeCloseTo(p.price, 2);
    }
  });

  for (const category of CATEGORIES) {
    it(`TC-P2: filter "${category}" shows the right items and count`, async () => {
      await ProductsPage.filterBy(category);
      const expected = productsIn(category).map((p) => p.name).sort(byName);
      const actual = [...(await ProductsPage.names())].sort(byName);
      expect(actual).toHaveLength(expected.length);
      expect(actual).toEqual(expected);
    });
  }

  it("TC-P3: category counts add up to the total", async () => {
    let sum = 0;
    for (const category of CATEGORIES.filter((c) => c !== "all")) {
      await ProductsPage.filterBy(category);
      sum += await ProductsPage.count();
    }
    expect(sum).toBe(TOTAL_ITEMS);
  });

  for (const option of SORT_OPTIONS) {
    it(`TC-P4: sort "${option}" orders the list correctly`, async () => {
      await ProductsPage.sortBy(option);
      const names = await ProductsPage.names();
      const prices = await ProductsPage.prices();
      const expectedNames = PRODUCTS.map((p) => p.name).sort(byName);
      const expectedPrices = PRODUCTS.map((p) => p.price).sort((a, b) => a - b);

      switch (option) {
        case "name-az":
          expect(names).toEqual(expectedNames);
          break;
        case "name-za":
          expect(names).toEqual([...expectedNames].reverse());
          break;
        case "price-low":
          expect(prices).toEqual(expectedPrices);
          break;
        case "price-high":
          expect(prices).toEqual([...expectedPrices].reverse());
          break;
      }
      // sorting must never add or drop items
      expect([...names].sort(byName)).toEqual(expectedNames);
    });
  }
});

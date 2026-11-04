import { expect } from "@wdio/globals";
import ProductsPage from "../pages/ProductsPage";
import CartPage from "../pages/CartPage";
import { loginAs, buildCart } from "../utils/session";
import { bySlug } from "../data/products";
import { PRICING_SCENARIOS, TOP_MIDDLE_BOTTOM } from "../data/scenarios";
import { expectedTotals, unitPricesOf, waitForStable } from "../utils/helpers";

const priced = (picks: { slug: string; qty: number }[]) =>
  picks.map((p) => ({ ...bySlug(p.slug), qty: p.qty }));

describe("Cart", () => {
  beforeEach(async () => {
    await loginAs();
  });

  it("TC-C1: empty cart shows the empty state and Continue Shopping returns to the store", async () => {
    await ProductsPage.openCart();
    expect(await CartPage.isEmpty()).toBe(true);
    expect(await CartPage.emptyTitle()).toBe("Your cart is empty");
    expect(await CartPage.emptyMessage()).toBe("Head back to the store and add some items.");
    expect(await CartPage.itemCount()).toBe(0);
    await CartPage.continueShopping();
    await ProductsPage.isLoaded();
  });

  it("TC-C2: items from the top, middle and bottom of the list appear with correct details and totals", async () => {
    await buildCart(TOP_MIDDLE_BOTTOM);
    await ProductsPage.openCart();

    const lines = await CartPage.lines();
    expect(lines).toHaveLength(TOP_MIDDLE_BOTTOM.length);
    for (const pick of priced(TOP_MIDDLE_BOTTOM)) {
      const line = lines.find((l) => l.id === pick.id);
      expect(line).toBeDefined();
      expect(line!.name).toBe(pick.name);
      expect(line!.unitPrice).toBeCloseTo(pick.price, 2);
      expect(line!.qty).toBe(pick.qty);
      expect(line!.lineTotal).toBeCloseTo(pick.price * pick.qty, 2);
    }

    const exp = expectedTotals(unitPricesOf(priced(TOP_MIDDLE_BOTTOM)));
    expect(await CartPage.subtotal()).toBeCloseTo(exp.subtotal, 2);
    expect(await CartPage.tax()).toBeCloseTo(exp.tax, 2);
    expect(await CartPage.total()).toBeCloseTo(exp.total, 2);
  });

  it("TC-C3: (+) and (-) update quantity, line total and order totals", async () => {
    const p = bySlug("sauce-labs-hoodie");
    await ProductsPage.addToCartOrFail(p.slug);
    await ProductsPage.openCart();

    await CartPage.increase(p.id);
    expect(await CartPage.quantity(p.id)).toBe(2);
    expect(await CartPage.lineTotal(p.id)).toBeCloseTo(p.price * 2, 2);
    let exp = expectedTotals([p.price, p.price]);
    expect(await CartPage.subtotal()).toBeCloseTo(exp.subtotal, 2);
    expect(await CartPage.tax()).toBeCloseTo(exp.tax, 2);
    expect(await CartPage.total()).toBeCloseTo(exp.total, 2);

    await CartPage.decrease(p.id);
    expect(await CartPage.quantity(p.id)).toBe(1);
    exp = expectedTotals([p.price]);
    expect(await CartPage.subtotal()).toBeCloseTo(exp.subtotal, 2);
    expect(await CartPage.total()).toBeCloseTo(exp.total, 2);
  });

  it("TC-C4: (-) at quantity 1 never leaves a zero or negative quantity in the cart", async () => {
    const p = bySlug("backpack");
    await ProductsPage.addToCartOrFail(p.slug);
    await ProductsPage.openCart();
    await CartPage.decreaseRaw(p.id);

    const state = await waitForStable(async () => {
      const lines = await CartPage.itemCount();
      return { lines, qty: lines > 0 ? await CartPage.quantity(p.id) : 0 };
    });
    expect(state.lines === 0 || state.qty >= 1).toBe(true);
  });

  it("TC-C5: removing an item updates the remaining items and totals", async () => {
    const keep = bySlug("backpack");
    const drop = bySlug("sauce-labs-hoodie");
    await buildCart([{ slug: drop.slug, qty: 1 }, { slug: keep.slug, qty: 1 }]);
    await ProductsPage.openCart();
    await CartPage.remove(drop.id);

    expect(await CartPage.itemCount()).toBe(1);
    const exp = expectedTotals([keep.price]);
    expect(await CartPage.subtotal()).toBeCloseTo(exp.subtotal, 2);
    expect(await CartPage.total()).toBeCloseTo(exp.total, 2);
  });

  for (const scenario of PRICING_SCENARIOS) {
    it(`TC-C6: pricing is correct - ${scenario.name}`, async () => {
      await buildCart(scenario.picks);
      await ProductsPage.openCart();
      const exp = expectedTotals(unitPricesOf(priced(scenario.picks)));
      expect(await CartPage.subtotal()).toBeCloseTo(exp.subtotal, 2);
      expect(await CartPage.tax()).toBeCloseTo(exp.tax, 2);
      expect(await CartPage.total()).toBeCloseTo(exp.total, 2);
      // the total shown must equal what is displayed above it
      expect((await CartPage.subtotal()) + (await CartPage.tax())).toBeCloseTo(await CartPage.total(), 2);
    });
  }

  it("TC-C7: cart title uses correct singular/plural wording", async () => {
    await ProductsPage.addToCartOrFail("backpack");
    await ProductsPage.openCart();
    expect(await CartPage.title()).toBe("Your Cart (1 item)");

    await CartPage.continueShopping();
    await ProductsPage.isLoaded();
    await ProductsPage.addToCartOrFail("bike-light");
    await ProductsPage.openCart();
    expect(await CartPage.title()).toBe("Your Cart (2 items)");
  });

  it("TC-C8: header badge is consistent with the cart contents", async () => {
    await buildCart([{ slug: "backpack", qty: 2 }, { slug: "sauce-labs-mug", qty: 1 }]);
    const badge = await ProductsPage.badgeCount();

    await ProductsPage.openCart();
    const ids = await CartPage.itemIds();
    const units = (await Promise.all(ids.map((id) => CartPage.quantity(id)))).reduce((a, b) => a + b, 0);
    // The badge may count units or distinct lines; either is consistent, anything else is a defect.
    expect([units, ids.length]).toContain(badge);
  });
});

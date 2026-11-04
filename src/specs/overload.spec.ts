import { expect } from "@wdio/globals";
import ProductsPage from "../pages/ProductsPage";
import CartPage from "../pages/CartPage";
import { loginAs } from "../utils/session";
import { bySlug } from "../data/products";

/**
 * KNOWN DEFECT (see BUGS.md BUG-001 / BUG-002).
 * These tests assert the CORRECT behaviour and are expected to FAIL until the app is fixed.
 * They are kept in their own spec so the happy-path specs stay green and diagnosable.
 */
describe("Known defect: 'System overload' error", () => {
  beforeEach(async () => {
    await loginAs();
  });

  it("TC-B1: re-adding units after removing some does not show the overload error", async () => {
    const p = bySlug("backpack");
    await ProductsPage.addToCart(p.slug, 4);
    await ProductsPage.openCart();
    await CartPage.decrease(p.id);
    await CartPage.decrease(p.id); // cart now holds 2
    await CartPage.continueShopping();
    await ProductsPage.isLoaded();

    await ProductsPage.addToCart(p.slug, 3); // cart should hold 5
    expect(await ProductsPage.overloadShown()).toBe(false);
    await ProductsPage.openCart();
    expect(await CartPage.quantity(p.id)).toBe(5);
  });

  it("TC-B2: repeatedly adding and removing one item never triggers the overload error", async () => {
    const p = bySlug("bike-light");
    for (let i = 1; i <= 8; i++) {
      await ProductsPage.addToCart(p.slug);
      expect(await ProductsPage.overloadShown()).toBe(false);
      await ProductsPage.openCart();
      await CartPage.remove(p.id);
      await CartPage.continueShopping();
      await ProductsPage.isLoaded();
    }
  });

  it("TC-B3: other products can still be added while the overload banner is showing", async () => {
    for (let i = 0; i < 8; i++) await ProductsPage.addToCart("backpack");
    await ProductsPage.dismissOverload();
    await ProductsPage.addToCart("bike-light");
    await ProductsPage.openCart();
    expect(await CartPage.itemCount()).toBeGreaterThanOrEqual(2);
  });
});

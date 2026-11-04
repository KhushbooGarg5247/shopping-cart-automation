import { browser, expect } from "@wdio/globals";
import LoginPage from "../pages/LoginPage";
import ProductsPage from "../pages/ProductsPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import { loginAs, buildCart, freshSession } from "../utils/session";
import { USERS, LOCKED_MESSAGE } from "../data/users";
import { SHIPPING, EXPECTED } from "../data/checkout";
import { TOTAL_ITEMS, productsIn, bySlug } from "../data/products";
import { TOP_MIDDLE_BOTTOM } from "../data/scenarios";
import { expectedTotals, unitPricesOf } from "../utils/helpers";

/** Runs under Chrome mobile emulation (390x844) - see the second capability in wdio.conf.ts. */
const hasHorizontalScroll = () =>
  browser.execute(() => document.documentElement.scrollWidth > window.innerWidth + 1);

describe("Mobile viewport (390x844)", () => {
  it("TC-M0: the browser is really running with a phone-sized viewport", async () => {
    await freshSession();
    const width = await browser.execute(() => window.innerWidth);
    expect(width).toBeLessThanOrEqual(500);
  });

  it("TC-M1: login works on mobile and the locked account is rejected", async () => {
    await freshSession();
    await LoginPage.open();
    await LoginPage.login(USERS.locked.username);
    expect(await LoginPage.errorText()).toContain(LOCKED_MESSAGE);
    expect(await hasHorizontalScroll()).toBe(false);

    await LoginPage.login(USERS.shopper.username);
    await ProductsPage.isLoaded();
  });

  describe("signed in", () => {
    beforeEach(async () => {
      await loginAs();
    });

    it("TC-M2: all products show and category filtering works", async () => {
      expect(await ProductsPage.count()).toBe(TOTAL_ITEMS);
      await ProductsPage.filterBy("books");
      expect(await ProductsPage.count()).toBe(productsIn("books").length);
      expect(await hasHorizontalScroll()).toBe(false);
    });

    it("TC-M3: sorting by price (low to high) works", async () => {
      await ProductsPage.sortBy("price-low");
      const prices = await ProductsPage.prices();
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it("TC-M4: cart quantities and totals are correct", async () => {
      const p = bySlug("debug-socks");
      await ProductsPage.addToCartOrFail(p.slug);
      await ProductsPage.openCart();
      await CartPage.increase(p.id);
      const exp = expectedTotals([p.price, p.price]);
      expect(await CartPage.subtotal()).toBeCloseTo(exp.subtotal, 2);
      expect(await CartPage.tax()).toBeCloseTo(exp.tax, 2);
      expect(await CartPage.total()).toBeCloseTo(exp.total, 2);
      expect(await hasHorizontalScroll()).toBe(false);
    });

    it("TC-M5: an order can be placed end to end", async () => {
      await buildCart(TOP_MIDDLE_BOTTOM);
      await ProductsPage.openCart();
      await CartPage.checkout();
      expect(await hasHorizontalScroll()).toBe(false);
      await CheckoutPage.submitShipping(SHIPPING);

      const priced = TOP_MIDDLE_BOTTOM.map((x) => ({ ...bySlug(x.slug), qty: x.qty }));
      expect(await CheckoutPage.total()).toBeCloseTo(expectedTotals(unitPricesOf(priced)).total, 2);

      await CheckoutPage.finish();
      await CheckoutPage.waitForSuccess();
      expect(await CheckoutPage.successTitle()).toBe(EXPECTED.successTitle);
    });
  });
});

import { expect } from "@wdio/globals";
import ProductsPage from "../pages/ProductsPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import { loginAs, buildCart } from "../utils/session";
import { SHIPPING, EXPECTED } from "../data/checkout";
import { bySlug } from "../data/products";
import { TOP_MIDDLE_BOTTOM } from "../data/scenarios";
import { expectedTotals, unitPricesOf } from "../utils/helpers";

const picks = TOP_MIDDLE_BOTTOM;
const priced = picks.map((p) => ({ ...bySlug(p.slug), qty: p.qty }));

async function goToShippingForm() {
  await buildCart(picks);
  await ProductsPage.openCart();
  await CartPage.checkout();
}

async function goToSummary() {
  await goToShippingForm();
  await CheckoutPage.submitShipping(SHIPPING);
}

describe("Checkout", () => {
  beforeEach(async () => {
    await loginAs();
  });

  it("TC-K1: a complete order can be placed end to end", async () => {
    await goToSummary();
    await CheckoutPage.finish();
    await CheckoutPage.waitForSuccess();
    expect(await CheckoutPage.successTitle()).toBe(EXPECTED.successTitle);
    expect(await CheckoutPage.successMessage()).toBe(EXPECTED.successMessage);
  });

  it("TC-K2: the order preview total matches the cart total", async () => {
    await buildCart(picks);
    await ProductsPage.openCart();
    const cartTotal = await CartPage.total();
    await CartPage.checkout();
    expect(await CheckoutPage.previewTotal()).toBeCloseTo(cartTotal, 2);
  });

  it("TC-K3: the order summary lists the same items, quantities and line totals as were added", async () => {
    await goToSummary();
    const items = await CheckoutPage.summaryItems();
    expect(items).toHaveLength(priced.length);
    for (const p of priced) {
      const row = items.find((i) => i.id === p.id);
      expect(row).toBeDefined();
      expect(row!.name).toBe(p.name);
      expect(row!.qty).toBe(p.qty);
      expect(row!.unitPrice).toBeCloseTo(p.price, 2);
      expect(row!.subtotal).toBeCloseTo(p.price * p.qty, 2);
    }
  });

  it("TC-K4: the order summary subtotal, 8% tax and total are correct", async () => {
    await goToSummary();
    const exp = expectedTotals(unitPricesOf(priced));
    expect(await CheckoutPage.subtotal()).toBeCloseTo(exp.subtotal, 2);
    expect(await CheckoutPage.tax()).toBeCloseTo(exp.tax, 2);
    expect(await CheckoutPage.total()).toBeCloseTo(exp.total, 2);
  });

  it("TC-K5: the order summary shows the shipping details that were entered", async () => {
    await goToSummary();
    const info = (await CheckoutPage.shippingInfo()).toLowerCase();
    expect(info).toContain(`${SHIPPING.firstName} ${SHIPPING.lastName}`.toLowerCase());
    expect(info).toContain(SHIPPING.postalCode.toLowerCase());
  });

  it("TC-K6: the cart is emptied after the order is placed", async () => {
    await goToSummary();
    await CheckoutPage.finish();
    await CheckoutPage.waitForSuccess();
    await CheckoutPage.backToHome();
    await ProductsPage.isLoaded();
    expect(await ProductsPage.badgeCount()).toBe(0);
    await ProductsPage.openCart();
    expect(await CartPage.isEmpty()).toBe(true);
  });

  it("TC-K7: the shipping form cannot be submitted empty", async () => {
    await buildCart([{ slug: "backpack", qty: 1 }]);
    await ProductsPage.openCart();
    await CartPage.checkout();
    await CheckoutPage.continue();
    // The form has `novalidate`, so confirm in the live app whether validation exists.
    expect(await CheckoutPage.summaryShown(2000)).toBe(false);
    expect(await CheckoutPage.isFormShown()).toBe(true);
  });

  it("TC-K8: going back from the summary and the form keeps the cart intact", async () => {
    await goToSummary();
    await CheckoutPage.backToForm();
    expect(await CheckoutPage.isFormShown()).toBe(true);
    await CheckoutPage.backToCart();
    expect(await CartPage.itemCount()).toBe(picks.length);
  });
});

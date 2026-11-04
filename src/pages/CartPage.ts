import { $, $$, browser } from "@wdio/globals";
import BasePage from "./BasePage";
import { byTest, parseMoney, waitForStable, allElements } from "../utils/helpers";
import { log } from "../utils/logger";

export interface CartLine {
  id: string;
  name: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

class CartPage extends BasePage {
  async open() {
    await super.open("/cart");
  }

  // ---- empty state ----
  isEmpty()      { return this.isShown("cart-empty-title", 3000); }
  emptyTitle()   { return this.text("cart-empty-title"); }
  emptyMessage() { return this.text("cart-empty-message"); }

  // ---- populated state ----
  title()    { return this.text("cart-title"); }
  subtotal() { return this.money("cart-subtotal"); }
  tax()      { return this.money("cart-tax"); }
  total()    { return this.money("cart-total"); }

  async itemCount(): Promise<number> {
    return (await $$(byTest("cart-item"))).length;
  }

    async itemIds(): Promise<string[]> {
    const rows = await allElements(byTest("cart-item"));
    return Promise.all(rows.map(async (r) => (await r.getAttribute("id")).replace("cart-item-", "")));
  }

  quantity(id: string)  { return this.text(`quantity-item-${id}`).then(Number); }
  name(id: string)      { return this.textById(`cart-item-name-${id}`); }
  unitPrice(id: string) { return this.textById(`cart-item-price-${id}`).then(parseMoney); }
  lineTotal(id: string) { return this.money(`cart-item-total-${id}`); }

  async lines(): Promise<CartLine[]> {
    return waitForStable(async () => {
      const ids = await this.itemIds();
      return Promise.all(
        ids.map(async (id) => ({
          id,
          name: await this.name(id),
          unitPrice: await this.unitPrice(id),
          qty: await this.quantity(id),
          lineTotal: await this.lineTotal(id),
        }))
      );
    });
  }

  async increase(id: string) {
    const before = await this.quantity(id);
    log.step(`Increase item ${id} (${before} -> ${before + 1})`);
    await this.click(`increase-qty-item-${id}`);
    await browser.waitUntil(async () => (await this.quantity(id)) === before + 1, {
      timeoutMsg: `Quantity of item ${id} did not increase`,
    });
  }

  async decrease(id: string) {
    const before = await this.quantity(id);
    log.step(`Decrease item ${id} (${before} -> ${before - 1})`);
    await this.click(`decrease-qty-item-${id}`);
    await browser.waitUntil(async () => (await this.quantity(id)) === before - 1, {
      timeoutMsg: `Quantity of item ${id} did not decrease`,
    });
  }

  /** Click (-) without waiting for a specific result (used to probe the lower boundary). */
  decreaseRaw(id: string) {
    return this.click(`decrease-qty-item-${id}`);
  }

  async remove(id: string) {
    log.step(`Remove item ${id}`);
    await this.click(`remove-item-${id}`);
    await $(byTest("cart-item") + `#cart-item-${id}`).waitForExist({ reverse: true, timeout: 5000 });
  }

  checkout() {
    return this.click("checkout-button");
  }

  /** The empty cart and the populated cart use different locators for this link. */
  async continueShopping() {
    const link = await $(`${byTest("continue-shopping")}, ${byTest("continue-shopping-link")}`);
    await link.waitForClickable({ timeout: 10000 });
    await link.click();
  }
}

export default new CartPage();

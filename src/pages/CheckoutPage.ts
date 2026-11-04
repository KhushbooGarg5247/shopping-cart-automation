import { $$ } from "@wdio/globals";
import BasePage from "./BasePage";
import { byTest, parseMoney, allElements, waitForStable } from "../utils/helpers";
import { log } from "../utils/logger";

export interface SummaryItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

class CheckoutPage extends BasePage {
  // ---- Step 1: shipping form ----
  isFormShown() { return this.isShown("checkout-form", 5000); }

  async fillShipping(d: { firstName: string; lastName: string; postalCode: string }) {
    log.step("Fill shipping information");
    await (await this.el("checkout-first-name")).setValue(d.firstName);
    await (await this.el("checkout-last-name")).setValue(d.lastName);
    await (await this.el("checkout-postal-code")).setValue(d.postalCode);
  }

  continue()     { return this.click("continue-to-summary"); }
  previewTotal() { return this.money("preview-total"); }
  backToCart()   { return this.click("back-to-cart"); }

  // ---- Step 2: order summary ----
  summaryShown(timeout = 10000) { return this.isShown("checkout-summary-page", timeout); }

  async waitForSummary() {
    if (!(await this.summaryShown())) throw new Error("Order summary page did not appear");
  }

  async summaryItems(): Promise<SummaryItem[]> {
    return waitForStable(async () => {
      const rows = await allElements(byTest("checkout-item"));
      const ids: string[] = [];
      for (const row of rows) ids.push((await row.getAttribute("id")).replace("checkout-item-", ""));
 
      const items: SummaryItem[] = [];
      for (const id of ids) {
        const qtyText = await this.textById(`checkout-item-qty-${id}`); // "Qty: 1 × $44.99"
        const m = qtyText.match(/Qty:\s*(\d+)\s*[×x]\s*\$([\d.,]+)/);
        if (!m) throw new Error(`Unexpected quantity text: "${qtyText}"`);
        items.push({
          id,
          name: await this.textById(`checkout-item-name-${id}`),
          qty: Number(m[1]),
          unitPrice: parseMoney(m[2]),
          subtotal: parseMoney(await this.textById(`checkout-item-subtotal-${id}`)),
        });
      }
      return items;
    });
  }

  shippingInfo() { return this.text("shipping-info"); }
  subtotal()     { return this.money("checkout-subtotal"); }
  tax()          { return this.money("checkout-tax"); }
  total()        { return this.money("checkout-total"); }
  backToForm()   { return this.click("back-to-form"); }
  finish()       { return this.click("finish-button"); }

  // ---- Step 3: confirmation ----
  async waitForSuccess() {
    if (!(await this.isShown("checkout-success-page", 10000))) throw new Error("Order confirmation page did not appear");
  }
  successTitle()   { return this.text("checkout-success-title"); }
  successMessage() { return this.text("checkout-success-message"); }
  backToHome()     { return this.click("back-to-home"); }

  /** Complete the shipping form and land on the summary page. */
  async submitShipping(d: { firstName: string; lastName: string; postalCode: string }) {
    await this.fillShipping(d);
    await this.continue();
    await this.waitForSummary();
  }
}

export default new CheckoutPage();

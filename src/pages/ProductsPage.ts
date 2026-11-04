import { $, browser } from "@wdio/globals";
import BasePage from "./BasePage";
import { byTest, parseMoney, waitForStable, allElements } from "../utils/helpers";
import { log } from "../utils/logger";
 
export interface CardSnapshot {
  id: string;
  name: string;
  price: number;
  imageSig: string;   // fingerprint of the product image markup / src
  imageWidth: number; // rendered width in px (0 = not rendered / broken)
}
 
class ProductsPage extends BasePage {
  isLoaded() {
    return this.el("inventory-container").waitForDisplayed({ timeout: 10000 });
  }
 
  // ---- reading the list (stable reads survive re-render after filter/sort) ----
  names = () =>
    waitForStable(async () =>
      Promise.all((await allElements(byTest("inventory-item-name"))).map((e) => e.getText()))
    );
 
  prices = () =>
    waitForStable(async () =>
      Promise.all(
        (await allElements(byTest("inventory-item-price"))).map(async (e) => parseMoney(await e.getText()))
      )
    );
 
  async count(): Promise<number> {
    return (await this.names()).length;
  }
 
  /** Name, price and image fingerprint of every card. */
  async snapshot(): Promise<CardSnapshot[]> {
    await this.names(); // make sure the list has finished rendering
    // NOTE: no named inner functions here - this callback is serialised and run in the browser.
    return browser.execute((cardSel: string) => {
      return Array.from(document.querySelectorAll(cardSel)).map((card) => {
        const nameEl = card.querySelector('[data-test="inventory-item-name"]');
        const priceEl = card.querySelector('[data-test="inventory-item-price"]');
        const media = card.querySelector("a svg, a img");
        let sig = "";
        let width = 0;
        if (media) {
          if (media.tagName === "IMG") {
            const img = media as HTMLImageElement;
            sig = img.currentSrc;
            width = img.naturalWidth;
          } else {
            sig = media.outerHTML;
            width = media.getBoundingClientRect().width;
          }
        }
        let hash = 5381;
        for (let i = 0; i < sig.length; i++) {
          hash = ((hash * 33) ^ sig.charCodeAt(i)) >>> 0;
        }
        return {
          id: (card.getAttribute("data-test-item-id") || "").replace("inventory-item-", ""),
          name: nameEl && nameEl.textContent ? nameEl.textContent.trim() : "",
          price: Number((priceEl && priceEl.textContent ? priceEl.textContent : "").replace(/[^0-9.]/g, "")),
          imageSig: hash + ":" + sig.length,
          imageWidth: width,
        };
      });
    }, byTest("inventory-item")) as Promise<CardSnapshot[]>;
  }
 
  // ---- filter / sort ----
  async filterBy(category: string) {
    log.step(`Filter: ${category}`);
    await (await this.el("filter-category")).selectByAttribute("value", category);
  }
 
  async sortBy(option: string) {
    log.step(`Sort: ${option}`);
    await (await this.el("sort-select")).selectByAttribute("value", option);
  }
 
  // ---- cart actions ----
  /** Use the card's quantity stepper (qty-1 times), then click Add to Cart. */
  async addToCart(slug: string, qty = 1) {
    for (let i = 1; i < qty; i++) await this.click(`qty-increase-${slug}`);
    log.step(`Add ${slug} x${qty}`);
    await this.click(`add-to-cart-${slug}`);
  }
 
  /** Same as addToCart but throws if the overload banner appears (the button still looks successful). */
  async addToCartOrFail(slug: string, qty = 1) {
    await this.addToCart(slug, qty);
    if (await this.overloadShown()) {
      throw new Error(`Overload banner after adding ${slug} x${qty}: ${await this.overloadText()}`);
    }
  }
 
  async openCart() {
    await this.dismissOverload();
    await this.click("nav-cart");
  }
 
  /** 0 when the badge is not rendered (empty cart). */
  async badgeCount(): Promise<number> {
    const badge = await this.el("cart-badge");
    if (!(await badge.isExisting())) return 0;
    return Number((await badge.getText()).trim());
  }
 
  async waitForBadge(expected: number) {
    let last = -1;
    await browser
      .waitUntil(async () => { last = await this.badgeCount(); return last === expected; }, { timeout: 5000 })
      .catch(() => { throw new Error(`Cart badge expected ${expected} but showed ${last}`); });
  }
 
  /** Logout has no data-test attribute, so it is located by its visible text. */
  async logout() {
    const button = await $("button=Logout");
    await button.waitForClickable({ timeout: 10000 });
    await button.click();
  }
}
 
export default new ProductsPage();
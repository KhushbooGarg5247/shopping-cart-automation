import { browser } from "@wdio/globals";
import LoginPage from "../pages/LoginPage";
import ProductsPage from "../pages/ProductsPage";
import { USERS } from "../data/users";
import type { CartPick } from "../data/scenarios";
import { log } from "./logger";

/** Clear cookies and web storage so every test starts logged out with an empty cart. */
export async function freshSession() {
  await browser.url("/");
  await browser.deleteCookies();
  try {
    await browser.execute(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  } catch (e) {
    log.warn(`Could not clear web storage: ${(e as Error).message}`);
  }
}

export async function loginAs(username: string = USERS.shopper.username) {
  await freshSession();
  await LoginPage.open();
  await LoginPage.login(username);
  await ProductsPage.isLoaded();
}

/** Adds the picks; fails fast (at the right line) if the overload banner appears. */
export async function buildCart(picks: CartPick[]) {
  for (const p of picks) await ProductsPage.addToCartOrFail(p.slug, p.qty);
}

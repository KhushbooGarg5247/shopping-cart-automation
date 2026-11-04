import { expect } from "@wdio/globals";
import ProductsPage from "../pages/ProductsPage";
import CartPage from "../pages/CartPage";
import { loginAs } from "../utils/session";
import { LOGGABLE_USERS } from "../data/users";
import { bySlug } from "../data/products";

/**
 * KNOWN DEFECT (BUG-003). Asserts the CORRECT behaviour; expected to FAIL until the app is fixed.
 */
describe("Known defect: Bolt T-Shirt cannot be added to the cart", () => {
  const bolt = bySlug("bolt-t-shirt");

  for (const u of LOGGABLE_USERS) {
    it(`TC-B4: ${u.label} (${u.username}) can add the Bolt T-Shirt to the cart`, async () => {
      await loginAs(u.username);
      await ProductsPage.addToCart(bolt.slug);

      await ProductsPage.openCart();
      expect(await CartPage.isEmpty()).toBe(false);
      const lines = await CartPage.lines();
      const line = lines.find((l) => l.id === bolt.id);
      expect(line).toBeDefined();
      expect(line!.name).toBe(bolt.name);
      expect(line!.qty).toBe(1);
      expect(line!.lineTotal).toBeCloseTo(bolt.price, 2);
    });
  }
});

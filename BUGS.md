# Bug Reports

**Application:** https://qa-task--oyettijon.replit.app (Morrow Supply practice store)
**Browser:** Chrome 156 on macOS, desktop viewport
**Accounts:** `fern_signal` (Shopper), `lens_warp` (Image variation), `count_echo` (Cart badge), password `test_sauce`. `quiet_lock` is the intentionally locked account and behaves correctly.

## Summary

| ID | Title | Severity | Accounts affected | Automated test |
|---|---|---|---|---|
| BUG-001 | "System overload" error on the 7th Add to Cart click for the same product | High | All tested | `overload.spec.ts` TC-B2 |
| BUG-002 | Add to Cart shows a success state while the failure banner is displayed | Medium | Same as BUG-001 | Manual |
| BUG-003 | Bolt T-Shirt cannot be added to the cart (cart stays empty) | High | fern_signal, lens_warp, count_echo | `defects.spec.ts` TC-B4 (x3) |
| BUG-004 | Cart badge is one higher than the real cart contents | High | count_echo | `accounts.spec.ts` TC-A0, A2, A3 |
| BUG-005 | "Price: High to Low" sorts in ascending order | Medium | fern_signal, lens_warp, count_echo | `products.spec.ts` TC-P4, `accounts.spec.ts` TC-A5 (x3) |
| BUG-006 | lens_warp shows the wrong picture on every product (pictures shuffled) | Medium | lens_warp | `accounts.spec.ts` TC-A1, TC-A4 |

Tests that assert the correct behaviour fail until the bug is fixed. They are expected failures.

---

## BUG-001 - "System overload" error on the 7th Add to Cart click for the same product

**Severity:** High  **Priority:** High  **Component:** Products / Cart

**Steps to reproduce**
1. Log in as `fern_signal` with an empty cart.
2. On the products page click Add to Cart on one product (e.g. Nightline Safety Light).
3. Open the cart and remove that item, then return to the store.
4. Repeat steps 2 and 3. On the 7th Add to Cart click the error appears.
(Same result without removing: clicking Add to Cart on one product 7 times in a row.)

**Expected result:** The item is added every time. The cart never holds more than 1 unit here, and no limit is documented.

**Actual result:** A red banner appears at the top of the page: "Error: System overload - item interaction limit exceeded for this session. Please refresh the page to continue." Other products can still be added while it is showing.

**Automated evidence:** `overload.spec.ts` TC-B2 (add and remove one product in a loop) fails on **add #7**. TC-B3 shows the banner after 8 Add to Cart clicks on one product while a different product still adds normally.

**Notes**
* The limit counts Add to Cart clicks per product for the whole session, not the quantity in the cart: it triggers even though the cart is empty after each removal.
* It counts clicks, not units: TC-B1 (stepper set to 4, one click, remove 2, stepper set to 3, one click) used only 2 clicks and did not trigger it.
* The message blames the system and the session, and a page refresh is not a sensible instruction for a normal purchase.

---

## BUG-002 - Add to Cart shows a success state while the failure banner is displayed

**Severity:** Medium  **Priority:** Medium  **Component:** Products

**Steps to reproduce:** As BUG-001, at the moment the banner appears.

**Expected result:** If the item is not added, the button does not show a success state.

**Actual result:** The Add to Cart button shows its success state while the red banner reports an error. The UI contradicts itself, so a user cannot tell whether the item was added.

**Notes:** Found by manual testing and not yet automated.

---

## BUG-003 - Bolt T-Shirt cannot be added to the cart

**Severity:** High  **Priority:** High  **Component:** Products / Cart

**Steps to reproduce**
1. Log in with any working account (reproduced with `fern_signal`, `lens_warp` and `count_echo`) on a fresh session with an empty cart.
2. Find "Bolt T-Shirt" ($15.99) on the products page.
3. Click Add to Cart.
4. Open the cart.

**Expected result:** The item is added: the cart badge increases and the cart shows Bolt T-Shirt at $15.99, quantity 1.

**Actual result:** Clicking Add to Cart does nothing: there is no visible change and no error message. Opening the cart afterwards shows "Your cart is empty".

**Automated evidence:** `defects.spec.ts` TC-B4 fails for all three accounts: the cart is empty after the click.

**Notes:** All other products add normally; the Side Quest Tee ($15.99, same price) works. The failure is silent, so a user gets no indication that the item was not added.

---

## BUG-004 - Cart badge is one higher than the real cart contents

**Severity:** High  **Priority:** High  **Component:** Header cart badge

**Steps to reproduce**
1. Log in as `count_echo` in a new session with an empty cart.
2. Look at the cart badge in the header, then open the cart.
3. Return to the store, add one product, and check the badge.
4. Open the cart and increase that item to 2 units, then check the badge.

**Expected result:** No badge at login and an empty cart. After adding 1 unit the badge shows 1 (or the number of cart lines); with 2 units it matches the cart.

**Actual result:**
* Immediately after login the badge shows **1** while the cart page says "Your cart is empty".
* After adding one product the badge never shows 1.
* With 2 units of one product in the cart the badge shows **3**.
The badge is consistently one higher than the real contents, as if a phantom item were counted.

**Automated evidence:** `accounts.spec.ts` TC-A0 (badge 1, expected 0), TC-A2 (badge never reaches 1), TC-A3 (badge 3 with 2 units in the cart) fail for `count_echo` and pass for `fern_signal` and `lens_warp`.

---

## BUG-005 - "Price: High to Low" sorts in ascending order

**Severity:** Medium  **Priority:** Medium  **Component:** Products

**Steps to reproduce**
1. Log in as any account.
2. Choose "Price: High to Low" in the sort dropdown.

**Expected result:** 49.99, 44.99, 29.99, 24.99, 15.99, 15.99, 14.99, 12.99, 9.99, 8.99, 7.99, 4.99.

**Actual result:** 4.99, 7.99, 8.99, 9.99, 12.99, 14.99, 15.99, 15.99, 24.99, 29.99, 44.99, 49.99, which is the same as "Price: Low to High".

**Automated evidence:** `products.spec.ts` TC-P4 `price-high` and `accounts.spec.ts` TC-A5 fail on all three accounts. Name A-Z, Name Z-A and Price Low to High pass.

---

## BUG-006 - lens_warp shows the wrong picture on every product

**Severity:** Medium  **Priority:** Medium  **Component:** Products

**Steps to reproduce**
1. Log in as `lens_warp` and look at the product list.
2. Compare each card's picture with the product name.
3. Choose each category in the filter (Apparel, Accessories, Gear, Books) and check again.
4. Log in as `fern_signal` and compare the same products.

**Expected result:** Every product shows its own picture, the same for every account, with and without a category filter.

**Actual result:** For `lens_warp` all 12 products show another product's picture. The 12 pictures are shuffled among the products, with none missing and none duplicated:

| Product on `lens_warp` | Picture shown |
|---|---|
| After Hours Hoodie | Daybreak Ceramic Mug |
| Bolt T-Shirt | Nightline Safety Light |
| Branch Point Decals | Gridline Journal |
| Bug Hunt Crew Socks | Signal Path Field Guide |
| Daybreak Ceramic Mug | Side Quest Tee |
| Gridline Journal | After Hours Hoodie |
| Little Trek Bodysuit | Summit Fleece |
| Nightline Safety Light | Trailmark Day Pack |
| Side Quest Tee | Little Trek Bodysuit |
| Signal Path Field Guide | Branch Point Decals |
| Summit Fleece | Bolt T-Shirt |
| Trailmark Day Pack | Bug Hunt Crew Socks |

The same wrong pictures appear on the unfiltered list and under every category filter. `fern_signal` and `count_echo` show the correct pictures, identical to each other.

**Automated evidence:** `accounts.spec.ts` TC-A1 (all 12 images differ from the baseline) and TC-A4 (all 12 differ under each category filter) fail for `lens_warp` and pass for the other two accounts.

**Impact:** A customer could buy the wrong product, because the picture does not match the name or price.

---

## Verified working (no defect found)

* **Login:** all four accounts, the practice-account buttons, wrong password, unknown user, empty credentials, show/hide password, logout, and the locked-out message for `quiet_lock` (13 of 13 tests).
* **Cart:** empty state, Continue Shopping, names, unit prices, quantities and line totals, (+) and (-), remove, singular/plural title, and subtotal + 8% tax = total across 5 pricing scenarios (12 of 12).
* **Checkout:** order preview, order summary items and totals, shipping details, order confirmation, cart emptied afterwards, empty shipping form blocked, back navigation (8 of 8).
* **Products:** total count (12), all category filters (5 Apparel, 4 Accessories, 2 Gear, 1 Books), and the sorts Name A-Z, Name Z-A and Price Low to High.
* **Mobile (390x844 emulation):** login, filter, price sort, cart totals and a full checkout all passed.

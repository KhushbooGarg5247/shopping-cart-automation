# Bug Reports

Environment for all tickets: https://qa-task--oyettijon.replit.app, desktop Chrome.
Practice password for all accounts: `test_sauce`.
Automated evidence is listed per ticket; tests that assert the correct behaviour fail until the bug is fixed.

| ID | Title | Severity | Accounts | Automated test |
|---|---|---|---|---|
| BUG-001 | "System overload" error after repeated add/remove of the same product | High | Seen on all tested accounts | TC-B1, TC-B2, TC-B3 |
| BUG-002 | Add to Cart shows success while the failure banner is displayed | Medium | Same as BUG-001 | (manual; see ticket) |
| BUG-003 | Bolt T-Shirt cannot be added to the cart | High | fern_signal, lens_warp, count_echo | TC-B4 |
| BUG-004 | Cart badge shows an item but the cart is empty after login | High | count_echo | TC-A0 |
| BUG-005 | Sort "Price: High to Low" does not order the products correctly | Medium | fern_signal, lens_warp (check count_echo) | TC-P4, TC-A5 |
| BUG-006 | Wrong product pictures when filtering by category | Medium | lens_warp | TC-A4, TC-A1 |

---

## BUG-001 - "System overload" error after repeated add/remove of the same product

**Severity:** High  **Component:** Cart / Products

**Steps to reproduce**
1. Log in as `fern_signal`.
2. Add 6 units of one product (e.g. Trailmark Day Pack), then try a 7th unit.
   Alternative path: add 4 units, open the cart, remove some, return to the store and add more.

**Expected:** Units are added. The cart holds only a few units and no limit is documented.

**Actual:** A red banner appears: "Error: System overload - item interaction limit exceeded for this session. Please refresh the page to continue." Other products can still be added.

**Notes**
* The counter appears to be cumulative per item rather than the quantity currently in the cart: it triggers with only 4 units in the cart.
* The wording blames the system and the session, and a refresh is not a sensible instruction for a normal purchase.

---

## BUG-002 - Add to Cart shows a success state while the failure banner is displayed

**Severity:** Medium  **Component:** Products

**Steps to reproduce:** As BUG-001, at the moment the banner appears.

**Expected:** If adding fails, the button does not show success.

**Actual:** The Add to Cart button shows its success state while the red banner reports an error. The UI contradicts itself, so the user cannot tell whether the item was added.

---

## BUG-003 - Bolt T-Shirt cannot be added to the cart

**Severity:** High  **Component:** Products / Cart

**Steps to reproduce**
1. Log in (reproduced with `fern_signal`, `lens_warp` and `count_echo`).
2. On the product list find "Bolt T-Shirt" ($15.99).
3. Click Add to Cart.

**Expected:** The item is added; the cart badge increases and the item appears in the cart.

**Actual:** The item cannot be added to the cart.

**Notes:** Other products add normally. Record what the button and badge do on click, and whether the quantity stepper changes anything. The similarly priced Side Quest Tee ($15.99) can be used for comparison.

---

## BUG-004 - Cart badge shows an item but the cart is empty after login

**Severity:** High  **Component:** Header cart badge / Cart

**Steps to reproduce**
1. Log in as `count_echo` with a new session and an empty cart.
2. Look at the cart badge in the header.
3. Open the cart.

**Expected:** No badge is shown and the cart is empty, or the badge matches the cart contents.

**Actual:** The badge shows an item, but the cart page says the cart is empty. The badge and cart disagree.

**Notes:** Does not happen on `fern_signal`. Record the badge number shown.

---

## BUG-005 - Sort "Price: High to Low" does not order the products correctly

**Severity:** Medium  **Component:** Products

**Steps to reproduce**
1. Log in as `fern_signal` (also reproduced with `lens_warp`; check `count_echo`).
2. Choose "Price: High to Low" in the sort dropdown.

**Expected:** Highest price first: $49.99, $44.99, $29.99, $24.99, $15.99, $15.99, $14.99, $12.99, $9.99, $8.99, $7.99, $4.99.

**Actual:** The list is not in descending price order. Record the order you see (first few prices) here.

**Notes:** Confirm "Price: Low to High" and the name sorts are correct.

---

## BUG-006 - Wrong product pictures when filtering by category

**Severity:** Medium  **Component:** Products

**Steps to reproduce**
1. Log in as `lens_warp` ("Image variation").
2. Choose a category in the filter (list which categories are affected).
3. Compare the pictures with the same products under `fern_signal`.

**Expected:** Each product shows its own picture, identical across accounts and filters.

**Actual:** Some products show the wrong picture. Record which product shows which picture.

**Notes:** Not reproduced with `fern_signal`.

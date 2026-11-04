# Morrow Supply - Shopping Cart Automation

End-to-end UI tests for https://qa-task--oyettijon.replit.app, written with **WebdriverIO + TypeScript + Mocha** on the **Page Object Model**.

Bug tickets are in [BUGS.md](./BUGS.md).

## Setup

Requirements: **Node 22 LTS** (Node 26 breaks the WebdriverIO session request) and Google Chrome.

```bash
npm install            # or: npm ci
npm run wdio           # whole suite: desktop run + mobile-emulation run
```

Run a single spec:

```bash
npx wdio run ./wdio.conf.ts --spec src/specs/cart.spec.ts
```

Failure screenshots are saved to `./screenshots`.

**ChromeDriver (optional):** WebdriverIO downloads a matching driver itself. If that download fails on your machine, install ChromeDriver manually and point to it:

```bash
CHROMEDRIVER_PATH=/path/to/chromedriver npm run wdio
```

**Managed work laptops:** if you see `DevTools remote debugging is disallowed by the system admin`, an IT policy blocks WebDriver. Run on an unmanaged machine.

## Design

| Concern | Approach |
|---|---|
| Framework design | Page Object Model: `BasePage` -> `LoginPage`, `ProductsPage`, `CartPage`, `CheckoutPage`. Specs contain no selectors. |
| Locators | The app's stable `data-test` attributes through one `byTest()` helper. Elements whose `data-test` has no item number (cart and checkout line items) are found by `id`. The only text-based locator is Logout, which has no attribute. |
| Code quality / DRY | Shared `BasePage` actions; `helpers.ts` (money parsing, expected totals, stable reads, plain-array wrapper for `$$`); `session.ts` (clean login, cart builder); data-driven loops over accounts, categories, sorts and pricing scenarios. |
| Resiliency | No hard sleeps. Explicit waits (`waitForClickable`, `waitForDisplayed`, `waitUntil`) and `waitForStable` for list re-renders after filter or sort. Every test starts from a clean session (cookies and storage cleared, fresh login), so specs are independent. Parallelism is set by `maxInstances` in `wdio.conf.ts`. |
| Robustness | Test data in `src/data/`; expected totals calculated independently in integer cents (8% tax, half-up); descriptive timeout messages; `addToCartOrFail` fails at the real cause when the overload banner appears; step logger; screenshot on failure; mismatch lists (not first-failure-only) for image checks. |
| Mobile | A second Chrome capability uses device emulation (390x844 at 3x) and runs only `mobile.spec.ts`; the desktop capability excludes it. |

```
src/
  pages/   BasePage, LoginPage, ProductsPage, CartPage, CheckoutPage
  data/    users, products, scenarios, checkout
  utils/   helpers, logger, session
  specs/   login, products, cart, checkout, accounts, overload, defects, mobile
```

## Assumptions

* Product categories in `src/data/products.ts` were checked against the live filter: Apparel 5, Accessories 4, Gear 2, Books 1 (12 in total). Socks and the journal sit under Accessories on the site.
* Tax is 8% (the cart and checkout show "Tax (8%)"), rounded to the cent.
* The header badge may count units or distinct lines, so TC-C8 accepts either as long as it matches the cart.
* Because of BUG-003 the Bolt T-Shirt is excluded from the happy-path flows and covered only by TC-B4.

## Test cases

### Login (`login.spec.ts`)
| ID | Scenario | Steps | Expected |
|---|---|---|---|
| TC-L1 | Login with each practice account | Open login, enter account and `test_sauce`, click Login | `fern_signal`, `lens_warp`, `count_echo` reach the products page. `quiet_lock` stays on login and sees "Sorry, this user has been locked out." |
| TC-L2 | Practice-account buttons | Click each account button | Username and password fields are filled |
| TC-L3 | Wrong password | Valid user, wrong password | Error shown, still on login |
| TC-L4 | Unknown user | Login as `not_a_user` | Error shown, still on login |
| TC-L5 | Empty credentials | Click Login with blank fields | Not logged in |
| TC-L6 | Password toggle | Click the eye icon | Field type `password` -> `text` |
| TC-L7 | Logout | Login, click Logout | Login form shown |

### Products (`products.spec.ts`)
| ID | Scenario | Expected |
|---|---|---|
| TC-P1 | Total items | 12 items |
| TC-P2 | Filter by All / Apparel / Accessories / Gear / Books | Item names and count match the expected data for each category |
| TC-P3 | Category counts | The four categories add up to 12 |
| TC-P4 | Sort Name A-Z, Name Z-A, Price Low-High, Price High-Low | Correct order, no items added or lost |
| TC-P5 | Product data | Every product shows the expected name and price |

### Cart (`cart.spec.ts`)
| ID | Scenario | Expected |
|---|---|---|
| TC-C1 | Empty cart, then Continue Shopping | "Your cart is empty" and message; link returns to the store |
| TC-C2 | Add top, middle and bottom items, open the cart | Names, unit prices, quantities, line totals, subtotal, tax and total are correct |
| TC-C3 | (+) then (-) in the cart | Quantity, line total and order totals update each time |
| TC-C4 | (-) at quantity 1 | Item removed or stays at 1; never 0 or negative |
| TC-C5 | Remove an item | Remaining item and totals are correct |
| TC-C6 | Pricing scenarios (single item, top/middle/bottom, mixed quantities, three of one item, every product once) | Subtotal + 8% tax = total, matching an independent calculation |
| TC-C7 | Cart title wording | "1 item" and "2 items" |
| TC-C8 | Header badge | Consistent with the cart contents |

### Checkout (`checkout.spec.ts`)
| ID | Scenario | Expected |
|---|---|---|
| TC-K1 | Full order | "Order Placed!" and the success message |
| TC-K2 | Order preview total | Equals the cart total |
| TC-K3 | Summary items | Same items, quantities, unit prices and line totals |
| TC-K4 | Summary totals | Subtotal, 8% tax and total are correct |
| TC-K5 | Shipping info | Shows the name and postal code entered |
| TC-K6 | After ordering | Badge 0 and cart empty |
| TC-K7 | Empty shipping form | Cannot reach the summary |
| TC-K8 | Back navigation | Form and cart still intact |

### Per account (`accounts.spec.ts`, every account that can log in)
| ID | Scenario | Expected |
|---|---|---|
| TC-A0 | Fresh login | No badge, empty cart |
| TC-A1 | Names, prices and images vs the Shopper baseline | Identical, all images render |
| TC-A2 | Badge while adding 3 different products | 1, 2, 3 |
| TC-A3 | Badge after changing a quantity | Consistent with the cart |
| TC-A4 | Images while filtering by each category | Each product keeps its own picture |
| TC-A5 | Sort Price High-Low and Low-High | Prices in the correct order |

### Known defects (`overload.spec.ts`, `defects.spec.ts`)
| ID | Scenario | Expected |
|---|---|---|
| TC-B1 | Stepper to 4, add, remove 2, stepper to 3, add | No overload error, quantity 5 |
| TC-B2 | Add and remove one product 8 times | No overload error |
| TC-B3 | Overload banner showing, add a different product | The other product is added |
| TC-B4 | Add the Bolt T-Shirt (each account) | The item appears in the cart |

### Mobile (`mobile.spec.ts`, 390x844 emulation)
| ID | Scenario | Expected |
|---|---|---|
| TC-M0 | Viewport | Width of 500 px or less |
| TC-M1 | Login (locked and valid), no horizontal scroll | Same behaviour as desktop |
| TC-M2 | Filter Books | Correct count |
| TC-M3 | Sort Price Low-High | Ascending prices |
| TC-M4 | Cart quantity and totals | Correct, no horizontal scroll |
| TC-M5 | Full checkout | Order placed, totals correct |

## Results

Last run: everything passes except these tests, which assert the correct behaviour and fail because of the bugs in [BUGS.md](./BUGS.md).

| Failing test | Bug |
|---|---|
| TC-B2 (banner on the 7th Add to Cart click for one product) | BUG-001 |
| TC-B4 on all three accounts (Bolt T-Shirt cart stays empty) | BUG-003 |
| TC-A0, TC-A2, TC-A3 for `count_echo` (badge one too high) | BUG-004 |
| TC-P4 `price-high` and TC-A5 on all three accounts (High to Low sorts ascending) | BUG-005 |
| TC-A1, TC-A4 for `lens_warp` (pictures shuffled between products) | BUG-006 |

All login, cart, checkout and mobile tests pass. BUG-002 (success state shown beside the error banner) was found by manual testing.

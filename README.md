# Morrow Supply - Shopping Cart Automation

End-to-end UI tests for https://qa-task--oyettijon.replit.app using **WebdriverIO + TypeScript + Mocha**, built on the Page Object Model.

## Setup

```bash
npm install
npm run wdio                    # whole suite (desktop + mobile emulation)
npx wdio run ./wdio.conf.ts --spec src/specs/login.spec.ts   # one spec
```

Requires Node 20+ and Chrome. Failure screenshots are written to `./screenshots`.
If `npm install` fails with E401 on a corporate machine, use `npm install --registry=https://registry.npmjs.org/`.

> If `DevTools remote debugging is disallowed by the system admin` appears, your Chrome is managed by an
> IT policy that blocks WebDriver. Run on an unmanaged machine.

Before the first run delete the template's sample files: `src/specs/accessPage.ts` and `src/pages/storePage.ts`.

## Design

| Concern | Approach |
|---|---|
| Framework design | Page Object Model: `BasePage` -> `LoginPage`, `ProductsPage`, `CartPage`, `CheckoutPage`. Specs contain no selectors. |
| Locators | Only the app's stable `data-test` attributes (`byTest()` helper). One exception: Logout has no attribute and is found by its text. |
| Code quality / DRY | Shared `BasePage` actions, `helpers.ts` (money parsing, totals, stable reads), `session.ts` (login + cart builder), data-driven loops over users, categories, sorts and pricing scenarios. |
| Resiliency | No hard sleeps. Explicit waits (`waitForClickable`, `waitForDisplayed`, `waitUntil`) and `waitForStable` for list re-renders after filter/sort. Each test logs in from a clean session, so specs are independent and run in parallel (`maxInstances: 3`). One spec-file retry. |
| Robustness | Test data in `src/data/*`, independent expected-total calculation in integer cents (8% tax, half-up), descriptive timeout messages, `addToCartOrFail` fails at the real cause, step logger, screenshot on failure. |
| Mobile | A second Chrome capability uses mobile emulation (390x844 @3x) and runs only `mobile.spec.ts`; the desktop capability excludes it. |

```
src/
  pages/   BasePage, LoginPage, ProductsPage, CartPage, CheckoutPage
  data/    users, products, scenarios, checkout
  utils/   helpers, logger, session
  specs/   login, products, cart, checkout, accounts, overload, mobile
```

## Assumptions to verify on first run

* **Product categories** in `src/data/products.ts` are inferred from product names. Check each category in the live filter and correct the data before treating a TC-P2 failure as a bug.
* The login form is shown at `/` or `/login` for logged-out users.
* The header cart badge may count units or distinct lines; TC-C8 accepts either as long as it matches the cart.
* Tax is 8% (shown as "Tax (8%)").

## Test cases

### Login (`login.spec.ts`)
| ID | Scenario | Steps | Expected |
|---|---|---|---|
| TC-L1 | Login with each practice account | Open login, enter account + `test_sauce`, click Login | `fern_signal`, `lens_warp`, `count_echo` reach the products page. `quiet_lock` stays on login and sees "Sorry, this user has been locked out." |
| TC-L2 | Practice-account buttons | Click each account button | Username and password fields are filled |
| TC-L3 | Wrong password | Valid user, bad password | Error shown, still on login |
| TC-L4 | Unknown user | Login as `not_a_user` | Error shown, still on login |
| TC-L5 | Empty credentials | Click Login with blank fields | Not logged in |
| TC-L6 | Password toggle | Click eye icon | Field type `password` -> `text` |
| TC-L7 | Logout | Login, click Logout | Login form shown |

### Products (`products.spec.ts`)
| ID | Scenario | Expected |
|---|---|---|
| TC-P1 | Total items | 12 items |
| TC-P2 | Filter by All / Apparel / Accessories / Gear / Books | Item names and count match expected data for each category |
| TC-P3 | Category counts | Sum of the four categories = 12 |
| TC-P4 | Sort Name A-Z, Z-A, Price low-high, high-low | List order is correct, no items added or lost |
| TC-P5 | Product data | Every product shows the expected name and price |

### Cart (`cart.spec.ts`)
| ID | Scenario | Expected |
|---|---|---|
| TC-C1 | Empty cart, then Continue Shopping | "Your cart is empty" + message; link returns to the store |
| TC-C2 | Add top/middle/bottom items, open cart | Names, unit prices, quantities, line totals, subtotal, tax, total all correct |
| TC-C3 | (+) then (-) in the cart | Quantity, line total and order totals update each time |
| TC-C4 | (-) at quantity 1 | Item is removed or stays at 1; never 0 or negative |
| TC-C5 | Remove an item | Remaining item and totals correct |
| TC-C6 | Pricing scenarios (single item, mixed quantities, 3 of one item, every product) | Subtotal + 8% tax = total, matching an independent calculation |
| TC-C7 | Cart title wording | "1 item" / "2 items" |
| TC-C8 | Header badge | Matches the cart contents |

### Checkout (`checkout.spec.ts`)
| ID | Scenario | Expected |
|---|---|---|
| TC-K1 | Full order | "Order Placed!" and success message |
| TC-K2 | Order preview total | Equals the cart total |
| TC-K3 | Summary items | Same items, quantities, unit prices and line totals |
| TC-K4 | Summary totals | Subtotal, 8% tax, total correct |
| TC-K5 | Shipping info | Shows name and postal code entered |
| TC-K6 | After ordering | Badge 0 and cart empty |
| TC-K7 | Empty shipping form | Cannot proceed to the summary |
| TC-K8 | Back navigation | Form and cart still intact |

### Per-account (`accounts.spec.ts`) - runs for each account that can log in
| ID | Scenario | Expected |
|---|---|---|
| TC-A0 | Fresh login | No badge, empty cart |
| TC-A1 | Names, prices and images vs the Shopper baseline | Identical, all images render |
| TC-A4 | Images while filtering by each category | Each product keeps its own picture |
| TC-A5 | Sort Price high-low and low-high | Prices in correct order |
| TC-A2 | Badge while adding 3 products | 1, 2, 3 |
| TC-A3 | Badge after changing a quantity | Consistent with the cart |

### Known defects (`overload.spec.ts`, `defects.spec.ts`) - expected to fail until fixed
| ID | Scenario | Expected |
|---|---|---|
| TC-B1 | Add 4, remove 2, add 3 more of one item | No overload error; quantity 5 |
| TC-B2 | Add/remove one item 8 times | No overload error |
| TC-B3 | Overload banner showing, add a different item | Item is added |
| TC-B4 | Add the Bolt T-Shirt (each account) | Item appears in the cart |

### Mobile (`mobile.spec.ts`, 390x844)
| ID | Scenario | Expected |
|---|---|---|
| TC-M0 | Viewport | Width <= 500 px |
| TC-M1 | Login (locked + valid), no horizontal scroll | Behaves as on desktop |
| TC-M2 | Filter Books | Correct count |
| TC-M3 | Sort price low-high | Ascending prices |
| TC-M4 | Cart quantity and totals | Correct, no horizontal scroll |
| TC-M5 | Full checkout | Order placed, totals correct |

Bug tickets (BUG-001 to BUG-006) are in [BUGS.md](./BUGS.md). Because of BUG-003 the Bolt T-Shirt is excluded from the happy-path flows and covered only by TC-B4.
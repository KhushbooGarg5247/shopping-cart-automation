import { $$, browser } from "@wdio/globals";

/** `$$` returns a WebdriverIO array type; copy it into a plain array so map/Promise.all behave normally. */
export async function allElements(selector: string): Promise<WebdriverIO.Element[]> {
  const found = (await $$(selector)) as unknown as WebdriverIO.Element[];
  const list: WebdriverIO.Element[] = [];
  for (let i = 0; i < found.length; i++) list.push(found[i]);
  return list;
}

/** Locator for the app's `data-test` attribute. */
export const byTest = (name: string): string => `[data-test="${name}"]`;

/** "$1,234.50" -> 1234.5 ; "$4.99 each" -> 4.99 */
export const parseMoney = (text: string): number => Number(text.replace(/[^0-9.-]/g, ""));

export const TAX_RATE_PERCENT = 8;

const toCents = (dollars: number): number => Math.round(dollars * 100);

/**
 * Independent expected-total calculation. Done in integer cents (tax rounded half-up) so
 * floating point drift can never produce a false pass or false failure.
 */
export const expectedTotals = (unitPrices: number[]) => {
  const subtotalCents = unitPrices.reduce((sum, p) => sum + toCents(p), 0);
  const taxCents = Math.floor((subtotalCents * TAX_RATE_PERCENT + 50) / 100);
  return {
    subtotal: subtotalCents / 100,
    tax: taxCents / 100,
    total: (subtotalCents + taxCents) / 100,
  };
};

/** Expand {price, qty} entries into one unit price per unit. */
export const unitPricesOf = (picks: { price: number; qty: number }[]): number[] =>
  picks.flatMap((p) => Array<number>(p.qty).fill(p.price));

/**
 * Poll `read` until two consecutive reads are identical. Handles re-renders and
 * animations without hard-coded sleeps.
 */
export async function waitForStable<T>(read: () => Promise<T>, timeout = 8000): Promise<T> {
  let previous: string | undefined;
  let value: T | undefined;
  await browser.waitUntil(
    async () => {
      value = await read();
      const current = JSON.stringify(value);
      const stable = current === previous;
      previous = current;
      return stable;
    },
    { timeout, interval: 300, timeoutMsg: "Value did not stabilise" }
  );
  return value as T;
}

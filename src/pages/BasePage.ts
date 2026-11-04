import { browser, $ } from "@wdio/globals";
import { byTest, parseMoney } from "../utils/helpers";
import { log } from "../utils/logger";

const TIMEOUT = 10000;

/** Shared behaviour for every page object. All locators use the app's stable `data-test` attributes. */
export default class BasePage {
  protected el(testId: string) {
    return $(byTest(testId));
  }

  async open(path = "/") {
    log.step(`Open ${path}`);
    await browser.url(path);
  }

  protected async click(testId: string) {
    const element = await this.el(testId);
    await element.waitForClickable({ timeout: TIMEOUT, timeoutMsg: `"${testId}" was not clickable` });
    await element.click();
  }

  protected async text(testId: string): Promise<string> {
    const element = await this.el(testId);
    await element.waitForDisplayed({ timeout: TIMEOUT, timeoutMsg: `"${testId}" was not displayed` });
    return (await element.getText()).trim();
  }

  protected async money(testId: string): Promise<number> {
    return parseMoney(await this.text(testId));
  }

  /** timeout 0 = instant check; otherwise wait up to `timeout` ms for it to appear. */
  protected async isShown(testId: string, timeout = 0): Promise<boolean> {
    const element = await this.el(testId);
    if (timeout === 0) return element.isDisplayed();
    return element.waitForDisplayed({ timeout }).then(() => true).catch(() => false);
  }

  // ---- "System overload" error banner (fixed to the top of the viewport) ----
  overloadShown(timeout = 1500): Promise<boolean> {
    return this.isShown("overload-error-banner", timeout);
  }

  overloadText(): Promise<string> {
    return this.text("overload-error-banner");
  }

  /** The banner overlays the header, so close it before interacting with the nav. */
  async dismissOverload() {
    if (await this.isShown("overload-error-banner")) {
      log.warn("Overload banner visible - dismissing");
      await this.click("overload-error-close");
    }
  }
}

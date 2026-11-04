import { mkdirSync } from "node:fs";
import { browser } from "@wdio/globals";

const MOBILE_SPEC = "./src/specs/mobile.spec.ts";

export const config: WebdriverIO.Config = {
  runner: "local",
  tsConfigPath: "./tsconfig.json",

  // Only *.spec.ts files are tests. Page objects / data / utils are never picked up.
  specs: ["src/specs/**/*.spec.ts"],
  exclude: [],

  // Parallel workers. Every spec file gets its own browser session and every test logs in
  // from a clean state, so specs are independent. If the app's "overload" counter turns out
  // to be tracked server-side per account, lower this to 1.
  maxInstances: 3,

  capabilities: [
    {
      // Desktop run: everything except the mobile spec
      browserName: "chrome",
      "wdio:exclude": [MOBILE_SPEC],
      "goog:chromeOptions": { args: ["--window-size=1366,900"] },
    },
    {
      // Mobile run: only the mobile spec, using Chrome's device emulation (390x844 @3x)
      browserName: "chrome",
      "wdio:specs": [MOBILE_SPEC],
      "goog:chromeOptions": {
        mobileEmulation: {
          deviceMetrics: { width: 390, height: 844, pixelRatio: 3 },
          userAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        },
      },
    },
  ],

  logLevel: "warn",
  bail: 0,
  baseUrl: "https://qa-task--oyettijon.replit.app",
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: "mocha",
  // Re-run a whole spec file once if it fails (guards against one-off environment flakiness)
  specFileRetries: 1,
  specFileRetriesDelay: 2,
  reporters: ["spec"],
  mochaOpts: { ui: "bdd", timeout: 60000 },

  onPrepare: function () {
    mkdirSync("./screenshots", { recursive: true });
  },

  afterTest: async function (test, _context, { passed }) {
    if (passed) return;
    const name = `${test.title}`.replace(/[^a-z0-9]+/gi, "_").slice(0, 100);
    await browser.saveScreenshot(`./screenshots/${name}_${Date.now()}.png`);
  },
};

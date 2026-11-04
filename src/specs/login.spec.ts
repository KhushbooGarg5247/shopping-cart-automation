import { expect } from "@wdio/globals";
import LoginPage from "../pages/LoginPage";
import ProductsPage from "../pages/ProductsPage";
import { freshSession } from "../utils/session";
import { ALL_USERS, USERS, PASSWORD, LOCKED_MESSAGE } from "../data/users";

describe("Login", () => {
  beforeEach(async () => {
    await freshSession();
    await LoginPage.open();
  });

  for (const u of ALL_USERS) {
    it(`TC-L1: ${u.label} (${u.username}) ${u.shouldLogin ? "can" : "cannot"} log in`, async () => {
      await LoginPage.login(u.username);
      if (u.shouldLogin) {
        await ProductsPage.isLoaded();
      } else {
        expect(await LoginPage.hasError()).toBe(true);
        expect(await LoginPage.errorText()).toContain(LOCKED_MESSAGE);
        expect(await LoginPage.isOnLoginForm()).toBe(true);
      }
    });
  }

  for (const u of ALL_USERS) {
    it(`TC-L2: practice-account button fills credentials for ${u.username}`, async () => {
      await LoginPage.useHint(u.username);
      expect(await LoginPage.filledCredentials()).toEqual({ username: u.username, password: PASSWORD });
    });
  }

  it("TC-L3: a wrong password is rejected", async () => {
    await LoginPage.login(USERS.shopper.username, "wrong_password");
    expect(await LoginPage.hasError()).toBe(true);
    expect(await LoginPage.isOnLoginForm()).toBe(true);
  });

  it("TC-L4: an unknown user is rejected", async () => {
    await LoginPage.login("not_a_user");
    expect(await LoginPage.hasError()).toBe(true);
    expect(await LoginPage.isOnLoginForm()).toBe(true);
  });

  it("TC-L5: empty credentials do not log the user in", async () => {
    await LoginPage.login("", "");
    expect(await LoginPage.isOnLoginForm()).toBe(true);
  });

  it("TC-L6: the show/hide password toggle changes the field type", async () => {
    expect(await LoginPage.passwordFieldType()).toBe("password");
    await LoginPage.togglePasswordVisibility();
    expect(await LoginPage.passwordFieldType()).toBe("text");
  });

  it("TC-L7: logout returns the user to the login form", async () => {
    await LoginPage.login(USERS.shopper.username);
    await ProductsPage.isLoaded();
    await ProductsPage.logout();
    expect(await LoginPage.isOnLoginForm()).toBe(true);
  });
});

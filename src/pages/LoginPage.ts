import BasePage from "./BasePage";
import { PASSWORD } from "../data/users";
import { log } from "../utils/logger";

class LoginPage extends BasePage {
  /** The login form is shown to logged-out users; try "/" first, then "/login". */
  async open() {
    for (const path of ["/", "/login"]) {
      await super.open(path);
      if (await this.isShown("login-form", 3000)) return;
    }
    throw new Error('Login form not found at "/" or "/login"');
  }

  async login(user: string, password: string = PASSWORD) {
    log.step(`Login as "${user}"`);
    const username = await this.el("username");
    const pass = await this.el("password");
    await username.setValue(user);
    await pass.setValue(password);
    await this.click("login-button");
  }

  async useHint(user: string) {
    await this.click(`hint-user-${user}`);
  }

  async filledCredentials() {
    return {
      username: await (await this.el("username")).getValue(),
      password: await (await this.el("password")).getValue(),
    };
  }

  async togglePasswordVisibility() {
    await this.click("toggle-password-visibility");
  }

  async passwordFieldType(): Promise<string> {
    return (await (await this.el("password")).getAttribute("type")) ?? "";
  }

  isOnLoginForm() { return this.isShown("login-form"); }
  hasError()      { return this.isShown("login-error-message", 3000); }
  errorText()     { return this.text("login-error-message"); }
}

export default new LoginPage();

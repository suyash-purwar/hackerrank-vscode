import * as vscode from "vscode";

export default class Authentication {
  constructor() {}

  static async isLoggedIn() {
    // TODO: Check Config files
    return {
      status: true,
      userCredentials: {
        hacker_id: 1234,
        x_csrf_token: "csrf token",
        hrank_session: "session token",
        hacker_name: "Adeeba",
      },
    };
  }

  static async login() {
    try {
      const email = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        title: "Email Address:",
        prompt: "Enter your email address",
      });
      const password = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        title: "Password",
        prompt: "Enter your password",
        password: true,
      });

      // TODO: Make a call to API
      console.log(email, password);
      return false;
    } catch (e) {}
  }
}

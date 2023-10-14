import * as vscode from "vscode";
import Database from "./Database";
import Hackerrank from "./Hackerrank";
import ISession from "./interface/Session";

export default class Authentication {
  constructor() {}

  static async isLoggedIn() {
    const session = await Database.getSession();

    return session?.csrf_token && session?.hackerrank_cookie;
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

      const session = await Hackerrank.login(
        email as string,
        password as string
      );

      await Database.saveSession(session as ISession);
      console.log(email, password);
      return false;
    } catch (e) {}
  }
}

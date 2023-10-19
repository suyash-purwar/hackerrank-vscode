import * as vscode from "vscode";
import Database from "./Database";
import Hackerrank from "./Hackerrank";
import ChallengeProvider from "./ChallengesProvider";
import ISession from "./interface/Session";

export default class Authentication {
  constructor() {}

  static async isLoggedIn() {
    await Database.getSession();

    return process.env.CSRF_TOKEN && process.env.HACKERRANK_COOKIE;
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

      if (session) {
        await Database.saveSession(session as ISession);
        ChallengeProvider.loadMainTree();
      }
      return false;
    } catch (e: any) {
      switch (e.message) {
        case "AUTHENTICATION_FAILED":
          await vscode.window.showErrorMessage(
            "User authentication failed. Make sure your credentails are correct."
          );
          break;
        default:
          await vscode.window.showErrorMessage(
            "Seems like you are disconnected from internet."
          );
          break;
      }
    }
  }
}

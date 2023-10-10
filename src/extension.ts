import * as vscode from "vscode";

import Authenticate from "./modules/Authentication";
import ChallengeProvider from "./modules/ChallengesProvider";

export function activate(context: vscode.ExtensionContext) {
  const loggedIn = false;
  if (loggedIn) {
    vscode.window.registerTreeDataProvider(
      "challenges",
      new ChallengeProvider()
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("hackerrank-vscode.helloWorld", () => {
      vscode.window.showInformationMessage(
        "Hello World from hackerrank-vscode!"
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("hackerrank-vscode.signin", async () => {
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

      // Make a call to API
      console.log(email, password);
    })
  );
}

export function deactivate() {}

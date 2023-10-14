import * as vscode from "vscode";

import Authenticate from "./modules/Authentication";
import ChallengeProvider from "./modules/ChallengesProvider";

export async function activate(context: vscode.ExtensionContext) {
  // * Add subscriptions
  context.subscriptions.push(
    vscode.commands.registerCommand("hackerrank-vscode.helloWorld", () => {
      vscode.window.showInformationMessage(
        "Hello World from hackerrank-vscode!"
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "hackerrank-vscode.signin",
      Authenticate.login
    )
  );

  // * Check login status and show appropriate TreeView
  const authStatus = await Authenticate.isLoggedIn();

  if (authStatus) {
    ChallengeProvider.loadMainTree();
  }
}

export function deactivate() {}

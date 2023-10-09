import * as vscode from "vscode";

import Authenticate from "./modules/Authentication";
import ChallengeProvider from "./modules/ChallengesProvider";

export function activate(context: vscode.ExtensionContext) {
  vscode.window.registerTreeDataProvider("challenges", new Authenticate());

  let disposable = vscode.commands.registerCommand(
    "hackerrank-vscode.helloWorld",
    () => {
      vscode.window.showInformationMessage(
        "Hello World from hackerrank-vscode!"
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

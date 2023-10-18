import * as vscode from "vscode";

import Authenticate from "./modules/Authentication";
import ChallengeProvider from "./modules/ChallengesProvider";
import Challenge from "./modules/Challenge";

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
  // context.subscriptions.push(
  //   vscode.window.onDidChangeActiveTextEditor(async (activeTextEditor) => {
  //     console.log(activeTextEditor?.document.fileName);
  //     console.log(vscode.window.activeTextEditor?.document.fileName);
  //     console.log(vscode.window.visibleTextEditors[0].document.fileName);
  //     // let activeWebview = null;
  //     // Challenge.webviewPanesAndEditors.forEach((value, key) => {
  //     //   if (key.active) activeWebview = key;
  //     // });

  //     // if (!activeWebview && vscode.workspace.textDocuments.length === 0) {
  //     //   await Challenge.updateWebviewState(activeTextEditor?.document);
  //     // }
  //   })
  // );

  // context.subscriptions.push(
  //   vscode.window.onDidCloseTe((editors) => {
  //     console.log(editors);
  //   })
  // );

  // * Check login status and show appropriate TreeView
  const authStatus = await Authenticate.isLoggedIn();

  if (authStatus) {
    ChallengeProvider.loadMainTree();
  }
}

export function deactivate() {}

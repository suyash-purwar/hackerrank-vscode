import * as vscode from "vscode";
import * as fs from "node:fs/promises";

interface TChallenge {
  id: string;
  name: string;
  boilerplate: string;
}

export class Challenge {
  static getChallengeContent(challenge: TChallenge) {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${challenge.name}</title>
  </head>
  <body>
    <h1>${challenge.name}</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  </body>
</html>`;
  }

  static async renderChallenge(challengeId: string, challengeName: string) {
    const challengePane = vscode.window.createWebviewPanel(
      challengeId,
      challengeName,
      vscode.ViewColumn.Beside,
      {}
    );

    const challenge: TChallenge = {
      id: challengeId,
      name: challengeName,
      boilerplate: `#include<iostream>\nusing namespace std;\nint main() {\n\tcout << "Hello World" << endl;\n}`,
    };

    challengePane.webview.html = this.getChallengeContent(challenge);

    const url = `${process.env.HOME}/.hackerrank/users/12100435/solutions/${challengeName}.cpp`;

    await fs.writeFile(url, challenge.boilerplate);

    const codeEditor = await vscode.workspace.openTextDocument(
      vscode.Uri.file(url)
    );

    vscode.window.showTextDocument(codeEditor, {
      viewColumn: vscode.ViewColumn.Beside,
    });

    return challengePane;
  }
}

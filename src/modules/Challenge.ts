import * as vscode from "vscode";
import * as fs from "fs/promises";
import IChallenge from "./interface/Challenge";
import Hackerrank from "./Hackerrank";

export default class Challenge {
  static getChallengeContent(challenge: IChallenge) {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${challenge.name}</title>
    <style>
      body {
        border-left: 3px solid green;
      }
      h1 {
        font-size: 30px
      }
      code, svg, li, .highlight, p, pre {
        font-size: 16px;
      }
      li {
        margin: 5px 0;
      }
      pre {
        background-color: rgba(0, 0, 0, 0.4);
        padding: 10px;
        border-radius: 10px;
      }
      h1, h2, h3, h4, h5, h6, p, code, svg, li, .highlight, pre {
        color: white;
      }
      p, li {
        line-height: 1.7;
      }
    </style>
  </head>
  <body>
    <h1>${challenge.name}</h1>
    ${challenge.questionHtml}
  </body>
</html>`;
  }

  static async renderChallenge(challengeSlug: string) {
    const challenge = await Hackerrank.getChallenge(challengeSlug);
    if (!challenge) return;

    const challengePane = vscode.window.createWebviewPanel(
      challenge.id.toString(),
      challenge.name,
      vscode.ViewColumn.Beside,
      {}
    );

    // await fs.writeFile("page.html", challenge.questionHtml);
    challengePane.webview.html = this.getChallengeContent(challenge);

    // const url = `${process.env.HOME}/.hackerrank/users/12100435/solutions/${challengeName}.cpp`;

    // await fs.writeFile(url, challenge.boilerplate);

    // const codeEditor = await vscode.workspace.openTextDocument(
    //   vscode.Uri.file(url)
    // );

    // vscode.window.showTextDocument(codeEditor, {
    //   viewColumn: vscode.ViewColumn.Beside,
    // });

    return challengePane;
  }
}

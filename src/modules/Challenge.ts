import * as vscode from "vscode";
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
      h1 {
        font-size: 30px
      }
      p {
        font-size: 16px;
      }
      code {
        font-size: 15px;
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

    console.log(JSON.stringify(challenge.questionHtml));
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

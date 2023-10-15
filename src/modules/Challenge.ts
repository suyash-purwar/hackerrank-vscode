import * as vscode from "vscode";
import IChallenge from "./interface/Challenge";
import Hackerrank from "./Hackerrank";
import Language from "./Language";
import Database from "./Database";

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
        border-left: 3px solid #00EA64;
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
      .solve {
        font-size: 15px;
        border-radius: 5px;
        padding: 10px 25px;
        cursor: pointer;
        border: none;
        font-weight: 500;
        background-color: #00EA64;
      }
    </style>
  </head>
  <body>
    <h1>${challenge.name}</h1>
    <button class="solve" onclick="solve()">Solve</button>
    ${challenge.questionHtml}
    <script>
      const vscode = acquireVsCodeApi();
      function solve() {
        vscode.postMessage({
          event: 'solve',
          challengeSlug: "${challenge.slug}"
        });
      }
    </script>
  </body>
</html>`;
  }

  static async renderChallenge(challengeSlug: string, trackSlug: string) {
    const challenge = await Hackerrank.getChallenge(challengeSlug);
    if (!challenge) return;

    const challengePane = vscode.window.createWebviewPanel(
      challenge.id.toString(),
      challenge.name,
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
      }
    );

    challengePane.webview.html = this.getChallengeContent(challenge);

    challengePane.webview.onDidReceiveMessage(async (message) => {
      const languageChosen = await vscode.window.showQuickPick(
        challenge.languages.map((lang) => new Language(lang))
      );

      if (!languageChosen) return;

      let fileName = `${challenge.slug}-${languageChosen.value}${languageChosen.extension}`;
      let boilerplate =
        challenge.languagesBoilerplate[`${languageChosen.value}_template`];
      if (
        challenge.languagesBoilerplate[`${languageChosen.value}_template_head`]
      ) {
        boilerplate +=
          challenge.languagesBoilerplate[
            `${languageChosen.value}_template_head`
          ];
      }
      if (
        challenge.languagesBoilerplate[`${languageChosen.value}_template_tail`]
      ) {
        boilerplate +=
          challenge.languagesBoilerplate[
            `${languageChosen.value}_template_tail`
          ];
      }

      const url = await Database.createSolutionFile(
        fileName,
        trackSlug,
        boilerplate
      );

      const codeEditor = await vscode.workspace.openTextDocument(
        vscode.Uri.file(url)
      );

      vscode.window.showTextDocument(codeEditor, {
        viewColumn: vscode.ViewColumn.Beside,
      });
    });

    return challengePane;
  }
}

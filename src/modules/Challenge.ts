import * as vscode from "vscode";
import IChallenge from "./interface/Challenge";
import Hackerrank from "./Hackerrank";
import Language from "./Language";
import Database from "./Database";

export default class Challenge {
  static getChallengeContent(challenge: IChallenge) {
    // TODO: Migrate to Pug
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
      .btn {
        font-size: 15px;
        padding: 10px 25px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        border-radius: 3px;
      }
      .buttons::after {
        content: "";
        display: table;
        clear: both;
      }
      .solve {
        background-color: #00EA64;
      }
      .run {
        float: right;
        background-color: #F4F4F5;
        margin-right: 10px;
      }
      .submit {
        float: right;
        background-color: #00EA64;
      }
      .disable {
        cursor: not-allowed;
      }
    </style>
  </head>
  <body>
    <h1>${challenge.name}</h1>
    <div class="buttons">
      <button class="btn solve" onclick="solve()">Solve</button>
      <button class="btn submit disable" onclick="execute('submit')" disabled>Submit</button>
      <button class="btn run disable" onclick="execute('run')" disabled>Run</button>
    </div>
    ${challenge.questionHtml}
    <script>
      const vscode = acquireVsCodeApi();
      function solve() {
        vscode.postMessage({
          event: 'solve',
          challenge: ${JSON.stringify(challenge)}
        });
      }

      function execute(type) {
        vscode.postMessage({
          event: type,
          challenge: ${JSON.stringify(challenge)}
        });
      }
    </script>
  </body>
</html>`;
  }

  static async renderChallenge(challengeSlug: string) {
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

    challengePane.webview.onDidReceiveMessage(
      async (message) =>
        await this.handleMessageFromWebView(message, challengePane.webview)
    );

    return challengePane;
  }

  static async handleMessageFromWebView(message: any, webview: vscode.Webview) {
    let { event, challenge }: { event: string; challenge: IChallenge } =
      message;

    switch (event) {
      case "solve":
        /**
         * ! 'this' doesn't reference to the current class.
         * ! When the event is triggered, a new context is created and 'this' references to that.
         * ! Do not change to 'this.openEditor(challenge)'
         */
        await Challenge.openEditor(challenge);
        break;
      case "run":
        break;
      case "submit":
        break;
    }
  }

  static async openEditor(challenge: IChallenge) {
    const languageChosen = await vscode.window.showQuickPick(
      challenge.languages.map((lang) => new Language(lang))
    );

    if (!languageChosen) return;

    let fileName = `${challenge.slug}-${languageChosen.value}${languageChosen.extension}`;

    let url = await Database.fetchSolutionFile(
      fileName,
      challenge.trackSlug as string
    );

    if (!url) {
      let boilerplate = "";
      if (
        challenge.languagesBoilerplate[`${languageChosen.value}_template_head`]
      ) {
        boilerplate +=
          challenge.languagesBoilerplate[
            `${languageChosen.value}_template_head`
          ];
      }

      if (challenge.languagesBoilerplate[`${languageChosen.value}_template`]) {
        boilerplate +=
          challenge.languagesBoilerplate[`${languageChosen.value}_template`];
      } else {
        boilerplate += languageChosen.default_boilerplate;
      }

      if (
        challenge.languagesBoilerplate[`${languageChosen.value}_template_tail`]
      ) {
        boilerplate +=
          challenge.languagesBoilerplate[
            `${languageChosen.value}_template_tail`
          ];
      }

      url = await Database.createSolutionFile(
        fileName,
        challenge.trackSlug as string,
        boilerplate
      );
    }

    const codeEditor = await vscode.workspace.openTextDocument(
      vscode.Uri.file(url)
    );

    vscode.window.showTextDocument(codeEditor, {
      viewColumn: vscode.ViewColumn.Beside,
    });
  }
}

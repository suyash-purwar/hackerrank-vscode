import * as vscode from "vscode";
import * as ejs from "ejs";
import IChallenge from "./interface/Challenge";
import Hackerrank from "./Hackerrank";
import Language from "./Language";
import Database from "./Database";

interface IChallengeEditor {
  webviewPanel: vscode.WebviewPanel;
  editors: vscode.TextDocument[];
  data: IChallenge;
}

export default class Challenge {
  static challenges: Record<string, IChallengeEditor> = {};

  static async renderChallenge(challengeSlug: string, trackSlug: string) {
    const challengeData = await Hackerrank.getChallenge(challengeSlug);

    if (!challengeData) return;

    challengeData.trackSlug = trackSlug;

    const challengePane = vscode.window.createWebviewPanel(
      challengeData.slug,
      challengeData.name,
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
      }
    );

    this.challenges[challengeData.slug] = {
      webviewPanel: challengePane,
      editors: [],
      data: challengeData,
    };

    const challengeTemplatePath =
      "/media/suyash/HDD/realwork/hackerrank-vscode/src/templates/challenge.ejs";
    const challengeHtml = await ejs.renderFile(
      challengeTemplatePath,
      challengeData
    );

    challengePane.webview.html = challengeHtml;

    challengePane.webview.onDidReceiveMessage(
      async (message) => await this.handleMessageFromWebView(message)
    );

    return challengePane;
  }

  static async handleMessageFromWebView(message: any) {
    let { event, challengeSlug }: { event: string; challengeSlug: string } =
      message;

    switch (event) {
      case "solve":
        /**
         * ! 'this' doesn't reference to the current class.
         * ! When the event is triggered, a new context is created and 'this' references to that.
         * ! Do not change to 'this.openEditor(challenge)'
         */
        await Challenge.openEditor(this.challenges[challengeSlug]);
        break;
      case "run":
        await Challenge.runCode(this.challenges[challengeSlug]);
      case "submit":
        break;
    }
  }

  static async openEditor(challenge: IChallengeEditor) {
    const { data: challengeData, editors: challengeEditors } = challenge;
    const languageChosen = await vscode.window.showQuickPick(
      challengeData.languages.map((lang) => new Language(lang))
    );

    if (!languageChosen) return;

    let fileName = `${challengeData.slug}-${languageChosen.value}${languageChosen.extension}`;

    let url = await Database.fetchSolutionFileUrl(
      fileName,
      challenge.data.trackSlug as string
    );

    if (!url) {
      let boilerplate = "";
      if (
        challengeData.languagesBoilerplate[
          `${languageChosen.value}_template_head`
        ]
      ) {
        boilerplate +=
          challengeData.languagesBoilerplate[
            `${languageChosen.value}_template_head`
          ];
      }

      if (
        challengeData.languagesBoilerplate[`${languageChosen.value}_template`]
      ) {
        boilerplate +=
          challengeData.languagesBoilerplate[
            `${languageChosen.value}_template`
          ];
      } else {
        boilerplate += languageChosen.default_boilerplate;
      }

      if (
        challengeData.languagesBoilerplate[
          `${languageChosen.value}_template_tail`
        ]
      ) {
        boilerplate +=
          challengeData.languagesBoilerplate[
            `${languageChosen.value}_template_tail`
          ];
      }

      url = await Database.createSolutionFile(
        fileName,
        challengeData.trackSlug as string,
        boilerplate
      );
    }

    const codeEditor = await vscode.workspace.openTextDocument(
      vscode.Uri.file(url)
    );

    await vscode.window.showTextDocument(codeEditor, {
      viewColumn: vscode.ViewColumn.Beside,
    });

    challengeEditors.push(codeEditor);
  }

  static async runCode(challenge: IChallengeEditor) {
    const visibleEditors = vscode.window.visibleTextEditors;
    console.log(visibleEditors.length);

    if (!visibleEditors.length) {
      vscode.window.showErrorMessage(
        "Open the code file which you want execute."
      );
    }

    if (visibleEditors.length === 1) {
      if (challenge.editors.indexOf(visibleEditors[0].document) >= 0) {
        const solution = visibleEditors[0].document.getText();
        console.log(solution);
      } else {
        vscode.window.showErrorMessage(
          "Solution file not found. Make sure it is visible while clicking on the 'Run' button"
        );
      }
    }

    if (visibleEditors.length > 1) {
      const validEditors: vscode.TextEditor[] = [];
      for (let editor of visibleEditors) {
        if (challenge.editors.indexOf(editor.document) !== -1) {
          validEditors.push(editor);
        }
      }

      const chosenEditor = await vscode.window.showQuickPick(
        validEditors.map((editor) => {
          let indexOfLastForwardSlash =
            editor.document.fileName.lastIndexOf("/");
          let label = editor.document.fileName.slice(
            indexOfLastForwardSlash + 1
          );
          return {
            label,
            value: editor,
          };
        })
      );

      console.log(chosenEditor?.value.document.getText());
    }
  }

  // static async updateWebviewState(closedDocument?: vscode.TextDocument) {
  //   for (let [
  //     webviewPanel,
  //     associatedCodeEditors,
  //   ] of Object.entries(this.challenges)) {
  //     let indexOfClosedDocument = associatedCodeEditors.indexOf(
  //       closedDocument as vscode.TextDocument
  //     );
  //     if (indexOfClosedDocument !== -1) {
  //       webviewPanel.webview.postMessage({
  //         event: "enable",
  //       });
  //     } else {
  //       console.log("disable");
  //       webviewPanel.webview.postMessage({
  //         event: "disable",
  //       });
  //     }
  //   }
  // }
}

import * as vscode from "vscode";
import * as ejs from "ejs";
import IChallenge from "./interface/Challenge";
import Hackerrank from "./Hackerrank";
import Language from "./Language";
import Database from "./Database";
import ISolution from "./interface/Solution";

interface IChallengeEditor {
  webviewPanel: vscode.WebviewPanel;
  editors: {
    textEditor: vscode.TextDocument;
    language: string;
  }[];
  data: IChallenge;
  testcasesPane?: vscode.WebviewPanel;
}

interface IRunResult {
  id: number;
  stdin: string;
  stdout: string;
  stderr: string;
  testcaseMessage: string;
  testcaseStatus: number;
  time: number;
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

    challengeEditors.push({
      textEditor: codeEditor,
      language: languageChosen.value,
    });
  }

  static async getCodeFromEditor(challenge: IChallengeEditor) {
    const visibleEditors = vscode.window.visibleTextEditors;
    let solution: ISolution | undefined;

    if (!visibleEditors.length) {
      vscode.window.showErrorMessage(
        "Open the code file which you want execute."
      );
      return solution;
    }

    if (visibleEditors.length === 1) {
      for (let editor of challenge.editors) {
        if (editor.textEditor === visibleEditors[0].document) {
          solution = {
            code: visibleEditors[0].document.getText(),
            language: editor.language,
          };
        }
      }
      if (!solution) {
        vscode.window.showErrorMessage(
          "Keep the solution file you want to submit visible."
        );
      }
      return solution;
    }

    if (visibleEditors.length > 1) {
      const validEditors: {
        textEditor: vscode.TextEditor;
        language: string;
      }[] = [];
      for (let visibleEditor of visibleEditors) {
        for (let myEditor of challenge.editors) {
          if (myEditor.textEditor === visibleEditor.document) {
            validEditors.push({
              textEditor: visibleEditor,
              language: myEditor.language,
            });
          }
        }
      }

      const chosenEditor = await vscode.window.showQuickPick(
        validEditors.map((editor) => {
          let indexOfLastForwardSlash =
            editor.textEditor.document.fileName.lastIndexOf("/");
          let label = editor.textEditor.document.fileName.slice(
            indexOfLastForwardSlash + 1
          );
          return {
            label,
            value: editor,
          };
        })
      );

      if (!chosenEditor) return;

      solution = {
        code: chosenEditor.value.textEditor.document.getText(),
        language: chosenEditor.value.language,
      };

      return solution;
    }
  }

  static async runCode(challenge: IChallengeEditor) {
    const solution = await this.getCodeFromEditor(challenge);

    if (!solution) return;

    const initiateCodeRunResponse = await Hackerrank.initiateCodeRun(
      challenge.data.slug,
      solution
    );

    const submissionId = initiateCodeRunResponse.model.id;

    let executionStatus = 0;
    const seed = 500;
    const incrementByMultipleOf = 200;
    let tries = 0;

    /**
     * Everytime executionStatus is 0, API call is made with an increasing delay (by a factor of 200) to not overwhelm the server.
     * Using nested setTimeout instead of setInterval for greater control.
     * Allows for strict delay between two api calls. Read reference.
     * Reference: https://javascript.info/settimeout-setinterval#nested-settimeout
     */
    let apiPoller = setTimeout(async function getSubmissionStatus() {
      console.log(tries);
      if (tries === 0) {
        vscode.window.showInformationMessage(
          "Hang in there! Running testcases."
        );
      }

      let codeRunStatusResponse;
      try {
        codeRunStatusResponse = await Hackerrank.getCodeRunStatus(
          challenge.data.slug,
          submissionId
        );
      } catch (e) {
        vscode.window.showErrorMessage(
          "Failed to run your code. Make sure you are connected to internet."
        );
      }

      executionStatus = codeRunStatusResponse.model.status;
      tries++;

      if (executionStatus) {
        vscode.window.showInformationMessage("Executed your code");
        console.log(tries, executionStatus, codeRunStatusResponse);
        challenge.testcasesPane?.dispose();
        challenge.testcasesPane = await Challenge.openTestcasesView(
          codeRunStatusResponse.model
        );
      } else if (tries >= 5) {
        vscode.window.showErrorMessage(
          "It is taking unusually long time to run you code. Check again after some time"
        );
      } else {
        console.log(seed + incrementByMultipleOf * tries);
        apiPoller = setTimeout(
          getSubmissionStatus,
          seed + incrementByMultipleOf * tries
        );
      }
    }, seed);
  }

  static async openTestcasesView(submissionData: any) {
    const testcasesPane = vscode.window.createWebviewPanel(
      "Testcases",
      "Testcases",
      {
        preserveFocus: true,
        viewColumn: vscode.ViewColumn.Three,
      },
      {
        enableScripts: true,
      }
    );

    // True when tere are no compilation errors
    if (submissionData.compilemessage.length === 0) {
      const testcaseResults: IRunResult[] = [];
      const numberOfTestcases: number = submissionData.expected_output.length;
      for (let i = 0; i < numberOfTestcases; i++) {
        testcaseResults.push({
          id: i + 1,
          stdin: submissionData.stdin[i],
          stdout: submissionData.stdout[i],
          stderr: submissionData.stderr[i],
          testcaseMessage: submissionData.testcase_message[i],
          testcaseStatus: submissionData.testcase_status[i],
          time: submissionData.time[i],
        });
      }

      console.log(testcaseResults);
      // Send object to ejs template and render the html on the webview
    } else {
      const compileMessage = submissionData.compilemessage;

      console.log(compileMessage);
      // Send error message to webview
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  ${JSON.stringify(submissionData, null, 3)}
</body>
</html>`;

    console.log(submissionData);
    testcasesPane.webview.html = html;
    return testcasesPane;
  }
}

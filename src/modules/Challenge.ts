import * as vscode from "vscode";
import * as ejs from "ejs";
import IChallenge from "./interface/Challenge";
import Hackerrank from "./Hackerrank";
import Language from "./Language";
import Database from "./Database";
import ISolution from "./interface/Solution";
import apiPoller from "../utils/apiPoller";

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
  message: string;
  expectedOutput: string;
  status: number;
  time: number;
}

interface ISubmissionResult {
  challengeId: number;
  submissionId: number;
  challengeSlug: string;
  unlockedTestcases?: number[];
  status: number;
  testcaseResults: {
    id: number;
    message: string;
    status: number;
    stdin?: string;
    expectedOutput?: string;
    stderr?: string;
    time: number;
    isUnlocked: boolean;
  }[];
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

    const challengeTemplatePath = "src/templates/challenge.ejs";
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
        await Challenge.executeCode(this.challenges[challengeSlug], "run");
        break;
      case "submit":
        await Challenge.executeCode(this.challenges[challengeSlug], "submit");
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

  static async executeCode(challenge: IChallengeEditor, action: string) {
    const solution = await this.getCodeFromEditor(challenge);

    if (!solution) return;

    vscode.window.showInformationMessage("Hang in there! Running testcases.");

    const response = await Hackerrank.initiateCodeExecution(
      challenge.data.slug,
      solution,
      action
    );

    console.log(response);

    const submissionId = response.model.id;

    const executionResult = await apiPoller(
      Hackerrank.getCodeExecutionStatus,
      challenge.data.slug,
      submissionId,
      action
    );

    if (action === "run" && executionResult.status) {
      this.openRunTestcasesView(challenge, executionResult.data);
    } else if (action === "submit" && executionResult.status) {
      const unlockedTestcases = await Hackerrank.getUnlockedTestcases(
        challenge.data.id
      );
      let testcasesData: any = {};
      if (unlockedTestcases) {
        for (let testcaseId of unlockedTestcases) {
          const testcase = await Hackerrank.getTestcaseData(
            challenge.data.id,
            testcaseId
          );
          if (testcase) {
            testcasesData[testcaseId] = testcase;
          }
        }
      }
      console.log(testcasesData);
      this.openSubmitTestcasesView(
        challenge,
        executionResult.data,
        testcasesData
      );
    }
  }

  static async openRunTestcasesView(
    challenge: IChallengeEditor,
    submissionData: any
  ) {
    let html;

    challenge.testcasesPane?.dispose();

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
      let status = 0;
      const numberOfTestcases: number = submissionData.expected_output.length;
      for (let i = 0; i < numberOfTestcases; i++) {
        if (submissionData.testcase_status[i]) {
          status = 1;
        }
        testcaseResults.push({
          id: i,
          stdin: submissionData.stdin[i],
          stdout: submissionData.stdout[i],
          stderr: submissionData.stderr[i],
          message: submissionData.testcase_message[i],
          expectedOutput: submissionData.expected_output[i],
          status: submissionData.testcase_status[i],
          time: submissionData.time[i],
        });
      }

      const templateData = { status, testcaseResults };

      html = await ejs.renderFile("src/templates/run.ejs", templateData);
    } else {
      const compileMessage = submissionData.compilemessage;

      html = await ejs.renderFile("src/templates/compilation.ejs", {
        compileMessage,
      });
    }

    testcasesPane.webview.html = html;

    challenge.testcasesPane = testcasesPane;

    return testcasesPane;
  }

  static async openSubmitTestcasesView(
    challenge: IChallengeEditor,
    submissionData: any,
    testcasesData: any
  ) {
    let html;

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

    testcasesPane.webview.onDidReceiveMessage(async (message) =>
      this.unlockTestcase(message)
    );

    if (submissionData.compile_message.length === 0) {
      const submissionResult: ISubmissionResult = {
        challengeId: submissionData.challenge_id,
        challengeSlug: submissionData.challenge_slug,
        submissionId: submissionData.id,
        status: submissionData.status === "Accepted" ? 1 : 0,
        testcaseResults: [],
      };
      const numberOfTestcases = submissionData.testcase_message.length;

      for (let i = 0; i < numberOfTestcases; i++) {
        submissionResult.testcaseResults.push({
          id: i,
          message: submissionData.testcase_message[i],
          status: submissionData.testcase_status[i],
          time: submissionData.codechecker_time[i],
          stdin: testcasesData[i]?.stdin,
          expectedOutput: testcasesData[i]?.expected_output,
          stderr: testcasesData[i]?.stderr,
          isUnlocked: Boolean(testcasesData[i]),
        });
      }

      console.log(submissionResult);

      html = await ejs.renderFile(
        "src/templates/submission.ejs",
        submissionResult
      );
    } else {
      const compileMessage = submissionData.compile_message;

      html = await ejs.renderFile("src/templates/compilation.ejs", {
        compileMessage,
      });
    }

    testcasesPane.webview.html = html;

    challenge.testcasesPane?.dispose();
    challenge.testcasesPane = testcasesPane;
  }

  static async unlockTestcase(message: {
    challengeId: number;
    challengeSlug: string;
    submissionId: number;
    testcaseId: number;
  }) {
    const { challengeId, challengeSlug, submissionId, testcaseId } = message;
    vscode.window.showInformationMessage("Getting testcases! Hang in there.");
    const purchaseResponse = await Hackerrank.purchaseTestcase(
      challengeId,
      submissionId,
      testcaseId
    );
    const testcaseResponse = await Hackerrank.getTestcaseData(
      challengeId,
      testcaseId
    );

    this.challenges[challengeSlug].testcasesPane?.webview.postMessage({
      testcaseId,
      ...testcaseResponse,
    });
  }
}

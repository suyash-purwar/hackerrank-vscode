import * as vscode from "vscode";
import Hackerrank from "../modules/Hackerrank";

/**
 * Everytime executionStatus is 0, API call is made with an increasing delay (by a factor of 200) to not overwhelm the server.
 * Using nested setTimeout instead of setInterval for greater control.
 * Allows for strict delay between two api calls. Read reference.
 * Reference: https://javascript.info/settimeout-setinterval#nested-settimeout
 */

const apiPoller = async (
  fn: Function,
  ...args: any
): Promise<{ status: boolean; data: any }> => {
  let executionStatus: number | string;
  const seed = 500;
  const incrementByMultipleOf = 200;
  let tries = 0;

  return new Promise((resolve, reject) => {
    let response = {
      status: false,
      data: null,
    };

    let poller = setTimeout(async function getSubmissionStatus() {
      let codeExecutionResponse;

      try {
        codeExecutionResponse = await fn.call(Hackerrank, ...args);
      } catch (e) {
        console.log(e);
        vscode.window.showErrorMessage(
          "Failed to run your code. Make sure you are connected to internet."
        );
        clearInterval(poller);
        resolve(response);
      }

      executionStatus = codeExecutionResponse.model.status;
      console.log(executionStatus);
      tries++;

      // executionStatus is of type number for code run endpoint
      if (
        (typeof executionStatus === "number" && executionStatus === 1) ||
        (typeof executionStatus === "string" &&
          executionStatus !== "Processing")
      ) {
        vscode.window.showInformationMessage("Executed your code");
        console.log(tries, executionStatus, codeExecutionResponse);
        response = {
          status: true,
          data: codeExecutionResponse.model,
        };
        resolve(response);
      } else if (tries >= 5) {
        vscode.window.showErrorMessage(
          "It is taking unusually long time to run you code. Check again after some time"
        );
        resolve(response);
      } else {
        poller = setTimeout(
          getSubmissionStatus,
          seed + incrementByMultipleOf * tries
        );
      }
    }, seed);
  });
};

export default apiPoller;

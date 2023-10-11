import * as vscode from "vscode";
import { Challenge } from "./Challenge";

class Track extends vscode.TreeItem {
  readonly type: string = "track";

  constructor(trackId: number, trackName: string) {
    super(trackName, vscode.TreeItemCollapsibleState.Collapsed);
    this.id = trackId.toString();
  }
}

class TrackChallenge extends vscode.TreeItem {
  readonly type: string = "challenge";
  constructor(challengeId: number, challengeName: string) {
    super(challengeName);
    this.id = challengeId.toString();
  }
}

export default class ChallengeProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  static async getChallenges() {
    const challengesTreeView = vscode.window.createTreeView("challenges", {
      treeDataProvider: new ChallengeProvider(),
    });

    challengesTreeView.onDidChangeSelection(async (event) => {
      const selectedItem = event.selection[0] as Track;

      if (selectedItem.type === "track") return;

      if (selectedItem) {
        // Render pains
        vscode.window.showInformationMessage(`${selectedItem.label}`);
        await Challenge.renderChallenge(
          selectedItem.id as string,
          selectedItem.label as string
        );
      }
    });
  }

  // getTracks(): Promise<Tracks[]> {}

  // getTrackChallenges(trackId: number): Promise<TrackChallenge[]> {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    console.log(element);
    return element;
  }

  getChildren(
    element?: vscode.TreeItem | undefined
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    const javascript = new Track(10, "JavaScript");
    const python = new Track(20, "Python");
    const alogrithms = new Track(30, "Algorithms");

    const javascriptChallenges = [
      {
        id: 1,
        name: "Coercion for beginners",
      },
      {
        id: 2,
        name: "Currying Patterns",
      },
      {
        id: 3,
        name: "Tower of Hanoi",
      },
    ];
    const pythonChallenges = [
      {
        id: 4,
        name: "For-loops",
      },
      {
        id: 5,
        name: "Operator Overloading",
      },
      {
        id: 6,
        name: "Armstrong Number",
      },
    ];
    const algorithmsChallenges = [
      {
        id: 7,
        name: "Bubble Sort",
      },
      {
        id: 8,
        name: "Bubble Sort using Recursion",
      },
      {
        id: 9,
        name: "Quick Sort",
      },
    ];

    const javascriptChallengeList = javascriptChallenges.map(
      (ch) => new TrackChallenge(ch.id, ch.name)
    );

    const pythonChallengeList = pythonChallenges.map(
      (ch) => new TrackChallenge(ch.id, ch.name)
    );

    const algorithmsChallengeList = algorithmsChallenges.map(
      (ch) => new TrackChallenge(ch.id, ch.name)
    );

    switch (element?.id) {
      case "10":
        return javascriptChallengeList;
      case "20":
        return pythonChallengeList;
      case "30":
        return algorithmsChallengeList;
      default:
        return [javascript, python, alogrithms];
    }
  }
}

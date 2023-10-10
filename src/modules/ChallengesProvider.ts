import * as vscode from "vscode";

class Tracks extends vscode.TreeItem {
  constructor(
    trackId: number,
    trackName: string,
    collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(trackName, collapsibleState);
    this.id = trackId.toString();
  }
}

class TrackChallenge extends vscode.TreeItem {
  constructor(challengeId: number, challengeName: string) {
    super(challengeName);
    this.id = challengeId.toString();
  }
}

export default class ChallengeProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  constructor() {}

  static async getChallenges() {
    vscode.window.createTreeView("challenges", {
      treeDataProvider: new ChallengeProvider(),
    });
  }

  // getTracks(): Promise<Tracks[]> {}

  // getTrackChallenges(trackId: number): Promise<TrackChallenge[]> {}

  // getChallenge(challengeId: number): Promise<vscode.TreeItem[]> {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    console.log(element);
    return element;
  }

  getChildren(
    element?: vscode.TreeItem | undefined
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    const javascript = new vscode.TreeItem(
      "JavaScript",
      vscode.TreeItemCollapsibleState.Collapsed
    );
    const python = new vscode.TreeItem(
      "Python",
      vscode.TreeItemCollapsibleState.Collapsed
    );
    const alogrithms = new vscode.TreeItem(
      "Algorithms",
      vscode.TreeItemCollapsibleState.Collapsed
    );

    switch (element?.label) {
      case "JavaScript":
        return [
          new vscode.TreeItem("Coercion for beginners"),
          new vscode.TreeItem("Currying Patters"),
          new vscode.TreeItem("Tower of Hanoi"),
        ];
      case "Python":
        return [
          new vscode.TreeItem("For-loops"),
          new vscode.TreeItem("Operator Overloading"),
          new vscode.TreeItem("Armstrong Number"),
        ];
      case "Algorithms":
        return [
          new vscode.TreeItem("Bubble Sort"),
          new vscode.TreeItem("Bubble Sort using Recursion"),
          new vscode.TreeItem("Quick Sort"),
        ];
      default:
        return [javascript, python, alogrithms];
    }
  }
}

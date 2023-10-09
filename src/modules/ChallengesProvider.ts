import * as vscode from "vscode";

export default class ChallengeProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  constructor() {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(
    element?: vscode.TreeItem | undefined
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    return [
      new vscode.TreeItem("Child 1"),
      new vscode.TreeItem("Child 2"),
      new vscode.TreeItem("Child 3"),
    ];
  }
}

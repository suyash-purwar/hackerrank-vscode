import * as vscode from "vscode";

export default class Authentication
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  constructor() {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(
    element?: vscode.TreeItem | undefined
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    return [new vscode.TreeItem("Sign in to Hackerrank")];
  }
}

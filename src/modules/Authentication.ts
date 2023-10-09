import * as vscode from "vscode";

export default class Authentication
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  constructor() {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    console.log(element);
    return element;
  }

  getChildren(
    element?: vscode.TreeItem | undefined
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    return [new vscode.TreeItem("Sign in to Hackerrank")];
  }
}

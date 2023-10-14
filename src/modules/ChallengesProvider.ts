import * as vscode from "vscode";
import Challenge from "./Challenge";
import Hackerrank from "./Hackerrank";

class TrackTreeItem extends vscode.TreeItem {
  slug: string;
  readonly type: string = "track";

  constructor(trackId: number, trackSlug: string, trackName: string) {
    super(trackName, vscode.TreeItemCollapsibleState.Collapsed);
    this.id = trackId.toString();
    this.slug = trackSlug;
  }
}

class TrackChallengeTreeItem extends vscode.TreeItem {
  readonly type: string = "challenge";
  slug: string;

  constructor(
    challengeId: number,
    challengeSlug: string,
    challengeName: string
  ) {
    super(challengeName);
    this.id = challengeId.toString();
    this.slug = challengeSlug;
  }
}

export default class ChallengeProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  static loadMainTree() {
    const challengesTreeView = vscode.window.createTreeView("challenges", {
      treeDataProvider: new ChallengeProvider(),
    });

    challengesTreeView.onDidChangeSelection(this.getChallenge);
  }

  async getTracks(): Promise<TrackTreeItem[] | undefined> {
    const tracks = await Hackerrank.getTracks();

    if (!tracks) return;

    const trackTreeItems = tracks.map((tr) => {
      return new TrackTreeItem(tr.id, tr.slug, tr.name);
    });

    return trackTreeItems;
  }

  async getTrackChallenges(
    trackSlug: string
  ): Promise<TrackChallengeTreeItem[] | undefined> {
    const trackChallenges = await Hackerrank.getTracksChallenges(trackSlug);

    if (!trackChallenges) return;

    const trackChallengesTreeItems = trackChallenges.challenges.map((tc) => {
      return new TrackChallengeTreeItem(tc.id, tc.slug, tc.name);
    });

    return trackChallengesTreeItems;
  }

  static async getChallenge(
    event: vscode.TreeViewSelectionChangeEvent<vscode.TreeItem>
  ) {
    const selectedItem = event.selection[0] as TrackTreeItem;

    if (selectedItem.type === "challenge") {
      await Challenge.renderChallenge(selectedItem.slug);
    }
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    console.log(element);
    return element;
  }

  getChildren(
    element?: TrackTreeItem | TrackChallengeTreeItem | undefined
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    if (element && element.type === "track") {
      return this.getTrackChallenges(element.slug);
    } else {
      return this.getTracks();
    }
  }
}

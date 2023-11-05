import * as vscode from "vscode";
import Challenge from "./Challenge";
import Hackerrank from "./Hackerrank";

class LoadMoreItem extends vscode.TreeItem {
  readonly type: string = "load-more";
  slug: string;

  constructor(slug: string) {
    super("Load More Challenges");
    this.slug = slug;
  }
}

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
  trackSlug: string;

  constructor(
    challengeId: number,
    challengeSlug: string,
    challengeName: string,
    trackSlug: string
  ) {
    super(challengeName);
    this.id = challengeId.toString();
    this.slug = challengeSlug;
    this.trackSlug = trackSlug;
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
    try {
      const tracks = await Hackerrank.getTracks();

      if (!tracks) return;

      const trackTreeItems = tracks.map((tr) => {
        return new TrackTreeItem(tr.id, tr.slug, tr.name);
      });

      return trackTreeItems;
    } catch (e) {
      vscode.window.showErrorMessage(
        "Failed to load challege tracks. Make sure you are connected to internet."
      );
    }
  }

  async getTrackChallenges(
    trackSlug: string
  ): Promise<TrackChallengeTreeItem[] | undefined> {
    try {
      const trackChallenges = await Hackerrank.getTracksChallenges(trackSlug);

      if (!trackChallenges) return;

      const trackChallengesTreeItems = trackChallenges.map((tc) => {
        return new TrackChallengeTreeItem(tc.id, tc.slug, tc.name, trackSlug);
      });

      return trackChallengesTreeItems;
    } catch (e) {
      console.log(e);
      vscode.window.showErrorMessage(
        "Failed to load challeges. Make sure you are connected to internet."
      );
    }
  }

  static async getChallenge(
    event: vscode.TreeViewSelectionChangeEvent<vscode.TreeItem>
  ) {
    try {
      const selectedItem = event.selection[0] as TrackChallengeTreeItem;

      if (selectedItem.type === "challenge") {
        await Challenge.renderChallenge(
          selectedItem.slug,
          selectedItem.trackSlug
        );
      }
    } catch (e) {
      console.log(e);
      vscode.window.showErrorMessage(
        "Failed to load this challenge. Make sure you are connected to internet."
      );
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

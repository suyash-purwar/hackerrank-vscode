import Session from "./interface/Session";
import Track from "./interface/Track";
import TrackChallenges from "./interface/TrackChallenges";

export default class Hackerrank {
  static readonly BASE_URI = "https://www.hackerrank.com/rest";
  static session: Session = {};

  constructor() {}

  static async getCookie() {
    const url = "https://www.hackerrank.com/auth/login";

    // @ts-ignore
    const response = await fetch(url, {
      method: "GET",
    });
    const cookie = response.headers.get("set-cookie") as string;
    return cookie;
  }

  static async login(email: string, password: string) {
    try {
      const sessionKey = await this.getCookie();
      this.session.hackerrank_cookie = sessionKey;

      const url = `${this.BASE_URI}/auth/login`;
      const headers = {
        Cookie: sessionKey,
        "Content-Type": "application/json",
      };
      const data = JSON.stringify({
        login: email,
        password,
        remember_me: false,
        fallback: false,
      });
      const requestOptions = {
        method: "POST",
        headers,
        body: data,
      };

      // @ts-ignore
      const response = await fetch(url, requestOptions);
      const responseData = (await response.json()) as any;

      if (!responseData.status) {
        throw new Error("AUTHENTICATION_FAILED");
      }

      this.session.csrf_token = responseData.csrf_token;

      return this.session;
    } catch (e) {
      console.log(e);
    }
  }

  static async getTracks() {
    try {
      const url = `${this.BASE_URI}/contests/master/tracks`;

      // @ts-ignore
      const response = await fetch(url, {
        method: "GET",
      });

      const responseData = (await response.json()) as any;

      const tracks: Track[] = responseData.models.map((t: any) => {
        delete t["priority"];
        delete t["rewards_system_enabled"];
        delete t["hidden_at"];

        return t;
      });

      return tracks;
    } catch (e) {
      // Publish error message
      console.log(e);
    }
  }

  static async getTracksChallenges(trackSlug: string, offset = 0, limit = 10) {
    try {
      let isExhausted = false;
      const url = `${this.BASE_URI}/contests/master/tracks/${trackSlug}/challenges?offset=${offset}&limit=${limit}`;

      // @ts-ignore
      const response = await fetch(url, {
        method: "GET",
      });
      const responseData = (await response.json()) as any;

      const challengesCount = responseData.total;
      if (challengesCount <= offset + limit) isExhausted = true;

      // TODO: Remove unnecessary fields
      const trackChallenges: TrackChallenges[] = responseData.models.map(
        (tc: any) => {
          return {
            id: tc.id,
            slug: tc.slug,
            name: tc.name,
            description: tc.preview,
          };
        }
      );

      console.log(trackChallenges);
      return {
        isExhausted,
        challenges: trackChallenges,
      };
    } catch (e) {
      // Publish error message
      console.log(e);
    }
  }

  static async getChallenge(challengeSlug: string) {
    try {
      const url = `${this.BASE_URI}/contests/master/challenges/${challengeSlug}`;

      // @ts-ignore
      const response = await fetch(url, {
        method: "GET",
      });
      const responseData = await response.json();

      const challenge = {
        id: responseData.model.id,
        slug: responseData.model.slug,
        name: responseData.model.name,
        languages: responseData.model.languages,
        totalCount: responseData.model.total_count,
        solvedCount: responseData.model.solved_count,
        successRatio: responseData.model.success_ratio,
        maxScore: responseData.model.max_score,
        userScore: responseData.model.user_score,
        difficulty: responseData.model.difficulty_name,
        description: responseData.model.preview,
        questionHtml: responseData.model.body_html,
        authorName: responseData.model.author_name,
        authorAvatar: responseData.model.author_avatar,
      };

      console.log(challenge);
      return challenge;
    } catch (e) {
      // Publish error
      console.log(e);
    }
  }
}

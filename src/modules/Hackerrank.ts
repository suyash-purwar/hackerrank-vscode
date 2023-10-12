import fetch from "node-fetch";

interface Session {
  status: boolean;
  csrf_token?: string;
  hackerrank_session?: string;
}

interface Track {
  id: number;
  name: string;
  description: string;
  slug: string;
}

interface TrackChallenges {
  maxScore: number;
  submissions: number;
  accepted: number;
  successRatio: number;
  id: number;
  slug: string;
  name: string;
  description: string;
  difficulty: string;
  hints: string[];
  tagNames: string[];
  skill: string;
}

export class Hackerrank {
  static readonly BASE_URI = "https://www.hackerrank.com/rest";
  static session: Session = {
    status: false,
  };

  constructor() {}

  static async getSession() {
    const url = "https://www.hackerrank.com/auth/login";

    const response = await fetch(url);
    const cookie = response.headers.get("cookie") as string;
    const sessionKey = cookie[2].split(";")[0];

    return sessionKey;
  }

  static async login(email: string, password: string) {
    try {
      const sessionKey = await this.getSession();
      this.session.hackerrank_session = sessionKey;

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

      const response = await fetch(url, requestOptions);
      const responseData = (await response.json()) as Session;

      if (!responseData.status) {
        throw new Error("AUTHENTICATION_FAILED");
      }

      this.session.csrf_token = responseData.csrf_token;

      return responseData.status;
    } catch (e) {
      console.log(e);
    }
  }

  static async getTracks() {
    try {
      const url = `${this.BASE_URI}/contests/master/tracks`;

      const response = await fetch(url);

      const responseData = (await response.json()) as any;

      const tracks: Track[] = responseData.models.map((t: any) => {
        delete t["priority"];
        delete t["rewards_system_enabled"];
        delete t["hidden_at"];

        return t;
      });

      return tracks;
    } catch (e) {
      console.log(e);
    }
  }

  static async getTracksChallenges(trackSlug: string, offset = 0, limit = 10) {
    try {
      let isExhausted = false;
      const url = `${this.BASE_URI}/contests/master/tracks/${trackSlug}/challenges?offset=${offset}&limit=${limit}`;

      const response = await fetch(url, {
        method: "GET",
      });
      const responseData = (await response.json()) as any;

      const challengesCount = responseData.total;
      if (challengesCount <= offset + limit) isExhausted = true;

      const trackChallenges: TrackChallenges[] = responseData.models.map(
        (tc: any) => {
          return {
            maxScore: tc.max_score,
            submissions: tc.total_count,
            accepted: tc.solved_count,
            successRatio: tc.success_ratio,
            id: tc.id,
            slug: tc.slug,
            name: tc.name,
            description: tc.preview,
            difficulty: tc.difficulty_name,
            hints: tc.hints,
            tagNames: tc.tag_names,
            skill: tc.skill,
          };
        }
      );

      console.log(trackChallenges);
      return {
        isExhausted,
        trackChallenges,
      };
    } catch (e) {
      console.log(e);
    }
  }

  static async getChallenge(challengeSlug: string) {
    try {
    } catch (e) {
      console.log(e);
    }
  }
}
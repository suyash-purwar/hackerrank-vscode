import IChallenge from "./interface/Challenge";
import ITrack from "./interface/Track";
import ISession from "./interface/Session";
import ITrackChallenges from "./interface/TrackChallenges";
import ISolution from "./interface/Solution";

export default class Hackerrank {
  static readonly BASE_URI = "https://www.hackerrank.com/rest";

  constructor() {}

  static async getCookie() {
    const url = "https://www.hackerrank.com/auth/login";

    // @ts-ignore
    // Node.js >= 18.x.x supports the use of Fetch API.
    // Though TS Node typebindings do not support it.
    // Keep '@ts-ignore' up until it's supported.
    const response = await fetch(url, {
      method: "HEAD",
    });

    const cookie = response.headers.get("set-cookie") as string;
    return cookie;
  }

  static async getCookieAndCSRFToken() {
    const url = "https://www.hackerrank.com/auth/login";

    // @ts-ignore
    const response = await fetch(url, {
      method: "GET",
    });
    const responseData = await response.text();

    const index = responseData.indexOf(`name="csrf-token`);
    const token: string = responseData.slice(index - 90, index - 2);

    const cookie = response.headers.get("set-cookie") as string;
    return { cookie, token };
  }

  static async login(email: string, password: string): Promise<ISession> {
    const session: ISession = { email };

    const { cookie: sessionKey, token: seedCsrfToken } =
      await this.getCookieAndCSRFToken();

    const url = `${this.BASE_URI}/auth/login`;
    const headers = {
      Cookie: sessionKey,
      "Content-Type": "application/json",
      "X-Csrf-Token": seedCsrfToken,
    };
    const body = JSON.stringify({
      login: email,
      password,
      remember_me: false,
      fallback: false,
    });
    const requestOptions = {
      method: "POST",
      headers,
      body,
    };

    // @ts-ignore
    const response = await fetch(url, requestOptions);
    const responseData = (await response.json()) as any;

    if (!responseData.status) {
      throw new Error("AUTHENTICATION_FAILED");
    }

    session["csrf_token"] = responseData.csrf_token;
    session["hackerrank_cookie"] = sessionKey;

    return session;
  }

  static async getTracks() {
    const url = `${this.BASE_URI}/contests/master/tracks`;

    // @ts-ignore
    const response = await fetch(url, {
      method: "GET",
    });

    const responseData = (await response.json()) as any;

    const tracks: ITrack[] = responseData.models.map((t: any) => {
      delete t["priority"];
      delete t["rewards_system_enabled"];
      delete t["hidden_at"];

      return t;
    });

    return tracks;
  }

  static async getTracksChallenges(trackSlug: string) {
    const url = `${this.BASE_URI}/contests/master/tracks/${trackSlug}/challenges?offset=0&limit=200`;

    // @ts-ignore
    const response = await fetch(url, {
      method: "GET",
    });
    const responseData = (await response.json()) as any;

    // TODO: Remove unnecessary fields
    const trackChallenges: ITrackChallenges[] = responseData.models.map(
      (tc: any) => {
        return {
          id: tc.id,
          slug: tc.slug,
          name: tc.name,
          description: tc.preview,
          trackSlug,
        };
      }
    );

    return trackChallenges;
  }

  static async getChallenge(challengeSlug: string) {
    const url = `${this.BASE_URI}/contests/master/challenges/${challengeSlug}`;

    // @ts-ignore
    const response = await fetch(url, {
      method: "GET",
    });
    const responseData = await response.json();

    const challenge: IChallenge = {
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
      languagesBoilerplate: {},
    };

    for (let lang of responseData.model.languages) {
      let key = `${lang}_template`;
      if (!responseData.model[key]) continue;
      challenge.languagesBoilerplate[key] = responseData.model[key];

      let keyHead = `${key}_head`;
      if (responseData.model[keyHead]) {
        challenge.languagesBoilerplate[keyHead] = responseData.model[keyHead];
      }

      let keyTail = `${key}_tail`;
      if (responseData.model[keyTail]) {
        challenge.languagesBoilerplate[keyTail] = responseData.model[keyTail];
      }
    }

    return challenge;
  }

  static async initiateCodeExecution(
    challengeSlug: string,
    solution: ISolution,
    action: string
  ) {
    const endpoint = action === "run" ? "compile_tests" : "submissions";
    const url = `${this.BASE_URI}/contests/master/challenges/${challengeSlug}/${endpoint}`;
    // @ts-ignore
    const headers = new Headers({
      Cookie: process.env.HACKERRANK_COOKIE,
      "X-Csrf-Token": process.env.CSRF_TOKEN,
      "Content-Type": "application/json",
    });
    const body = JSON.stringify({
      customtestcase: false,
      playlist_slug: "",
      ...solution,
    });
    const requestOptions = {
      method: "POST",
      headers,
      body,
    };

    // @ts-ignore
    const response = await fetch(url, requestOptions);
    const responseData = await response.json();

    return responseData;
  }

  static async getCodeExecutionStatus(
    challengeSlug: string,
    submissionId: number,
    action: string
  ) {
    const endpoint = action === "run" ? "compile_tests" : "submissions";
    const url = `${this.BASE_URI}/contests/master/challenges/${challengeSlug}/${endpoint}/${submissionId}`;
    // @ts-ignore
    const headers = new Headers({
      Cookie: process.env.HACKERRANK_COOKIE,
      "X-Csrf-Token": process.env.CSRF_TOKEN,
      "Content-Type": "application/json",
    });
    const requestOptions = {
      method: "GET",
      headers,
    };
    // @ts-ignore
    const response = await fetch(url, requestOptions);
    const responseData = await response.json();

    return responseData;
  }

  static async getUnlockedTestcases(challengeId: number) {
    const url = `${this.BASE_URI}/contests/master/testcases/${challengeId}/all/unlocked_testcases`;
    // @ts-ignore
    const headers = new Headers({
      Cookie: process.env.HACKERRANK_COOKIE,
      "X-Csrf-Token": process.env.CSRF_TOKEN,
      "Content-Type": "application/json",
    });
    const requestOptions = {
      method: "GET",
      headers,
    };
    // @ts-ignore
    const response = await fetch(url, requestOptions);
    const responsedData = await response.json();

    return responsedData;
  }

  static async getTestcaseData(challengeId: number, testcaseId: number) {
    const url = `${this.BASE_URI}/contests/master/testcases/${challengeId}/${testcaseId}/testcase_data`;
    // @ts-ignore
    const headers = new Headers({
      Cookie: process.env.HACKERRANK_COOKIE,
      "X-Csrf-Token": process.env.CSRF_TOKEN,
      "Content-Type": "application/json",
    });
    const requestOptions = {
      method: "GET",
      headers,
    };
    // @ts-ignore
    const response = await fetch(url, requestOptions);
    const responseData = await response.json();

    return responseData;
  }

  static async purchaseTestcase(
    challengeId: number,
    submissionId: number,
    testcaseId: number
  ) {
    const url = `${this.BASE_URI}/contests/master/testcases/${challengeId}/${testcaseId}/purchase?submission_id=${submissionId}`;
    // @ts-ignore
    const headers = new Headers({
      Cookie: process.env.HACKERRANK_COOKIE,
      "X-Csrf-Token": process.env.CSRF_TOKEN,
      "Content-Type": "application/json",
    });
    const requestOptions = {
      method: "GET",
      headers,
    };
    // @ts-ignore
    const response = await fetch(url, requestOptions);
    const responseData = await response.json();

    return responseData;
  }
}

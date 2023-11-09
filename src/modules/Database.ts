import * as dotenv from "dotenv";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import ISession from "./interface/Session";

export default class Database {
  static readonly folder = "hackerrank";
  static readonly configFile = ".hackerrankrc";
  static path: string | undefined;

  static async getPath() {
    switch (os.type()) {
      case "Darwin":
      case "Linux":
        if (process.env.XDG_CONFIG_HOME) {
          this.path = process.env.XDG_CONFIG_HOME;
        } else {
          this.path = process.env.HOME + "/.config";
        }
        break;
      case "Windows_NT":
        this.path = process.env.APPDATA;
        break;
      default:
        throw new Error("PLATFORM_NOT_SUPPORTED");
    }

    this.path += `/${this.folder}`;

    try {
      await fs.access(this.path as string, fs.constants.F_OK);
    } catch (e) {
      await fs.mkdir(this.path as string);
    }

    return this.path;
  }

  static async saveSession(session: ISession) {
    try {
      const { email, csrf_token, hackerrank_cookie } = session;
      process.env.EMAIL = email;
      process.env.CSRF_TOKEN = csrf_token;
      process.env.HACKERRANK_COOKIE = hackerrank_cookie;
      const content = `EMAIL=${email}\nCSRF_TOKEN=${csrf_token}\nHACKERRANK_COOKIE=${hackerrank_cookie}`;

      const path = await this.getPath();
      await fs.writeFile(`${path}/${this.configFile}`, content);

      // * Setup users structure if not present
      try {
        await fs.access(`${path}/users/${email}/solutions`, fs.constants.F_OK);
      } catch (e) {
        fs.mkdir(`${path}/users/${email}/solutions`, {
          recursive: true,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  static async getSession() {
    try {
      const path = await this.getPath();
      const configFilePath = `${path}/${this.configFile}`;
      dotenv.config({
        path: configFilePath,
      });
    } catch (e) {
      console.log(e);
    }
  }

  static async createSolutionFile(
    fileName: string,
    trackSlug: string,
    boilerplate: string
  ) {
    const url = `${this.path}/users/${process.env.EMAIL}/solutions/${trackSlug}`;
    try {
      await fs.access(url, fs.constants.F_OK);
    } catch (e) {
      await fs.mkdir(url);
    }
    await fs.writeFile(`${url}/${fileName}`, boilerplate);
    return `${url}/${fileName}`;
  }

  static async fetchSolutionFileUrl(fileName: string, trackSlug: string) {
    const url = `${this.path}/users/${process.env.EMAIL}/solutions/${trackSlug}/${fileName}`;
    try {
      await fs.access(url, fs.constants.F_OK);
      return url;
    } catch (e) {
      console.log(e);
    }
  }
}

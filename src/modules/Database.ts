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
      const { csrf_token, hackerrank_cookie } = session;
      const content = `CSRF_TOKEN=${csrf_token}\nHACKERRANK_COOKIE=${hackerrank_cookie}`;
      const path = await this.getPath();
      await fs.writeFile(`${path}/${this.configFile}`, content);
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
      const session: ISession = {
        csrf_token: process.env.CSRF_TOKEN,
        hackerrank_cookie: process.env.HACKERRANK_COOKIE,
      };
      return session;
    } catch (e) {
      console.log(e);
    }
  }
}

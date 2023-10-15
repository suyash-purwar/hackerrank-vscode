import languages from "../languages";

export default class Language {
  label: string;
  value: string;
  extension: string;
  default_boilerplate: string;

  constructor(value: string) {
    const language = languages.find((lang) => lang.value === value);

    this.value = language?.value as string;
    this.label = language?.label as string;
    this.extension = language?.extension as string;
    this.default_boilerplate = language?.default_boilerplate as string;
  }
}

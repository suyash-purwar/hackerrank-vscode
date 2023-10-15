import langExtensions from "../languages";

export default class Language {
  label: string;
  value: string;
  extension: string;
  default_boilerplate: string;

  constructor(value: string) {
    this.value = value;
    this.label = "";

    for (let index = 0; index < value.length; index++) {
      if (index == 0) {
        this.label += value[index].toUpperCase();
        continue;
      }
      if (isNaN(+value[index])) {
        this.label += value[index];
      } else {
        this.label += " " + value.slice(index);
        break;
      }
    }

    // * Remove the language version
    // * If the value is cpp20, it'll be reduced to cpp
    if (!isNaN(+value[value.length - 1])) {
      value = value.slice(0, value.length - 1);
    }
    if (!isNaN(+value[value.length - 1])) {
      value = value.slice(0, value.length - 1);
    }

    this.extension =
      langExtensions[value as keyof typeof langExtensions].extension;
    this.default_boilerplate =
      langExtensions[value as keyof typeof langExtensions].default_boilerplate;
  }
}

export default {
  java: {
    extension: ".java",
    default_boilerplate:
      "import java.io.*;\nimport java.util.*;\n\npublic class Solution {\n\n    public static void main(String[] args) {\n        /* Enter your code here. Read input from STDIN. Print output to STDOUT. Your class should be named Solution. */\n    }\n}",
  },
  d: {
    extension: ".d",
    default_boilerplate:
      "/* Enter your code here. Read input from STDIN. Print output to STDOUT */",
  },
  c: {
    extension: ".c",
    default_boilerplate:
      "#include <stdio.h>\n#include <string.h>\n#include <math.h>\n#include <stdlib.h>\n\nint main() {\n\n    /* Enter your code here. Read input from STDIN. Print output to STDOUT */\n    return 0;\n}",
  },
  python: {
    extension: ".py",
    default_boilerplate: "",
  },
  cpp: {
    extension: ".cpp",
    default_boilerplate:
      "#include <cmath>\n#include <cstdio>\n#include <vector>\n#include <iostream>\n#include <algorithm>\nusing namespace std;\n\n\nint main() {\n    /* Enter your code here. Read input from STDIN. Print output to STDOUT */   \n    return 0;\n}",
  },
  html: {
    extension: ".html",
    default_boilerplate: "",
  },
  javascript: {
    extension: ".js",
    default_boilerplate:
      "function processData(input) {\n    //Enter your code here\n} \n\nprocess.stdin.resume();\nprocess.stdin.setEncoding('ascii');\n_input = '';\nprocess.stdin.on('data', function (input) {\n    _input += input;\n});\n\nprocess.stdin.on('end', function () {\n   processData(_input);\n});",
  },
  typescript: {
    extension: ".ts",
    default_boilerplate:
      'function processData(input) {\n    //Enter your code here\n} \n\nprocess.stdin.resume();\nprocess.stdin.setEncoding("ascii");\n_input = "";\nprocess.stdin.on("data", function (input) {\n    _input += input;\n});\n\nprocess.stdin.on("end", function () {\n   processData(_input);\n});',
  },
  css: {
    extension: ".css",
    default_boilerplate: "",
  },
  haskell: {
    extension: ".hs",
    default_boilerplate:
      "-- Enter your code here. Read input from STDIN. Print output to STDOUT",
  },
  erlang: {
    extension: ".erl",
    default_boilerplate:
      "% Enter your code here. Read input from STDIN. Print output to STDOUT\n% Your class should be named solution\n\n-module(solution).\n-export([main/0]).\n\nmain() ->\n\t.\n",
  },
  scala: {
    extension: ".scala",
    default_boilerplate:
      "object Solution {\n\n    def main(args: Array[String]) {\n        /* Enter your code here. Read input from STDIN. Print output to STDOUT. Your class should be named Solution\n*/\n    }\n}",
  },
  clojure: {
    extension: ".clj",
    default_boilerplate:
      "; Enter your code here. Read input from STDIN. Print output to STDOUT\n;",
  },
  pypy: {
    extension: ".py",
    default_boilerplate:
      "# Enter your code here. Read input from STDIN. Print output to STDOUT",
  },
  ruby: {
    extension: ".ruby",
    default_boilerplate:
      "# Enter your code here. Read input from STDIN. Print output to STDOUT",
  },
  rust: {
    extension: ".rs",
    default_boilerplate: "// Enter your code here",
  },
  php: {
    extension: ".php",
    default_boilerplate:
      "<?php\n$_fp = fopen('php://stdin', 'r');\n/* Enter your code here. Read input from STDIN. Print output to STDOUT */\n\n?>",
  },
  swift: {
    extension: ".swift",
    default_boilerplate: "import Foundation\n\n// Enter your code here ",
  },
  objectivec: {
    extension: ".m",
    default_boilerplate:
      "//Enter your code here. Read input from STDIN. Print output to STDOUT",
  },
  kotlin: {
    extension: ".kt",
    default_boilerplate:
      "import java.io.*\nimport java.util.*\n\nfun main(args: Array<String>) {\n        /* Enter your code here. Read input from STDIN. Print output to STDOUT. */\n}",
  },
  lua: {
    extension: ".lua",
    default_boilerplate:
      "-- Enter your code here. Read input from STDIN. Print output to STDOUT",
  },
  csharp: {
    extension: ".cs",
    default_boilerplate:
      "using System;\nusing System.Collections.Generic;\nusing System.IO;\nclass Solution {\n    static void Main(String[] args) {\n        /* Enter your code here. Read input from STDIN. Print output to STDOUT. Your class should be named Solution */\n    }\n}",
  },
  perl: {
    extension: ".pl",
    default_boilerplate:
      "# Enter your code here. Read input from STDIN. Print output to STDOUT",
  },
  julia: {
    extension: ".jl",
    default_boilerplate: "# Enter your code here",
  },
  go: {
    extension: ".go",
    default_boilerplate:
      "package main\nimport 'fmt'\n\nfunc main() {\n //Enter your code here. Read input from STDIN. Print output to STDOUT\n}",
  },
  fsharp: {
    extension: ".fs",
    default_boilerplate:
      "//Enter your code here. Read input from STDIN. Print output to STDOUT",
  },
  elixir: {
    extension: ".ex",
    default_boilerplate:
      "defmodule Solution do\n#Enter your code here. Read input from STDIN. Print output to STDOUT\nend",
  },
  ocaml: {
    extension: ".ml",
    default_boilerplate:
      "(* Enter your code here. Read input from STDIN. Print output to STDOUT *)",
  },
  racket: {
    extension: ".rkt",
    default_boilerplate:
      "#lang racket\n; Enter your code here. Read input from STDIN. Print output to STDOUT",
  },
  sbcl: {
    extension: ".lisp",
    default_boilerplate:
      ";; Enter your code here. Read input from STDIN. Print output to STDOUT",
  },
  r: {
    extension: ".R",
    default_boilerplate:
      "# Enter your code here. Read input from STDIN. Print output to STDOUT",
  },
  groovy: {
    extension: ".groovy",
    default_boilerplate:
      "//Enter your code here. Read input from STDIN. Print output to STDOUT",
  },
  lolcode: {
    extension: ".lol",
    default_boilerplate:
      "BTW Enter your code here. Read input from STDIN. Print output to STDOUT",
  },
  visualbasic: {
    extension: ".vb",
    default_boilerplate:
      "'Enter your code here. Read input from STDIN. Print output to STDOUT",
  },
  pascal: {
    extension: ".pas",
    default_boilerplate:
      "(* Enter your code here. Read input from STDIN. Print output to STDOUT *)",
  },
  tcl: {
    extension: ".tcl",
    default_boilerplate:
      "# Enter your code here. Read input from STDIN. Print output to STDOUT",
  },
  smalltalk: {
    extension: ".st",
    default_boilerplate:
      '"Enter your code here. Read input from STDIN. Print output to STDOUT"',
  },
  bash: {
    extension: ".sh",
    default_boilerplate: "",
  },
  text: {
    extension: ".txt",
    default_boilerplate: "",
  },
};

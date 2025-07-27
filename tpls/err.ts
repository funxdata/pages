export class TplError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Tpl Error";
  }
}

export class TplParseError extends TplError {
  constructor(message: string) {
    super(message);
    this.name = "TplParser Error";
  }
}

export class TplRuntimeError extends TplError {
  constructor(message: string) {
    super(message);
    this.name = "TplRuntime Error";
  }
}

export class TplFileResolutionError extends TplError {
  constructor(message: string) {
    super(message);
    this.name = "TplFileResolution Error";
  }
}

export class TplNameResolutionError extends TplError {
  constructor(message: string) {
    super(message);
    this.name = "TplNameResolution Error";
  }
}

/**
 * Throws an TplError with a nicely formatted error and message showing where in the template the error occurred.
 */

export function ParseErr(message: string, str: string, indx: number): never {
  const whitespace = str.slice(0, indx).split(/\n/);

  const lineNo = whitespace.length;
  const colNo = whitespace[lineNo - 1].length + 1;
  message += " at line " +
    lineNo +
    " col " +
    colNo +
    ":\n\n" +
    "  " +
    str.split(/\n/)[lineNo - 1] +
    "\n" +
    "  " +
    Array(colNo).join(" ") +
    "^";
  throw new TplParseError(message);
}

export const RuntimeErr=(
  originalError: Error,
  str: string,
  lineNo: number,
  path: string,
): never =>{
  // code gratefully taken from https://github.com/mde/ejs and adapted

  const lines = str.split("\n");
  const start = Math.max(lineNo - 3, 0);
  const end = Math.min(lines.length, lineNo + 3);
  const filename = path;
  // Error context
  const context = lines
    .slice(start, end)
    .map(function (line, i) {
      const curr = i + start + 1;
      return (curr == lineNo ? " >> " : "    ") + curr + "| " + line;
    })
    .join("\n");

  const header = filename
    ? filename + ":" + lineNo + "\n"
    : "line " + lineNo + "\n";

  const err = new TplRuntimeError(
    header + context + "\n\n" + originalError.message,
  );

  err.name = originalError.name; // the original name (e.g. ReferenceError) may be useful

  throw err;
}
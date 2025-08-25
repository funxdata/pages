import { TplError as TplErrorType } from "./types/err.ts"
export class TplError extends Error implements TplErrorType {
  override cause?: unknown;

  constructor(message?: string, cause?: unknown) {
    super(message);
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype); // 继承链修复
  }

  // ============ 实例方法（链式）===========

  TplParseError(msg: string): this {
    this.name = "TplParseError";
    this.message = msg;
    this.ParseError();
    return this;
  }

  TplRuntimeError(msg: string): this {
    this.name = "TplRuntimeError";
    this.message = msg;
    this.ParseError();
    return this;
  }

  TplNameResolutionError(msg: string): this {
    this.name = "TplNameResolutionError";
    this.message = msg;
    this.ParseError();
    return this;
  }

  private ParseError() {
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }

  // ============ 工厂方法（静态）===========

  static ParseError(message: string, str: string, indx: number): never {
    const whitespace = str.slice(0, indx).split(/\n/);
    const lineNo = whitespace.length;
    const colNo = whitespace[lineNo - 1].length + 1;

    const formatted =
      `${message} at line ${lineNo}, col ${colNo}:\n\n` +
      `  ${str.split(/\n/)[lineNo - 1]}\n` +
      `  ${" ".repeat(colNo - 1)}^`;

    const err = new TplError(formatted);
    err.name = "TplParseError";
    throw err;
  }

  static RuntimeError(
    originalError: Error,
    str: string,
    lineNo: number,
    path?: string,
  ): never {
    const lines = str.split("\n");
    const start = Math.max(lineNo - 3, 0);
    const end = Math.min(lines.length, lineNo + 3);

    const context = lines
      .slice(start, end)
      .map((line, i) => {
        const curr = i + start + 1;
        return (curr === lineNo ? " >> " : "    ") + curr + "| " + line;
      })
      .join("\n");

    const header = path ? `${path}:${lineNo}\n` : `line ${lineNo}\n`;

    const err = new TplError(
      header + context + "\n\n" + originalError.message,
      originalError,
    );
    err.name = originalError.name || "TplRuntimeError";

    throw err;
  }

  static NameResolutionError(message: string): never {
    const err = new TplError(`TplNameResolutionError: ${message}`);
    err.name = "TplNameResolutionError";
    throw err;
  }

  static FileResolutionError(path: string): never {
    const err = new TplError(
      `TplFileResolutionError: Could not find template at path: ${path}`,
    );
    err.name = "TplFileResolutionError";
    throw err;
  }

  // ============ 工具方法 ============

  log() {
    console.warn(`[${this.name}] ${this.message}`);
  }
}



import type { Tpl } from "./types/core.ts";

import type { TplConfig, Options } from "./types/config.ts";

import { TplParseError } from "./err.ts";

/* istanbul ignore next */
const AsyncFunction = async function () {}.constructor; // eslint-disable-line @typescript-eslint/no-empty-function

/**
 * Takes a template string and returns a template function that can be called with (data, config)
 *
 * @param str - The template string
 * @param config - A custom configuration object (optional)
 */

export function compile(
  this: Tpl,
  str: string,
  options?: Partial<Options>,
): TemplateFunction {
  const config: TplConfig = this.config;

  /* ASYNC HANDLING */
  // code gratefully taken from https://github.com/mde/ejs and adapted
  const ctor = options && options.async
    ? (AsyncFunction as FunctionConstructor)
    : Function;
  /* END ASYNC HANDLING */

  try {
    return new ctor(
      config.varName,
      "options",
      this.compileToString.call(this, str, options),
    ) as TemplateFunction; // eslint-disable-line no-new-func
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new TplParseError(
        "Bad template syntax\n\n" +
          e.message +
          "\n" +
          Array(e.message.length + 1).join("=") +
          "\n" +
          this.compileToString.call(this, str, options) +
          "\n", // This will put an extra newline before the callstack for extra readability
      );
    } else {
      throw e;
    }
  }
}
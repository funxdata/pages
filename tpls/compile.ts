import type { Tpl } from "./types/core.ts";
import type { TplConfig, Options } from "./types/config.ts";
import type { TemplateFunction,compile as CompileFunction } from "./types/compile.ts";

/* istanbul ignore next */
const AsyncFunction = async function () {}.constructor; // eslint-disable-line @typescript-eslint/no-empty-function

export const compile: CompileFunction = <T extends Record<string, any> = Record<string, any>>(
  tpl: Tpl,
  str: string,
  options?: Partial<Options>
): TemplateFunction<T> => {
  const config: TplConfig = tpl.config;

  const ctor = options && options.async
    ? (AsyncFunction as FunctionConstructor)
    : Function;

  try {
    return new ctor(
      config.varName,
      "options",
      tpl.compileToString.call(tpl, str, options)
    ) as TemplateFunction<T>; // 保持 TS 泛型
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw tpl.TplErr.TplNameResolutionError(
        "Bad template syntax\n\n" +
        e.message +
        "\n" +
        Array(e.message.length + 1).join("=") +
        "\n" +
        tpl.compileToString.call(tpl, str, options) +
        "\n"
      );
    } else {
      throw e;
    }
  }
};
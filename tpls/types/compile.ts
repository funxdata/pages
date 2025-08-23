import type { Tpl } from "./core.ts";
import type { Options } from "./config.ts";

export type TemplateFunction = (
  this: Tpl,
  data?: T,
  options?: Partial<Options>,
) => string;
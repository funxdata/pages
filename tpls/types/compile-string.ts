import type { Tpl } from "./core.ts";
import type { Options } from "./config.ts";
import type { AstObject } from "./parse.ts";

export type compileToString=(
  tpl: Tpl,
  str: string,
  options?: Partial<Options>
)=> string

export type compileBody=(tpl: Tpl, buff: AstObject[])=> string
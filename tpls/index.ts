import { Tpl as TplCore } from "./core.ts";
import { readFile, resolvePath } from "./file-handling.ts";
export {
  TplError,
  TplFileResolutionError,
  TplNameResolutionError,
  TplParseError,
  TplRuntimeError,
} from "./err.ts";
export { type TplConfig, type Options } from "./config.ts";

export class Tpl extends TplCore {
  override readFile = readFile;

  override resolvePath = resolvePath;
}

export const hello = "world";
import { TplFileResolutionError } from "./err.ts";
import * as path from "@std/path";

/* TYPES */
import type { Tpl as TplCore } from "./types/core.ts";
import type { Options } from "./types/config.ts";

/* END TYPES */

export function readFile(this: TplCore, abs_path: string): string {
  let text = "";
  try {
    const res = Deno.readFileSync(abs_path);
    text = new TextDecoder().decode(res);

  // deno-lint-ignore no-explicit-any
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      throw new TplFileResolutionError(abs_path);
    } else {
      throw err;
    }
  }

  return text;
}

export function resolvePath(
  this: TplCore,
  templatePath: string,
  options?: Partial<Options>,
): string {
  let resolvedFilePath = "";

  const views = this.config.views;

  if (!views) {
    throw new TplFileResolutionError("Views directory is not defined");
  }

  const baseFilePath = options && options.filepath;
  const defaultExtension = this.config.defaultExtension === undefined
    ? ".tpl"
    : this.config.defaultExtension;

  // how we index cached template paths
  const cacheIndex = JSON.stringify({
    filename: baseFilePath, // filename of the template which called includeFile()
    path: templatePath,
    views: this.config.views,
  });

  templatePath += path.extname(templatePath) ? "" : defaultExtension;

  // if the file was included from another template
  if (baseFilePath) {
    // check the cache

    if (this.config.cacheFilepaths && this.filepathCache[cacheIndex]) {
      return this.filepathCache[cacheIndex];
    }

    const absolutePathTest = absolutePathRegExp.exec(templatePath);

    if (absolutePathTest && absolutePathTest.length) {
      const formattedPath = templatePath.replace(/^\/*|^\\*/, "");
      resolvedFilePath = path.join(views, formattedPath);
    } else {
      resolvedFilePath = path.join(path.dirname(baseFilePath), templatePath);
    }
  } else {
    resolvedFilePath = path.join(views, templatePath);
  }

  if (dirIsChild(views, resolvedFilePath)) {
    // add resolved path to the cache
    if (baseFilePath && this.config.cacheFilepaths) {
      this.filepathCache[cacheIndex] = resolvedFilePath;
    }

    return resolvedFilePath;
  } else {
    throw new TplFileResolutionError(
      `Template '${templatePath}' is not in the views directory`,
    );
  }
}

const dirIsChild=(parent: string, dir: string)=> {
  const relative = path.relative(parent, dir);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

const absolutePathRegExp = /^\\|^\//;
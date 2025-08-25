/* TYPES */

import type { Options } from "./types/config.ts";
import type { AstObject } from "./types/parse.ts";
import type { Tpl as TplType } from "./types/core.ts";

/* END TYPES */

/**
 * Compiles a template string to a function string. Most often users just use `compile()`, which calls `compileToString` and creates a new function using the result
 */

export function compileToString(
  this: TplType,
  str: string,
  options?: Partial<Options>,
): string {
  const config = this.config;
  const isAsync = options && options.async;
  // const compileBody = this.compileBody;

  const buffer: Array<AstObject> = this.parse.call(this, str);

  // note: when the include function passes through options, the only parameter that matters is the filepath parameter
  let res = `${config.functionHeader}
let include = (template, data) => this.render(template, data, options)
let includeAsync = (template, data) => this.renderAsync(template, data, options)

let __tpl = {res: "", e: this.config.escapeFunction, f: this.config.filterFunction${
    config.debug
      ? ', line: 1, templateStr: "' +
        str.replace(/\\|"/g, "\\$&").replace(/\r\n|\n|\r/g, "\\n") +
        '"'
      : ""
  }};

function layout(path, data) {
  __tpl.layout = path;
  __tpl.layoutData = data;
}${config.debug ? "try {" : ""}${
    config.useWith ? "with(" + config.varName + "||{}){" : ""
  }

${this.compileBody.call(this, buffer)}
if (__tpl.layout) {
  __tpl.res = ${
    isAsync ? "await includeAsync" : "include"
  } (__tpl.layout, {...${config.varName}, body: __tpl.res, ...__tpl.layoutData});
}
${config.useWith ? "}" : ""}${
    config.debug
      ? "} catch (e) { this.TplToHtml.RuntimeErr(e, __tpl.templateStr, __tpl.line, options.filepath) }"
      : ""
  }
return __tpl.res;
`;

  if (config.plugins) {
    for (let i = 0; i < config.plugins.length; i++) {
      const plugin = config.plugins[i];
      if (plugin.processFnString) {
        res = plugin.processFnString(res, config);
      }
    }
  }

  return res;
}

/**
 * 优化后的 compileBody
 * 将 AST 转换为可执行 JS 代码
 */

export function compileBody(this: TplType, buff: AstObject[]): string {
  const config = this.config;

  const autoEscape = config.autoEscape;
  const autoFilter = config.autoFilter;
  const escapeFn = "__tpl.e";
  const filterFn = "__tpl.f";

  const codeChunks: string[] = [];

  // 预处理插件，只保留 processAST
  const activePlugins = (config.plugins || []).filter(p => p.processAST);

  for (let i = 0, len = buff.length; i < len; i++) {
    const currentBlock = buff[i];

    if (typeof currentBlock === "string") {
      const str = currentBlock.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\r\n|\n|\r/g, "\\n");
      codeChunks.push(`__tpl.res+='${str}'`);
    } else {
      // AST 对象
      const block = currentBlock; // AstObject 实际上是 string | { t,val,lineNo }
      const type = block.t;
      let content = block.val || "";

      if (config.debug && block.lineNo !== undefined) {
        codeChunks.push(`__tpl.line=${block.lineNo}`);
      }

      switch (type) {
        case "r":
          if (autoFilter) content = `${filterFn}(${content})`;
          codeChunks.push(`__tpl.res+=${content}`);
          break;

        case "i":
          if (autoFilter) content = `${filterFn}(${content})`;
          if (autoEscape) content = `${escapeFn}(${content})`;
          codeChunks.push(`__tpl.res+=${content}`);
          break;

        case "e":
          codeChunks.push(content);
          break;

        default:
          break;
      }
    }
  }

  let finalCode = codeChunks.join("\n");

  // 处理插件对函数字符串的修改
  for (let i = 0; i < activePlugins.length; i++) {
    const plugin = activePlugins[i];
    if (plugin.processFnString) {
      finalCode = plugin.processFnString(finalCode, config);
    }
  }

  return finalCode;
}
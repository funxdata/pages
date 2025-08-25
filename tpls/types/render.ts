import type { InternalOptions } from "./config.ts"
import type { TemplateFunction } from "./compile.ts"
export type TplRender = {
  // 同步渲染
  render: (
    template: string | TemplateFunction,
    data?: Record<string, any>,
    meta?: InternalOptions
  ) => string;

  // 异步渲染
  renderAsync: (
    template: string | TemplateFunction,
    data?: Record<string, any>,
    meta?: InternalOptions
  ) => Promise<string>;

  // 渲染字符串
  renderString: (
    template: string,
    data?: Record<string, any>
  ) => string;

  // 异步渲染字符串
  renderStringAsync: (
    template: string,
    data?: Record<string, any>
  ) => Promise<string>;
};
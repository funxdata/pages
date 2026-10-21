// 基础模板错误类型
export interface TplError extends Error {
  TplParseError: (msg: string, str?: string, index?: number) => never;
  TplRuntimeError: (msg: string) => never;
  TplNameResolutionError: (msg: string) => never;
}

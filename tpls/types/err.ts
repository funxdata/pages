// 基础模板错误类型
export interface TplError extends Error {
  TplParseError: (msg: string, str: string, index: number) => void;
  TplRuntimeError: (msg: string) => void;
  TplNameResolutionError: (msg: string) => void;
}
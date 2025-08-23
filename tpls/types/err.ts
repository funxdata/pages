// 基础模板错误类型
export type TplError = Error & {
    name: "Tpl Error";
    message: string;
  };
  
  export type TplParseError = TplError & {
    name: "TplParser Error";
  };
  
  export type TplRuntimeError = TplError & {
    name: "TplRuntime Error";
  };
  
  export type TplFileResolutionError = TplError & {
    name: "TplFileResolution Error";
    message: string;
  };
  
  export type TplNameResolutionError = TplError & {
    name: "TplNameResolution Error";
  };
  
  // 抛出解析错误的函数类型
  export type ParseErrFn = (message: string, str: string, indx: number) => never;
  
  // 抛出运行时错误的函数类型
  export type RuntimeErrFn = (
    originalError: Error,
    str: string,
    lineNo: number,
    path: string,
  ) => never;
  
  // 类型导出
  export type TplErrors = {
    TplError: TplError;
    TplParseError: TplParseError;
    TplRuntimeError: TplRuntimeError;
    TplFileResolutionError: TplFileResolutionError;
    TplNameResolutionError: TplNameResolutionError;
    ParseErr: ParseErrFn;
    RuntimeErr: RuntimeErrFn;
  };
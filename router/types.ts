export type CallBackFn = ()=>Promise<void>;
export type RouteMap= [Route]
// deno-lint-ignore no-explicit-any
export type HistoryStateArgs = [state: any, title: string, url?: string | URL | null];

export type Route = {
  pathname: string; // 路由地址  
  loadjs?:string; // 需要加载js
  hook?:CallBackFn;    // 正式的回调方法
  already?: CallBackFn; // 执行前的方法
  before?: CallBackFn; // 执行前执行的
  after?: CallBackFn;  // 执行完的回调方法
  leave?: CallBackFn;  // 页面离开时执行的方法
  is_history:number;  // 是否记录路由
  Pagination?:CallBackFn
  do_load():void;
  load_Pagination():void;
}
export type RouteNode = {
  pathname: string;
  children: RouteNode[];  // 可以有多个子节点
  title?:string;  // 节点名称
  parent?: RouteNode;     // 可选：指向父节点，构建完整树
  add_node(path: string,title:string): RouteNode;
  search_node(path: string): RouteNode|undefined;
  delete_node(path: string):boolean;
};

export interface PagesRouterInfo {
  nodes: RouteNode;
  routers: RouteMap;
  on(path: string,title:string): Route|null;
  off(path: string): boolean;
  navigate(redirt_url: string): void;
  replace(redirt_url:string): void;
  loading(redirt_url:string):void;
  search(path:string): Route|null;
  init(url?: string): void;
}

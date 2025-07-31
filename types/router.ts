export type CallBackFn = ()=>Promise<void>;
export type RouteMap= [Route]
export type Route = {
  pathname: string; // 路由地址  
  loadjs?:string; // 需要加载js
  hook?:CallBackFn;    // 正式的回调方法
  already?: CallBackFn; // 执行前的方法
  before?: CallBackFn; // 执行前执行的
  after?: CallBackFn;  // 执行完的回调方法
  leave?: CallBackFn;  // 页面离开时执行的方法
  do_load():void;
}
export type RouteNode = {
  pathname: string;
  children: RouteNode[];  // 可以有多个子节点
  parent?: RouteNode;     // 可选：指向父节点，构建完整树
  add_node(path: string): RouteNode;
  search_node(path: string): RouteNode|undefined;
  delete_node(path: string):boolean;
};

export interface PagesRouterInfo {
  nodes: RouteNode;
  routers: RouteMap;
  on(path: string): Route|null;
  search(path:string): Route|null;
  off(path: string): boolean;
  navigate(path: string): void;
  init(url?: string): void;
}

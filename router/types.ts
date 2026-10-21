/** 路由回调，允许同步或异步 */
export type CallBackFn = () => Promise<void> | void;

/** 路由列表 */
export type RouteMap = Route[];

// deno-lint-ignore no-explicit-any
export type HistoryStateArgs = [state: any, title: string, url?: string | URL | null];

/** 单条路由的加载配置 */
export type RouteLoadOptions = {
  /** 是否在脚本 URL 后追加随机参数，默认 true（沿用旧行为） */
  cacheBust?: boolean;
  /** 脚本加载超时时间（毫秒），默认 10000 */
  scriptTimeout?: number;
};

export type Route = {
  pathname: string; // 路由地址，支持 /user/:id 与 /files/*
  title?: string; // 路由标题
  loadjs?: string; // 需要加载的 js 文件
  /** 为 true 时离开该路由后保留已加载的脚本 */
  keepLoadedScript?: boolean;
  /** 为 true 时缓存页面 DOM 与滚动位置（需配置 container） */
  keepAlive?: boolean;
  /** 当前导航匹配到的动态参数，如 /user/:id -> { id: "42" } */
  params: Record<string, string>;
  /** 由该路由加载的脚本，用于离开时清理 */
  loadedScripts: HTMLScriptElement[];
  hook?: CallBackFn; // 正式的回调方法
  already?: CallBackFn; // 执行前的方法
  before?: CallBackFn; // 执行前执行的
  after?: CallBackFn; // 执行完的回调方法
  leave?: CallBackFn; // 页面离开时执行的方法
  Pagination?: CallBackFn;
  /** 脚本加载失败或超时的回调 */
  onLoadError?: (error: Error) => void;
  is_history: number; // 1 = pushState，其它值 = replaceState
  do_load(): Promise<void>;
  do_unload(removeScripts?: boolean): void;
  load_Pagination(): Promise<void>;
};

export type RouteNode = {
  pathname: string;
  children: RouteNode[]; // 可以有多个子节点
  title?: string; // 节点名称
  parent?: RouteNode; // 可选：指向父节点，构建完整树
  add_node(path: string, title: string): RouteNode;
  search_node(path: string): RouteNode | undefined;
  delete_node(path: string): boolean;
};

/** PagesRouter 的完整配置（构造后只读约定） */
export type PagesRouterConfig = {
  /** 离开路由时移除本次加载的 script，默认 true */
  removeLoadedScripts: boolean;
  /** 脚本加载超时时间（毫秒），默认 10000 */
  scriptTimeout: number;
  /** 脚本 URL 是否追加随机参数，默认 true */
  cacheBust: boolean;
  /** 全局开启 keep-alive（路由可用 keepAlive: false 关闭），默认 false */
  keepAlive: boolean;
  /** 恢复滚动位置，默认 false */
  restoreScroll: boolean;
  /** 离开带查询参数的页面时清理地址栏参数，默认 false */
  clearSearchOnLeave: boolean;
  /** keep-alive 缓存的容器（选择器或元素），未配置时不缓存 DOM */
  container?: string | HTMLElement;
  /** 未匹配到路由时的回调 */
  onNotFound?: (url: string) => void;
  /** 统一错误回调（脚本加载、生命周期回调抛错等） */
  onError?: (error: unknown) => void;
};

/** PagesRouter 构造配置 */
export type PagesRouterOptions =
  & Partial<Omit<PagesRouterConfig, "onNotFound" | "onError">>
  & Pick<PagesRouterConfig, "onNotFound" | "onError">;

export interface PagesRouterInfo {
  nodes: RouteNode;
  routers: RouteMap;
  /** 当前已加载的路由 */
  currentRoute: Route | null;
  config: PagesRouterConfig;
  on(path: string, title: string): Route | null;
  off(path: string): boolean;
  navigate(redirt_url: string): Promise<void>;
  replace(redirt_url: string): Promise<void>;
  loading(redirt_url: string): Promise<void>;
  search(path: string): Route | null;
  init(url?: string): void;
  /** 清理 keep-alive 缓存：不传参数时清空全部 */
  clearKeepAlive(path?: string): void;
}

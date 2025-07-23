//  数据结构的格式化

export type Route = {
  name: string
  path: string | RegExp
  handler: Handler
  load_js:URL
  hooks: RouteHooksStorage
}
export type Handler = (match?: Match) => void
export type Match = {
  url: string
  queryString: string
  hashString: string
  route: Route
  data: { [key: string]: string } | null
  params: { [key: string]: string } | null
}
// 回调方法的定义
export type CallBackFn = ()=>Promise<void>;
export type BeforeHook = (done: CallBackFn, match: Match) => void
export type AfterHook = (match: Match) => void
export type LeaveHook = (done: CallBackFn, match: Match | Match[]) => void
export type AlreadyHook = (match: Match) => void
export type RouteHooks = {
  before?: BeforeHook
  after?: AfterHook
  leave?: LeaveHook
  already?: AlreadyHook
}
export type RouteHooksStorage = {
  before?: BeforeHook[]
  after?: AfterHook[]
  leave?: LeaveHook[]
  already?: AlreadyHook[]
}
export type NavigateOptions = {
  title?: string
  stateObj?: Object
  historyAPIMethod?: string
  updateBrowserURL?: boolean
  callHandler?: boolean
  callHooks?: boolean
  updateState?: boolean
  force?: boolean
  resolveOptions?: ResolveOptions
}
export type ResolveStrategy = 'ONE' | 'ALL'
export type ResolveOptions = {
  strategy?: ResolveStrategy
  hash?: boolean
  noMatchWarning?: boolean
}
export type QContext = {
  currentLocationPath: string
  to: string
  instance: PagesRouterInfo
  matches?: Match[]
  match?: Match
  navigateOptions?: NavigateOptions
  resolveOptions?: ResolveOptions
  notFoundHandled?: boolean
}
export type GenerateOptions = {
  includeRoot: boolean
}
export type RouterOptions = ResolveOptions & { linksSelector?: string }
declare class PagesRouterInfo {
  constructor(options?: RouterOptions)
  root: string
  routes: Route[]
  destroyed: boolean
  current: null | Match[]
  on(f:string, hooks: CallBackFn, load_js?: URL): Route
  off(f:string):void
}

export default PagesRouterInfo

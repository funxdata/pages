import { HistoryStateArgs } from "@/types/router.ts"
import { PagesRouter } from  "./core.ts"
import { WatchClickLink } from "./watch/watch_click.ts"
import { WatchPopState } from "./watch/watch_pop.ts"
import { WatchPushState } from "./watch/watch_push.ts"
import { WatchReplace } from "./watch/watch_replace.ts"
// // 初始化并挂载到globalThis
// deno-lint-ignore no-explicit-any
declare const globalThis:any
const GlobalPagesRouter = new PagesRouter();
globalThis.GlobalPagesRouter = GlobalPagesRouter;

// 监听所有页面跳转事件
globalThis.addEventListener("click", (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) return;  // 先判断 target 是 Element 类型
  const anchor = target.closest('a');
  if (!anchor || !anchor.href) return;
  event.preventDefault();
  WatchClickLink(globalThis.GlobalPagesRouter,event)
});

const rawPushState = history.pushState;
const rawReplaceState = history.replaceState
// 使用 function 而不是箭头函数，这样 arguments 是当前函数的
history.pushState = function (state: any, title: string, url?: string | URL | null): void {
  const result = rawPushState.apply(this, arguments as unknown as HistoryStateArgs);
  WatchPushState(globalThis.GlobalPagesRouter,arguments  as unknown as HistoryStateArgs)
  return result;
};

// deno-lint-ignore no-explicit-any
history.replaceState = function (state: any,title: string, url?: string | URL | null): void {
  const result = rawReplaceState.apply(this, arguments as unknown as HistoryStateArgs);
  WatchReplace(globalThis.GlobalPagesRouter,arguments as unknown as HistoryStateArgs)
  return result;
};
// 
globalThis.addEventListener("popstate",  (event:PopStateEvent)=> {
  // fireChangeEvent("popstate", event.state, true);
  WatchPopState(globalThis.GlobalPagesRouter,event);
});

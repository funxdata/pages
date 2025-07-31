import type {Route,RouteNode,PagesRouterInfo} from "@/types/router.ts"
// deno-lint-ignore no-explicit-any
const GlobalPagesRoute = (globalThis as any)["GlobalPagesRouter"] as PagesRouterInfo;
export const MatchRout=(from:Route|null,to:Route|null,nodes:RouteNode)=>{
  if(to==null||from==null){
    console.warn("Route path no exists");
    return;
  }
  if(from.leave!=null){
    from.leave();
  }
  to.do_load();
}
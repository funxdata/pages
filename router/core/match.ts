import type { Route, PagesRouterInfo } from "@/types/router.ts"
export const MatchRout=(routes:PagesRouterInfo,from:Route|null,to:Route|null)=>{
  if(to==null||from==null){
    console.warn("Route path no exists");
    return;
  }
  if(from.leave!=null){
    from.leave();
  }
  const segments = to.pathname.split("/").filter(Boolean);
  // 一级目录没有内容,直接跳转至二级页面
  if((segments.length<2&&to.loadjs==null)||(segments.length<2&&to.loadjs=="")){
    // 跳转至子目录
    const router_nodes = routes.nodes.search_node(to.pathname);
    if(router_nodes==undefined){
      console.warn("not found page");
      return;
    }
    // 跳转至子目录的一级目录
    const redirt_path = "/"+router_nodes.pathname+"/"+router_nodes.children[0].pathname;
    routes.navigate(redirt_path);
    return;
  }
  to.do_load();
}
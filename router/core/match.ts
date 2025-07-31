import type {Route,RouteNode,PagesRouterInfo} from "@/types/router.ts"
// deno-lint-ignore no-explicit-any
const GlobalPagesRoute = (globalThis as any)["GlobalPagesRouter"] as PagesRouterInfo;
export const MatchRout=(from:Route|null,to:Route|null,nodes:RouteNode)=>{
  if(to==null){
    console.warn("Route path no exists");
    return;
  }
  
  // 正常执行
  if(from==null){
    const tosegments = to.pathname.split("/").filter(Boolean);
    let cur_path = "";
    tosegments.forEach((segment, index) => {
      cur_path = cur_path+"/"+segment;
      const cur_Route = GlobalPagesRoute.search(cur_path)
      if(cur_Route==null){
        const cur_node = nodes.search_node(cur_path)
        if(cur_node==undefined){
          console.warn("this path is error");
          return;
        }
      }else{
        cur_Route.do_load();
      }
      console.log("第" + index + "级路径：" + segment);
    });

  }else{
    // 匹配执行
    

  }

}
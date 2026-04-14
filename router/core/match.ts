import type { Route, PagesRouterInfo,RouteNode } from "@/types/router.ts"

export const MatchRoute = (
  routes: PagesRouterInfo,
  cur_url: URL
): Route | null => {
  const cur_route = routes.search(cur_url.pathname);
  if (cur_route == null) {
    console.warn("router is not found");
    return null;
  }

  // 查找对应的节点
  const router_node = routes.nodes.search_node(cur_url.pathname) as RouteNode | null;
  if (!router_node) {
    console.warn("router node is not found");
    return null;
  }

  const segments = cur_url.pathname.split("/").filter(Boolean);

  // 一级目录特殊处理：当只有一级目录且 loadjs 未定义时，返回拼接路径字符串
  if (segments.length === 1 && cur_route.loadjs === undefined) {
    const child = router_node.children?.[0];
    if (child) {
      return routes.search(`${cur_url.pathname}/${child.pathname}`);
    } else {
      console.warn("No child route found for the node");
      return null;
    }
  }

  // 默认返回当前路由
  return cur_route;
};
import type { RouteNode as RouteNodeType} from "@/types/router.ts";
export class RouteNode implements RouteNodeType {
  pathname: string;
  title?: string; // ✅ 新增 title 属性
  children: RouteNodeType[];
  parent?: RouteNodeType | undefined;
  constructor(pathname:string,children:[], title?: string){
    this.pathname =pathname;
    this.children = children;
    this.title = title;
  }

  add_node(path: string, title: string): RouteNode {
    const parts = path.split("/").filter(Boolean);
    // deno-lint-ignore no-this-alias
    let current: RouteNode = this;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      let next = current.children.find(c => c.pathname === part) as RouteNode;

      if (!next) {
        next = new RouteNode(part, [], i === parts.length - 1 ? title : undefined); // ✅ 设置 title 仅在最后一层
        next.parent = current;
        current.children.push(next);
      }

      current = next;
    }

    return current;
  }

  search_node(path: string): RouteNode | undefined {
    const parts = path.split("/").filter(Boolean);
    let current: RouteNode = this;

    for (const part of parts) {
      const next = current.children.find(c => c.pathname === part) as RouteNode;
      if (!next) return undefined;
      current = next;
    }

    return current;
  }

  delete_node(path: string): boolean {
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 0) return false;

    const name = parts.pop()!;
    const parentPath = "/" + parts.join("/");
    const parent = this.search_node(parentPath);
    if (!parent) return false;

    const index = parent.children.findIndex(c => c.pathname === name);
    if (index !== -1) {
      parent.children.splice(index, 1);
      return true;
    }
    return false;
  }
  
}
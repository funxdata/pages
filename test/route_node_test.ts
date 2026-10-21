import { assertEquals, assertThrows } from "@std/assert";
import { RouteNode } from "../router/core/route_node.ts";

Deno.test("RouteNode 支持新增、查找与删除", () => {
  const root = new RouteNode("/", []);
  const node = root.add_node("/a/b", "B");

  assertEquals(node.pathname, "b");
  assertEquals(node.title, "B");
  assertEquals(root.search_node("/a/b")?.title, "B");
  assertEquals(root.search_node("/a")?.children.length, 1);

  assertEquals(root.delete_node("/a/b"), true);
  assertEquals(root.search_node("/a/b"), undefined);
  assertEquals(root.delete_node("/a/b"), false);
});

Deno.test("RouteNode 重复新增不会产生重复节点", () => {
  const root = new RouteNode("/", []);
  root.add_node("/a/b", "B1");
  root.add_node("/a/b", "B2");

  assertEquals(root.search_node("/a")?.children.length, 1);
  assertEquals(root.search_node("/a/b")?.title, "B1");
});

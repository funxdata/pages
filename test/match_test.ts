import { assertEquals } from "@std/assert";
import { PagesRouter } from "../router/core.ts";
import { MatchRoute } from "../router/core/match.ts";

Deno.test("MatchRoute 一级目录未配置 loadjs 时落到第一个子路由", () => {
  const router = new PagesRouter();
  router.on("/product", "产品");
  router.on("/product/infos", "详情");
  router.on("/product/classify", "分类");

  const matched = MatchRoute(router, new URL("https://example.com/product"));
  assertEquals(matched?.pathname, "/product/infos");
});

Deno.test("MatchRoute 一级目录配置 loadjs 后返回自身", () => {
  const router = new PagesRouter();
  const route = router.on("/product", "产品");
  route!.loadjs = "/product.ts";
  router.on("/product/infos", "详情");

  const matched = MatchRoute(router, new URL("https://example.com/product"));
  assertEquals(matched?.pathname, "/product");
});

Deno.test("MatchRoute 未注册路径返回 null", () => {
  const router = new PagesRouter();
  const matched = MatchRoute(router, new URL("https://example.com/missing"));
  assertEquals(matched, null);
});

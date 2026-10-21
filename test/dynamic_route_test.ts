import { assertEquals } from "@std/assert";
import { PagesRouter } from "../router/core.ts";
import { MatchRoute } from "../router/core/match.ts";

Deno.test("R-07 search 解析 :param", () => {
  const router = new PagesRouter();
  router.on("/user/:id", "用户");

  const route = router.search("/user/42");
  assertEquals(route?.pathname, "/user/:id");
  assertEquals(route?.params.id, "42");
});

Deno.test("R-07 search 支持通配符", () => {
  const router = new PagesRouter();
  router.on("/files/*", "文件");

  const route = router.search("/files/a/b.txt");
  assertEquals(route?.pathname, "/files/*");
  assertEquals(route?.params["*"], "a/b.txt");
});

Deno.test("R-07 精确路由优先于动态路由", () => {
  const router = new PagesRouter();
  router.on("/user/me", "我");
  router.on("/user/:id", "用户");

  assertEquals(router.search("/user/me")?.pathname, "/user/me");
  assertEquals(router.search("/user/42")?.pathname, "/user/:id");
});

Deno.test("R-07 MatchRoute 保留动态参数", () => {
  const router = new PagesRouter();
  router.on("/user/:id", "用户");

  const matched = MatchRoute(router, new URL("https://example.com/user/42"));
  assertEquals(matched?.pathname, "/user/:id");
  assertEquals(matched?.params.id, "42");
});

Deno.test("R-07 未匹配的动态路由返回 null", () => {
  const router = new PagesRouter();
  router.on("/user/:id", "用户");

  assertEquals(router.search("/post/42"), null);
  assertEquals(
    MatchRoute(router, new URL("https://example.com/post/42")),
    null,
  );
});

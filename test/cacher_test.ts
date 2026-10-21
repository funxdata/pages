import { assertEquals } from "@std/assert";
import { Cacher } from "../tpls/storage.ts";

Deno.test("Cacher 提供 define/get/has/keys/size/remove/clear", () => {
  const cacher = new Cacher();

  cacher.define("a", "A");
  assertEquals(cacher.has("a"), true);
  assertEquals(cacher.has("missing"), false);
  assertEquals(cacher.get("a"), "A");
  assertEquals(cacher.keys(), ["a"]);
  assertEquals(cacher.size(), 1);

  cacher.remove("a");
  assertEquals(cacher.has("a"), false);
  assertEquals(cacher.size(), 0);

  cacher.define("b", "B");
  cacher.define("c", "C");
  cacher.clear();
  assertEquals(cacher.size(), 0);
  assertEquals(cacher.keys(), []);
});

Deno.test("Cacher.load 合并缓存", () => {
  const cacher = new Cacher();
  cacher.define("a", "A");
  cacher.load({ b: "B" });

  assertEquals(cacher.get("a"), "A");
  assertEquals(cacher.get("b"), "B");
  assertEquals(cacher.size(), 2);
});

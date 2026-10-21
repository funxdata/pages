import { assertEquals } from "@std/assert";
import {
  isInternalUrl,
  isModifiedClick,
  is_only_Pagination,
  safeURL,
} from "../router/core/check_url.ts";

Deno.test("is_only_Pagination 仅在 pathname 相同且带查询串时命中", () => {
  const from = "https://example.com/a";
  assertEquals(is_only_Pagination("/a?page=2", from), true);
  assertEquals(is_only_Pagination("/a", from), false);
  assertEquals(is_only_Pagination("/b?page=2", from), false);
});

Deno.test("safeURL 支持相对路径与非法输入", () => {
  const base = "https://example.com";
  assertEquals(safeURL("/a?x=1", base)?.href, "https://example.com/a?x=1");
  assertEquals(safeURL("https://other.com/a", base)?.href, "https://other.com/a");
  assertEquals(safeURL("http://[invalid", base), null);
});

Deno.test("isModifiedClick 过滤组合键与非左键", () => {
  const base = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };
  assertEquals(isModifiedClick(base as MouseEvent), false);
  assertEquals(isModifiedClick({ ...base, button: 1 } as MouseEvent), true);
  assertEquals(isModifiedClick({ ...base, metaKey: true } as MouseEvent), true);
  assertEquals(isModifiedClick({ ...base, ctrlKey: true } as MouseEvent), true);
});

Deno.test("isInternalUrl 只接受同源 http(s)", () => {
  assertEquals(isInternalUrl(new URL("mailto:a@b.com")), false);
  assertEquals(isInternalUrl(new URL("javascript:void(0)")), false);
});

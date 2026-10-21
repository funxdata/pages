import {
  assertEquals,
  assertStringIncludes,
  assertThrows,
} from "@std/assert";
import { fromFileUrl, join } from "@std/path";
import { Tpl } from "../tpls/core.ts";
import { Tpl as FileTpl } from "../tpls/index.ts";
import { readFile } from "../tpls/file-handling.ts";

Deno.test("插值默认转义，raw 不转义", () => {
  const tpl = new Tpl();
  assertEquals(
    tpl.renderString("Hello <%= it.name %>!", { name: "Dowell" }),
    "Hello Dowell!",
  );
  assertEquals(
    tpl.renderString("<%= it.html %>", { html: "<b>" }),
    "&lt;b&gt;",
  );
  assertEquals(tpl.renderString("<%~ it.html %>", { html: "<b>" }), "<b>");
});

Deno.test("未闭合标签抛出带行列号的 TplParseError", () => {
  const tpl = new Tpl();
  const err = assertThrows(() => tpl.compile("<% if (true) {"), Error);
  assertEquals(err.name, "TplParseError");
  assertStringIncludes(err.message, "unclosed tag");
  assertStringIncludes(err.message, "line 1");
});

Deno.test("未注册模板抛出 TplNameResolutionError", () => {
  const tpl = new Tpl();
  const err = assertThrows(
    () => tpl.renderString("<%~ include('missing', it) %>"),
    Error,
  );
  assertEquals(err.name, "TplNameResolutionError");
});

Deno.test("loadTemplate 注册的模板可被 include", () => {
  const tpl = new Tpl();
  tpl.loadTemplate("greeting", "<%= it.name %>");
  assertEquals(
    tpl.renderString("<%~ include('greeting', it) %>", { name: "A" }),
    "A",
  );
});

Deno.test("文件模板渲染与文件不存在错误", () => {
  const views = fromFileUrl(new URL("../examples/", import.meta.url));
  const tpl = new FileTpl({ views });

  assertStringIncludes(
    tpl.render("./tpl_sample", { message: "world" }),
    "Hello world!",
  );

  const err = assertThrows(
    () => readFile.call(tpl, join(views, "not-exist.tpl")),
    Error,
  );
  assertEquals(err.name, "TplFileResolutionError");
});

import type { Tpl } from "@/types/tpls.ts"
// deno-lint-ignore no-explicit-any
const TplToHtml = (globalThis as any)["TplToHtml"] as Tpl;

const App = document.getElementById("app") as HTMLElement;
// 1. 编译并注册模板
TplToHtml.templatesSync?.define("header", TplToHtml.compile!("<header><%= it.title %></header>"));
TplToHtml.templatesSync?.define("footer", TplToHtml.compile!("<footer>© <%= it.year %></footer>"));

// 2. 渲染模板
const result = await TplToHtml.renderStringAsync!(
  "<%~ include('header', it) %><p>Hello</p><%~ include('footer', it) %>",
  { title: "My Site", year: 2025 }
);

console.log(result);
App.innerHTML = result;

import type { Tpl } from "@/types/tpls.ts"
// deno-lint-ignore no-explicit-any
const TplToHtml = (globalThis as any)["TplToHtml"] as Tpl;

const App = document.getElementById("app") as HTMLElement;
// 1. 编译并注册模板
const header_html = `
<header>

<div><%= it.title %></div>

</header>
`
TplToHtml.loadTemplate("header", TplToHtml.compile!(header_html));
TplToHtml.loadTemplate("footer", TplToHtml.compile!("<footer>© <%= it.year %></footer>"));

// console.log(TplToHtml.templates)
// const aa = TplToHtml.templates?.get("header")
// console.log(aa);
// // 2. 渲染模板
const result = await TplToHtml.renderStringAsync(
  "<%~ include('header', it) %><p><%= it.hello %></p><%~ include('footer', it) %><% console.log('hello world') %> ",
  { title: "My Site", year: 2025,hello:"hello world" }
);
console.log(result)
App.innerHTML = result;

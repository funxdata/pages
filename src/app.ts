import type { PagesRouterInfo } from "@/types/router.ts";
import type { Tpl } from "@/types/tpls.ts";
import { get_router_info } from "@/src/apis/route.ts";
import { main_tpl } from "./views/main.ts";
import { menu_tpl } from "./views/menu.ts";

const TplToHtml = (globalThis as { TplToHtml?: Tpl }).TplToHtml;
const GlobalPagesRouter = (globalThis as { GlobalPagesRouter?: PagesRouterInfo })
  .GlobalPagesRouter;

if (!TplToHtml) {
  throw new Error(
    "TplToHtml is not available: load /tpls/browser.ts before /src/app.ts",
  );
}
if (!GlobalPagesRouter) {
  throw new Error(
    "GlobalPagesRouter is not available: load /router/router.ts before /src/app.ts",
  );
}

const response = await get_router_info();
const routerinfo = response.data ?? [];

for (const group of routerinfo) {
  for (const item of group.child) {
    const route = GlobalPagesRouter.on(item.path, item.title);
    if (route && item.url) {
      route.loadjs = item.url;
    }
  }
}

const app_main = document.getElementById("app") as HTMLElement;
app_main.innerHTML = main_tpl;

const app_navtabs = app_main.querySelector("#asides") as HTMLElement;
app_navtabs.innerHTML = await TplToHtml.renderString(menu_tpl, {
  tabledata: routerinfo,
});

// 未匹配路由时在内容区展示 404，而不是停留在旧页面
GlobalPagesRouter.config.onNotFound = (url) => {
  const showmain = document.getElementById("showmain");
  if (!showmain) return;
  showmain.innerHTML = `
    <div class="NotFound">
      <h2>404</h2>
      <p>页面不存在：${escapeHtml(url)}</p>
      <p><a href="/">返回首页</a></p>
    </div>
  `;
};

// 完成路由注册后执行首次导航
GlobalPagesRouter.init();

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]!,
  );
}

import type { PagesRouterInfo } from "@/types/router.ts";
import type { Tpl } from "@/types/tpls.ts";
import { menu_tpl } from "@/examples/menu_view.ts";

const GlobalPagesRouter = (globalThis as { GlobalPagesRouter?: PagesRouterInfo })
  .GlobalPagesRouter;
const TplToHtml = (globalThis as { TplToHtml?: Tpl }).TplToHtml;

if (!GlobalPagesRouter || !TplToHtml) {
  throw new Error(
    "router/tpls is not installed: load /router/router.ts and /tpls/browser.ts first",
  );
}

const routerData = [
  {
    route: "/home",
    view_url: "/examples/load_js_a.ts",
    name: "home",
    title: "测试1",
  },
  {
    route: "/user",
    view_url: "/examples/load_js_b.ts",
    name: "user",
    title: "测试2",
  },
  {
    route: "/product",
    view_url: "",
    name: "product",
    title: "测试3",
  },
  {
    route: "/product/infos",
    view_url: "/examples/load_js_cc.ts",
    name: "product/infos",
    title: "测试4",
  },
  {
    route: "/product/classify",
    view_url: "/examples/load_js_cc.ts",
    name: "product/classify",
    title: "测试5",
  },
];

for (const items of routerData) {
  const route = GlobalPagesRouter.on(items.route, items.title);
  // 空字符串与未配置等价，交给一级目录规则处理
  if (route && items.view_url) {
    route.loadjs = items.view_url;
  }
}

const document_app = document.getElementById("app") as HTMLElement;

document_app.innerHTML = await TplToHtml.renderString(menu_tpl, {
  menuitems: routerData,
});

const do_test_location = document_app.querySelector(
  "#do_test_location",
) as HTMLElement;
do_test_location.onclick = () => {
  globalThis.location.href = "/home/test";
};

const do_test_replace = document_app.querySelector(
  "#do_test_replace",
) as HTMLElement;
do_test_replace.onclick = () => {
  history.replaceState(null, "", "/home/replacepop");
};

const do_test_pop = document_app.querySelector("#do_test_pop") as HTMLElement;
do_test_pop.onclick = () => {
  history.pushState(null, "", "/home/pop");
};

GlobalPagesRouter.init();


import type { PagesRouterInfo,Route } from "@/types/router.ts"
import type { Tpl } from "@/types/tpls.ts"
import { menu_tpl } from "@/examples/menu_view.ts"
import { pagination } from "@/tools/index.ts"
import type { paginationtype } from "@/types/tools.ts"
// deno-lint-ignore no-explicit-any
const GlobalPagesRoute = (globalThis as any)["GlobalPagesRouter"] as PagesRouterInfo;
 // deno-lint-ignore no-explicit-any
 const TplToHtml = (globalThis as any)["TplToHtml"] as Tpl;
const routerData =[
  {
    route:"/home",
    view_url:"/examples/load_js_a.ts",
    name:"home",
    title:"测试1"
  },
  {
    route:"/user",
    view_url:"/examples/load_js_b.ts",
    name:"user",
    title:"测试2"
  },
  {
    route:"/product",
    view_url:"",
    name:"product",
    title:"测试3"
  },
  {
    route:"/product/infos",
    view_url:"/examples/load_js_cc.ts",
    name:"product/infos",
    title:"测试4"
  },
  {
    route:"/product/classify",
    view_url:"/examples/load_js_cc.ts",
    name:"product/classify",
    title:"测试5"
  },
]
for (let index = 0; index < routerData.length; index++) {
  const items = routerData[index];
  const route = GlobalPagesRoute.on(items.route,items.title) as Route
  if(route.loadjs!=""&&route.loadjs!="default"){
    route.loadjs = items.view_url;
  }
  
}

const document_app = document.getElementById("app") as HTMLElement;

const nav_html = await TplToHtml.renderString(menu_tpl, {
        menuitems:routerData
    });
document_app.innerHTML = nav_html

const pagination_node = document.getElementById("tables-set-pagination") as HTMLElement;
const pagination_cfg:paginationtype.paginationcfg = {
  size: 10,
  num: 1,
  total: 44
}
await pagination(pagination_node,pagination_cfg,(cfg:paginationtype.paginationcfg)=>{
  console.log(cfg)
  console.log("zzzzzzzz")
})
const page_id_change = document.getElementById("do_page_change") as HTMLElement;
page_id_change.onclick= ()=>{
  // pgcfg.total = 11
  pagination_cfg.total = 22;
}
console.log(GlobalPagesRoute)

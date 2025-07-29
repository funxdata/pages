import PagesRouterInfo  from "@/types/router.ts";
export default (route: any) => {
  if (typeof globalThis.document !== "undefined") {
    globalThis.document.addEventListener("click", function (event: MouseEvent) {
      const target = (event.target as HTMLElement).closest("a");
      if (target instanceof HTMLAnchorElement) {
        event.preventDefault(); // 阻止默认跳转
        route.navigate(target.href);
      }
    });
  } else {
    console.warn("document 不存在，跳过绑定点击事件");
  }
};
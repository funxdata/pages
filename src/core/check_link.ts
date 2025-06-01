export default (route:any)=>{
  document.addEventListener("click", function (event:MouseEvent) {
        const target = (event.target as HTMLElement).closest("a");
        if (target instanceof HTMLAnchorElement) {
          event.preventDefault(); // 阻止跳转
          // let PagesRouterInfo
          // declare const GlobalPagesRouter: PagesRouter;
          route.navigate(target.href)
        }
  });
}
//  监听页面的替换变化
// replacestate 主要针对于页面只改变地址,不记录历史记录地址
import type { PagesRouterInfo,HistoryStateArgs } from "@/types/router.ts";

export const WatchReplace = (router: PagesRouterInfo,evt:HistoryStateArgs) => {
  // router.replace(href.toString())
  if(evt[0]!=null&&evt[0].sys){
    return;
  }
  router.loading(evt[2] as string);
};

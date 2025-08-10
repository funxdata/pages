//  监听页面的替换变化
// PushState 主要针对于页面只改变地址,并记录历史记录地址
import type { PagesRouterInfo,HistoryStateArgs } from "@/types/router.ts";

export const WatchPushState = (router: PagesRouterInfo,evt:HistoryStateArgs) => {
    //   router.replace(href.toString())

    if(evt[0]!=null&&evt[0].sys){
        return;
    }
    console.log("pushstate   evt",evt);
    // try{
    //     if(evt[0].sys){
    //         return;
    //     }
    // } catch {
    //     console.log("pushstate   evt",evt);
    // }
};

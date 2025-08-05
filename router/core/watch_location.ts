//  监听url 变化
import { PagesRouterInfo } from "@/types/router.ts";
export const WatchReplacestate = (router: PagesRouterInfo) => {
globalThis.addEventListener('replacestate', () => {
    console.log('URL updated via replaceState:', location.href);

    }); 
};

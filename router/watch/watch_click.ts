import type { PagesRouterInfo } from "@/types/router.ts";
import { isInternalUrl, isModifiedClick, safeURL } from "../core/check_url.ts";

/**
 * 只接管"同源、左键、无修饰键、无 target/download"的普通链接；
 * 外链、下载、新窗口、锚点等保持浏览器默认行为。
 */
export const WatchClickLink = (router: PagesRouterInfo, event: MouseEvent) => {
  if (event.defaultPrevented) return;
  if (isModifiedClick(event)) return;

  const target = (event.target as Element | null)?.closest?.("a");
  if (!(target instanceof HTMLAnchorElement)) return;

  if (target.target && target.target !== "_self") return;
  if (target.hasAttribute("download")) return;
  if (target.getAttribute("rel")?.split(/\s+/).includes("external")) return;

  const href = target.getAttribute("href");
  if (!href || href.startsWith("#")) return;

  const to_url = safeURL(target.href);
  if (!to_url) {
    console.warn("node route error");
    return;
  }
  if (!isInternalUrl(to_url)) return;

  event.preventDefault();
  void router.navigate(to_url.href);
};

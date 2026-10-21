export const getPathLevel = (path: string): number => {
  const parts = path.split("/").filter(Boolean);
  return parts.length;
};

/** 生成绝对 URL；非浏览器环境回退到 localhost，避免测试时崩溃 */
export const absoluteUrl = (url: string): string => {
  try {
    const base = typeof globalThis.location !== "undefined"
      ? globalThis.location.href
      : "http://localhost/";
    return new URL(url, base).href;
  } catch {
    return url;
  }
};

/** 用于比较的 URL：去掉 query 与 hash，避免随机参数导致重复加载 */
export const canonicalUrl = (url: string): string => {
  try {
    const parsed = new URL(absoluteUrl(url));
    parsed.search = "";
    parsed.hash = "";
    return parsed.href;
  } catch {
    return url;
  }
};

/** 页面中是否已经存在同地址脚本（已移除的脚本不算） */
export const hasScript = (canonical: string): boolean => {
  if (typeof document === "undefined") return false;
  return Array.from(document.scripts).some((script) => {
    if (!script.src || !script.isConnected) return false;
    return canonicalUrl(script.src) === canonical;
  });
};

/** 在保留原有 query 的前提下追加（或覆盖）缓存参数 */
export const withCacheBust = (url: string, key = "mt_rand"): string => {
  try {
    const parsed = new URL(absoluteUrl(url));
    parsed.searchParams.set(key, String(Math.random()));
    return parsed.href;
  } catch {
    return url;
  }
};

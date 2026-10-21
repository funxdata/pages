/**
 * 兼容旧接口：跨域链接交由浏览器默认行为处理，
 * 这里保留返回值语义（true 表示跨域）供外部调用。
 */
export const check_url = (target: HTMLAnchorElement): boolean => {
  const linkOrigin = new URL(target.href).origin;
  const currentOrigin = currentOriginOrFallback();
  return linkOrigin !== currentOrigin;
};

export const is_only_Pagination = (
  to: string,
  from?: string,
): boolean => {
  try {
    const from_url = new URL(from ?? currentHref());
    const to_url = new URL(to, from_url);
    return (
      from_url.pathname === to_url.pathname &&
      Boolean(to_url.search)
    );
  } catch {
    return false;
  }
};

export const safeURL = (url: string, base?: string): URL | null => {
  /** 安全 URL 解析，支持相对路径 */
  try {
    const fallbackBase = base ?? currentOriginOrFallback();
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
      return new URL(url, fallbackBase);
    }
    return new URL(url);
  } catch (e) {
    console.warn("Invalid URL:", url, e);
    return null;
  }
};

/** 组合键 / 非左键点击不应被路由接管 */
export const isModifiedClick = (event: MouseEvent): boolean =>
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey;

/** 是否为同源 http(s) 链接 */
export const isInternalUrl = (url: URL): boolean =>
  (url.protocol === "http:" || url.protocol === "https:") &&
  url.origin === currentOriginOrFallback();

function currentHref(): string {
  return typeof globalThis.location !== "undefined"
    ? globalThis.location.href
    : "http://localhost/";
}

function currentOriginOrFallback(): string {
  return typeof globalThis.location !== "undefined"
    ? globalThis.location.origin
    : "http://localhost";
}

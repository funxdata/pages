export const check_url=  (target:HTMLAnchorElement):boolean=>{
  const linkOrigin = new URL(target.href).origin;
  const currentOrigin = globalThis.location.origin;
  if (linkOrigin === currentOrigin) {
    return false;
  }
  console.log('阻止跨域跳转:', target.href);
  globalThis.open(target.href, '_blank');
  return true;
}


export const is_only_Pagination=(to:string):boolean=>{
  const from_url = new URL(globalThis.location.href);
  const to_url = new URL(to, globalThis.location.href);
  return (
    from_url.pathname === to_url.pathname &&
    Boolean(to_url.search)
  );
};

export const safeURL = (url: string): URL | null=>{
  /** 安全 URL 解析，支持相对路径 */
    try {
      if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
        return new URL(url, globalThis.location.origin);
      }
      return new URL(url);
    } catch (e) {
      console.warn("Invalid URL:", url, e);
      return null;
    }
  
}
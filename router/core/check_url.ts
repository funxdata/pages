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
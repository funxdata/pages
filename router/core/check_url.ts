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
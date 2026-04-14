export const getPathLevel = (path:string):number=> {
  const parts = path.split('/').filter(Boolean); // 去掉空串
  return parts.length;
}
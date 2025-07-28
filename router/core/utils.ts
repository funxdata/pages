// 路由路径分割
export const path_slice=(path_src:string):string[]=>{
    path_src.replace(/^\/|\/$/g, "");
    return path_src.split("/");
}
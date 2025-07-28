import router from "./router_map.ts";

const match_rout_map = (path_src:string,rts:router[]):router|undefined=>{
    for (let index = 0; index < rts.length; index++) {
        if(path_src==rts[index].path){
            return rts[index];
        }
    }
    return undefined;
}
// 根据路径匹配路由
export default async (redirt_path:string,rts:router[])=>{
    const local_path = globalThis.location.pathname
    // 执行离开的回调
    const res = match_rout_map(redirt_path,rts)
    if(res!=undefined){
       await res.leave_handler()
    }
    // 执行刷新
    if(local_path==redirt_path){
        const res = match_rout_map(redirt_path,rts)
        if(res!=undefined){
            await res.do_hookhandler()
        }
        return;
    }
    /** 
     *  执行回调
     * 
     * 
    **/

    // 当前路径
    // const local_paths = path_slice(local_path)
    // // 执行
    // for (let index = 0; index < local_paths.length; index++) {
    //     const element = array[index];
        
    // }

    // 执行最后的页面执行
    const redirt_res = match_rout_map(redirt_path,rts);
    if(redirt_res!=undefined){
        await redirt_res.do_hookhandler();
    }
    return undefined; 
}
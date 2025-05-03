// 定义路由表
import { CallBackFn} from "../types.ts"
export default class {
    path:string;
    hook:CallBackFn;    // 正式的回调方法
    already?: CallBackFn; // 执行前的方法
    before?: CallBackFn; // 执行前执行的
    after?: CallBackFn;  // 执行完的回调方法
    leave?: CallBackFn;  // 页面离开时执行的方法
    constructor(path:string,callbackfn:CallBackFn){
        this.path =path;
        this.hook = callbackfn;
    }
    async do_hookhandler(){
        // 准备
        if(this.already!=undefined){
            await this.already()
        }
        // 执行前
        if(this.before!=undefined){
            await this.before()
        }
        // 执行回调
        if(this.hook!=undefined){
            await this.hook();
        }
        // 执行后
        if(this.after!=undefined){
            await this.after()
        }
        this.hook()
    }

    // 执行离开后的方法
    async leave_handler(){
        // 执行后
        if(this.leave!=undefined){
            await this.leave()
        }
    }
}
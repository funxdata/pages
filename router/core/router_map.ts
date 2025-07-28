// 定义路由表
import { CallBackFn} from "../../types/router.ts"
const DEFAULT_JS_URL = new URL("https://static.funxdata.com/default.js");
export default class {
    path:string;
    load_js:URL;
    hook:CallBackFn;    // 正式的回调方法
    already?: CallBackFn; // 执行前的方法
    before?: CallBackFn; // 执行前执行的
    after?: CallBackFn;  // 执行完的回调方法
    leave?: CallBackFn;  // 页面离开时执行的方法
    constructor(path:string,callbackfn:CallBackFn,load_js:URL=DEFAULT_JS_URL){
        this.path =path;
        this.hook = callbackfn;
        this.load_js = load_js;
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
        // this.hook()
    }
    // 加载 call_back
    async loading_url_hook(){
        if(this.load_js.href!=DEFAULT_JS_URL.href){
            const script = document.createElement('script') as HTMLScriptElement ;
            if(this.load_js.href==""){
                script.src = DEFAULT_JS_URL.href;
            }else{
                script.src = this.load_js.href;
            }
            script.onload = this.hook;
            document.body.appendChild(script);
            await this.hook();
        }else{
           await this.hook(); 
        }
    }

    // 执行离开后的方法
    async leave_handler(){
        // 执行后
        if(this.leave!=undefined){
            await this.leave()
        }
    }
}
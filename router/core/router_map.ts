import type { CallBackFn, Route as RouteType } from "@/types/router.ts";
import { service_plugin } from "./service_plugin.ts";
import { getPathLevel } from "./utils.ts"
export class Route implements RouteType {
  pathname: string;
  title?:string;  // 节点名称
  loadjs?: string;
  hook?: CallBackFn;
  already?: CallBackFn;
  before?: CallBackFn;
  after?: CallBackFn;
  leave?: CallBackFn;
  Pagination?:CallBackFn
  is_history:number;
  constructor(pathname: string) {
    this.pathname = pathname;
    this.is_history = 1;
  }
  do_load(){
    if(this.loadjs!=null){
      this.do_load_script();
    }else{
      this.do_load_fn();
    }
    // 二级目录加载
    if(getPathLevel(this.pathname)>1){
      service_plugin();
    }
  }
  do_load_fn(){

    if(this.already!=null){
      this.already();
    }
    if(this.before!=null){
      this.before();
    }
    if(this.hook!=null){
      this.hook();
    }
    if(this.after!=null){
      this.after();
    }
  }

  do_load_script() {
    if (!this.loadjs) return;

    const baseUrl = this.loadjs;
    const urlWithRand = `${baseUrl}?mt_rand=${Math.random()}`;

    // 检查是否已加载过（忽略随机参数）
    const alreadyLoaded = Array.from(document.scripts).some(
        s => s.src && s.src.startsWith(baseUrl)
    );

    if (alreadyLoaded) {
      console.log(`[script] already loaded: ${baseUrl}`);
      if (this.hook) {
          this.hook(); // 直接执行 hook
      }
      return;
    }

    // 创建唯一 ID（可选）
    const scriptId = `dy_load_scripts_${Date.now()}`;
    const script = document.createElement("script");
    script.src = urlWithRand;
    script.id = scriptId;
    script.async = true;
    script.type = "module";

    script.onload = () => {
        console.log(`[script] loaded: ${urlWithRand}`);
        if (this.hook) {
          this.hook(); // 脚本加载完成后再执行 hook
        }
    };

    script.onerror = () => {
      console.error(`[script] failed to load: ${urlWithRand}`);
    };

    document.body.appendChild(script);
  }

  // 加载分页方法
  load_Pagination(){
    if(this.Pagination!=null){
      this.Pagination();
    }
  }
  
  
}
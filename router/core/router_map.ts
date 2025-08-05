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
  constructor(pathname: string) {
    this.pathname = pathname;
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

  do_load_script(){
    if(this.loadjs==null){
      return;
    }
    // 检查是否已经加载过
    const existingScript = document.getElementById("dy_load_scripts");
    if (existingScript) {
      existingScript.remove();
    }
    const script = document.createElement("script");
    script.src = this.loadjs+"?mt_rand="+Math.random();
    script.id = "dy_load_scripts"
    script.async = true;
    script.type = "module";
    script.onload = () => {
      console.log(`[script] loaded: ${script.src}`);
    };
    document.body.appendChild(script);
    if(this.hook!=null){
      this.hook();
    }
  }

  // 加载分页方法
  load_Pagination(){
    if(this.Pagination!=null){
      this.Pagination();
    }
  }
  
  
}
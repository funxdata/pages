import { CallBackFn} from "../types.ts"
export default class RouteNode {
    node:string="";   // 节点名称
    child:RouteNode[]=[]; // 子节点
    cross?:CallBackFn; // 通过执行的方法
    constructor(node:string){
        this.node = node
    }
    // 添加节点
    add(node:RouteNode){
        this.child.push(node)
    }
    // 返回节点数量
    sum(){
        return this.child.length;
    }
}
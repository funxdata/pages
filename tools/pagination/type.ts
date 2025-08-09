
export type paginationcfg = {
    size:number,    // 分页数量
    num:number,     // 当前页码
    total:number,   // 总计
    amount?:number, // 页面总数 
}

export type PaginationCallback= (cfg: paginationcfg)=>void
export type PaginationFn = (node:HTMLElement,cfg:paginationcfg,cb:PaginationCallback)=>void
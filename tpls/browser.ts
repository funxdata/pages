import { Tpl as TplCore } from "./core.ts";

export class Tpl extends TplCore {}

// deno-lint-ignore no-explicit-any
declare const globalThis:any;
(() => {
    globalThis.TplToHtml = new Tpl({cache:false}); 
})();


import { Tpl } from "@/tpls/index.ts";

const tpl = new Tpl({cache:false}); // 假设你构造了它

const result = tpl.renderString("Hello <%= it.name %>!", { name: "Dowell" });
console.log(result);
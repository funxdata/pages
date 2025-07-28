import { Tpl } from "../tpls/index.ts";
const SampleTpl = new Tpl({ views: "./examples"});
const res = await SampleTpl.render("./tpl_sample", { message: "world" });
console.log(res); // Hi Ben!
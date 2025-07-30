
import type { Tpl } from "../types/tpls.ts"
// deno-lint-ignore no-explicit-any
const TplToHtml = (globalThis as any)["TplToHtml"] as Tpl;
const template = `<ul>
<% it.users.forEach(function(user){ %>
  <li><%= user %></li>
<% }) %>
</ul>`;
const data = { users: ["Alice", "Bob", "Charlie"] };

const output = await TplToHtml.renderString(template, data);

console.log(output); 
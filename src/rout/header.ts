import { header_tpl } from "../views/header.ts";
export const init_footer = () => {
  // Your code here to initialize the footer
  const header = document.getElementById("header");
  header.innerHTML = header_tpl;
};

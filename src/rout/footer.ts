import { footer_tpl } from "../views/footer.ts";
export const init_footer = () => {
  // Your code here to initialize the footer
  const footer = document.getElementById("footer");
  footer.innerHTML = footer_tpl;
};

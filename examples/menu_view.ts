export const menu_tpl = `
<ul>
  <li class="row align-center mb-20"><a href="https://www.funxdata.com" class="vg-btn btn-size-sm btn-type-brand mr-8" >跳转至其它网站</a></li>
  <% it.menuitems.forEach(function(item){ %>
    <li class="row align-center mb-20"><a class="vg-btn btn-size-sm btn-type-brand mr-8" href="<%= item.route%>"><%= item.name%></a></li>
  <% }) %>
  <li class="row align-center mb-20"><a href="?uuid=asdasda" class="vg-btn btn-size-sm btn-type-brand mr-8" >params search1</a></li>
  <li class="row align-center mb-20"><a href="/home?uuid=123" class="vg-btn btn-size-sm btn-type-brand mr-8" >params search2</a></li>
  <li class="row align-center mb-20"><a href="/home2?uuid=zzasd" class="vg-btn btn-size-sm btn-type-brand mr-8" >params search3</a></li>
  <li class="row align-center mb-20"><a class="vg-btn btn-size-sm btn-type-brand mr-8" id="do_test_location">do_test_location</a></li>
  <li class="row align-center mb-20"><a class="vg-btn btn-size-sm btn-type-brand mr-8" id="do_test_replace">do_test_replace</a></li>
  <li class="row align-center mb-20"><a class="vg-btn btn-size-sm btn-type-brand mr-8" id="do_test_pop">do_test_pop</a></li>
</ul>
`
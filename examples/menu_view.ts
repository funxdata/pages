export const menu_tpl = `
<ul>
    <% it.menuitems.forEach(function(item){ %>
      <li><a href="<%= item.route%>"><%= item.name%></a></li>
    <% }) %>
  </ul>
`
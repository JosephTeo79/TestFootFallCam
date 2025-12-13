// menu-load.js
document.addEventListener("DOMContentLoaded", function () {
  fetch("menu.html")
    .then(response => response.text())
    .then(html => {
      // 电脑菜单
      const leftScroll = document.getElementById("left-menu-scroll");
      if (leftScroll) leftScroll.innerHTML = html;

      // 手机菜单
      const mobileUl = document.querySelector("#mobile-drawer ul");
      if (mobileUl) mobileUl.innerHTML = html;

      // 初始化 treeview
      if (typeof initTreeview === "function") initTreeview();
    })
    .catch(err => console.error("加载 menu.html 失败:", err));
});

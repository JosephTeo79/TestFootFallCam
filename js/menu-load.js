// menu-load.js
// 异步加载 menu.html，然后初始化 treeview

document.addEventListener("DOMContentLoaded", function() {
  fetch("menu.html")
    .then(response => {
      if (!response.ok) throw new Error("加载 menu.html 失败");
      return response.text();
    })
    .then(html => {
      // 电脑左侧菜单
      const leftMenu = document.getElementById("left-menu-scroll");
      if (leftMenu) leftMenu.innerHTML = html;

      // 手机 drawer 菜单
      const mobileDrawer = document.getElementById("mobile-drawer");
      if (mobileDrawer) {
        const ul = mobileDrawer.querySelector("ul");
        if (ul) ul.innerHTML = html;
      }

      // 初始化 treeview
      if (typeof initTreeview === "function") {
        initTreeview();
      } else {
        console.warn("initTreeview 未定义，请确认 treeview.js 已正确加载");
      }
    })
    .catch(err => console.error("menu-load.js 错误:", err));
});

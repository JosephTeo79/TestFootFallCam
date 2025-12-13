// menu-load.js
// 加载 menu.html 并初始化 treeview

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

    // 菜单加载完成后初始化 treeview
    if (typeof initTreeview === "function") {
      initTreeview();
    } else {
      console.error("initTreeview 函数未定义");
    }
  })
  .catch(err => console.error("menu-load.js 错误:", err));

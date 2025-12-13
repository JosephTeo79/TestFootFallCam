// menu-load.js
document.addEventListener("DOMContentLoaded", function () {
  // 目标容器
  const leftMenu = document.getElementById("left-menu-scroll");
  const mobileDrawer = document.querySelector("#mobile-drawer ul");

  if (!leftMenu || !mobileDrawer) {
    console.error("缺少菜单容器");
    return;
  }

  // 加载 menu.html
  fetch("menu.html")
    .then(response => response.text())
    .then(html => {
      // 创建一个临时 DOM
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      // 获取菜单 <ul>
      const menuUl = tempDiv.querySelector("ul");
      if (!menuUl) {
        console.error("menu.html 中找不到 <ul>");
        return;
      }

      // 克隆两份，分别放入电脑和手机
      const leftMenuClone = menuUl.cloneNode(true);
      const mobileMenuClone = menuUl.cloneNode(true);

      leftMenu.appendChild(leftMenuClone);
      mobileDrawer.appendChild(mobileMenuClone);

      // ⚠️ 注意：treeview.js 中的事件监听会自动生效，因为它监听 DOMContentLoaded 时的 .caret
      // 如果 menu-load.js 在 treeview.js 之后执行，需要手动初始化事件（可选）
    })
    .catch(err => console.error("加载 menu.html 失败:", err));
});

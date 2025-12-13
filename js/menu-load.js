document.addEventListener("DOMContentLoaded", function () {
  fetch("menu.html")
    .then(res => res.text())
    .then(html => {
      // 电脑菜单
      const desktopMenu = document.getElementById("left-menu-scroll");
      if (desktopMenu) desktopMenu.innerHTML = html;

      // 手机菜单
      const mobileDrawer = document.getElementById("mobile-drawer");
      if (mobileDrawer) {
        const ul = mobileDrawer.querySelector("ul");
        if (ul) ul.innerHTML = html;
      }
    })
    .catch(err => console.error("菜单加载失败:", err));
});

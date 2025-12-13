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

      // ✅ 菜单加载完成后手动触发 treeview.js 的点击绑定
      // 电脑端
      const desktopCarets = desktopMenu.querySelectorAll(".caret");
      desktopCarets.forEach(caret => {
        caret.addEventListener("click", function () {
          const nested = caret.nextElementSibling;
          if (nested) nested.classList.toggle("active");
          caret.classList.toggle("caret-down");
        });
      });

      // 手机端
      const mobileCarets = mobileDrawer.querySelectorAll(".caret");
      mobileCarets.forEach(caret => {
        caret.addEventListener("click", function (e) {
          e.stopPropagation();
          const nested = caret.nextElementSibling;
          if (nested) nested.classList.toggle("nested-open");
        });
      });
    })
    .catch(err => console.error("菜单加载失败:", err));
});

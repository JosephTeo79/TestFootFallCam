document.addEventListener("DOMContentLoaded", function () {
  // 父容器
  const leftMenu = document.getElementById("left-menu-scroll");
  const mobileDrawer = document.getElementById("mobile-drawer").querySelector("ul");

  // 加载 menu.html
  fetch("menu.html")
    .then(response => {
      if (!response.ok) throw new Error("加载 menu.html 失败");
      return response.text();
    })
    .then(html => {
      // 插入电脑和手机菜单
      leftMenu.innerHTML = html;
      mobileDrawer.innerHTML = html;

      // ✅ 事件委托处理点击
      // 电脑菜单
      leftMenu.addEventListener("click", function(e) {
        const caret = e.target.closest(".caret");
        if (caret) {
          const nested = caret.parentElement.querySelector(".nested");
          if (nested) nested.classList.toggle("active");
          caret.classList.toggle("caret-down");
        }
      });

      // 手机菜单
      mobileDrawer.addEventListener("click", function(e) {
        const target = e.target;

        // 1️⃣ 文件夹 toggle
        const caret = target.closest(".caret");
        if (caret) {
          const nested = caret.parentElement.querySelector(".nested");
          if (nested) nested.classList.toggle("nested-open");
        }

        // 2️⃣ 点击菜单项关闭 drawer
        if (target.closest("a.nav-link")) {
          document.getElementById("mobile-drawer").classList.remove("open");
        }
      });
    })
    .catch(err => console.error(err));
});

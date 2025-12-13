document.addEventListener("DOMContentLoaded", function () {
  fetch('menu.html')
    .then(response => response.text())
    .then(html => {
      // 放入电脑菜单
      const leftMenuScroll = document.getElementById('left-menu-scroll');
      if (leftMenuScroll) {
        leftMenuScroll.innerHTML = html;
      }

      // 放入手机菜单
      const mobileDrawerUL = document.querySelector('#mobile-drawer > ul');
      if (mobileDrawerUL) {
        mobileDrawerUL.innerHTML = html;
      }

      // 菜单加载完成后初始化 treeview
      if (typeof initTreeview === "function") {
        initTreeview(); // 调用 treeview.js 内部封装好的初始化函数
      }
    })
    .catch(err => console.error("加载 menu.html 失败:", err));
});

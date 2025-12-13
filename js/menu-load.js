// menu-load.js
document.addEventListener("DOMContentLoaded", function () {
  fetch('menu.html')
    .then(response => response.text())
    .then(html => {
      // --- 插入电脑菜单 ---
      const leftMenuScroll = document.getElementById('left-menu-scroll');
      if (leftMenuScroll) leftMenuScroll.innerHTML = html;

      // --- 插入手机菜单 ---
      const mobileDrawerUL = document.querySelector('#mobile-drawer > ul');
      if (mobileDrawerUL) mobileDrawerUL.innerHTML = html;

      // --- 初始化 Treeview ---
      if (typeof initTreeview === "function") initTreeview();

      // --- 事件委托：电脑菜单 ---
      if (leftMenuScroll) {
        leftMenuScroll.addEventListener('click', function(e){
          const link = e.target.closest('a.nav-link');
          if (!link) return;

          const title = link.dataset.title || link.textContent.trim();
          const url = link.dataset.url;
          const resource = link.dataset.resource;

          if(resource) openResourceTab(title, resource);
          else if(url) openTab(title, url);

          e.preventDefault();
        });
      }

      // --- 事件委托：手机菜单 ---
      const mobileDrawer = document.getElementById('mobile-drawer');
      if (mobileDrawer) {
        mobileDrawer.addEventListener('click', function(e){
          const link = e.target.closest('a.nav-link');
          if (!link) return;

          const title = link.dataset.title || link.textContent.trim();
          const url = link.dataset.url;
          const resource = link.dataset.resource;

          if(resource) openResourceTab(title, resource);
          else if(url) openTab(title, url);

          // 点击后自动关闭 drawer
          mobileDrawer.classList.remove('open');
          e.preventDefault();
        });
      }

    })
    .catch(err => console.error("加载 menu.html 失败:", err));
});

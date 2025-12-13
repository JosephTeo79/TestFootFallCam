function initTreeView() {
  // caret 展开/收起
  document.querySelectorAll(".caret").forEach(caret => {
    caret.addEventListener("click", function () {
      const nested = this.parentElement.querySelector(".nested");
      if (nested) nested.classList.toggle("active");
      this.classList.toggle("caret-down");
    });
  });

  // 拖拽分隔条
  const divider = document.getElementById("divider");
  const leftPane = document.getElementById("left-pane");
  const rightPane = document.getElementById("right-pane");
  if (divider && leftPane) {
    let isDragging = false;
    divider.addEventListener("mousedown", e => {
      isDragging = true;
      document.body.style.cursor = "col-resize";
      if (rightPane) rightPane.style.pointerEvents = "none";
      e.preventDefault();
    });
    document.addEventListener("mousemove", e => {
      if (!isDragging) return;
      const newWidth = e.clientX;
      if (newWidth > 100 && newWidth < window.innerWidth - 100) {
        leftPane.style.width = newWidth + "px";
      }
    });
    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = "default";
        if (rightPane) rightPane.style.pointerEvents = "auto";
      }
    });
  }

  // 菜单点击
  function openTab(title, url) {
    const tabBar = document.getElementById("tab-bar");
    const tabContent = document.getElementById("tab-content");

    let existingTab = tabBar.querySelector(`.tab[data-title="${title}"]`);
    if (existingTab) {
      tabBar.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tabContent.querySelectorAll(".tab-frame").forEach(f => f.style.display = "none");
      existingTab.classList.add("active");
      const frame = document.getElementById(existingTab.dataset.frameId);
      if (frame) frame.style.display = "block";
      return;
    }

    const frameId = "frame-" + Date.now();
    const tab = document.createElement("div");
    tab.classList.add("tab", "active");
    tab.dataset.title = title;
    tab.dataset.frameId = frameId;
    tab.innerHTML = `${title} <button class="close-btn">&times;</button>`;
    tabBar.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tabBar.appendChild(tab);

    const frame = document.createElement("iframe");
    frame.classList.add("tab-frame");
    frame.id = frameId;
    frame.src = url;
    frame.style.display = "block";
    tabContent.querySelectorAll(".tab-frame").forEach(f => f.style.display = "none");
    tabContent.appendChild(frame);

    tab.querySelector(".close-btn").addEventListener("click", () => {
      frame.remove();
      tab.remove();
      const tabs = tabBar.querySelectorAll(".tab");
      if (tabs.length > 0) {
        const lastTab = tabs[tabs.length - 1];
        lastTab.classList.add("active");
        const lastFrame = document.getElementById(lastTab.dataset.frameId);
        if (lastFrame) lastFrame.style.display = "block";
      }
    });

    tab.addEventListener("click", e => {
      if (e.target.classList.contains("close-btn")) return;
      tabBar.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tabContent.querySelectorAll(".tab-frame").forEach(f => f.style.display = "none");
      tab.classList.add("active");
      frame.style.display = "block";
    });
  }

  document.querySelectorAll("a.nav-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const title = link.dataset.title || link.textContent.trim();
      const url = link.dataset.url;
      const resource = link.dataset.resource;
      if (url) openTab(title, url);
      else if (resource) openTab(title, resource + ".html");

      // 手机 drawer 自动关闭
      const mobileDrawer = document.getElementById("mobile-drawer");
      if (mobileDrawer && mobileDrawer.contains(link)) mobileDrawer.classList.remove("open");
    });
  });
}

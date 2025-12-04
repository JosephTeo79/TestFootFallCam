// js/tab.js
const tabBar = document.getElementById("tab-bar");
const tabContent = document.getElementById("tab-content");
const openTabs = {};

function openTab(title, url) {
    if (openTabs[title]) {
        setActiveTab(title);
        return;
    }

    // === 创建 Tab 按钮 ===
    const tab = document.createElement("div");
    tab.className = "tab";
    tab.dataset.title = title;

    const tabText = document.createElement("span");
    tabText.textContent = title;
    tab.appendChild(tabText);

    // 关闭按钮 ❌
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.className = "close-btn";
    tab.appendChild(closeBtn);

    // === 事件 ===
    tabText.addEventListener("click", () => setActiveTab(title));
    closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeTab(title);
    });

    tabBar.appendChild(tab);

    // === iframe ===
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.className = "tab-frame";
    iframe.dataset.title = title;
    tabContent.appendChild(iframe);

    openTabs[title] = { tab, iframe };

    setActiveTab(title);
}

function setActiveTab(title) {
    Object.values(openTabs).forEach(({ tab, iframe }) => {
        tab.classList.remove("active");
        iframe.style.display = "none";
    });
    openTabs[title].tab.classList.add("active");
    openTabs[title].iframe.style.display = "block";
}

function closeTab(title) {
    const { tab, iframe } = openTabs[title];
    tab.remove();
    iframe.remove();
    delete openTabs[title];

    // 自动切换到最后一个 tab
    const remaining = Object.keys(openTabs);
    if (remaining.length > 0) {
        setActiveTab(remaining[remaining.length - 1]);
    }
}

// 给 nav-link 绑定
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const url = this.getAttribute("data-url");
            const title = this.textContent.trim();
            openTab(title, url);
        });
    });
});

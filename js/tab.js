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
    iframe.className = "tab-frame";
    iframe.dataset.title = title;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.frameBorder = "0";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    // 如果是 YouTube embed 链接，确保用 https://www.youtube.com/embed/ 格式
    if (url.includes("youtube.com")) {
        // 可选：直接替换原来的 embed URL 确保兼容
        let embedUrl = url;
        if (!url.includes("/embed/")) {
            // 转换普通 youtube 链接为 embed
            const videoIdMatch = url.match(/(?:v=|\.be\/)([a-zA-Z0-9_-]{11})/);
            if (videoIdMatch) embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
        }
        iframe.src = embedUrl;
    } else {
        iframe.src = url;
    }

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

    const remaining = Object.keys(openTabs);
    if (remaining.length > 0) {
        setActiveTab(remaining[remaining.length - 1]);
    }
}

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

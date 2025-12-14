document.addEventListener("DOMContentLoaded", () => {
    const documents = window.documents || []; // 从 tab.js 引用
    const searchContent = window.searchContent;

    if (!searchContent) return;

    // --- 创建移动端搜索按钮，放在 Introduction menu 右上角 ---
    const introLink = document.querySelector('#mobile-drawer a.nav-link[data-url="introduction.html"]');
    if (!introLink) return;

    const mobileSearchBtn = document.createElement("button");
    mobileSearchBtn.textContent = "🔍";
    mobileSearchBtn.style.float = "right";
    mobileSearchBtn.style.marginLeft = "5px";
    mobileSearchBtn.style.fontSize = "0.9em";
    mobileSearchBtn.style.padding = "2px 6px";
    mobileSearchBtn.style.border = "none";
    mobileSearchBtn.style.borderRadius = "4px";
    mobileSearchBtn.style.background = "#007bff";
    mobileSearchBtn.style.color = "#fff";
    mobileSearchBtn.style.cursor = "pointer";

    introLink.style.position = "relative";
    introLink.appendChild(mobileSearchBtn);

    // --- 点击按钮切换显示搜索面板 ---
    mobileSearchBtn.addEventListener("click", () => {
        if (!searchContent) return;

        // 隐藏所有已打开 tab
        Object.values(window.openTabs || {}).forEach(({ iframe }) => {
            if (iframe) iframe.style.display = "none";
            if (iframe) iframe.style.flex = "1";
        });

        // 切换 searchContent 显示/隐藏
        searchContent.style.display = searchContent.style.display === "none" ? "flex" : "none";

        // 清空搜索输入和结果
        const inputBox = document.getElementById("search-box");
        const resultsDiv = document.getElementById("search-results");
        if (inputBox) inputBox.value = "";
        if (resultsDiv) resultsDiv.innerHTML = "";
    });
});

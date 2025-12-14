document.addEventListener('DOMContentLoaded', function() {
    // 确保浮窗 searchPanel 已经存在
    const searchPanel = document.getElementById("search-panel");
    if (!searchPanel) return;

    // 找 Introduction 链接
    const introLink = document.querySelector('#mobile-drawer a.nav-link[data-url="introduction.html"]');
    if (!introLink) return;

    // 创建移动端搜索按钮
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

    // 点击按钮显示/隐藏搜索浮窗
    mobileSearchBtn.addEventListener("click", () => {
        searchPanel.style.display = searchPanel.style.display === "none" ? "block" : "none";
    });

    // 把按钮添加到 Introduction 链接右侧
    introLink.style.position = "relative";
    introLink.appendChild(mobileSearchBtn);
});

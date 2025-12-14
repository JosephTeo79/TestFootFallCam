// js/search.js
document.addEventListener("DOMContentLoaded", () => {
  if (!window.documents) window.documents = [];

  const searchContent = document.createElement("div");
  searchContent.style.display = "none";
  searchContent.style.flex = "1";
  searchContent.style.flexDirection = "column";
  searchContent.style.height = "100%";
  window.searchContent = searchContent;

  const inputBox = document.createElement("input");
  inputBox.type = "text";
  inputBox.id = "search-box";
  inputBox.placeholder = "Search...";

  const resultsDiv = document.createElement("div");
  resultsDiv.id = "search-results";
  resultsDiv.style.flex = "1";
  resultsDiv.style.overflowY = "auto";

  searchContent.appendChild(inputBox);
  searchContent.appendChild(resultsDiv);
  tabContent.appendChild(searchContent);

  inputBox.addEventListener("input", function () {
    const query = inputBox.value.trim();
    resultsDiv.innerHTML = "";
    if (!query) return;

    const results = window.documents.filter(doc => window.fuzzyMatch(query, doc.title));
    if (results.length === 0) {
      resultsDiv.innerHTML = "<p>No results...</p>";
      return;
    }

    results.forEach(doc => {
      const item = document.createElement("div");
      item.textContent = doc.title;
      item.style.cursor = "pointer";
      item.style.padding = "4px 0";

      item.addEventListener("click", () => {
        if (doc.resource) window.openResourceTab(doc.title, doc.resource);
        else if (doc.url) window.openTab(doc.title, doc.url);
      });

      resultsDiv.appendChild(item);
    });
  });

  // 搜索 tab 按钮
  const searchBtnTab = document.createElement("div");
  searchBtnTab.className = "tab";
  searchBtnTab.textContent = "🔍 Search";
  searchBtnTab.style.cursor = "pointer";
  searchBtnTab.style.flexShrink = "0";

  searchBtnTab.addEventListener("click", () => {
    Object.values(window.openTabs).forEach(({ iframe }) => iframe.style.display = "none");
    searchContent.style.display = "flex";

    document.querySelectorAll("#tab-bar .tab").forEach(btn => btn.classList.remove("active"));
    searchBtnTab.classList.add("active");
  });

  window.tabsRight.appendChild(searchBtnTab);
});

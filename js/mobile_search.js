// js/mobile_search.js
document.addEventListener("DOMContentLoaded", () => {
  const introLink = document.querySelector('#mobile-drawer a.nav-link[data-url="introduction.html"]');
  if (!introLink) return;

  const searchPanel = document.createElement("div");
  searchPanel.id = "mobile-search-panel";
  searchPanel.style.position = "fixed";
  searchPanel.style.top = "60px";
  searchPanel.style.right = "16px";
  searchPanel.style.width = "250px";
  searchPanel.style.height = "400px";
  searchPanel.style.background = "#fff";
  searchPanel.style.border = "1px solid #ccc";
  searchPanel.style.borderRadius = "8px";
  searchPanel.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  searchPanel.style.display = "none";
  searchPanel.style.zIndex = "1000";
  searchPanel.style.padding = "8px";
  searchPanel.style.overflowY = "auto";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search...";
  searchInput.style.width = "100%";
  searchInput.style.padding = "4px";
  searchInput.style.marginBottom = "6px";
  searchPanel.appendChild(searchInput);

  const searchResults = document.createElement("div");
  searchPanel.appendChild(searchResults);
  document.body.appendChild(searchPanel);

  // 搜索逻辑
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    searchResults.innerHTML = "";
    if (!query) return;

    const results = window.documents.filter(doc => window.fuzzyMatch(query, doc.title));
    if (results.length === 0) searchResults.innerHTML = "<p>No results</p>";

    results.forEach(doc => {
      const item = document.createElement("div");
      item.textContent = doc.title;
      item.style.cursor = "pointer";
      item.style.padding = "4px 0";

      item.addEventListener("click", () => {
        if (doc.resource) window.openResourceTab(doc.title, doc.resource);
        else if (doc.url) window.openTab(doc.title, doc.url);

        searchPanel.style.display = "none";
        searchInput.value = "";
        searchResults.innerHTML = "";
      });

      searchResults.appendChild(item);
    });
  });

  // 移动端搜索按钮
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

  mobileSearchBtn.addEventListener("click", () => {
    searchPanel.style.display = searchPanel.style.display === "none" ? "block" : "none";
  });

  introLink.style.position = "relative";
  introLink.appendChild(mobileSearchBtn);
});

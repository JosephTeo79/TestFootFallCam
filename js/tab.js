// js/tab.js
const tabBar = document.getElementById("tab-bar");
const tabContent = document.getElementById("tab-content");
const openTabs = {};
const tabsLeft = document.createElement("div");
tabsLeft.id = "tabs-left";
tabsLeft.style.display = "flex";

const tabsRight = document.createElement("div");
tabsRight.id = "tabs-right";
tabsRight.style.display = "flex";
tabsRight.style.marginLeft = "auto";

tabBar.appendChild(tabsLeft);
tabBar.appendChild(tabsRight);

function openTab(title, url) { /* ...和之前tab.js完全相同，略 */ }
function openResourceTab(title, resource) { /* ... */ }
function createTab(title, contentElem) { /* ... */ }
function setActiveTab(title) { /* ... */ }
function closeTab(title) { /* ... */ }
function fuzzyMatch(keyword, text) { /* ... */ }

window.openTab = openTab;
window.openResourceTab = openResourceTab;
window.setActiveTab = setActiveTab;
window.openTabs = openTabs;
window.tabsRight = tabsRight;

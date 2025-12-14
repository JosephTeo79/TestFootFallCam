// ===============================
// shared-library version control
// ===============================
const vCtr = "v1.0";

// GitHub Pages base (NOT raw.githubusercontent)
const BASE =
  `https://josephteo79.github.io/shared-library/${vCtr}`;

// -------------------------------
// helpers
// -------------------------------
function loadCSS(path) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${BASE}/${path}`;
  document.head.appendChild(link);
}

function loadJS(path) {
  const script = document.createElement("script");
  script.src = `${BASE}/${path}`;
  script.defer = true;
  document.body.appendChild(script);
}

// -------------------------------
// load shared-library assets
// -------------------------------
loadCSS("css/style.css");

// 如果以后需要 JS 功能，取消注释
// loadJS("js/tab.js");
// loadJS("js/search.js");
// loadJS("js/mobile_search.js");

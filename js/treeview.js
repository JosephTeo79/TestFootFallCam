function generateMenu(container, data) {
  const ul = document.createElement("ul");
  data.forEach(item => {
    const li = document.createElement("li");

    if(item.children && item.children.length > 0){
      const span = document.createElement("span");
      span.className = "caret";
      span.innerHTML = `<img src="${item.icon}" class="image"> ${item.title}`;
      li.appendChild(span);

      const nested = document.createElement("ul");
      nested.className = "nested";
      generateMenu(nested, item.children);
      li.appendChild(nested);

      span.addEventListener("click", () => nested.classList.toggle("active"));
    } else {
      const a = document.createElement("a");
      a.href = "#";
      a.className = "nav-link";
      a.dataset.title = item.title;
      if(item.url) a.dataset.url = item.url;
      if(item.resource) a.dataset.resource = item.resource;
      a.innerHTML = `<img src="${item.icon}" class="image"> ${item.title}`;
      li.appendChild(a);
    }

    ul.appendChild(li);
  });
  container.appendChild(ul);
}

// 生成菜单
document.addEventListener("DOMContentLoaded", () => {
  const leftContainer = document.getElementById("left-menu-scroll");
  const mobileContainer = document.getElementById("mobile-drawer");
  generateMenu(leftContainer, menuData);
  generateMenu(mobileContainer, menuData);

  // 移动端抽屉逻辑
  const hamburger = document.getElementById("hamburger");
  hamburger?.addEventListener("click", () => mobileContainer.classList.toggle("open"));

  mobileContainer.querySelectorAll('a.nav-link').forEach(link => {
    link.addEventListener('click', () => mobileContainer.classList.remove('open'));
  });
});

function generateMenu(containerId){
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  function createItem(item){
    const li = document.createElement("li");
    if(item.url || item.resource){
      const a = document.createElement("a");
      a.href = "#";
      a.className = "nav-link";
      a.textContent = item.title;
      if(item.url) a.dataset.url = item.url;
      if(item.resource) a.dataset.resource = item.resource;
      li.appendChild(a);
    } else {
      const span = document.createElement("span");
      span.className = "caret";
      span.textContent = item.title;
      li.appendChild(span);
    }

    if(item.children && item.children.length){
      const ul = document.createElement("ul");
      ul.className = "nested";
      item.children.forEach(child => ul.appendChild(createItem(child)));
      li.appendChild(ul);
    }
    return li;
  }

  const ulRoot = document.createElement("ul");
  menuData.forEach(item => ulRoot.appendChild(createItem(item)));
  container.appendChild(ulRoot);
}

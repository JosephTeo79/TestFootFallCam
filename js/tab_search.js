document.querySelectorAll(".nav-link").forEach(link => {
  const title = link.textContent.trim();
  const url = link.dataset.url;
  const resource = link.dataset.resource;

  link.addEventListener("click", function(e){
    e.preventDefault();
    if(resource) openResourceTab(title,resource);
    else if(url) openTab(title,url);

    // mobile drawer 自动关闭
    const drawer = document.getElementById("mobile-drawer");
    if(drawer) drawer.classList.remove("open");
  });
});

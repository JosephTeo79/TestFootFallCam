class TabManager {
  constructor() {
    this.tabBar = document.getElementById("tab-bar");
    this.tabContent = document.getElementById("tab-content");
    this.openTabs = {};
    this.tabsLeft = document.createElement("div");
    this.tabsLeft.id = "tabs-left";
    this.tabsLeft.style.display = "flex";
    this.tabsRight = document.createElement("div");
    this.tabsRight.id = "tabs-right";
    this.tabsRight.style.display = "flex";
    this.tabsRight.style.marginLeft = "auto";
    this.tabBar.appendChild(this.tabsLeft);
    this.tabBar.appendChild(this.tabsRight);
  }

  async openTab(title, url) {
    if (this.openTabs[title]) {
      this.setActiveTab(title);
      return;
    }
    const contentElem = document.createElement("div");
    contentElem.style.display = "flex";
    contentElem.style.flexDirection = "column";
    contentElem.style.overflowY = "auto";
    const loadingElem = document.createElement("p");
    loadingElem.textContent = "Loading...";
    loadingElem.style.color = "gray";
    contentElem.appendChild(loadingElem);

    try {
      if (url.endsWith(".pdf")) {
        const resp = await fetch(url);
        const pdfData = await resp.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data: pdfData}).promise;
        const dpr = window.devicePixelRatio || 1;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({scale:2});
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width*dpr;
          canvas.height = viewport.height*dpr;
          canvas.style.width="100%";
          canvas.style.height="auto";
          const ctx = canvas.getContext("2d");
          ctx.setTransform(dpr,0,0,dpr,0,0);
          await page.render({canvasContext:ctx,viewport}).promise;
          contentElem.appendChild(canvas);
        }
      } else if (url.endsWith(".mp4")) {
        const video = document.createElement("video");
        video.src = url;
        video.controls = true;
        video.setAttribute("controlsList","nodownload");
        video.style.width="70%";
        video.style.height="auto";
        video.setAttribute("playsinline","true");
        video.addEventListener("contextmenu", e=>e.preventDefault());
        const container = document.createElement("div");
        container.style.display="flex";
        container.style.justifyContent="center";
        container.appendChild(video);
        contentElem.appendChild(container);
      } else {
        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style.width="100%";
        iframe.style.height="100%";
        iframe.style.flex="1";
        iframe.frameBorder="0";
        contentElem.appendChild(iframe);
      }
      loadingElem.remove();
    } catch(err) {
      contentElem.innerHTML = `<p style="color:red;">Failed to load: ${err.message}</p>`;
    }

    this.createTab(title, contentElem);
  }

  createTab(title, contentElem) {
    this.tabContent.appendChild(contentElem);

    const tab = document.createElement("div");
    tab.className="tab";
    tab.dataset.title = title;
    const tabText = document.createElement("span");
    tabText.textContent = title;
    tab.appendChild(tabText);
    const closeBtn = document.createElement("button");
    closeBtn.textContent="×";
    closeBtn.className="close-btn";
    tab.appendChild(closeBtn);

    tabText.addEventListener("click", ()=>this.setActiveTab(title));
    closeBtn.addEventListener("click", e=>{
      e.stopPropagation();
      this.closeTab(title);
    });

    this.tabsLeft.appendChild(tab);
    this.openTabs[title]={tab, iframe:contentElem};
    this.setActiveTab(title);
  }

  setActiveTab(title){
    Object.values(this.openTabs).forEach(({tab,iframe})=>{
      if(tab) tab.classList.remove("active");
      if(iframe) iframe.style.display="none";
    });
    if(this.openTabs[title]){
      this.openTabs[title].tab.classList.add("active");
      this.openTabs[title].iframe.style.display="flex";
    }
  }

  closeTab(title){
    if(!this.openTabs[title]) return;
    const {tab,iframe} = this.openTabs[title];
    if(tab) tab.remove();
    if(iframe) iframe.remove();
    delete this.openTabs[title];
    const remaining = Object.keys(this.openTabs);
    if(remaining.length>0) this.setActiveTab(remaining[remaining.length-1]);
  }
}

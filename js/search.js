class SearchManager {
  constructor(tabManager) {
    this.tabManager = tabManager;
    this.documents = [];
    this.seen = new Set();
    this.createSearchTab();
    this.initDocuments();
  }

  fuzzyMatch(keyword,text){
    keyword = keyword.toLowerCase();
    text = text.toLowerCase();
    let index=-1;
    for(let c of keyword){
      index = text.indexOf(c,index+1);
      if(index===-1) return false;
    }
    return true;
  }

  initDocuments(){
    const navLinks = document.querySelectorAll(
      "#left-menu-scroll .nav-link, #mobile-drawer .nav-link"
    );
    navLinks.forEach((link,idx)=>{
      const title = link.getAttribute("data-title") || link.textContent.trim();
      const url = link.getAttribute("data-url");
      const resource = link.getAttribute("data-resource");
      if(!this.seen.has(title)){
        this.seen.add(title);
        this.documents.push({id:idx,title,url,resource});
      }
      link.addEventListener("click",e=>{
        e.preventDefault();
        if(resource) this.tabManager.openTab(title, resource);
        else if(url) this.tabManager.openTab(title, url);
      });
    });
  }

  createSearchTab(){
    this.searchContent = document.createElement("div");
    this.searchContent.style.display="none";
    this.searchContent.style.flex="1";
    this.searchContent.style.flexDirection="column";
    this.searchContent.style.height="100%";
    this.tabManager.tabContent.appendChild(this.searchContent);

    this.inputBox = document.createElement("input");
    this.inputBox.type="text";
    this.inputBox.id="search-box";
    this.inputBox.placeholder="Search...";
    this.searchContent.appendChild(this.inputBox);

    this.resultsDiv = document.createElement("div");
    this.resultsDiv.id="search-results";
    this.resultsDiv.style.flex="1";
    this.resultsDiv.style.overflowY="auto";
    this.searchContent.appendChild(this.resultsDiv);

    this.inputBox.addEventListener("input",()=>{
      const query = this.inputBox.value.trim();
      this.resultsDiv.innerHTML="";
      if(!query) return;
      const results = this.documents.filter(d=>this.fuzzyMatch(query,d.title));
      if(results.length===0){
        this.resultsDiv.innerHTML="<p>No results...</p>";
        return;
      }
      results.forEach(doc=>{
        const item = document.createElement("div");
        item.textContent = doc.title;
        item.style.cursor="pointer";
        item.style.padding="4px 0";
        item.addEventListener("click", ()=>{
          if(doc.resource) this.tabManager.openTab(doc.title, doc.resource);
          else if(doc.url) this.tabManager.openTab(doc.title, doc.url);
        });
        this.resultsDiv.appendChild(item);
      });
    });

    // PC Search button
    const searchBtnTab = document.createElement("div");
    searchBtnTab.className="tab";
    searchBtnTab.textContent="🔍 Search";
    searchBtnTab.style.cursor="pointer";
    searchBtnTab.style.flexShrink="0";
    searchBtnTab.addEventListener("click",()=>{
      Object.values(this.tabManager.openTabs).forEach(({iframe})=>iframe.style.display="none");
      this.searchContent.style.display="flex";
    });
    this.tabManager.tabsRight.appendChild(searchBtnTab);
  }
}

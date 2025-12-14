class MobileSearchManager {
  constructor(tabManager, searchManager){
    this.tabManager = tabManager;
    this.searchManager = searchManager;
    this.initMobileSearch();
  }

  initMobileSearch(){
    const introLink = document.querySelector('#mobile-drawer a.nav-link[data-url="introduction.html"]');
    if(!introLink) return;

    const mobileSearchBtn = document.createElement("button");
    mobileSearchBtn.textContent="🔍";
    mobileSearchBtn.style.float="right";
    mobileSearchBtn.style.marginLeft="5px";
    mobileSearchBtn.style.fontSize="0.9em";
    mobileSearchBtn.style.padding="2px 6px";
    mobileSearchBtn.style.border="none";
    mobileSearchBtn.style.borderRadius="4px";
    mobileSearchBtn.style.background="#007bff";
    mobileSearchBtn.style.color="#fff";
    mobileSearchBtn.style.cursor="pointer";

    mobileSearchBtn.addEventListener("click",()=>{
      this.searchManager.searchContent.style.display =
        this.searchManager.searchContent.style.display==="none"?"flex":"none";
    });

    introLink.style.position="relative";
    introLink.appendChild(mobileSearchBtn);
  }
}

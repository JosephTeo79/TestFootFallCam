pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

const tabBar = document.getElementById("tab-bar");
const tabContent = document.getElementById("tab-content");
const openTabs = {};

// -------------------- 打开 HTML/PDF/MP4 --------------------
async function openTab(title, url) {
    if (openTabs[title]) { setActiveTab(title); return; }
    if ((url.endsWith(".pdf")||url.endsWith(".mp4")||url.endsWith(".html")) && !/IR_/.test(url)) {
        url = url.replace(/([^\/]+)$/, "IR_$1");
    }

    const contentElem = document.createElement("div");
    contentElem.style.flex="1"; contentElem.style.display="flex"; contentElem.style.flexDirection="column"; contentElem.style.overflowY="auto";

    try {
        if(url.endsWith(".pdf")){
            const resp = await fetch(url);
            if(!resp.ok) throw new Error(`PDF not found: ${url}`);
            const pdfData = await resp.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({data:pdfData}).promise;
            const dpr = window.devicePixelRatio||1;
            for(let i=1;i<=pdf.numPages;i++){
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
        } else if(url.endsWith(".mp4")){
            const video = document.createElement("video");
            video.src=url; video.controls=true; video.setAttribute("controlsList","nodownload");
            video.style.width="70%"; video.style.height="auto";
            video.setAttribute("playsinline","true");
            video.addEventListener("contextmenu",e=>e.preventDefault());
            const container=document.createElement("div"); container.style.display="flex"; container.style.justifyContent="center";
            container.appendChild(video); contentElem.appendChild(container);
        } else {
            const iframe=document.createElement("iframe");
            iframe.src=url; iframe.style.width="100%"; iframe.style.height="100%"; iframe.style.flex="1"; iframe.frameBorder="0";
            contentElem.appendChild(iframe);
        }
    } catch(err){
        contentElem.innerHTML=`<p style="color:red;">Failed to load: ${err.message}</p>`;
    }

    createTab(title, contentElem);
}

// -------------------- 打开 resource --------------------
async function openResourceTab(title, resource){
    if(openTabs[title]){ setActiveTab(title); return; }
    const contentElem=document.createElement("div");
    contentElem.style.flex="1"; contentElem.style.display="flex"; contentElem.style.flexDirection="column"; contentElem.style.overflowY="auto";

    try{
        const videoUrl = resource.replace(/([^\/]+)$/,"IR_$1.mp4");
        const videoLink=document.createElement("a");
        videoLink.href="#"; videoLink.textContent="▶ Click to play video"; 
        videoLink.style.display="block"; videoLink.style.marginBottom="10px"; videoLink.style.fontWeight="bold";
        videoLink.addEventListener("click",function(e){
            e.preventDefault();
            if(!contentElem.querySelector("video")){
                const video=document.createElement("video");
                video.src=videoUrl; video.controls=true; video.setAttribute("controlsList","nodownload");
                video.style.width="70%"; video.style.height="auto"; video.setAttribute("playsinline","true");
                video.addEventListener("contextmenu",e=>e.preventDefault());
                const container=document.createElement("div"); container.style.display="flex"; container.style.justifyContent="center";
                container.appendChild(video); contentElem.insertBefore(container,contentElem.firstChild);
            }
        });
        contentElem.appendChild(videoLink);

        const pdfUrl = resource.replace(/([^\/]+)$/,"IR_$1.pdf");
        const resp = await fetch(pdfUrl);
        if(resp.ok){
            const pdfData = await resp.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({data:pdfData}).promise;
            const dpr = window.devicePixelRatio||1;
            for(let i=1;i<=pdf.numPages;i++){
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({scale:2});
                const canvas=document.createElement("canvas");
                canvas.width = viewport.width*dpr;
                canvas.height = viewport.height*dpr;
                canvas.style.width="100%"; canvas.style.height="auto";
                const ctx = canvas.getContext("2d");
                ctx.setTransform(dpr,0,0,dpr,0,0);
                await page.render({canvasContext:ctx,viewport}).promise;
                contentElem.appendChild(canvas);
            }
        } else { contentElem.innerHTML+="<p style='color:red;'>PDF not found</p>"; }
    } catch(err){ contentElem.innerHTML+="<p style='color:red;'>Failed to load PDF/video</p>"; }

    createTab(title, contentElem);
}

// -------------------- 创建 Tab --------------------
function createTab(title, contentElem){
    tabContent.appendChild(contentElem);
    const tab=document.createElement("div"); tab.className="tab"; tab.dataset.title=title;
    const tabText=document.createElement("span"); tabText.textContent=title; tab.appendChild(tabText);
    const closeBtn=document.createElement("button"); closeBtn.textContent="×"; closeBtn.className="close-btn"; tab.appendChild(closeBtn);
    tabText.addEventListener("click",()=>setActiveTab(title));
    closeBtn.addEventListener("click",e=>{ e.stopPropagation(); closeTab(title); });
    tabBar.appendChild(tab);
    openTabs[title]={tab, iframe:contentElem};
    setActiveTab(title);
}

function setActiveTab(title){
    Object.values(openTabs).forEach(({tab,iframe})=>{tab.classList.remove("active"); iframe.style.display="none";});
    if(!openTabs[title]) return;
    openTabs[title].tab.classList.add("active"); openTabs[title].iframe.style.display="flex";
}

function closeTab(title){
    if(!openTabs[title]) return;
    const {tab,iframe}=openTabs[title]; tab.remove(); iframe.remove(); delete openTabs[title];
    const remaining=Object.keys(openTabs);
    if(remaining.length>0) setActiveTab(remaining[remaining.length-1]);
}

// -------------------- 初始化菜单 & Search --------------------
document.addEventListener("DOMContentLoaded",()=>{
    const navLinks = document.querySelectorAll(".nav-link");
    const documents = [];

    navLinks.forEach((link,idx)=>{
        const title = link.getAttribute("data-title") || link.textContent.trim();
        const url = link.getAttribute("data-url") || null;
        const resource = link.getAttribute("data-resource") || null;
        documents.push({id:idx,title,url,resource});

        link.addEventListener("click",function(e){
            e.preventDefault();
            if(resource) openResourceTab(title,resource);
            else if(url) openTab(title,url);
        });
    });

    // -------------------- Lunr 索引 --------------------
    const idx = lunr(function(){ this.ref('id'); this.field('title'); documents.forEach(d=>this.add(d)); });

    function openSearchTab(){
        if(openTabs["Search"]) { setActiveTab("Search"); return; }

        const contentElem=document.createElement("div");
        contentElem.style.display="flex"; contentElem.style.flexDirection="column"; contentElem.style.height="100%";

        const inputBox=document.createElement("input");
        inputBox.type="text"; inputBox.id="search-box"; inputBox.placeholder="Search...";
        const resultsDiv=document.createElement("div");
        resultsDiv.id="search-results"; resultsDiv.style.flex="1"; resultsDiv.style.overflowY="auto";

        contentElem.appendChild(inputBox);
        contentElem.appendChild(resultsDiv);

        inputBox.addEventListener("keypress",function(e){
            if(e.key==='Enter'){
                const query=inputBox.value.trim();
                if(!query) return;
                const results=idx.search(query);
                resultsDiv.innerHTML="";
                if(results.length===0){ resultsDiv.innerHTML="<p>No results found.</p>"; return; }
                results.forEach(res=>{
                    const doc=documents.find(d=>d.id==res.ref);
                    const item=document.createElement("div"); item.textContent=doc.title;
                    item.addEventListener("click",()=>{ 
                        if(doc.resource) openResourceTab(doc.title,doc.resource);
                        else if(doc.url) openTab(doc.title,doc.url);
                    });
                    resultsDiv.appendChild(item);
                });
            }
        });

        createTab("Search", contentElem);
    }

    // -------------------- 添加 Search Tab 按钮 --------------------
    const searchBtnTab = document.createElement("div");
    searchBtnTab.className="tab";
    searchBtnTab.textContent="🔍 Search";
    searchBtnTab.style.cursor="pointer";
    searchBtnTab.style.flexShrink="0";
    searchBtnTab.addEventListener("click", openSearchTab);
    tabBar.appendChild(searchBtnTab);

    // -------------------- 初始化只打开两个 Tab --------------------
    openTab('Introduction','introduction.html');
    openSearchTab();
});

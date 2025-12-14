pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

const tabBar = document.getElementById("tab-bar");
const tabContent = document.getElementById("tab-content");
const openTabs = {}; // 存储已打开 tab

// 创建左右 tab 容器
const tabsLeft = document.createElement("div");
tabsLeft.id = "tabs-left";
tabsLeft.style.display = "flex";

const tabsRight = document.createElement("div");
tabsRight.id = "tabs-right";
tabsRight.style.display = "flex";
tabsRight.style.marginLeft = "auto";

tabBar.appendChild(tabsLeft);
tabBar.appendChild(tabsRight);

// -------------------- Tab 打开函数 --------------------
async function openTab(title, url) {
    if (openTabs[title]) {
        if (openTabs[title].loading) return;
        setActiveTab(title);
        return;
    }

    openTabs[title] = { loading: true };

    // 自动替换 IR_
    if ((url.endsWith(".pdf")||url.endsWith(".mp4")||url.endsWith(".html")) && !/IR_/.test(url)) {
        url = url.replace(/([^\/]+)$/, "IR_$1");
    }

    const contentElem = document.createElement("div");
    contentElem.style.flex = "1"; 
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
            if (!resp.ok) throw new Error(`PDF not found: ${url}`);
            const pdfData = await resp.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({data: pdfData}).promise;
            const dpr = window.devicePixelRatio || 1;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement("canvas");
                canvas.width = viewport.width * dpr;
                canvas.height = viewport.height * dpr;
                canvas.style.width = "100%";
                canvas.style.height = "auto";
                const ctx = canvas.getContext("2d");
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                await page.render({ canvasContext: ctx, viewport }).promise;
                contentElem.appendChild(canvas);
            }

        } else if (url.endsWith(".mp4")) {
            const video = document.createElement("video");
            video.src = url;
            video.controls = true;
            video.setAttribute("controlsList", "nodownload");
            video.style.width = "70%";
            video.style.height = "auto";
            video.setAttribute("playsinline", "true");
            video.addEventListener("contextmenu", e => e.preventDefault());

            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.justifyContent = "center";
            container.appendChild(video);
            contentElem.appendChild(container);

        } else {
            const iframe = document.createElement("iframe");
            iframe.src = url;
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.flex = "1";
            iframe.frameBorder = "0";
            contentElem.appendChild(iframe);
        }

        loadingElem.remove();

    } catch (err) {
        contentElem.innerHTML = `<p style="color:red;">Failed to load: ${err.message}</p>`;
    }

    createTab(title, contentElem);
    openTabs[title].loading = false;
}

// -------------------- Resource Tab --------------------
async function openResourceTab(title, resource) {
    if (openTabs[title]) {
        if (openTabs[title].loading) return;
        setActiveTab(title);
        return;
    }

    openTabs[title] = { loading: true };

    const contentElem = document.createElement("div");
    contentElem.style.flex = "1";
    contentElem.style.display = "flex";
    contentElem.style.flexDirection = "column";
    contentElem.style.overflowY = "auto";

    const loadingElem = document.createElement("p");
    loadingElem.textContent = "Loading...";
    loadingElem.style.color = "gray";
    contentElem.appendChild(loadingElem);

    try {
        // 视频
        const videoUrl = resource.replace(/([^\/]+)$/, "IR_$1.mp4");
        const videoLink = document.createElement("a");
        videoLink.href = "#";
        videoLink.textContent = "▶ Click to play video";
        videoLink.style.display = "block";
        videoLink.style.marginBottom = "10px";
        videoLink.style.fontWeight = "bold";

        videoLink.addEventListener("click", e => {
            e.preventDefault();
            if (!contentElem.querySelector("video")) {
                const video = document.createElement("video");
                video.src = videoUrl;
                video.controls = true;
                video.setAttribute("controlsList", "nodownload");
                video.style.width = "70%";
                video.style.height = "auto";
                video.setAttribute("playsinline", "true");
                video.addEventListener("contextmenu", e => e.preventDefault());

                const container = document.createElement("div");
                container.style.display = "flex";
                container.style.justifyContent = "center";
                container.appendChild(video);
                contentElem.insertBefore(container, contentElem.firstChild);
            }
        });

        contentElem.appendChild(videoLink);

        // PDF
        const pdfUrl = resource.replace(/([^\/]+)$/, "IR_$1.pdf");
        const resp = await fetch(pdfUrl);
        if (resp.ok) {
            const pdfData = await resp.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            const dpr = window.devicePixelRatio || 1;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement("canvas");
                canvas.width = viewport.width * dpr;
                canvas.height = viewport.height * dpr;
                canvas.style.width = "100%";
                canvas.style.height = "auto";
                const ctx = canvas.getContext("2d");
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                await page.render({ canvasContext: ctx, viewport }).promise;
                contentElem.appendChild(canvas);
            }
        } else {
            contentElem.innerHTML += "<p style='color:red;'>PDF not found</p>";
        }

        loadingElem.remove();

    } catch (err) {
        contentElem.innerHTML += "<p style='color:red;'>Failed to load PDF/video</p>";
    }

    createTab(title, contentElem);
    openTabs[title].loading = false;
}

// -------------------- 创建 Tab --------------------
function createTab(title, contentElem) {
    tabContent.appendChild(contentElem);

    const tab = document.createElement("div");
    tab.className = "tab";
    tab.dataset.title = title;

    const tabText = document.createElement("span");
    tabText.textContent = title;
    tab.appendChild(tabText);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.className = "close-btn";
    tab.appendChild(closeBtn);

    tabText.addEventListener("click", () => setActiveTab(title));
    closeBtn.addEventListener("click", e => {
        e.stopPropagation();
        closeTab(title);
    });

    tabsLeft.appendChild(tab);

    openTabs[title].tab = tab;
    openTabs[title].iframe = contentElem;

    setActiveTab(title);
}

function setActiveTab(title) {
    Object.values(openTabs).forEach(({ tab, iframe }) => {
        if (tab) tab.classList.remove("active");
        if (iframe) iframe.style.display = "none";
    });

    if (openTabs[title]) {
        openTabs[title].tab.classList.add("active");
        openTabs[title].iframe.style.display = "flex";
    }

    if (window.searchContent) window.searchContent.style.display = "none";
}

function closeTab(title) {
    if (!openTabs[title]) return;

    const { tab, iframe } = openTabs[title];
    if (tab) tab.remove();
    if (iframe) iframe.remove();
    delete openTabs[title];

    const remaining = Object.keys(openTabs);
    if (remaining.length > 0) setActiveTab(remaining[remaining.length - 1]);
}

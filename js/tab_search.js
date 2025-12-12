const tabBar = document.getElementById("tab-bar");
const tabContent = document.getElementById("tab-content");
const openTabs = {};

// -------------------- 打开普通 URL（HTML / PDF / MP4） --------------------
async function openTab(title, url) {
    if (openTabs[title]) {
        setActiveTab(title);
        return;
    }

    // 只对 PDF / MP4 / HTML 自动加 IR_（文件名，不加文件夹）
    if ((url.endsWith(".pdf") || url.endsWith(".mp4") || url.endsWith(".html")) && !/IR_/.test(url)) {
        url = url.replace(/([^\/]+)$/, "IR_$1");
    }

    const contentElem = document.createElement("div");
    contentElem.style.flex = "1";
    contentElem.style.display = "flex";
    contentElem.style.flexDirection = "column";
    contentElem.style.overflowY = "auto";

    try {
        if (url.endsWith(".pdf")) {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`PDF not found: ${url}`);
            const pdfData = await response.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            const numPages = pdf.numPages;
            const dpr = window.devicePixelRatio || 1;

            for (let i = 1; i <= numPages; i++) {
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
            const videoContainer = document.createElement("div");
            videoContainer.style.display = "flex";
            videoContainer.style.justifyContent = "center";
            videoContainer.style.width = "100%";

            const video = document.createElement("video");
            video.src = url;
            video.controls = true;
            video.setAttribute("controlsList", "nodownload");
            video.style.width = "70%";
            video.style.height = "auto";
            video.setAttribute("playsinline", "true");
            video.addEventListener("contextmenu", e => e.preventDefault());

            videoContainer.appendChild(video);
            contentElem.appendChild(videoContainer);
        } else {
            const iframe = document.createElement("iframe");
            iframe.src = url;
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.flex = "1";
            iframe.frameBorder = "0";
            contentElem.appendChild(iframe);
        }
    } catch (err) {
        contentElem.innerHTML = `<p style="color:red;">Failed to load content: ${err.message}</p>`;
        console.error(err);
    }

    createTab(title, contentElem);
}

// -------------------- 打开 data-resource（PDF + 链接 MP4） --------------------
async function openResourceTab(title, resource) {
    if (openTabs[title]) {
        setActiveTab(title);
        return;
    }

    const contentElem = document.createElement("div");
    contentElem.style.flex = "1";
    contentElem.style.display = "flex";
    contentElem.style.flexDirection = "column";
    contentElem.style.overflowY = "auto";

    try {
        const videoUrl = resource.replace(/([^\/]+)$/, "IR_$1.mp4");
        const videoLink = document.createElement("a");
        videoLink.href = "#";
        videoLink.textContent = "Click here to play video";
        videoLink.style.display = "block";
        videoLink.style.marginBottom = "10px";
        videoLink.style.fontWeight = "bold";

        videoLink.addEventListener("click", function(e) {
            e.preventDefault();
            let existingVideo = contentElem.querySelector("video");
            if (!existingVideo) {
                const videoContainer = document.createElement("div");
                videoContainer.style.display = "flex";
                videoContainer.style.justifyContent = "center";
                videoContainer.style.width = "100%";

                const video = document.createElement("video");
                video.src = videoUrl;
                video.controls = true;
                video.setAttribute("controlsList", "nodownload");
                video.style.width = "70%";
                video.style.height = "auto";
                video.setAttribute("playsinline", "true");
                video.addEventListener("contextmenu", e => e.preventDefault());

                videoContainer.appendChild(video);
                contentElem.insertBefore(videoContainer, contentElem.firstChild);
            }
        });

        contentElem.appendChild(videoLink);

        const pdfUrl = resource.replace(/([^\/]+)$/, "IR_$1.pdf");
        const pdfResponse = await fetch(pdfUrl);
        if (pdfResponse.ok) {
            const pdfData = await pdfResponse.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            const numPages = pdf.numPages;
            const dpr = window.devicePixelRatio || 1;

            for (let i = 1; i <= numPages; i++) {
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
            contentElem.innerHTML += `<p style="color:red;">PDF not found</p>`;
        }
    } catch (err) {
        contentElem.innerHTML += `<p style="color:red;">Failed to load PDF/video</p>`;
        console.error(err);
    }

    createTab(title, contentElem);
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

    tabBar.appendChild(tab);
    openTabs[title] = { tab, iframe: contentElem };
    setActiveTab(title);
}

// -------------------- 切换 Tab --------------------
function setActiveTab(title) {
    Object.values(openTabs).forEach(({ tab, iframe }) => {
        tab.classList.remove("active");
        iframe.style.display = "none";
    });
    if (!openTabs[title]) return;
    openTabs[title].tab.classList.add("active");
    openTabs[title].iframe.style.display = "flex";
}

// -------------------- 关闭 Tab --------------------
function closeTab(title) {
    if (!openTabs[title]) return;
    const { tab, iframe } = openTabs[title];
    tab.remove();
    iframe.remove();
    delete openTabs[title];

    const remaining = Object.keys(openTabs);
    if (remaining.length > 0) setActiveTab(remaining[remaining.length - 1]);
}

// -------------------- 初始化菜单点击事件 --------------------
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const title = this.getAttribute("data-title") || this.textContent.trim();
            const resource = this.getAttribute("data-resource");
            if (resource) {
                openResourceTab(title, resource);
            } else {
                const url = this.getAttribute("data-url");
                openTab(title, url);
            }
        });
    });

    // 自动打开 Introduction（HTML 不加 IR_）
    openTab('Introduction', 'introduction.html');

    // -------------------- 自动添加右侧搜索 Tab --------------------
// -------------------- 自动添加右侧搜索 Tab --------------------
(function addSearchTabButton() {
    const searchBtnTab = document.createElement("div");
    searchBtnTab.className = "tab";
    searchBtnTab.style.marginLeft = "auto"; // 右对齐
    searchBtnTab.textContent = "🔍 Search";

    searchBtnTab.addEventListener("click", () => {
        if (!openTabs["Search"]) {
            // 插入 Search tab 之前，保证它在最右边
            tabBar.insertBefore(searchBtnTab, null); // 永远最后
            openTab("Search", "search.html");
        } else {
            setActiveTab("Search");
        }
    });

    // 直接插入 tabBar 最后，保证在所有左侧菜单 Tab 右边
    tabBar.appendChild(searchBtnTab);
})();

});

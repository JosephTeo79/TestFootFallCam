const tabBar = document.getElementById("tab-bar");
const tabContent = document.getElementById("tab-content");
const openTabs = {};

// === 打开普通 Tab ===
async function openTab(title, url) {

    if (url.endsWith(".pdf") && !/IR_/.test(url)) {
        url = url.replace(/([^\/]+)\.([^\.]+)$/, (match, name, ext) => `IR_${name}.${ext}`);
    }
    if (url.endsWith(".mp4") && !/IR_/.test(url)) {
        url = url.replace(/([^\/]+)\.([^\.]+)$/, (match, name, ext) => `IR_${name}.${ext}`);
    }
    if (url.endsWith(".html") && !/IR_/.test(url)) {
        url = url.replace(/([^\/]+)\.([^\.]+)$/, (match, name, ext) => `IR_${name}.${ext}`);
    }

    if (openTabs[title]) {
        setActiveTab(title);
        return;
    }

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

    const contentElem = document.createElement("div");
    contentElem.style.flex = "1";
    contentElem.style.display = "flex";
    contentElem.style.flexDirection = "column";
    contentElem.style.overflowY = "auto";

    try {
        if (url.endsWith(".pdf")) {
            const response = await fetch(url);
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
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const videoContainer = document.createElement("div");
            videoContainer.style.width = "100%";
            videoContainer.style.textAlign = "center";

            const video = document.createElement("video");
            video.src = blobUrl;
            video.controls = true;
            video.setAttribute("controlsList", "nodownload");
            video.style.width = "100%";
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

    tabContent.appendChild(contentElem);
    openTabs[title] = { tab, iframe: contentElem };
    setActiveTab(title);
}

// === 打开资源 Tab (视频按钮在最上方) ===
async function openResourceTab(title, resource) {
    if (openTabs[title]) {
        setActiveTab(title);
        return;
    }

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

    const contentElem = document.createElement("div");
    contentElem.style.flex = "1";
    contentElem.style.display = "flex";
    contentElem.style.flexDirection = "column";
    contentElem.style.overflowY = "auto";

    try {
        // === 视频按钮在最上方 ===
        const videoBtn = document.createElement("button");
        videoBtn.textContent = "Play Video";
        videoBtn.style.margin = "10px 0";
        contentElem.appendChild(videoBtn);

        videoBtn.addEventListener("click", async () => {
            const mp4Url = `${resource}.mp4`;
            const videoResponse = await fetch(mp4Url);
            const blob = await videoResponse.blob();
            const blobUrl = URL.createObjectURL(blob);

            const videoContainer = document.createElement("div");
            videoContainer.style.width = "100%";
            videoContainer.style.textAlign = "center";

            const video = document.createElement("video");
            video.src = blobUrl;
            video.controls = true;
            video.setAttribute("controlsList", "nodownload");
            video.style.width = "100%";
            video.style.height = "auto";
            video.setAttribute("playsinline", "true");
            video.addEventListener("contextmenu", e => e.preventDefault());

            videoContainer.appendChild(video);
            contentElem.appendChild(videoContainer);

            videoBtn.disabled = true;
        });

        // === 渲染 PDF ===
        const pdfUrl = `${resource}.pdf`;
        const response = await fetch(pdfUrl);
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

    } catch (err) {
        contentElem.innerHTML = `<p style="color:red;">Failed to load content: ${err.message}</p>`;
        console.error(err);
    }

    tabContent.appendChild(contentElem);
    openTabs[title] = { tab, iframe: contentElem };
    setActiveTab(title);
}

// === Tab 切换 ===
function setActiveTab(title) {
    Object.values(openTabs).forEach(({ tab, iframe }) => {
        tab.classList.remove("active");
        iframe.style.display = "none";
    });
    if (!openTabs[title]) return;
    openTabs[title].tab.classList.add("active");
    openTabs[title].iframe.style.display = "flex";
}

// === 关闭 Tab ===
function closeTab(title) {
    if (!openTabs[title]) return;
    const { tab, iframe } = openTabs[title];
    tab.remove();
    iframe.remove();
    delete openTabs[title];

    const remaining = Object.keys(openTabs);
    if (remaining.length > 0) setActiveTab(remaining[remaining.length - 1]);
}

// === 初始化菜单点击事件 ===
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

    // 自动打开 Introduction
    openTab('Introduction', 'introduction.html');
});

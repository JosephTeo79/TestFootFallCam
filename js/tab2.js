const tabBar = document.getElementById("tab-bar");
const tabContent = document.getElementById("tab-content");
const openTabs = {};

// 只对文件名加 IR_，文件夹保持原样
function addIRToFilename(url) {
    return url.replace(/([^\/]+)$/, (match) => {
        if (!/^IR_/.test(match)) return "IR_" + match;
        return match;
    });
}

// 打开普通 URL（HTML / PDF / MP4）
async function openTab(title, url) {
    if (openTabs[title]) { setActiveTab(title); return; }

    if ((url.endsWith(".pdf") || url.endsWith(".mp4") || url.endsWith(".html"))) {
        url = addIRToFilename(url);
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
            const page = await pdf.getPage(1); // 只显示第一页
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width * window.devicePixelRatio;
            canvas.height = viewport.height * window.devicePixelRatio;
            const ctx = canvas.getContext("2d");
            ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
            await page.render({ canvasContext: ctx, viewport }).promise;
            contentElem.appendChild(canvas);
        } else if (url.endsWith(".mp4")) {
            const video = document.createElement("video");
            video.src = url;
            video.controls = true;
            video.style.width = "100%";
            video.style.height = "auto";
            video.setAttribute("playsinline", "true");
            video.addEventListener("contextmenu", e => e.preventDefault());
            contentElem.appendChild(video);
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

// 打开 data-resource（PDF 封面 + 视频，点击 PDF 封面播放视频）
async function openResourceTab(title, resource) {
    if (openTabs[title]) { setActiveTab(title); return; }

    const contentElem = document.createElement("div");
    contentElem.style.flex = "1";
    contentElem.style.display = "flex";
    contentElem.style.flexDirection = "column";
    contentElem.style.overflowY = "auto";

    const pdfFiles = [
        resource + "_0.pdf", // 封面 PDF，只当触发视频
        resource + ".pdf"    // 其他 PDF
    ];

    for (const pdfFile of pdfFiles) {
        const pdfUrl = pdfFile.includes("/") ? pdfFile.replace(/([^\/]+)$/, "IR_$1") : "IR_" + pdfFile;

        if (pdfFile.endsWith("_0.pdf")) {
            // 封面 PDF，不渲染，点击播放视频
            const coverDiv = document.createElement("div");
            coverDiv.textContent = pdfFile; // 可以换成“点击播放视频”或用背景图片
            coverDiv.style.cursor = "pointer";
            coverDiv.style.padding = "20px";
            coverDiv.style.textAlign = "center";
            coverDiv.style.border = "1px solid #ccc";
            coverDiv.style.marginBottom = "10px";
            coverDiv.style.backgroundColor = "#f0f0f0";

            coverDiv.addEventListener("click", () => {
                const video = document.createElement("video");
                video.src = addIRToFilename(resource + ".mp4");
                video.controls = true;
                video.style.width = "100%";
                video.style.height = "auto";
                video.setAttribute("playsinline", "true");
                contentElem.appendChild(video);

                // 可选：点击后隐藏封面
                coverDiv.style.display = "none";
            });

            contentElem.appendChild(coverDiv);
        } else {
            // 其他 PDF 渲染成 canvas
            try {
                const response = await fetch(pdfUrl);
                if (!response.ok) {
                    contentElem.innerHTML += `<p style="color:red;">PDF not found: ${pdfUrl}</p>`;
                    continue;
                }
                const pdfData = await response.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement("canvas");
                canvas.width = viewport.width * window.devicePixelRatio;
                canvas.height = viewport.height * window.devicePixelRatio;
                const ctx = canvas.getContext("2d");
                ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
                await page.render({ canvasContext: ctx, viewport }).promise;
                contentElem.appendChild(canvas);
            } catch (err) {
                contentElem.innerHTML += `<p style="color:red;">Failed to load PDF: ${pdfUrl}</p>`;
                console.error(err);
            }
        }
    }

    createTab(title, contentElem);
}


// 创建 Tab
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
    closeBtn.addEventListener("click", e => { e.stopPropagation(); closeTab(title); });

    tabBar.appendChild(tab);
    openTabs[title] = { tab, iframe: contentElem };
    setActiveTab(title);
}

// 切换 Tab
function setActiveTab(title) {
    Object.values(openTabs).forEach(({ tab, iframe }) => {
        tab.classList.remove("active");
        iframe.style.display = "none";
    });
    if (!openTabs[title]) return;
    openTabs[title].tab.classList.add("active");
    openTabs[title].iframe.style.display = "flex";
}

// 关闭 Tab
function closeTab(title) {
    if (!openTabs[title]) return;
    const { tab, iframe } = openTabs[title];
    tab.remove();
    iframe.remove();
    delete openTabs[title];

    const remaining = Object.keys(openTabs);
    if (remaining.length > 0) setActiveTab(remaining[remaining.length - 1]);
}

// 初始化菜单点击事件
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
});

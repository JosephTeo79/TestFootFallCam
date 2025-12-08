const tabBar = document.getElementById("tab-bar");
const tabContent = document.getElementById("tab-content");
const openTabs = {};

async function openTab(title, url) {

    // ============================
    //  自動加 IR_ 前綴（pdf / mp4 / html）
    // ============================
    if (!/\/IR_/.test(url)) {
        url = url.replace(/([^\/]+)\.([^\.]+)$/, (m, name, ext) => `IR_${name}.${ext}`);
    }

    console.log("FINAL URL = ", url);

    // 已存在 → 激活
    if (openTabs[title]) {
        setActiveTab(title);
        return;
    }

    // ============================
    //  建立 TAB
    // ============================
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
    closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeTab(title);
    });

    tabBar.appendChild(tab);

    // 内容容器
    const contentElem = document.createElement("div");
    contentElem.style.flex = "1";
    contentElem.style.display = "flex";
    contentElem.style.flexDirection = "column";
    contentElem.style.overflowY = "auto";

    try {
        // ============================
        //          PDF
        // ============================
        if (url.endsWith(".pdf")) {

            const response = await fetch(url);
            if (!response.ok) throw new Error("PDF Load Failed");

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

                const ctx = canvas.getContext("2d");
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

                await page.render({ canvasContext: ctx, viewport }).promise;

                contentElem.appendChild(canvas);
            }

        }
        // ============================
        //         MP4 影片
        // ============================
        else if (url.endsWith(".mp4")) {

            console.log("Fetching MP4: ", url);

            const response = await fetch(url);
            if (!response.ok) throw new Error("MP4 Load Failed");

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
            video.setAttribute("playsinline", true);

            video.addEventListener("contextmenu", (e) => e.preventDefault());

            videoContainer.appendChild(video);
            contentElem.appendChild(videoContainer);

        }
        // ============================
        //     HTML (Iframe)
        // ============================
        else {
            const iframe = document.createElement("iframe");
            iframe.src = url;
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.flex = "1";
            iframe.frameBorder = "0";
            contentElem.appendChild(iframe);
        }

    } catch (err) {
        console.error(err);
        contentElem.innerHTML = `<p style="color:red;">Failed to load content:<br>${err.message}</p>`;
    }

    tabContent.appendChild(contentElem);
    openTabs[title] = { tab, iframe: contentElem };
    setActiveTab(title);
}

function setActiveTab(title) {
    Object.values(openTabs).forEach(({ tab, iframe }) => {
        tab.classList.remove("active");
        iframe.style.display = "none";
    });
    if (openTabs[title]) {
        openTabs[title].tab.classList.add("active");
        openTabs[title].iframe.style.display = "flex";
    }
}

function closeTab(title) {
    if (!openTabs[title]) return;

    const { tab, iframe } = openTabs[title];
    tab.remove();
    iframe.remove();
    delete openTabs[title];

    const remaining = Object.keys(openTabs);
    if (remaining.length > 0) {
        setActiveTab(remaining[remaining.length - 1]);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const url = link.getAttribute("data-url");
            const title = link.getAttribute("data-title") || link.textContent.trim();
            openTab(title, url);
        });
    });

    openTab("Introduction", "introduction.html");
});

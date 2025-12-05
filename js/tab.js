const tabBar = document.getElementById("tab-bar");
const tabContent = document.getElementById("tab-content");
const openTabs = {};

async function openTab(title, url) {
    if (openTabs[title]) {
        setActiveTab(title);
        return;
    }

    // === 创建 Tab 按钮 ===
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

    // === 创建内容区域 ===
    const contentElem = document.createElement("div");
    contentElem.style.flex = "1";
    contentElem.style.display = "flex";
    contentElem.style.flexDirection = "column";
    contentElem.style.overflowY = "auto";

    if (url.endsWith(".pdf")) {
        try {
            const response = await fetch(url);       // fetch 隐藏真实 URL
            const pdfData = await response.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            const numPages = pdf.numPages;
            const dpr = window.devicePixelRatio || 1;

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2 }); // 调大 scale 提高清晰度
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
            contentElem.innerHTML = `<p style="color:red;">Failed to load PDF: ${err.message}</p>`;
            console.error(err);
        }
    } else {
        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.flex = "1";
        iframe.frameBorder = "0";
        contentElem.appendChild(iframe);
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
    if (!openTabs[title]) return;
    openTabs[title].tab.classList.add("active");
    openTabs[title].iframe.style.display = "flex";
}

function closeTab(title) {
    if (!openTabs[title]) return;
    const { tab, iframe } = openTabs[title];
    tab.remove();
    iframe.remove();
    delete openTabs[title];

    const remaining = Object.keys(openTabs);
    if (remaining.length > 0) setActiveTab(remaining[remaining.length - 1]);
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const url = this.getAttribute("data-url");
            const title = this.textContent.trim();
            openTab(title, url);
        });
    });
});

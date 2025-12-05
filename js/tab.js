// js/tab.js
const tabBar = document.getElementById("tab-bar");
const tabContent = document.getElementById("tab-content");
const openTabs = {};

function openTab(title, url) {
    if (openTabs[title]) {
        setActiveTab(title);
        return;
    }

    // === 创建 Tab 按钮 ===
    const tab = document.createElement("div");
    tab.className = "tab";
    tab.dataset.title = title;

    const tabText = document.createElement("span");
    tabText.textContent = title; // 这里是 Tab 显示的名字
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

    // === 创建内容区域 ===
    let contentElem;

    if (url.endsWith(".pdf")) {
        contentElem = document.createElement("div");
        contentElem.style.overflowY = "auto";
        contentElem.style.height = "100%";

        try {
            const pdfjsLib = window.pdfjsLib;
            if (!pdfjsLib) throw new Error("PDF.js not loaded");

            // worker 已在 HTML 设置，不要再设置
            pdfjsLib.getDocument(url).promise.then(pdf => {
                for (let i = 1; i <= pdf.numPages; i++) {
                    pdf.getPage(i).then(page => {
                        const scale = 1.5;
                        const viewport = page.getViewport({ scale });

                        const canvas = document.createElement("canvas");
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        const context = canvas.getContext("2d");
                        page.render({ canvasContext: context, viewport: viewport });

                        contentElem.appendChild(canvas);
                    }).catch(err => {
                        console.error(`Error rendering page ${i}:`, err);
                    });
                }
            }).catch(err => {
                console.error("PDF loading error:", err);
                contentElem.innerHTML = `<p style="color:red;">Failed to load PDF: ${err.message}</p>`;
            });

        } catch (err) {
            console.error("PDF.js error:", err);
            contentElem.innerHTML = `<p style="color:red;">PDF.js not loaded or error: ${err.message}</p>`;
        }

    } else {
        // iframe 用于非 PDF
        contentElem = document.createElement("iframe");
        contentElem.className = "tab-frame";
        contentElem.dataset.title = title;
        contentElem.style.width = "100%";
        contentElem.style.height = "100%";
        contentElem.frameBorder = "0";
        contentElem.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        contentElem.allowFullscreen = true;

        if (url.includes("youtube.com")) {
            let embedUrl = url;
            if (!url.includes("/embed/")) {
                const videoIdMatch = url.match(/(?:v=|\.be\/)([a-zA-Z0-9_-]{11})/);
                if (videoIdMatch) embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
            }
            contentElem.src = embedUrl;
        } else {
            contentElem.src = url;
        }
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
    if (!openTabs[title]) return; // 避免 undefined
    openTabs[title].tab.classList.add("active");
    openTabs[title].iframe.style.display = "block";
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

// 初始化菜单事件
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const url = this.getAttribute("data-url");
            const title = this.textContent.trim();
            openTab(title, url);
        });
    });

    // 自动打开 introduction.html
    openTab('Introduction', 'introduction.html');
});

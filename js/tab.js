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

    // === PDF.js 渲染 PDF 替代 iframe ===
    let contentElem;

    if (url.endsWith(".pdf")) {
        contentElem = document.createElement("div");
        contentElem.id = `pdf-container-${title}`;
        contentElem.style.overflowY = "auto";
        contentElem.style.height = "100%";

        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';

        pdfjsLib.getDocument(url).promise.then(pdf => {
            const totalPages = pdf.numPages;
            for (let i = 1; i <= totalPages; i++) {
                pdf.getPage(i).then(page => {
                    const scale = 1.5;
                    const viewport = page.getViewport({ scale });

                    const canvas = document.createElement("canvas");
                    canvas.style.display = "block";
                    canvas.style.margin = "20px auto";
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    const context = canvas.getContext("2d");
                    page.render({ canvasContext: context, viewport: viewport });

                    contentElem.appendChild(canvas);
                });
            }
        }).catch(err => {
            contentElem.innerHTML = '<p style="color:red;">Failed to load PDF.</p>';
            console.error(err);
        });

    } else {
        // 非 PDF 仍使用 iframe
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
    openTabs[title].tab.classList.add("active");
    openTabs[title].iframe.style.display = "block";
}

function closeTab(title) {
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
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const url = this.getAttribute("data-url");
            const title = this.textContent.trim();
            openTab(title, url);
        });
    });
});

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
    closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeTab(title);
    });

    tabBar.appendChild(tab);

    // === 创建内容容器 ===
    const contentElem = document.createElement("div");
    contentElem.style.flex = "1";
    contentElem.style.overflowY = "auto";
    contentElem.style.height = "100%";

    if (url.endsWith(".pdf")) {
        // PDF 渲染
        try {
            const pdf = await pdfjsLib.getDocument(url).promise;
            const numPages = pdf.numPages;

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const scale = 1.5;
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement("canvas");
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const context = canvas.getContext("2d");
                await page.render({ canvasContext: context, viewport: viewport }).promise;

                canvas.style.display = "block";
                canvas.style.margin = "10px auto";
                contentElem.appendChild(canvas);
            }
        } catch (err) {
            contentElem.innerHTML = `<p style="color:red;">Failed to load PDF: ${err.message}</p>`;
            console.error(err);
        }
    } else {
        // HTML iframe 渲染，禁止内部滚动
        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style.width = "100%";
        iframe.style.border = "none";
        iframe.style.display = "block";
        iframe.style.minHeight = "100%";
        iframe.scrolling = "no";  // 老浏览器兼容

        // 如果同源，自动调整高度
        iframe.onload = function () {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                iframe.style.height = iframeDoc.body.scrollHeight + "px";
            } catch (e) {
                // 跨域无法访问，外层滚动条控制
                iframe.style.height = "100%";
            }
        };

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
    openTabs[title].iframe.style.display = "block";
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
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const url = this.getAttribute("data-url");
            const title = this.textContent.trim();
            openTab(title, url);
        });
    });

    openTab('Introduction', 'introduction.html');
});

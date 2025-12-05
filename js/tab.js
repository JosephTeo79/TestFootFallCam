const tabBar = document.getElementById("tab-bar");
const tabContent = document.getElementById("tab-content");
const openTabs = {};

async function openTab(title, url) {
    if (openTabs[title]) {
        setActiveTab(title);
        return;
    }

    // 创建 tab 按钮
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

    // 创建内容容器
    const contentElem = document.createElement("div");
    contentElem.style.flex = "1";
    contentElem.style.overflowY = "auto";

    if (url.endsWith(".pdf")) {
        try {
            const pdf = await pdfjsLib.getDocument(url).promise;
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const scale = 1.5;
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement("canvas");
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const context = canvas.getContext("2d");
                await page.render({ canvasContext: context, viewport: viewport }).promise;

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
    openTabs[title].iframe.style.display = "flex"; // flex 填满右侧区域
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

// 初始化菜单点击事件
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const url = link.getAttribute("data-url");
            const title = link.textContent.trim();
            openTab(title, url);
        });
    });

    // 自动打开首页
    openTab('Introduction', 'introduction.html');
});

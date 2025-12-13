// treeview.js
function initTreeview() {
  const divider = document.getElementById("divider");
  const leftPane = document.getElementById("left-pane");
  const rightPane = document.getElementById("right-pane");

  if (!divider || !leftPane) {
    console.error("缺少 #divider 或 #left-pane");
    return;
  }

  // ---------------- 拖拽 ----------------
  let isDragging = false;

  divider.addEventListener("mousedown", function (e) {
    isDragging = true;
    document.body.style.cursor = "col-resize";
    if (rightPane) rightPane.style.pointerEvents = "none";
    e.preventDefault();
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;
    const newWidth = e.clientX;
    if (newWidth > 100 && newWidth < window.innerWidth - 100) {
      leftPane.style.width = newWidth + "px";
    }
  });

  document.addEventListener("mouseup", function () {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = "default";
      if (rightPane) rightPane.style.pointerEvents = "auto";
    }
  });

  // --------------- 树视图折叠 ----------------
  const togglers = document.getElementsByClassName("caret");
  for (let i = 0; i < togglers.length; i++) {
    togglers[i].addEventListener("click", function () {
      const nested = this.parentElement.querySelector(".nested");
      if (nested) nested.classList.toggle("active");
      this.classList.toggle("caret-down");
    });
  }
}

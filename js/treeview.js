document.addEventListener("DOMContentLoaded", function () {
  const togglers = document.getElementsByClassName("caret");
  for (let i = 0; i < togglers.length; i++) {
    togglers[i].addEventListener("click", function () {
      const nested = this.parentElement.querySelector(".nested");
      if (nested) nested.classList.toggle("active");
      this.classList.toggle("caret-down");
    });
  }
});

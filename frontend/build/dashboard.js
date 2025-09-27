cdocument.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.querySelector(".main-content");

  menuToggle.addEventListener("click", function () {
    sidebar.classList.toggle("closed");
    mainContent.classList.toggle("shifted");
  });
});

(() => {
  "use strict";
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

let taxSwitch = document.getElementById("flexSwitchCheckDefault");
taxSwitch.addEventListener("click", () => {
  let taxInfo = document.getElementsByClassName("tax-info");
  for (info of taxInfo) {
    if (info.style.display != "inline") {
      info.style.display = "inline";
    } else {
      info.style.display = "none";
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const leftBtn = document.querySelector(".left-btn");
  const rightBtn = document.querySelector(".right-btn");
  const filtersContainer = document.getElementById("filters-container");

  // Width of each filter item plus gap
  const filterWidth = document.querySelector(".filter").offsetWidth + 32;

  // Smooth scroll on button clicks
  leftBtn.addEventListener("click", function () {
    filtersContainer.scrollBy({
      left: -filterWidth,
      behavior: "smooth",
    });
  });

  rightBtn.addEventListener("click", function () {
    filtersContainer.scrollBy({
      left: filterWidth,
      behavior: "smooth",
    });
  });
});

// Smooth touch scrolling
document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("filters-container");

  let startX;
  let scrollLeft;

  container.addEventListener("touchstart", (e) => {
    startX = e.touches[0].pageX; // Starting touch position
    scrollLeft = container.scrollLeft; // Current scroll position
  });

  container.addEventListener("touchmove", (e) => {
    const x = e.touches[0].pageX; // Current touch position
    const walk = startX - x; // Difference between start and current
    container.scrollLeft = scrollLeft + walk; // Set new scroll position
  });
});


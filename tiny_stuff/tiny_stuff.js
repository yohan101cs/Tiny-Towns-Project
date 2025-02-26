document.addEventListener("DOMContentLoaded", function () {
  let selectedResource = null;

  // Select all resource cards
  const resourceCards = document.querySelectorAll(".resource-card");

  // Select/deselect a resource
  resourceCards.forEach(card => {
      card.addEventListener("click", function () {
          // Deselect previous selection
          resourceCards.forEach(c => c.classList.remove("selected"));

          // Select this card
          this.classList.add("selected");
          selectedResource = this.getAttribute("data-resource"); // Store resource type
      });
  });

  // Place selected resource into a grid cell
  document.querySelectorAll(".grid-cell").forEach(cell => {
      cell.addEventListener("click", function () {
          if (selectedResource && !this.hasChildNodes()) {
              const newResource = document.createElement("div");
              newResource.classList.add("resource-icon", selectedResource);
              this.appendChild(newResource);
          }
      });
  });
});



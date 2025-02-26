// Global variable to hold the selected resource type
let selectedResource = null;

// When a resource card is clicked, set the selected resource.
document.querySelectorAll('.resource-card').forEach(card => {
  card.addEventListener('click', () => {
    // Remove active state from all resource cards
    document.querySelectorAll('.resource-card').forEach(c => c.classList.remove('active'));
    // Add active state to the clicked card
    card.classList.add('active');
    // Set selected resource from the data attribute
    selectedResource = card.dataset.resource;
  });
});

// When a grid cell is clicked, place the resource if one is selected.
document.querySelectorAll('.grid-cell').forEach(cell => {
  cell.addEventListener('click', () => {
    // Only place resource if one is selected and the cell is empty.
    if (selectedResource && !cell.querySelector(`.${selectedResource}-block`)) {
      const resourceDiv = document.createElement('div');
      resourceDiv.classList.add(`${selectedResource}-block`);
      cell.appendChild(resourceDiv);
      
      // Clear the selected resource after placement (optional)
      selectedResource = null;
      document.querySelectorAll('.resource-card').forEach(c => c.classList.remove('active'));
    }
  });
});

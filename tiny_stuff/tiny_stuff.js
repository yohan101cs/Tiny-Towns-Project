document.addEventListener("DOMContentLoaded", function () {
  let selectedResource = null;

  let deck = createShuffledDeck();
  console.log(deck);
  console.log(deck.length);

  createMarket(deck); // Show initial market cards
  console.log(deck.length);


  // Select all resource cards
  const resourceCards = document.querySelectorAll(".resource-card");

  // Select/deselect a resource
  resourceCards.forEach(card => {
      card.addEventListener("click", function () {
          // Deselect previous selection
          resourceCards.forEach(c => c.classList.remove("selected"));

          // Select this card
          this.classList.add("selected");
          console.log(selectedResource);

          selectedResource = this.getAttribute("data-resource"); // Store resource type
          console.log(selectedResource);
          console.log("happening")


      });
  });

//   // Place selected resource into a grid cell
document.querySelectorAll(".grid-cell").forEach(cell => {
    cell.addEventListener("click", function () {
        console.log(selectedResource);
        console.log(this.hasChildNodes());

        if (selectedResource && !this.hasChildNodes()) {
            const newResource = document.createElement("div");
            newResource.classList.add("resource-icon", selectedResource);
            this.appendChild(newResource);
            console.log("Selected resource after placement:", selectedResource);

            marketRefresh(selectedResource, deck);

            // 🔥 Reset selectedResource and remove highlight from all cards
            selectedResource = null;
            document.querySelectorAll(".resource-card").forEach(card => {
                card.classList.remove("selected");
            });

            console.log("Selected resource after placement:", selectedResource);

            console.log("Updated deck size:", deck.length);
        }
    });
});

});


function createShuffledDeck() {
  let resources = ["wood", "stone", "brick", "wheat", "glass"];
  let deck = [];

  resources.forEach(resource => {
      for (let i = 0; i < 3; i++) {
          deck.push(resource);
      }
  });

  for (let i = deck.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}


function createMarket(deck) {
    const marketContainer = document.querySelector(".market");
    marketContainer.innerHTML = ""; // Clear previous market
  
    for (let i = 0; i < 3; i++) {
      let resource = deck.shift(); // Take from the top of the deck
  
      let card = document.createElement("div");
      card.classList.add("resource-card", resource);
      card.setAttribute("data-resource", resource);
  
      let label = document.createElement("div");
      label.classList.add("resource-label");
      label.textContent = resource.charAt(0).toUpperCase() + resource.slice(1);
  
      let icon = document.createElement("div");
      icon.classList.add("resource-icon", resource);
  
      card.appendChild(label);
      card.appendChild(icon);
      marketContainer.appendChild(card);
    }
  
    attachMarketListeners(); // 🔥 Ensure new cards get event listeners
  }


function attachMarketListeners() {
    const resourceCards = document.querySelectorAll(".resource-card");

    resourceCards.forEach(card => {
        card.addEventListener("click", function () {
            // Deselect all other cards
            resourceCards.forEach(c => c.classList.remove("selected"));

            // Select the clicked card and update `selectedResource`
            this.classList.add("selected");
            selectedResource = this.getAttribute("data-resource"); 
            console.log("Selected resource:", selectedResource);
        });
    });
}


function marketRefresh(placedResource, deck) {
    const marketContainer = document.querySelector(".market");

    // Find and remove the placed resource card from the market
    let cardToRemove = marketContainer.querySelector(`.resource-card[data-resource="${placedResource}"]`);

    if (cardToRemove) {
        marketContainer.removeChild(cardToRemove);
    } else {
        console.warn("Could not find resource to remove:", placedResource);
        return; // Stop execution if nothing was removed
    }

    // Move the placed resource to the bottom of the deck
    deck.push(placedResource);

    // Add a new resource from the deck if available
    if (deck.length > 0) {
        let newResource = deck.shift();

        let newCard = document.createElement("div");
        newCard.classList.add("resource-card", newResource);
        newCard.setAttribute("data-resource", newResource);

        let label = document.createElement("div");
        label.classList.add("resource-label");
        label.textContent = newResource.charAt(0).toUpperCase() + newResource.slice(1);

        let icon = document.createElement("div");
        icon.classList.add("resource-icon", newResource);

        newCard.appendChild(label);
        newCard.appendChild(icon);
        marketContainer.appendChild(newCard);
    }

    attachMarketListeners(); // 🔥 Reattach listeners to ensure new cards are clickable
}




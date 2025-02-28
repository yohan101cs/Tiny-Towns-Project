let selectedResource = null;
let deck = createShuffledDeck();
let selectedCells = new Set();
let selectedBuilding = null;

document.addEventListener("DOMContentLoaded", function () {
    createMarket(deck);
    attachGridListeners();
    attachBuildingListeners();
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
    marketContainer.innerHTML = "";

    for (let i = 0; i < 3; i++) {
        let resource = deck.shift();

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

    attachMarketListeners();
}

function attachMarketListeners() {
    const resourceCards = document.querySelectorAll(".resource-card");

    resourceCards.forEach(card => {
        card.removeEventListener("click", handleResourceClick); // Prevent duplicate listeners
        card.addEventListener("click", handleResourceClick);
    });
}

function handleResourceClick() {
    if (document.querySelectorAll(".grid-cell.selected").length > 0) {
        console.log("Cannot select resource, grid tiles are selected!");
        return; // Prevent selection if grids are still selected
    }

    if (this.classList.contains("selected")) {
        this.classList.remove("selected");
        selectedResource = null;
        console.log("Deselected resource.");
    } else {
        document.querySelectorAll(".resource-card").forEach(c => c.classList.remove("selected"));
        this.classList.add("selected");
        selectedResource = this.getAttribute("data-resource");
        console.log("Selected resource:", selectedResource);
    }
}


function attachGridListeners() {
    document.querySelectorAll(".grid-cell").forEach(cell => {
        cell.addEventListener("click", function () {
            if (selectedResource) {
                // Place the resource immediately
                if (!this.hasChildNodes()) {
                    const newResource = document.createElement("div");
                    newResource.classList.add("resource-icon", selectedResource);
                    newResource.setAttribute("data-resource", selectedResource);
                    this.appendChild(newResource);
                    console.log("Placed resource:", selectedResource);

                    marketRefresh(selectedResource); // Refresh market

                    // Clear selected resource after placement
                    selectedResource = null;
                    document.querySelectorAll(".resource-card").forEach(c => c.classList.remove("selected"));
                }
            } else {
                // Toggle grid selection (only if no resource is selected)
                if (selectedCells.has(this)) {
                    selectedCells.delete(this);
                    this.classList.remove("selected");
                    console.log("Deselected grid cell.");
                } else {
                    selectedCells.add(this);
                    this.classList.add("selected");
                    console.log("Selected grid cell.");
                }
            }
        });
    });
}

function marketRefresh(placedResource) {
    const marketContainer = document.querySelector(".market");
    let cardToRemove = marketContainer.querySelector(`.resource-card[data-resource="${placedResource}"]`);

    if (cardToRemove) {
        marketContainer.removeChild(cardToRemove);
    } else {
        console.warn("Could not find resource to remove:", placedResource);
        return;
    }

    deck.push(placedResource);

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

    attachMarketListeners();
}

function attachBuildingListeners() {
    const buildingCards = document.querySelectorAll(".cards-container .card");

    buildingCards.forEach(card => {
        card.removeEventListener("click", handleBuildingClick); // Prevent duplicate listeners
        card.addEventListener("click", handleBuildingClick);
    });
}

function handleBuildingClick() {
    if (this.classList.contains("selected")) {
        this.classList.remove("selected");
        selectedBuilding = null;
        console.log("Deselected building.");
    } else {
        document.querySelectorAll(".cards-container .card").forEach(c => c.classList.remove("selected"));
        this.classList.add("selected");
        selectedBuilding = this.querySelector(".card-title").textContent.trim();
        console.log("Selected building:", selectedBuilding);
    }
}

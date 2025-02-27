let selectedResource = null;
let deck = createShuffledDeck(); // deck is now a global variable so everything can use it

document.addEventListener("DOMContentLoaded", function () {
    console.log(deck);
    console.log(deck.length);

    createMarket(deck); 
    console.log(deck.length);

    attachGridListeners(); 
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


    //loops 3 times to add 3 resource cards to the market
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

    attachMarketListeners(); // Ensure new cards get event listeners
}

function attachMarketListeners() {
    const resourceCards = document.querySelectorAll(".resource-card");

    // Remove existing click event listeners before adding new ones
    resourceCards.forEach(card => {
        card.replaceWith(card.cloneNode(true)); // Clone to remove event listeners
    });

    document.querySelectorAll(".resource-card").forEach(card => {
        card.addEventListener("click", function () {
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
        });
    });
}

function attachGridListeners() {
    document.querySelectorAll(".grid-cell").forEach(cell => {
        cell.addEventListener("click", function () {
            console.log("Clicked cell - Selected Resource:", selectedResource);
            console.log("Cell has child:", this.hasChildNodes());

            if (selectedResource && !this.hasChildNodes()) {
                const newResource = document.createElement("div");
                newResource.classList.add("resource-icon", selectedResource);
                this.appendChild(newResource);
                console.log("Placed resource:", selectedResource);

                marketRefresh(selectedResource);

                // Reset selectedResource and remove highlight from all cards
                selectedResource = null;
                document.querySelectorAll(".resource-card").forEach(card => {
                    card.classList.remove("selected");
                });

                console.log("Updated deck size:", deck.length);
            }
        });
    });
}

function marketRefresh(placedResource) {
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
    deck.push(placedResource); // 🔥 Now modifies global deck

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

    setTimeout(attachMarketListeners, 0); // Ensure event listeners are attached after DOM updates
}





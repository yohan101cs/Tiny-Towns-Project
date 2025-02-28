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
            if (selectedBuilding === "Farm") {
                // Check if selected cells form a valid farm placement
                if (areCorrectGridsSelected("Farm")) {
                    // Replace selected tiles with a farm
                    placeFarm();
                    selectedBuilding = null; // Reset selected building
                    document.querySelectorAll(".cards-container .card").forEach(c => c.classList.remove("selected"));
                    return;
                } else {
                    console.log("Invalid farm placement.");
                    return;
                }
            }

            if (selectedResource) {
                // Place the resource immediately
                if (!this.hasChildNodes()) {
                    const newResource = document.createElement("div");
                    newResource.classList.add("resource-icon", selectedResource);
                    newResource.setAttribute("data-resource", selectedResource);
                    this.appendChild(newResource);
                    console.log("Placed resource:", selectedResource);

                    checkFarmPlacement(); // Check for farm after placement
                    marketRefresh(selectedResource); // Refresh market

                    // Clear selected resource after placement
                    selectedResource = null;
                    document.querySelectorAll(".resource-card").forEach(c => c.classList.remove("selected"));
                }
            } else {
                // Toggle grid selection if no resource is selected
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
    if (!this.classList.contains("readyToBuild")) {
        console.log("This building is not ready to be built!");
        return; 
    }

    const buildingName = this.querySelector(".card-title").textContent.trim();
    
    if (!areCorrectGridsSelected(buildingName)) {
        console.log(`Incorrect grid selection for ${buildingName}.`);
        return; 
    }

    console.log("Building clicked:", buildingName);

    if (this.classList.contains("selected")) {
        this.classList.remove("selected");
        selectedBuilding = null;
        console.log("Deselected building.");
    } else {
        document.querySelectorAll(".cards-container .card").forEach(c => c.classList.remove("selected"));
        this.classList.add("selected");
        selectedBuilding = buildingName;
        console.log("Selected building:", selectedBuilding);
    }
}


function areCorrectGridsSelected(buildingName) {
    if (buildingName === "Farm") {
        const selectedArray = Array.from(selectedCells);
        if (selectedArray.length !== 4) {
            console.log("Farm requires exactly 4 selected tiles.");
            return false;
        }

        let resources = selectedArray.map(cell => cell.firstChild ? cell.firstChild.getAttribute("data-resource") : null);
        resources.sort(); // Sort to make comparison easier

        const validFarmCombinations = [
            ["wheat", "wheat", "wood", "wood"], 
            ["wood", "wood", "wheat", "wheat"]
        ];

        return validFarmCombinations.some(combination => JSON.stringify(combination) === JSON.stringify(resources));
    }

    // Add more buildings here

    return false;
}


//if buildings have the resources to build them, then they are ready
//this makes buildings be ready to build
function markBuildingAsReady(buildingName) {
    const buildingCards = document.querySelectorAll(".card");

    buildingCards.forEach(card => {
        if (card.querySelector(".card-title").textContent === buildingName) {
            if (!card.classList.contains("readyToBuild")) {
                card.classList.add("readyToBuild");
                console.log(`${buildingName} is now ready to build.`);
            }
        }
    });
}


// If building no longer has the resources available to build it, then it is not ready
//this function makes buildings unready
function resetBuildingReadiness() {
    document.querySelectorAll(".card.readyToBuild").forEach(card => {
        card.classList.remove("readyToBuild");
    });
}


function checkFarmPlacement() {
    const gridCells = document.querySelectorAll(".grid-cell");
    const gridSize = Math.sqrt(gridCells.length); // Assuming a square grid

    let foundValidPlacement = false;

    // Loop through grid to check for a 2x2 block
    for (let row = 0; row < gridSize - 1; row++) {
        for (let col = 0; col < gridSize - 1; col++) {
            const topLeft = getResourceAt(row, col);
            const topRight = getResourceAt(row, col + 1);
            const bottomLeft = getResourceAt(row + 1, col);
            const bottomRight = getResourceAt(row + 1, col + 1);

            // Check for all four valid farm placements
            if (
                // Vertical normal
                (topLeft === "wheat" && topRight === "wheat" &&
                 bottomLeft === "wood" && bottomRight === "wood") ||
                // Vertical flipped
                (topLeft === "wood" && topRight === "wood" &&
                 bottomLeft === "wheat" && bottomRight === "wheat") ||
                // Horizontal normal
                (topLeft === "wheat" && bottomLeft === "wheat" &&
                 topRight === "wood" && bottomRight === "wood") ||
                // Horizontal flipped
                (topLeft === "wood" && bottomLeft === "wood" &&
                 topRight === "wheat" && bottomRight === "wheat")
            ) {
                foundValidPlacement = true;
                break;
            }
        }
        if (foundValidPlacement) break;
    }

    // Update the Farm building card based on the result
    const farmCard = document.querySelector(".card[data-building='Farm']");
    if (farmCard) {
        if (foundValidPlacement && !farmCard.classList.contains("readyToBuild")) {
            farmCard.classList.add("readyToBuild");
            console.log("Farm is now ready to build.");
        } else if (!foundValidPlacement && farmCard.classList.contains("readyToBuild")) {
            farmCard.classList.remove("readyToBuild");
            console.log("Farm is no longer ready to build.");
        }
    }
}


function getResourceAt(row, col) {
    const cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
    if (cell && cell.firstChild) {
        return cell.firstChild.getAttribute("data-resource");
    }
    return null;
}


function placeFarm() {
    if (selectedCells.size !== 4) {
        console.log("Farm requires exactly 4 selected tiles.");
        return;
    }

    // Convert Set to Array for easy access
    const selectedArray = Array.from(selectedCells);

    // Clear selected tiles (remove any previous resources)
    selectedArray.forEach(cell => {
        while (cell.firstChild) {
            cell.removeChild(cell.firstChild);
        }
    });

    // Create the farm icon element
    const farmIcon = document.createElement("div");
    farmIcon.classList.add("building-icon", "farm");
    farmIcon.innerHTML = "🚜"; // Add the farm emoji or use an image if preferred

    // Place the farm icon in one of the selected tiles (e.g., the top-left one)
    selectedArray[0].appendChild(farmIcon);

    console.log("Farm placed successfully!");

    // Clear selection highlights and reset selectedCells
    selectedCells.forEach(cell => cell.classList.remove("selected"));
    selectedCells.clear();
}

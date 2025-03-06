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
                if (selectedCells.has(this)) {
                    // Place the farm icon in the clicked cell
                    placeBuilding(this,selectedBuilding);
                    selectedBuilding = null; // Reset selected building
                    document.querySelectorAll(".cards-container .card").forEach(c => c.classList.remove("selected"));
                    return;
                } else {
                    console.log("Click on a selected tile to place the Farm.");
                    return;
                }
            }
            
            if (selectedBuilding === "Well") {
                if (selectedCells.has(this)) {
                    // If the cell is already selected, place the Well icon in the clicked cell
                    placeBuilding(this, selectedBuilding);
                    selectedBuilding = null; // Reset selected building
                    document.querySelectorAll(".cards-container .card").forEach(c => c.classList.remove("selected"));
                    return;
                } else if (selectedCells.size === 1) {
                    // If this is the second tile clicked, place the Well
                    placeBuilding(this, selectedBuilding);
                    selectedBuilding = null; // Reset selected building
                    document.querySelectorAll(".cards-container .card").forEach(c => c.classList.remove("selected"));
                    return;
                } else {
                    console.log("Click on a selected tile to place the Well.");
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
                    checkWellPlacement(); //Check for well after placement
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
  //farm Selection ---------------------------//
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
    if (buildingName === "Well") {
        const selectedArray = Array.from(selectedCells);
        if (selectedArray.length !== 2) {
            console.log("Well requires exactly 2 selected tiles.");
            return false;
        }

        let resources = selectedArray.map(cell => 
            cell.firstChild ? cell.firstChild.getAttribute("data-resource") : null
        );

        // Valid combinations for Well: ["wood", "stone"] OR ["stone", "wood"]
        if (resources.includes("wood") && resources.includes("stone")) {
            return true;
        }

        console.log("Invalid Well placement. Must have exactly one wood and one stone.");
        return false;
    }


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


function checkWellPlacement() {
    console.log("Checking Well placement...");

    const gridCells = document.querySelectorAll(".grid-cell");
    const gridSize = Math.sqrt(gridCells.length); // Assuming a square grid

    let foundValidPlacement = false;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const current = getResourceAt(row, col);
            console.log(`Cell (${row}, ${col}) contains: ${current}`); // Debugging log

            if (!current) continue; // Skip empty cells

            // Check right neighbor (horizontal)
            if (col < gridSize - 1) {
                const right = getResourceAt(row, col + 1);
                console.log(`Checking Right: ${current} - ${right}`);

                if (
                    (current === "wood" && right === "stone") ||
                    (current === "stone" && right === "wood")
                ) {
                    foundValidPlacement = true;
                }
            }

            // Check bottom neighbor (vertical)
            if (row < gridSize - 1) {
                const below = getResourceAt(row + 1, col);
                console.log(`Checking Below: ${current} - ${below}`);

                if (
                    (current === "wood" && below === "stone") ||
                    (current === "stone" && below === "wood")
                ) {
                    foundValidPlacement = true;
                }
            }

            if (foundValidPlacement) break;
        }
        if (foundValidPlacement) break;
    }

    // Find the Well card and update its status
    const wellCard = document.querySelector(".card[data-building='Well']");
    console.log("Well card:", wellCard); // Debugging log

    if (wellCard) {
        if (foundValidPlacement) {
            console.log("Well is ready to build!");
            wellCard.classList.add("readyToBuild");
        } else {
            console.log("Well is NOT ready to build.");
            wellCard.classList.remove("readyToBuild");
        }
    } else {
        console.error("Well card not found in DOM.");
    }
}



function getResourceAt(row, col) {
    const cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
    if (cell && cell.firstChild) {
        return cell.firstChild.getAttribute("data-resource");
    }
    return null;
}


function placeBuilding(targetCell, buildingType) {
    if (!selectedCells.has(targetCell)) {
        console.log("You must place the building in a selected tile.");
        return;
    }

    // Clear resources from selected tiles
    selectedCells.forEach(cell => {
        while (cell.firstChild) {
            cell.removeChild(cell.firstChild);
        }
    });

    // Create the building icon element
    const buildingIcon = document.createElement("div");
    buildingIcon.classList.add("building-icon", buildingType.toLowerCase().replace(/\s/g, "-")); // Convert to lowercase and replace spaces

    // Assign correct icon based on building type
    const buildingIcons = {
        "Farm": "🚜",
        "Well": "💧",
        "Theater": "🎭",
        "Tavern": "🍻",
        "Chapel": "⛪",
        "Factory": "🏭",
        "Cottage": "🏠"
        //add cathedral of caterina
    };

    buildingIcon.innerHTML = buildingIcons[buildingType] || "❓"; // Default icon if not found

    // Place the building icon in the clicked cell
    targetCell.appendChild(buildingIcon);

    console.log(`${buildingType} placed successfully in the selected tile!`);

    // Clear selection highlights and reset selectedCells
    selectedCells.forEach(cell => cell.classList.remove("selected"));
    selectedCells.clear();
}


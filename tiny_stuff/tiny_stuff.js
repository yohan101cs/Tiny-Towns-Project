let selectedResource = null;

/**
 * createShuffledDeck()
 * ---------------------
 * 1. We build an array of resources (wood, stone, brick, wheat, glass),
 *    each repeated 3 times.
 * 2. We shuffle that array randomly.
 * 3. The deck is returned so we can draw from it.
 */
function createShuffledDeck() {
    let resources = ["wood", "stone", "brick", "wheat", "glass"];
    let deck = [];

    // Add each resource 3 times
    resources.forEach(resource => {
        for (let i = 0; i < 3; i++) {
            deck.push(resource);
        }
    });

    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

// Our global deck of resources
let deck = createShuffledDeck();

// Tracks which grid cells are selected (for building placement)
let selectedCells = new Set();
let selectedBuilding = null;

document.addEventListener("DOMContentLoaded", function () {
    // We create the initial 3 resources in the market
    createMarket(deck);
    attachGridListeners();
    attachBuildingListeners();
});

/**
 * createMarket(deck)
 * ------------------
 * Draws 3 resources from the top of the deck (deck.shift())
 * and displays them as cards in the market. Each time you place
 * a resource on the board, we also call `marketRefresh()` to
 * remove that resource from the market and draw a new one.
 */
function createMarket(deck) {
    const marketContainer = document.querySelector(".market");
    marketContainer.innerHTML = "";

    // Pull 3 resources off the top of the deck
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

/**
 * marketRefresh(placedResource)
 * -----------------------------
 * When you place a resource on the grid, that resource is removed
 * from the market, put back at the bottom of the deck, and then we
 * draw a new resource (deck.shift()) to keep the market at 3 cards.
 */
function marketRefresh(placedResource) {
    const marketContainer = document.querySelector(".market");
    let cardToRemove = marketContainer.querySelector(`.resource-card[data-resource="${placedResource}"]`);

    if (cardToRemove) {
        marketContainer.removeChild(cardToRemove);
    } else {
        console.warn("Could not find resource to remove:", placedResource);
        return;
    }

    // Put the used resource at the bottom of the deck
    deck.push(placedResource);

    // If the deck has anything left, draw a new card
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

function attachMarketListeners() {
    const resourceCards = document.querySelectorAll(".resource-card");

    resourceCards.forEach(card => {
        card.removeEventListener("click", handleResourceClick); // Prevent duplicate listeners
        card.addEventListener("click", handleResourceClick);
    });
}

function handleResourceClick() {
    // If any grid cells are selected, don't allow resource selection
    if (document.querySelectorAll(".grid-cell.selected").length > 0) {
        console.log("Cannot select resource, grid tiles are selected!");
        return;
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
                    placeBuilding(this, selectedBuilding);
                    selectedBuilding = null;
                    document.querySelectorAll(".cards-container .card").forEach(c => c.classList.remove("selected"));
                    updateBuildingReadiness();
                    return;
                } else {
                    console.log("Click on a selected tile to place the Farm.");
                    return;
                }
            }
            
            if (selectedBuilding === "Well") {
                if (selectedCells.has(this)) {
                    placeBuilding(this, selectedBuilding);
                    selectedBuilding = null;
                    document.querySelectorAll(".cards-container .card").forEach(c => c.classList.remove("selected"));
                    updateBuildingReadiness();
                    return;
                } else if (selectedCells.size === 1) {
                    placeBuilding(this, selectedBuilding);
                    selectedBuilding = null;
                    document.querySelectorAll(".cards-container .card").forEach(c => c.classList.remove("selected"));
                    updateBuildingReadiness();
                    return;
                } else {
                    console.log("Click on a selected tile to place the Well.");
                    return;
                }
            }

            // If a resource is selected, place it on the board
            if (selectedResource) {
                if (!this.hasChildNodes()) {
                    const newResource = document.createElement("div");
                    newResource.classList.add("resource-icon", selectedResource);
                    newResource.setAttribute("data-resource", selectedResource);
                    this.appendChild(newResource);
                    console.log("Placed resource:", selectedResource);

                    // Optional checks for Farm/Well readiness
                    checkFarmPlacement(); 
                    checkWellPlacement(); 
                    marketRefresh(selectedResource);

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
            updateBuildingReadiness();
        });
    });
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
    buildingIcon.classList.add("building-icon", buildingType.toLowerCase().replace(/\s/g, "-")); 

    // Assign correct icon based on building type
    const buildingIcons = {
        "Farm": "🚜",
        "Well": "💧",
        "Theater": "🎭",
        "Tavern": "🍻",
        "Chapel": "⛪",
        "Factory": "🏭",
        "Cottage": "🏠",
        "Cathedral of Catarina": "🏛️"
    };

    buildingIcon.innerHTML = buildingIcons[buildingType] || "❓";
    targetCell.appendChild(buildingIcon);

    console.log(`${buildingType} placed successfully in the selected tile!`);

    // Clear selection highlights and reset
    selectedCells.forEach(cell => cell.classList.remove("selected"));
    selectedCells.clear();
    updateBuildingReadiness();
}

/* -----------------------------------------------------------------------
   Resource validation for each building 
   ----------------------------------------------------------------------- */

function compareResourceSet(selectedArray, neededArray) {
    let resources = selectedArray.map(cell => 
        cell.firstChild ? cell.firstChild.getAttribute("data-resource") : null
    );
    resources.sort();
    neededArray.sort();
    return JSON.stringify(resources) === JSON.stringify(neededArray);
}

function areCorrectGridsSelected(buildingName) {
    const selectedArray = Array.from(selectedCells);

    // Farm: 2x2 arrangement with exactly 2 wheat & 2 wood
    if (buildingName === "Farm") {
        if (selectedArray.length !== 4) {
            console.log("Farm requires exactly 4 selected tiles.");
            return false;
        }
        let resources = selectedArray.map(cell =>
            cell.firstChild ? cell.firstChild.getAttribute("data-resource") : null
        );
        resources.sort();
        const validFarmCombinations = [
            ["wheat", "wheat", "wood", "wood"], 
            ["wood", "wood", "wheat", "wheat"]
        ];
        return validFarmCombinations.some(
            combo => JSON.stringify(combo) === JSON.stringify(resources)
        );
    }

    // Well: 2 tiles, 1 wood & 1 stone
    if (buildingName === "Well") {
        if (selectedArray.length !== 2) {
            console.log("Well requires exactly 2 selected tiles.");
            return false;
        }
        return compareResourceSet(selectedArray, ["wood","stone"]) ||
               compareResourceSet(selectedArray, ["stone","wood"]);
    }

    // Cottage: 3 contiguous tiles: 1 brick, 1 glass, 1 wheat
    if (buildingName === "Cottage") {
        if (selectedArray.length !== 3) {
            console.log("Cottage requires exactly 3 tiles.");
            return false;
        }
        if (!areCellsContiguous(selectedArray)) {
            console.log("Cottage tiles must be contiguous.");
            return false;
        }
        return compareResourceSet(selectedArray, ["brick","glass","wheat"]);
    }

    // Chapel: 3 contiguous tiles: 2 stone, 1 wheat
    if (buildingName === "Chapel") {
        if (selectedArray.length !== 4) {
            console.log("Chapel requires exactly 3 tiles.");
            return false;
        }
        if (!areCellsContiguous(selectedArray)) {
            console.log("Chapel tiles must be contiguous.");
            return false;
        }
        return compareResourceSet(selectedArray, ["stone","glass","stone","glass"]);
    }

    // Tavern: 3 contiguous tiles: 2 brick, 1 wood
    if (buildingName === "Tavern") {
        if (selectedArray.length !== 3) {
            console.log("Tavern requires exactly 3 tiles.");
            return false;
        }
        if (!areCellsContiguous(selectedArray)) {
            console.log("Tavern tiles must be contiguous.");
            return false;
        }
        return compareResourceSet(selectedArray, ["brick","brick","wood"]);
    }

    // Theater: 3 contiguous tiles: 2 wood, 1 stone
    if (buildingName === "Theater") {
        if (selectedArray.length !== 4) {
            console.log("Theater requires exactly 3 tiles.");
            return false;
        }
        if (!areCellsContiguous(selectedArray)) {
            console.log("Theater tiles must be contiguous.");
            return false;
        }
        return compareResourceSet(selectedArray, ["wood","wood","stone","glass"]);
    }

    // Factory: 3 contiguous tiles: 2 wood, 1 stone
    if (buildingName === "Factory") {
        if (selectedArray.length !== 3) {
            console.log("Factory requires exactly 3 tiles.");
            return false;
        }
        if (!areCellsContiguous(selectedArray)) {
            console.log("Factory tiles must be contiguous.");
            return false;
        }
        return compareResourceSet(selectedArray, ["wood","wood","stone"]);
    }

    // Cathedral of Catarina: 1 tile (if you want a requirement, adjust here)
    if (buildingName === "Cathedral of Catarina") {
        if (selectedArray.length !== 1) {
            console.log("Cathedral of Catarina requires exactly 1 tile.");
            return false;
        }
        return true;
    }

    return false;
}

// Check contiguity for buildings requiring multiple adjacent squares
function areCellsContiguous(cells) {
    if (cells.length === 0) return false;
    const cellSet = new Set();
    cells.forEach(cell => {
        const row = parseInt(cell.getAttribute("data-row"));
        const col = parseInt(cell.getAttribute("data-col"));
        cellSet.add(`${row},${col}`);
    });
    const stack = [];
    const visited = new Set();
    const first = cells[0];
    const startKey = `${first.getAttribute("data-row")},${first.getAttribute("data-col")}`;
    stack.push(startKey);
    visited.add(startKey);
    
    while (stack.length > 0) {
        const current = stack.pop();
        const [curRow, curCol] = current.split(",").map(Number);
        const neighbors = [
            `${curRow-1},${curCol}`,
            `${curRow+1},${curCol}`,
            `${curRow},${curCol-1}`,
            `${curRow},${curCol+1}`
        ];
        neighbors.forEach(neighbor => {
            if (cellSet.has(neighbor) && !visited.has(neighbor)) {
                visited.add(neighbor);
                stack.push(neighbor);
            }
        });
    }
    
    return visited.size === cellSet.size;
}

function updateBuildingReadiness() {
    document.querySelectorAll(".cards-container .card").forEach(card => {
        const buildingName = card.querySelector(".card-title").textContent.trim();
        if (areCorrectGridsSelected(buildingName)) {
            if (!card.classList.contains("readyToBuild")) {
                card.classList.add("readyToBuild");
                console.log(`${buildingName} is now ready to build.`);
            }
        } else {
            if (card.classList.contains("readyToBuild")) {
                card.classList.remove("readyToBuild");
                console.log(`${buildingName} is no longer ready to build.`);
            }
        }
    });
}

/* Optional: Legacy checks for Farm/Well across the entire grid
   (these might be redundant now that we have areCorrectGridsSelected) */
function checkFarmPlacement() {
    const gridCells = document.querySelectorAll(".grid-cell");
    const gridSize = Math.sqrt(gridCells.length);
    let foundValidPlacement = false;

    for (let row = 0; row < gridSize - 1; row++) {
        for (let col = 0; col < gridSize - 1; col++) {
            const topLeft = getResourceAt(row, col);
            const topRight = getResourceAt(row, col + 1);
            const bottomLeft = getResourceAt(row + 1, col);
            const bottomRight = getResourceAt(row + 1, col + 1);

            if (
                (topLeft === "wheat" && topRight === "wheat" &&
                 bottomLeft === "wood" && bottomRight === "wood") ||
                (topLeft === "wood" && topRight === "wood" &&
                 bottomLeft === "wheat" && bottomRight === "wheat")
            ) {
                foundValidPlacement = true;
                break;
            }
        }
        if (foundValidPlacement) break;
    }

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
    const gridSize = Math.sqrt(gridCells.length);
    let foundValidPlacement = false;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const current = getResourceAt(row, col);
            if (!current) continue;

            if (col < gridSize - 1) {
                const right = getResourceAt(row, col + 1);
                if (
                    (current === "wood" && right === "stone") ||
                    (current === "stone" && right === "wood")
                ) {
                    foundValidPlacement = true;
                }
            }

            if (row < gridSize - 1) {
                const below = getResourceAt(row + 1, col);
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

    const wellCard = document.querySelector(".card[data-building='Well']");
    if (wellCard) {
        if (foundValidPlacement) {
            wellCard.classList.add("readyToBuild");
            console.log("Well is ready to build!");
        } else {
            wellCard.classList.remove("readyToBuild");
            console.log("Well is NOT ready to build.");
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

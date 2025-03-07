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

            // Add logic for placing the Cottage
            if (selectedBuilding === "Cottage") {
                if (selectedCells.has(this)) {
                    // Place the farm icon in the clicked cell
                    placeBuilding(this, selectedBuilding);
                    selectedBuilding = null; // Reset selected building
                    document.querySelectorAll(".cards-container .card").forEach(c => c.classList.remove("selected"));
                    return;
                } else {
                    console.log("Click on a selected tile to place the Farm.");
                    return;
                }
            }

            if (selectedBuilding === "Tavern") {
                if (selectedCells.has(this)) {
                    // Place the farm icon in the clicked cell
                    placeBuilding(this, selectedBuilding);
                    selectedBuilding = null; // Reset selected building
                    document.querySelectorAll(".cards-container .card").forEach(c => c.classList.remove("selected"));
                    return;
                } else {
                    console.log("Click on a selected tile to place the Farm.");
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

                    checkFarmPlacement(); 
                    checkWellPlacement(); 
                    // checkTheaterPlacement();
                    checkTavernPlacement();
                    // checkChapelPlacement();
                    // checkFactoryPlacement();
                    checkCottagePlacement();
                    // checkCathedralOfCaterinaPlacement();

                
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
    const selectedArray = Array.from(selectedCells);

    // Farm Selection ---------------------------//
    if (buildingName === "Farm") {
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

        // Check if the resources match a valid farm pattern
        if (!validFarmCombinations.some(combination => JSON.stringify(combination) === JSON.stringify(resources))) {
            console.log("Invalid Farm placement. Resources or position are incorrect.");
            return false;
        }

        // Check if the selected cells are either in the same row or the same column, but not diagonally
        const [cell1, cell2, cell3, cell4] = selectedArray;
        const [row1, col1] = getRowAndColumn(cell1);
        const [row2, col2] = getRowAndColumn(cell2);
        const [row3, col3] = getRowAndColumn(cell3);
        const [row4, col4] = getRowAndColumn(cell4);

        const isSameRow = row1 === row2 && row3 === row4 && col1 !== col2 && col3 !== col4;
        const isSameColumn = col1 === col2 && col3 === col4 && row1 !== row2 && row3 !== row4;

        if (isSameRow || isSameColumn) {
            console.log("Farm placement is valid.");
            return true;
        } else {
            console.log("Invalid Farm placement. Cells are diagonally placed.");
            return false;
        }
    }

    // Well Selection ---------------------------//
    if (buildingName === "Well") {
        if (selectedArray.length !== 2) {
            console.log("Well requires exactly 2 selected tiles.");
            return false;
        }

        let resources = selectedArray.map(cell => 
            cell.firstChild ? cell.firstChild.getAttribute("data-resource") : null
        );

        if (resources.includes("wood") && resources.includes("stone")) {
            const [cell1, cell2] = selectedArray;
            const [row1, col1] = getRowAndColumn(cell1);
            const [row2, col2] = getRowAndColumn(cell2);

            if ((row1 === row2 && col1 !== col2) || (row1 !== row2 && col1 === col2)) {
                console.log("Well placement is valid.");
                return true;
            } else {
                console.log("Invalid Well placement. Cells are diagonally placed.");
                return false;
            }
        }

        console.log("Invalid Well placement. Must have exactly one wood and one stone.");
        return false;
    }

    // Cottage Selection ---------------------------//
    if (buildingName === "Cottage") {
        if (selectedArray.length !== 3) {
            console.log("Cottage requires exactly 3 selected tiles.");
            return false;
        }
    
        let resources = selectedArray.map(cell => 
            cell.firstChild ? cell.firstChild.getAttribute("data-resource") : null
        );
    
        // Check if resources match the Cottage pattern (one wheat, brick/glass, brick/glass/wheat)
        if (resources.includes("wheat") && (resources.includes("brick") || resources.includes("glass"))) {
            const [cell1, cell2, cell3] = selectedArray;
            const [row1, col1] = getRowAndColumn(cell1);
            const [row2, col2] = getRowAndColumn(cell2);
            const [row3, col3] = getRowAndColumn(cell3);
    
            const topLeft = resources[0]; // Resource from the first cell
            const topRight = resources[1]; // Resource from the second cell
            const bottomLeft = resources[2]; // Resource from the third cell
            const bottomRight = null; // There's no fourth cell, so set this as null
    
            console.log('Top Left:', topLeft);
            console.log('Top Right:', topRight);
            console.log('Bottom Left:', bottomLeft);
    
            // Check if the selected resources match any of the valid Cottage patterns
            const isValidPattern = 
                (topLeft === "brick" && topRight === "glass" &&
                 bottomLeft === "wheat" && bottomRight === null) ||

                 (topLeft === "wheat" && bottomLeft === "brick" &&
                    topRight === "glass" && bottomRight === null) ||

                (topLeft === "glass" && bottomLeft === "wheat" &&
                    topRight === "brick" && bottomRight === null);
    
            if (isValidPattern) {
                console.log("Cottage placement is valid.");
                return true;
            } else {
                console.log("Invalid Cottage placement. Resources or orientation are incorrect.");
                return false;
            }
        }
    }
    

    // Tavern Selection ---------------------------//
    if (buildingName === "Tavern") {
        if (selectedArray.length !== 3) {
            console.log("Tavern requires exactly 3 selected tiles.");
            return false;
        }

        let resources = selectedArray.map(cell => 
            cell.firstChild ? cell.firstChild.getAttribute("data-resource") : null
        );

        // Check if resources match the Tavern pattern (Brick, Brick, Glass in horizontal or vertical pattern)
        if (resources.includes("brick") && resources.includes("glass")) {
            const [cell1, cell2, cell3] = selectedArray;
            const [row1, col1] = getRowAndColumn(cell1);
            const [row2, col2] = getRowAndColumn(cell2);
            const [row3, col3] = getRowAndColumn(cell3);
    
            // Check for horizontal (Brick, Brick, Glass)
            const isValidHorizontal = 
                (resources[0] === "brick" && resources[1] === "brick" && resources[2] === "glass") ||
                (resources[0] === "glass" && resources[1] === "brick" && resources[2] === "brick");
            
            // Check for vertical (Brick on top, Brick in middle, Glass on bottom)
            const isValidVertical =
                (resources[0] === "brick" && resources[1] === "brick" && resources[2] === "glass") ||
                (resources[0] === "glass" && resources[1] === "brick" && resources[2] === "brick");

            if (isValidHorizontal || isValidVertical) {
                console.log("Tavern placement is valid.");
                return true;
            } else {
                console.log("Invalid Tavern placement. Resources or orientation are incorrect.");
                return false;
            }
        }
    }
    
    // Add more buildings here...
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



function checkCottagePlacement() {
    const gridCells = document.querySelectorAll(".grid-cell");
    const gridSize = Math.sqrt(gridCells.length); // Assuming a square grid

    let foundValidPlacement = false;

    // Loop through the grid to check for a 2x2 block
    for (let row = 0; row < gridSize - 1; row++) {
        for (let col = 0; col < gridSize - 1; col++) {
            const topLeft = getResourceAt(row, col);
            const topRight = getResourceAt(row, col + 1);
            const bottomLeft = getResourceAt(row + 1, col);
            const bottomRight = getResourceAt(row + 1, col + 1);

            console.log(`Checking 2x2 block at (${row}, ${col}):`, { topLeft, topRight, bottomLeft, bottomRight });
            console.log(`Top Left: ${topLeft}, Top Right: ${topRight}, Bottom Left: ${bottomLeft}, Bottom Right: ${bottomRight}`);


            // Check for all valid Cottage placements
            if (
                // Original Orientation
                (topLeft === null && topRight === "wheat" &&
                 bottomLeft === "brick" && bottomRight === "glass") ||
                // Flipped Up-Down
                (topLeft === "brick" && topRight === "glass" &&
                 bottomLeft === null && bottomRight === "wheat") ||
                // Flipped Left-Right
                (topLeft === "wheat" && bottomLeft === "glass" &&
                 topRight === null && bottomRight === "brick") ||
                // Fully Rotated (90° Counterclockwise)
                (topLeft === "brick" && bottomLeft === "glass" &&
                 topRight === null && bottomRight === "wheat") 


            ) {
                foundValidPlacement = true;
                break;
            }
        }
        if (foundValidPlacement) break;
    }

    // Update the Cottage building card based on the result
    const cottageCard = document.querySelector(".card[data-building='Cottage']");
    if (cottageCard) {
        if (foundValidPlacement && !cottageCard.classList.contains("readyToBuild")) {
            cottageCard.classList.add("readyToBuild");
            console.log("Cottage is now ready to build.");
        } else if (!foundValidPlacement && cottageCard.classList.contains("readyToBuild")) {
            cottageCard.classList.remove("readyToBuild");
            console.log("Cottage is no longer ready to build.");
        }
    }
}



function checkTavernPlacement() {
    const gridCells = document.querySelectorAll(".grid-cell");
    const gridSize = Math.sqrt(gridCells.length); // Assuming a square grid

    let foundValidPlacement = false;

    // Check for horizontal placement (Brick, Brick, Glass in a row)
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize - 2; col++) { // Ensure width of 3
            const left = getResourceAt(row, col);
            const middle = getResourceAt(row, col + 1);
            const right = getResourceAt(row, col + 2);

            if ((left === "brick" && middle === "brick" && right === "glass") ||
                (left === "glass" && middle === "brick" && right === "brick")) {
                foundValidPlacement = true;
                break;
            }
        }
        if (foundValidPlacement) break;
    }

    // Check for vertical placement (Brick on top, Brick in middle, Glass on bottom)
    if (!foundValidPlacement) {
        for (let col = 0; col < gridSize; col++) {
            for (let row = 0; row < gridSize - 2; row++) { // Ensure height of 3
                const top = getResourceAt(row, col);
                const middle = getResourceAt(row + 1, col);
                const bottom = getResourceAt(row + 2, col);

                if ((top === "brick" && middle === "brick" && bottom === "glass") ||
                    (top === "glass" && middle === "brick" && bottom === "brick")) {
                    foundValidPlacement = true;
                    break;
                }
            }
            if (foundValidPlacement) break;
        }
    }

    // Update the Tavern building card based on the result
    const tavernCard = document.querySelector(".card[data-building='Tavern']");
    if (tavernCard) {
        if (foundValidPlacement && !tavernCard.classList.contains("readyToBuild")) {
            tavernCard.classList.add("readyToBuild");
            console.log("Tavern is now ready to build.");
        } else if (!foundValidPlacement && tavernCard.classList.contains("readyToBuild")) {
            tavernCard.classList.remove("readyToBuild");
            console.log("Tavern is no longer ready to build.");
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



function getRowAndColumn(cell) {
    const row = cell.getAttribute('data-row');
    const col = cell.getAttribute('data-col');
    return [parseInt(row), parseInt(col)];
}
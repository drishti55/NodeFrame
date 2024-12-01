let canvas, ctx;
let arrows = [];
let nodes = [];
let startNode = null;
let isConnecting = false;
let selectedNode = null; // Selected node for calendar functionality
let currentSticker = null; // Currently selected sticker
let cropping = false; // Tracks if cropping mode is active

// Select the list button
const listButton = document.getElementById('listButton');

// Create and style the sidebar dynamically
const sidebar = document.createElement('div');
sidebar.id = 'sidebar';
sidebar.style.position = 'fixed';
sidebar.style.left = '-300px'; // Completely hidden before clicking
sidebar.style.top = '0';
sidebar.style.width = '300px';
sidebar.style.height = '100%';
sidebar.style.backgroundColor = '#FFF';
sidebar.style.boxShadow = '2px 0 5px rgba(0, 0, 0, 0.5)';
sidebar.style.padding = '20px';
sidebar.style.transition = 'left 0.3s ease'; // Transition for sliding in/out
sidebar.style.overflowY = 'auto';
document.body.appendChild(sidebar);

// Add a header to the sidebar
const header = document.createElement('h2');
header.textContent = 'Mind Map List';
header.style.color = '#8352C6';
sidebar.appendChild(header);

// Create the list container
const itemList = document.createElement('ul');
itemList.style.listStyleType = 'none';
itemList.style.padding = '0';
sidebar.appendChild(itemList);

// Sample data for the list items (replace with your actual data)
const nodeData = [
    { name: 'Node 1', description: 'This is the first node' },
    { name: 'Node 2', description: 'This is the second node' },
    { name: 'Node 3', description: 'This is the third node' }
];

// Toggle sidebar visibility and populate the list when the "List" button is clicked
let sidebarOpen = false;
listButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent closing sidebar when clicking the button itself
    sidebarOpen = !sidebarOpen;
    sidebar.style.left = sidebarOpen ? '0' : '-300px'; // Show/hide sidebar

    if (sidebarOpen) {
        populateList();
    }
});

// Function to populate the list in the sidebar
function populateList() {
    itemList.innerHTML = ''; // Clear the list before adding items
    nodeData.forEach((node) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${node.name}: ${node.description}`;
        listItem.style.marginBottom = '10px';
        listItem.style.cursor = 'pointer';
        listItem.onclick = () => alert(`Clicked on ${node.name}`);
        itemList.appendChild(listItem);
    });
}

// Close sidebar if click occurs anywhere else in the document
document.addEventListener('click', () => {
    if (sidebarOpen) {
        sidebarOpen = false;
        sidebar.style.left = '-300px'; // Hide sidebar
    }
});

// Prevent sidebar from closing when clicking inside it
sidebar.addEventListener('click', (event) => {
    event.stopPropagation();
});

window.onload = function () {
    // Initialize canvas for drawing arrows
    canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    ctx = canvas.getContext("2d");

    // Add functionality to buttons
    document.getElementById("addButton").addEventListener("click", addNode);
    document.getElementById("connectButton").addEventListener("click", toggleConnectMode);
    document.getElementById("calendarButton").addEventListener("click", setDeadline);
    document.getElementById("stickerButton").addEventListener("click", () => document.getElementById("stickerUpload").click());
    document.getElementById("cropButton").addEventListener("click", toggleCropMode);
    document.getElementById("textButton").addEventListener("click", addText); // Updated to call addText

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawAllArrows();
    });

    // Initialize sticker upload functionality
    const stickerUpload = document.getElementById("stickerUpload");
    stickerUpload.addEventListener("change", handleStickerUpload);
};

// Function to add nodes with editable text
function addNode() {
    const node = document.createElement("div");
    node.className = "node";
    node.contentEditable = true;
    node.style.position = "absolute";
    node.style.left = "150px";
    node.style.top = "150px";
    node.style.width = "120px";
    node.style.height = "50px";
    node.style.backgroundColor = getRandomColor();
    node.style.borderRadius = "8px";
    node.style.padding = "10px";
    node.style.boxShadow = "0px 2px 5px rgba(0,0,0,0.2)";
    node.style.cursor = "pointer";
    node.style.outline = "none";

    node.addEventListener("mousedown", initiateDrag);
    node.addEventListener("click", () => selectNode(node));
    document.body.appendChild(node);
    nodes.push(node);
}

// Drag function for nodes
function initiateDrag(event) {
    const node = event.target;
    const shiftX = event.clientX - node.getBoundingClientRect().left;
    const shiftY = event.clientY - node.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
        node.style.left = pageX - shiftX + 'px';
        node.style.top = pageY - shiftY + 'px';
        drawAllArrows();
    }

    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);
    node.onmouseup = () => document.removeEventListener('mousemove', onMouseMove);
    node.ondragstart = () => false;
}

// Toggle connecting mode
function toggleConnectMode() {
    isConnecting = !isConnecting;
    document.querySelectorAll(".node").forEach(node =>
        node.addEventListener("click", isConnecting ? selectNodeForConnection : null)
    );
    if (!isConnecting) startNode = null;
}

// Select nodes for connection
function selectNodeForConnection(event) {
    const node = event.target;
    const rect = node.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (!startNode) {
        startNode = { element: node, x: centerX, y: centerY };
        node.classList.add("selected");
    } else {
        arrows.push({ start: startNode, end: { x: centerX, y: centerY } });
        drawAllArrows();
        startNode.element.classList.remove("selected");
        startNode = null;
    }
}

// Draw all arrows in canvas
function drawAllArrows() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    arrows.forEach(arrow => drawArrow(arrow.start.x, arrow.start.y, arrow.end.x, arrow.end.y));
}

// Function to draw arrow with head
function drawArrow(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    drawArrowhead(x1, y1, x2, y2);
}

// Helper to draw arrowhead
function drawArrowhead(x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = 10;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

// Random color generator for new nodes
function getRandomColor() {
    const colors = ["#FFC0CB", "#87CEFA", "#98FB98", "#FFD700", "#FFA07A"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Select a node for calendar functionality
function selectNode(node) {
    selectedNode = node;
}

// Calendar button functionality
function setDeadline() {
    if (selectedNode) {
        const selectedDate = prompt("Enter deadline date (YYYY-MM-DD):");
        if (selectedDate) {
            const deadline = new Date(selectedDate);
            const currentDate = new Date();

            const dateDisplay = document.createElement("div");
            dateDisplay.textContent = `Due: ${selectedDate}`;
            dateDisplay.style.fontSize = "10px";
            dateDisplay.style.color = "#333";
            dateDisplay.style.position = "absolute";
            dateDisplay.style.bottom = "5px";
            dateDisplay.style.left = "5px";

            selectedNode.appendChild(dateDisplay);
            const diffDays = Math.ceil((deadline - currentDate) / (1000 * 3600 * 24));
            selectedNode.style.backgroundColor = diffDays < 0 ? "#FF4500" : "#98FB98"; // red, orange, green
        }
    } else {
        alert("Please select a node first.");
    }
}

// Sticker upload and drag functionality
function handleStickerUpload(event) {
    const sticker = document.createElement("img");
    sticker.src = URL.createObjectURL(event.target.files[0]);
    sticker.style.position = "absolute";
    sticker.style.cursor = "move";
    sticker.style.maxWidth = "100px"; // Set a max size for stickers
    sticker.style.maxHeight = "100px";

    sticker.addEventListener("mousedown", initiateDrag);
    document.body.appendChild(sticker);
}

// Toggle crop mode for stickers
function toggleCropMode() {
    cropping = !cropping;
    alert(cropping ? "Crop mode enabled. Click on a sticker to crop." : "Crop mode disabled.");
}

// Text button functionality for adding editable text
function addText() {
    const textInput = document.createElement("div");
    textInput.contentEditable = true;
    textInput.style.position = "absolute";
    textInput.style.width = "150px";
    textInput.style.height = "50px";
    textInput.style.backgroundColor = "#FFF";
    textInput.style.border = "1px solid #ccc";
    textInput.style.padding = "10px";
    textInput.style.cursor = "move";
    textInput.textContent = "Editable Text";

    textInput.addEventListener("mousedown", initiateDrag);
    document.body.appendChild(textInput);
}









// JavaScript for Save button functionality 
document.getElementById("saveButton").addEventListener("click", function () {
    const targetElement = document.querySelector(".editor.menu");

    html2canvas(targetElement, {
        scale: 2,
        backgroundColor: null
    }).then(function (canvas) {
        canvas.toBlob(function (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "mind_map.jpeg";
            link.click();
            URL.revokeObjectURL(link.href);
        }, "image/jpeg");
    });
});


// JavaScript for Share button functionality
document.getElementById("shareButton").addEventListener("click", function() {
    const shareData = {
        title: 'Mind Map Editor - NodeFrame',
        text: 'Check out this mind map I created!',
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Successfully shared'))
            .catch(error => console.log('Error sharing:', error));
    } else {
        alert('Sharing is not supported on this browser.');
    }
});

document.getElementById("profileButton").addEventListener("click", () => {
    window.location.href = "Dashboard/profile.html";
});


// Add div for resize
const resizer = document.createElement("div");
resizer.style.width = "8px"; // and other styling
node.appendChild(resizer);
resizer.addEventListener("mousedown", resizeFunction);


function handleStickerUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const img = new Image();
        img.onload = () => document.body.appendChild(img);
        img.src = URL.createObjectURL(file);
        img.style.position = "absolute";
        img.style.left = "100px";
        img.style.top = "100px";
    }
}

const diffDays = Math.ceil((deadline - currentDate) / (1000 * 3600 * 24));
selectedNode.style.backgroundColor = diffDays <= 3 ? "#FFA07A" : "#FFC0CB"; // or other logic for colors


fetch("workpace.json")
  .then(response => response.json())
  .then(data => {
    // Load mind map data
    const mindMap = data.mindMap;
    initializeMindMap(mindMap);
  });

function initializeMindMap(mindMap) {
  // Set up title, settings, nodes, and connections here
  console.log("Loaded Mind Map:", mindMap);
}

// DOM Elements
const workspace = document.getElementById('workspace');
const addNodeBtn = document.getElementById('addNodeBtn');
const addArrowBtn = document.getElementById('addArrowBtn');
const shareModal = document.getElementById('shareModal');
const closeModal = document.getElementById('closeModal');

// Add a new node
addNodeBtn.addEventListener('click', () => {
  const node = document.createElement('div');
  node.classList.add('node');
  node.contentEditable = true;
  node.style.left = `${Math.random() * 80}vw`;
  node.style.top = `${Math.random() * 80}vh`;
  node.draggable = true;

  node.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', null);
    e.target.classList.add('dragging');
  });

  node.addEventListener('dragend', (e) => {
    const rect = workspace.getBoundingClientRect();
    node.style.left = `${e.clientX - rect.left}px`;
    node.style.top = `${e.clientY - rect.top}px`;
    e.target.classList.remove('dragging');
  });

  workspace.appendChild(node);
});

// Add an arrow
addArrowBtn.addEventListener('click', () => {
  const arrow = document.createElement('div');
  arrow.classList.add('arrow');
  arrow.style.left = '50%';
  arrow.style.top = '50%';
  workspace.appendChild(arrow);
});

// Modal Close
closeModal.addEventListener('click', () => {
  shareModal.style.display = 'none';
});

// Show Modal
document.getElementById('shareLink').addEventListener('click', () => {
  shareModal.style.display = 'block';
});

function addNode() {
    const node = document.createElement("div");
    node.className = "node";
    node.contentEditable = true;
    node.style.position = "absolute";
    node.style.left = "150px";
    node.style.top = "150px";
    node.style.width = "120px";
    node.style.height = "50px";
    node.style.backgroundColor = getRandomColor();
    node.style.borderRadius = "8px";
    node.style.padding = "10px";
    node.style.boxShadow = "0px 2px 5px rgba(0,0,0,0.2)";
    node.style.cursor = "pointer";
    node.style.outline = "none";

    // Create a delete icon
    const deleteIcon = document.createElement("span");
    deleteIcon.textContent = "✖"; // Unicode for X symbol
    deleteIcon.style.position = "absolute";
    deleteIcon.style.top = "5px";
    deleteIcon.style.right = "5px";
    deleteIcon.style.cursor = "pointer";
    deleteIcon.style.color = "red";
    deleteIcon.style.fontSize = "14px";
    deleteIcon.title = "Delete Node";

    // Attach delete functionality
    deleteIcon.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent triggering other events on the node
        deleteNode(node);
    });

    node.appendChild(deleteIcon);

    node.addEventListener("mousedown", initiateDrag);
    node.addEventListener("click", () => selectNode(node));
    document.body.appendChild(node);
    nodes.push(node);
}

function deleteNode(node) {
    // Remove node from the DOM
    document.body.removeChild(node);

    // Remove node from the `nodes` array
    nodes = nodes.filter(n => n !== node);

    // Remove any arrows connected to this node
    const rect = node.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    arrows = arrows.filter(arrow => {
        const connectedToNode = (
            arrow.start.x === centerX && arrow.start.y === centerY ||
            arrow.end.x === centerX && arrow.end.y === centerY
        );
        return !connectedToNode;
    });

    // Redraw canvas to update arrows
    drawAllArrows();
}

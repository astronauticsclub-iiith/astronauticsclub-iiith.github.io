const canvas = document.getElementById("starMap");
const starDetailsBox = document.getElementById("starDetailsBox");
const ctx = canvas.getContext("2d");

// Canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Zoom, pan, and rotation variables
let scale = 1;
let offsetX = canvas.width / 2;
let offsetY = canvas.height / 2;
let rotationAngle = 0

const STAR_HIT_MULTIPLIER = 3; // Adjust hit area sensitivity
let constellations = {};
let hoveredStar = null;


fetch('../data/constellation.json')
.then(response => {
  return response.json();
})
.then(data => {
  constellations = data
  drawScene();
})

// Handle resizing
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawScene();
});


function getCanvasMousePosition(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  
  // Handle CSS scaling (canvas drawing buffer vs display size)
  const cssToCanvasX = canvas.width / rect.width;
  const cssToCanvasY = canvas.height / rect.height;
  
  // Account for scroll and navbar positioning
  const mouseX = (clientX - rect.left) * cssToCanvasX;
  const mouseY = (clientY - rect.top) * cssToCanvasY;
  return { mouseX, mouseY };
}


// Draw celestial grid
function drawCelestialGrid() {
  const radius = Math.min(canvas.width, canvas.height) / 2;
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1;

  // Draw concentric circles (declination lines)
  for (let dec = 0; dec <= 90; dec += 15) {
    const r = (radius * (90 - Math.abs(dec))) / 90;
    ctx.beginPath();
    ctx.arc(offsetX, offsetY, r * scale, 0, 2 * Math.PI);
    ctx.stroke();
  }

  // Draw radial lines (right ascension lines)
  for (let ra = 0; ra < 360; ra += 15) {
    const radRA = (ra / 360) * 2 * Math.PI;
    const x = offsetX + radius * Math.cos(radRA) * scale;
    const y = offsetY + radius * Math.sin(radRA) * scale;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath()
  }

  ctx.restore();
}

// Convert RA/Dec to cartesian projection
function projectCelestial(ra, dec) {
    const radius = Math.min(canvas.width, canvas.height) / 2;
    const radRA = (ra / 360) * 2 * Math.PI; // Convert RA to radians
    const radDec = (dec / 360) * 2 * Math.PI; // Convert Dec to radians
    
    let x = radius * Math.cos(radDec) * Math.sin(radRA) + offsetX;
    let y = -radius * Math.cos(radDec) * Math.cos(radRA) + offsetY;

    // Apply rotation transformation around the celestial pole (center of canvas)
    const cosTheta = Math.cos(rotationAngle);
    const sinTheta = Math.sin(rotationAngle);
    const dx = (x - offsetX) / scale; // Remove scaling before rotation
    const dy = (y - offsetY) / scale;
    x = offsetX + (dx * cosTheta - dy * sinTheta) * scale;
    y = offsetY + (dx * sinTheta + dy * cosTheta) * scale;

    // Apply scaling transformation based on the zoom level
    x = offsetX + (x - offsetX) * scale;
    y = offsetY + (y - offsetY) * scale;
    
    return { x, y };
}

// Draw stars
function drawStars() {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1;

  for(const name in constellations){
      const constellation = constellations[name]
      const stars = constellation["stars"]

      for (const star in stars){
        const { x, y } = projectCelestial(stars[star].ra, stars[star].dec);

        // Adjust star size based on magnitude
        const size = Math.max(1, 5 - stars[star].magnitude);

        ctx.beginPath();
        ctx.arc(x, y, size * scale, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();


      }

      constellation["lines"].forEach(([start, end]) => {
        const { x: x1, y: y1 } = projectCelestial(stars[start].ra, stars[start].dec);
        const { x: x2, y: y2 } = projectCelestial(stars[end].ra, stars[end].dec);
    
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
  }
  ctx.restore();
}

// Main draw function
function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCelestialGrid();
  drawStars();
}


// Display star details in the box
function displayStarDetails(name, star) {
  document.getElementById("starName").textContent = name;
  document.getElementById("starPhoto").src = `../images/team_member_photos/${star.photo}`;
  document.getElementById("starRA").textContent = `${star.ra}h`;
  document.getElementById("starDec").textContent = `${star.dec}°`;
  document.getElementById("starMagnitude").textContent = star.magnitude;

  starDetailsBox.style.display = "block";  // Show the box
}


// Event listener for clicking on a star
canvas.addEventListener("click", (e) => {
  const { mouseX, mouseY } = getCanvasMousePosition(e.clientX, e.clientY)

  for(const name in constellations){
    const constellation = constellations[name]
    const stars = constellation["stars"]

    for (const starName in stars){
        const star = stars[starName];

        // Loop through stars to check if the click is near any star
        const { x, y } = projectCelestial(star.ra, star.dec);
        const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
        
        // Star clicked, display the details
        if (distance <= 10 && star.clickable) {
            displayStarDetails(starName, star);
            return
        }
        else{
            starDetailsBox.style.display = "none";
        }
    }
  }
});

// Event listener - Changing to pointer on a star hover
canvas.addEventListener("mousemove", (e) => {
    const { mouseX, mouseY } = getCanvasMousePosition(e.clientX, e.clientY)
    let currentHover = null;

    // Check all stars
    for (const constellationName in constellations) {
        const constellation = constellations[constellationName];
        const stars = constellation.stars;

        for (const starName in stars) {
            const star = stars[starName];
            const { x, y } = projectCelestial(star.ra, star.dec);
            const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));

            if (distance <= 10 && star.clickable) { // Match click hit radius
                currentHover = starName;
                break;
            }
        }
        if (currentHover) break;
    }

    // Update cursor only when state changes
    if (currentHover !== hoveredStar) {
        canvas.style.cursor = currentHover ? "pointer" : "grab";
        hoveredStar = currentHover;
    }
});

// Mouse wheel for zooming
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomSpeed = 0.001;
  scale *= 1 - e.deltaY * zoomSpeed; // Adjust zoom sensitivity
  drawScene();
});


// Panning and Rotation of Celestial grid
let isDragging = false;
let isRotating = false;
let dragStartX, dragStartY;
let lastRotationX, lastRotationY;

canvas.addEventListener("mousedown", (e) => {
  if (e.shiftKey) { // Panning mode
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  } else { // Rotation mode
    isRotating = true;
    lastRotationX = e.clientX;
    lastRotationY = e.clientY;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) { // Panning logic
    offsetX += e.clientX - dragStartX;
    offsetY += e.clientY - dragStartY;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    drawScene();
  } 
  else if (isRotating) {
    const deltaX = e.clientX - lastRotationX;
    const deltaY = e.clientY - lastRotationY;
    
    // Horizontal rotation (RA)
    rotationAngle += deltaX * 0.005;
    
    lastRotationX = e.clientX;
    lastRotationY = e.clientY;
    drawScene();
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
  isRotating = false;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
  isRotating = false;
});
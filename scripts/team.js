const canvas = document.getElementById("starMap");
const starDetailsBox = document.getElementById("starDetailsBox");
const ctx = canvas.getContext("2d");
let constellations;

// Canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

fetch('../data/constellation.json')
.then(response => {
  return response.json();
})
.then(data => {
  constellations = data
  drawScene(data);
})

// Handle resizing
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawScene();
});

// Zoom, pan, and rotation variables
let scale = 1;
let offsetX = canvas.width / 2;
let offsetY = canvas.height / 2;
let isDragging = false;
let dragStartX, dragStartY;
let rotationAngle = 0; // Rotation angle in radians


// Convert RA/Dec to polar projection
function projectCelestial(ra, dec) {
  const radius = Math.min(canvas.width, canvas.height) / 2;
  const radRA = (ra / 360) * 2 * Math.PI; // Convert RA to radians
  const radDec = (dec / 360) * 2 * Math.PI; // Convert Dec to radians
  // let x = radius * Math.cos(radDec) * Math.sin(radRA) + offsetX;
  // let y = radius * Math.sin(radDec) + offsetY;
  let x = radius * Math.cos(radDec) * Math.sin(radRA) + offsetX;
  let y = -radius * Math.cos(radDec) * Math.cos(radRA) + offsetY;

  // Apply rotation transformation around the celestial pole (center of canvas)
  const cosTheta = Math.cos(rotationAngle);
  const sinTheta = Math.sin(rotationAngle);
  const dx = x - offsetX;
  const dy = y - offsetY;
  x = offsetX + dx * cosTheta - dy * sinTheta;
  y = offsetY + dx * sinTheta + dy * cosTheta;

  // Apply scaling transformation based on the zoom level
  x = offsetX + (x - offsetX) * scale;
  y = offsetY + (y - offsetY) * scale;
  
  return { x, y };
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



// Mouse interactions for panning
canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    offsetX += e.clientX - dragStartX;
    offsetY += e.clientY - dragStartY;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    drawScene();
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
});

// Mouse wheel for zooming
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomSpeed = 0.001;
  scale *= 1 - e.deltaY * zoomSpeed; // Adjust zoom sensitivity
  drawScene();
});

// Mouse drag for rotation (around celestial pole)
let lastMouseX = 0;
canvas.addEventListener("mousedown", (e) => {
  lastMouseX = e.clientX;
});

canvas.addEventListener("mousemove", (e) => {
  if (e.buttons === 1) { // Check if left mouse button is pressed
    const deltaX = e.clientX - lastMouseX;
    rotationAngle += deltaX * 0.01; // Adjust rotation sensitivity
    lastMouseX = e.clientX;
    drawScene();
  }
});

// // Mouse interactions for clicking on stars
// canvas.addEventListener("click", (e) => {
//   const mouseX = e.clientX;
//   const mouseY = e.clientY;

//   // Loop through stars to check if the click is near any star
//   stars.every((star) => {
//     const { x, y } = projectCelestial(star.ra, star.dec);
//     const size = Math.max(1, 5 - star.magnitude);

//     const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));

//     if (distance <= 10 * size) {
//       // Star clicked, display the details
//       displayStarDetails(star);
//       return false;
//     }

//     else{
//       starDetailsBox.style.display = "none";
//     }
//   });
// });

// Display star details in the box
function displayStarDetails(star) {
  document.getElementById("starName").textContent = star.name;
  document.getElementById("starRA").textContent = `${star.ra}h`;
  document.getElementById("starDec").textContent = `${star.dec}°`;
  document.getElementById("starMagnitude").textContent = star.magnitude;

  starDetailsBox.style.display = "block";  // Show the box
}

// Mouse interactions for hovering over stars
// canvas.addEventListener("mousemove", (e) => {
//   const mouseX = e.clientX;
//   const mouseY = e.clientY;
//   let cursorChanged = false;

//   // Loop through stars to check if the mouse is hovering over any star
//   stars.forEach((star) => {
//     const { x, y } = projectCelestial(star.ra, star.dec);
//     const size = Math.max(1, 5 - star.magnitude);

//     const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));

//     if (distance <= 10 * size) {
//       // Mouse is hovering over this star, change cursor to pointer
//       canvas.style.cursor = "pointer";
//       cursorChanged = true;
//     }
//   });

//   if (!cursorChanged) {
//     // Mouse is not hovering over any star, set default cursor
//     canvas.style.cursor = "grab";
//   }
// });
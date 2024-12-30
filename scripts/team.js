const canvas = document.getElementById("starMap");
const starDetailsBox = document.getElementById("starDetailsBox");
const ctx = canvas.getContext("2d");
let constellations = {
  "Andromeda": {
    "stars": {
      "Alpheratz": { "ra": 2.098, "dec": 29.09, "magnitude": 2.07 },
      "Mirach": { "ra": 17.43, "dec": 35.62, "magnitude": 2.06 },
      "Almach": { "ra": 30.97, "dec": 42.33, "magnitude": 2.1 }
    },
    "lines": [
      ["Alpheratz", "Mirach"],
      ["Mirach", "Almach"]
    ]
  },
  "Orion": {
    "stars": {
      "Betelgeuse": { "ra": 88.79, "dec": 7.41, "magnitude": 0.42 },
      "Bellatrix": { "ra": 81.28, "dec": 6.35, "magnitude": 1.64 },
      "Rigel": { "ra": 78.63, "dec": -8.2, "magnitude": 0.13 },
      "Saiph": { "ra": 83.00, "dec": -9.67, "magnitude": 2.07 },
      "Alnitak": { "ra": 85.19, "dec": -1.94, "magnitude": 1.72 },
      "Alnilam": { "ra": 84.05, "dec": -1.20, "magnitude": 1.69 },
      "Mintaka": { "ra": 83.00, "dec": 0.30, "magnitude": 2.23 }
    },
    "lines": [
      ["Betelgeuse", "Bellatrix"],
      ["Bellatrix", "Mintaka"],
      ["Mintaka", "Alnilam"],
      ["Alnilam", "Alnitak"],
      ["Alnitak", "Rigel"],
      ["Rigel", "Saiph"],
      ["Saiph", "Betelgeuse"]
    ]
  },
  "Gemini": {
    "stars": {
      "Castor": { "ra": 113.65, "dec": 31.89, "magnitude": 1.58 },
      "Pollux": { "ra": 116.33, "dec": 28.02, "magnitude": 1.15 },
      "Alhena": { "ra": 99.43, "dec": 16.40, "magnitude": 1.93 }
    },
    "lines": [
      ["Castor", "Pollux"],
      ["Pollux", "Alhena"]
    ]
  },
  "Taurus": {
    "stars": {
      "Aldebaran": { "ra": 68.98, "dec": 16.51, "magnitude": 0.85 },
      "Elnath": { "ra": 81.57, "dec": 28.61, "magnitude": 1.65 }
    },
    "lines": [
      ["Aldebaran", "Elnath"]
    ]
  },
  "Ursa Major": {
    "stars": {
      "Dubhe": { "ra": 165.46, "dec": 61.75, "magnitude": 1.79 },
      "Merak": { "ra": 165.93, "dec": 56.38, "magnitude": 2.37 },
      "Phecda": { "ra": 177.26, "dec": 53.69, "magnitude": 2.43 },
      "Megrez": { "ra": 183.86, "dec": 57.03, "magnitude": 3.32 },
      "Alioth": { "ra": 193.51, "dec": 55.96, "magnitude": 1.76 },
      "Mizar": { "ra": 200.98, "dec": 54.92, "magnitude": 2.23 },
      "Alkaid": { "ra": 206.89, "dec": 49.31, "magnitude": 1.86 }
    },
    "lines": [
      ["Dubhe", "Merak"],
      ["Merak", "Phecda"],
      ["Phecda", "Megrez"],
      ["Megrez", "Alioth"],
      ["Alioth", "Mizar"],
      ["Mizar", "Alkaid"]
    ]
  },
  "Cygnus": {
    "stars": {
      "Deneb": { "ra": 310.36, "dec": 45.28, "magnitude": 1.25 },
      "Sadr": { "ra": 305.25, "dec": 40.73, "magnitude": 2.23 },
      "Albireo": { "ra": 292.68, "dec": 27.96, "magnitude": 3.05 }
    },
    "lines": [
      ["Deneb", "Sadr"],
      ["Sadr", "Albireo"]
    ]
  },
  "Cassiopeia": {
    "stars": {
      "Schedar": { "ra": 10.12, "dec": 56.54, "magnitude": 2.24 },
      "Caph": { "ra": 0.151, "dec": 59.15, "magnitude": 2.28 },
      "Gamma Cassiopeiae": { "ra": 6.07, "dec": 60.72, "magnitude": 2.47 },
      "Ruchbah": { "ra": 12.19, "dec": 64.33, "magnitude": 2.68 },
      "Segin": { "ra": 358.84, "dec": 63.67, "magnitude": 3.35 }
    },
    "lines": [
      ["Schedar", "Caph"],
      ["Caph", "Gamma Cassiopeiae"],
      ["Gamma Cassiopeiae", "Ruchbah"],
      ["Ruchbah", "Segin"],
      ["Segin", "Schedar"]
    ]
  },
  "Auriga": {
  "stars": {
    "Capella": { "ra": 79.17, "dec": 45.99, "magnitude": 0.08 },
    "Menkalinan": { "ra": 81.57, "dec": 44.95, "magnitude": 1.9 },
    "El Nath": { "ra": 81.12, "dec": 28.61, "magnitude": 1.65 }
  },
  "lines": [
    ["Capella", "Menkalinan"],
    ["Menkalinan", "El Nath"]
  ]
},
"Boötes": {
  "stars": {
    "Arcturus": { "ra": 213.91, "dec": 19.18, "magnitude": -0.05 },
    "Izar": { "ra": 221.25, "dec": 27.07, "magnitude": 2.35 },
    "Seginus": { "ra": 207.37, "dec": 33.96, "magnitude": 3.04 }
  },
  "lines": [
    ["Arcturus", "Izar"],
    ["Izar", "Seginus"]
  ]
},
"Hydra": {
  "stars": {
    "Alphard": { "ra": 141.89, "dec": -8.65, "magnitude": 1.98 },
    "Gamma Hydrae": { "ra": 131.17, "dec": -23.3, "magnitude": 3.0 },
    "Zeta Hydrae": { "ra": 140.52, "dec": -23.11, "magnitude": 3.1 },
    "Epsilon Hydrae": { "ra": 132.55, "dec": 6.42, "magnitude": 3.38 },
    "Delta Hydrae": { "ra": 126.15, "dec": 5.83, "magnitude": 4.14 },
    "Eta Hydrae": { "ra": 151.91, "dec": -2.31, "magnitude": 3.9 }
  },
  "lines": [
    ["Alphard", "Gamma Hydrae"],
    ["Gamma Hydrae", "Zeta Hydrae"],
    ["Zeta Hydrae", "Epsilon Hydrae"],
    ["Epsilon Hydrae", "Delta Hydrae"],
    ["Delta Hydrae", "Eta Hydrae"]
  ]
}
}

// fetch('../data/constellation.json')
// .then(response => {
//   constellations = response.json();
// })
// .then(() => {
//   drawScene();
// })

// Canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

drawScene();
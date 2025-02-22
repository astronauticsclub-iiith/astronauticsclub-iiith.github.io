const canvas = document.getElementById("starMap");
const starDetailsBox = document.getElementById("starDetailsBox");
const ctx = canvas.getContext("2d");
let constellations = {
  "Andromeda": {
  "stars": {
    "Alpheratz": { "ra": 342.098, "dec": 76.09, "magnitude": 2.07 },
    "Mirach": { "ra": 17.43, "dec": 80.62, "magnitude": 2.06 },
    "Almach": { "ra": 35.97, "dec": 82.33, "magnitude": 2.1 }
  },
  "lines": [
    ["Alpheratz", "Mirach"],
    ["Mirach", "Almach"]
  ],
  "team": "Coordinating Team"
},


  "Orion": { // Done - Projects
    "stars": {
      "Betelgeuse": { "ra": 88.79, "dec": 67.41, "magnitude": 0.42 },
      "Bellatrix": { "ra": 81.28, "dec": 66.35, "magnitude": 1.64 },
      "Rigel": { "ra": 78.63, "dec": 52.80, "magnitude": 0.13 },
      "Saiph": { "ra": 83.00, "dec": 51.33, "magnitude": 2.07 },
      "Alnitak": { "ra": 85.19, "dec": 58.06, "magnitude": 1.72 },
      "Alnilam": { "ra": 84.05, "dec": 58.80, "magnitude": 1.69 },
      "Mintaka": { "ra": 83.00, "dec": 60.30, "magnitude": 2.23 },
      "Meissa": { "ra": 87.00, "dec": 69.93, "magnitude": 3.39 },
      "Hatsya": { "ra": 97.06, "dec": 71.60, "magnitude": 2.77 },
      "Tabit": { "ra": 94.63, "dec": 76.42, "magnitude": 3.59 },
      "Pi0": { "ra": 74.91, "dec": 70.38, "magnitude": 4.16 },
      "Pi3": { "ra": 72.61, "dec": 66.38, "magnitude": 3.16 },
      "Pi5": { "ra": 74.91, "dec": 63.38, "magnitude": 3.89 }
    },
    "lines": [
      // Main body
      ["Betelgeuse", "Meissa"],
      ["Meissa", "Bellatrix"],
      ["Bellatrix", "Mintaka"],
      ["Mintaka", "Rigel"],
      ["Alnitak", "Saiph"],
      ["Alnitak", "Betelgeuse"],

      // Orion Belt
      ["Alnitak", "Alnilam"],
      ["Alnilam", "Mintaka"],

      // Arms
      ["Betelgeuse", "Hatsya"],
      ["Hatsya", "Tabit"],

      // Bow
      ["Pi0", "Pi3"],
      ["Bellatrix", "Pi3"],
      ["Pi3", "Pi5"]
    ],
    "team": "Events"
  },

  "Pegasus": { // Done - Content Writing and Social Media
    "stars": {
      "Enif": { "ra": 276.046, "dec": 42.875, "magnitude": 2.4 },
      "Scheat": { "ra": 295.943, "dec": 48.083, "magnitude": 2.42 },
      "Markab": { "ra": 296.412, "dec": 35.205, "magnitude": 2.49 },
      "Algenib": { "ra": 310.570, "dec": 35.183, "magnitude": 2.84 },
      "Alpheratz": { "ra": 310.083, "dec": 49.091, "magnitude": 2.07 },
      "Homam": { "ra": 290.365, "dec": 30.831, "magnitude": 3.41 },
      "Matar": { "ra": 286.734, "dec": 50.221, "magnitude": 2.95 },
      "Bahham": { "ra": 291.899, "dec": 49.308, "magnitude": 3.53 },
      "Sadalbari": { "ra": 292.489, "dec": 44.602, "magnitude": 3.51 },
      "Biham": { "ra": 287.840, "dec": 36.19, "magnitude": 3.74 }
    },
    "lines": [
      // Great Square of Pegasus
      ["Alpheratz", "Scheat"],
      ["Markab", "Scheat"],
      ["Algenib", "Markab"],
      ["Algenib", "Alpheratz"],

      ["Biham", "Homam"],
      ["Markab", "Homam"],

      ["Scheat", "Bahham"],
      ["Scheat", "Matar"],
      ["Scheat", "Sadalbari"],
      ["Enif", "Matar"],
    ],
    "team": "Content Writing and Social Media"
  },


  "Gemini": {
    "stars": {
      "Castor": { "ra": 253.65, "dec": 71.89, "magnitude": 1.58 },
      "Pollux": { "ra": 263.33, "dec": 70.02, "magnitude": 1.15 },
      "Alhena": { "ra": 244.43, "dec": 58.40, "magnitude": 1.93 },
      "Wasat": { "ra": 254.11, "dec": 63.98, "magnitude": 3.53 },
      "Mekbuda": { "ra": 248.56, "dec": 61.76, "magnitude": 4.02 },
      "Mebsuta": { "ra": 243.41, "dec": 65.13, "magnitude": 3.02 },
      "Tejat": { "ra": 238.76, "dec": 62.51, "magnitude": 2.87 },
      "Propus": { "ra": 233.71, "dec": 62.01, "magnitude": 3.28 },
      "Alzirr": { "ra": 250.79, "dec": 57.05, "magnitude": 4.64 },
      "Nu Geminorum": { "ra": 241.79, "dec": 61.24, "magnitude": 3.63 },
      "Tau Geminorum": { "ra": 252.21, "dec": 70.33, "magnitude": 3.36 },
      "Theta Geminorum": { "ra": 245.27, "dec": 72.12, "magnitude": 3.06 },
      "L Geminorum": { "ra": 257.56, "dec": 68.86, "magnitude": 4.04 },
      "U Geminorum": { "ra": 260.78, "dec": 68.42, "magnitude": 4.75 },
      "Kappa Geminorum": { "ra": 265.78, "dec": 66.42, "magnitude": 4.14 },
      "Lambda Geminorum": { "ra": 255.78, "dec": 60.72, "magnitude": 3.91 }
    },
    "lines": [
      ["Pollux", "U Geminorum"],
      ["U Geminorum", "L Geminorum"],
      ["Kappa Geminorum", "U Geminorum"],
      ["L Geminorum", "Tau Geminorum"],
      ["Castor", "Tau Geminorum"],
      ["Theta Geminorum", "Tau Geminorum"],
      
      ["Wasat", "U Geminorum"],
      ["Wasat", "Mekbuda"],
      ["Mekbuda", "Alhena"],
      ["Wasat", "Lambda Geminorum"],
      ["Lambda Geminorum", "Alzirr"],

      ["Tau Geminorum", "Mebsuta"],
      ["Mebsuta", "Nu Geminorum"],
      ["Mebsuta", "Tejat"],
      ["Tejat", "Propus"],
    ],
    "team": "Outreach Team"
},


  "Ursa Major": { // Done - Events
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
      ["Alkaid", "Mizar"],
      ["Mizar", "Alioth"],
      ["Alioth", "Megrez"],
      ["Megrez", "Phecda"],
      ["Phecda", "Merak"],
      ["Merak", "Dubhe"],
      ["Megrez", "Dubhe"],
    ],
    "team": "Events Team"
  },


  "Cassiopeia": {
      "stars": {
        "Schedar": { "ra": 11.123, "dec": 56.537, "magnitude": 2.24 },
        "Caph": { "ra": 15.293, "dec": 60.149, "magnitude": 2.28 },
        "Tsih": { "ra": 6.628, "dec": 62.716, "magnitude": 2.15 },
        "Ruchbah": { "ra": 6.166, "dec": 66.327, "magnitude": 2.68 },
        "Segin": { "ra": 354.836, "dec": 68.670, "magnitude": 3.35 }
      },
      "lines": [
        ["Schedar", "Caph"],
        ["Caph", "Tsih"],
        ["Tsih", "Ruchbah"],
        ["Ruchbah", "Segin"]
      ],
      "team": "Astrophotography"
    },

  // "Auriga": {
  //   "stars": {
  //     "Capella": { "ra": 109.17, "dec": 45.99, "magnitude": 0.08 },
  //     "Menkalinan": { "ra": 111.57, "dec": 44.95, "magnitude": 1.90 },
  //     "Mahasim": { "ra": 105.50, "dec": 40.00, "magnitude": 3.18 },
  //     "Haedus I": { "ra": 108.63, "dec": 41.23, "magnitude": 3.72 },
  //     "Haedus II": { "ra": 109.02, "dec": 37.18, "magnitude": 3.95 },
  //     "Almaaz": { "ra": 107.71, "dec": 43.82, "magnitude": 2.99 },
  //     "Elnath": { "ra": 111.57, "dec": 28.61, "magnitude": 1.65 },
  //     "Hassaleh": { "ra": 104.25, "dec": 33.17, "magnitude": 2.69 },
  //     "Theta Aurigae": { "ra": 116.94, "dec": 37.14, "magnitude": 2.62 }
  //   },
  //   "lines": [
  //     ["Capella", "Menkalinan"],
  //     ["Capella", "Almaaz"],
  //     ["Almaaz", "Haedus II"],
  //     ["Haedus II", "Haedus I"],
  //     ["Menkalinan", "Theta Aurigae"],
  //     ["Elnath", "Theta Aurigae"],
  //     ["Elnath", "Hassaleh"],
  //     ["Haedus I", "Hassaleh"]
  //   ],
  //   "team": "Design"
  // },

  "Hydra": {
    "stars": {
      "Alphard": { "ra": 37.16, "dec": 21.66, "magnitude": 1.98 },      // Reference star
      "Beta Hydrae": { "ra": 35.88, "dec": 26.50, "magnitude": 4.28 },   // Near head
      "Nu Hydrae": { "ra": 33.06, "dec": 23.93, "magnitude": 4.12 },     // Head
      "Omicron Hydrae": { "ra": 31.43, "dec": 27.59, "magnitude": 4.89 },
      "Delta Hydrae": { "ra": 28.09, "dec": 22.43, "magnitude": 3.54 },  // Mid-body
      "Pi Hydrae": { "ra": 24.80, "dec": 24.80, "magnitude": 3.89 },     // Mid-body
      "Eta Hydrae": { "ra": 23.58, "dec": 26.63, "magnitude": 4.26 },
      "Gamma Hydrae": { "ra": 18.94, "dec": 32.82, "magnitude": 2.88 },  // Bright mid-section
      "Zeta Hydrae": { "ra": 12.52, "dec": 28.98, "magnitude": 3.54 },
      "Epsilon Hydrae": { "ra": 8.25, "dec": 32.30, "magnitude": 3.95 }, // Mid-tail
      "Iota Hydrae": { "ra": 4.63, "dec": 36.66, "magnitude": 4.44 },    // Tail region
      "Kappa Hydrae": { "ra": 359.68, "dec": 30.30, "magnitude": 4.47 },
      "Lambda Hydrae": { "ra": 355.60, "dec": 29.73, "magnitude": 4.57 },
      "Mu Hydrae": { "ra": 351.78, "dec": 36.43, "magnitude": 4.77 },
      "Sigma Hydrae": { "ra": 344.55, "dec": 42.50, "magnitude": 4.51 }, // End of tail
      "Theta Hydrae": { "ra": 354.40, "dec": 33.10, "magnitude": 4.10 }  // Tail
    },
    "lines": [
      // Main body (head to tail)
      ["Alphard", "Nu Hydrae"],
      ["Alphard", "Beta Hydrae"],
      ["Omicron Hydrae", "Beta Hydrae"],
      ["Nu Hydrae", "Omicron Hydrae"],
      ["Omicron Hydrae", "Delta Hydrae"],
      ["Pi Hydrae", "Eta Hydrae"],
      ["Eta Hydrae", "Gamma Hydrae"],
      ["Gamma Hydrae", "Zeta Hydrae"],
      ["Zeta Hydrae", "Epsilon Hydrae"],
      ["Epsilon Hydrae", "Iota Hydrae"],
      ["Iota Hydrae", "Kappa Hydrae"],
      ["Kappa Hydrae", "Lambda Hydrae"],
      ["Lambda Hydrae", "Theta Hydrae"],
      ["Theta Hydrae", "Mu Hydrae"],
      ["Mu Hydrae", "Sigma Hydrae"],
      ["Delta Hydrae", "Pi Hydrae"],
    ],
    "team": "Astrophotography"
  },

  // "Draco": {
  //   "stars": {
  //     "Eltanin": { "ra": 21.85, "dec": 35.38, "magnitude": 2.24 },
  //     "Rastaban": { "ra": 26.85, "dec": 37.38, "magnitude": 2.79 },
  //     "Grumium": { "ra": 22.85, "dec": 30.38, "magnitude": 3.73 },
  //     "Thuban": { "ra": 20.85, "dec": 34.38, "magnitude": 3.67 },
  //     "Altais": { "ra": 26.85, "dec": 36.38, "magnitude": 3.07 },
  //     "Aldhibah": { "ra": 28.85, "dec": 42.38, "magnitude": 3.17 },
  //     "Edasich": { "ra": 29.85, "dec": 43.38, "magnitude": 3.29 },
  //     "Kuma": { "ra": 33.85, "dec": 46.38, "magnitude": 3.82 },
  //     "Shaula": { "ra": 36.85, "dec": 48.38, "magnitude": 3.82 },
  //     "Giausar": { "ra": 39.85, "dec": 49.38, "magnitude": 3.84 }
  //   },
  //   "lines": [
  //     // Main body of Draco

  //     // Head of Draco
  //     ["Eltanin", "Rastaban"],
  //     ["Eltanin", "Grumium"],

  //     // Tail of Draco
  //   ],
  //   "team": "Outreach Team"
  // }
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
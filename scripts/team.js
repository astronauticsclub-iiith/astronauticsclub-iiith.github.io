const canvas = document.getElementById("starMap");
const ctx = canvas.getContext("2d");

// Canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Handle resizing
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawScene();
});

// Zoom and pan variables
let scale = 1;
let offsetX = canvas.width / 2;
let offsetY = canvas.height / 2;
let isDragging = false;
let dragStartX, dragStartY;

// Star and constellation data (sample dataset)
const stars = [
  { ra: 0, dec: 0, magnitude: 2.5 },  // Example Star: Sun
  { ra: 10, dec: -8, magnitude: 1.46 }, // Star: Aldebaran
  { ra: 20, dec: 15, magnitude: 0.45 }, // Star: Betelgeuse
  { ra: 30, dec: -10, magnitude: 2.1 }, // Star: Sirius
  { ra: 50, dec: -60, magnitude: 1.98 }, // Star: Canopus
  { ra: 100, dec: -10, magnitude: 1.94 }, // Star: Antares
  { ra: 150, dec: 30, magnitude: 1.67 }, // Star: Vega
  { ra: 180, dec: 0, magnitude: 2.2 }, // Star: Spica
  { ra: 230, dec: -40, magnitude: 1.5 }, // Star: Arcturus
  { ra: 270, dec: 15, magnitude: 1.25 }, // Star: Altair
  { ra: 330, dec: -60, magnitude: 0.82 }, // Star: Fomalhaut
  { ra: 10.5, dec: -60, magnitude: 0.98 }, // Star: Rigel
  { ra: 35, dec: 60, magnitude: 1.23 }, // Star: Pollux
  { ra: 70, dec: 30, magnitude: 2.87 }, // Star: Castor
  { ra: 85, dec: 15, magnitude: 1.62 }, // Star: Procyon
  { ra: 100, dec: -20, magnitude: 1.46 }, // Star: Alpha Centauri
  { ra: 120, dec: 5, magnitude: 2.61 }, // Star: Deneb
  { ra: 180, dec: 40, magnitude: 1.21 }, // Star: Altair
  { ra: 195, dec: -10, magnitude: 2.05 }, // Star: Zeta Tauri
  { ra: 210, dec: -5, magnitude: 2.11 }, // Star: Antares
  { ra: 220, dec: 50, magnitude: 1.34 }, // Star: Aldebaran
];

const constellations = [
  [0, 1], // Connect star 0 to star 1
  [1, 2],
  [2, 3],
  [3, 4],
];

// Convert RA/Dec to polar projection
function projectCelestial(ra, dec) {
  const radius = Math.min(canvas.width, canvas.height) / 2;
  const radRA = (ra / 360) * 2 * Math.PI; // Convert RA to radians
  const radDec = (dec / 180) * Math.PI; // Convert Dec to radians
  const x = radius * Math.cos(radDec) * Math.sin(radRA) + offsetX;
  const y = radius * Math.sin(radDec) + offsetY;
  return { x, y };
}

// Draw celestial grid
function drawCelestialGrid() {
  const radius = Math.min(canvas.width, canvas.height) / 2;
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1;

  // Draw concentric circles (declination lines)
  for (let dec = -90; dec <= 90; dec += 30) {
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
  stars.forEach((star) => {
    const { x, y } = projectCelestial(star.ra, star.dec);

    // Adjust star size based on magnitude
    const size = Math.max(1, 5 - star.magnitude);

    ctx.beginPath();
    ctx.arc(x, y, size * scale, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
  });
}

// Draw constellations
function drawConstellations() {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1;

  constellations.forEach(([start, end]) => {
    const { x: x1, y: y1 } = projectCelestial(stars[start].ra, stars[start].dec);
    const { x: x2, y: y2 } = projectCelestial(stars[end].ra, stars[end].dec);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  ctx.restore();
}

// Main draw function
function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCelestialGrid();
  drawStars();
  drawConstellations();
}

// Mouse interactions for panning
canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  dragStartX = e.clientX - offsetX;
  dragStartY = e.clientY - offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    offsetX = e.clientX - dragStartX;
    offsetY = e.clientY - dragStartY;
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
  scale *= 1 - e.deltaY * zoomSpeed;
  drawScene();
});

// Initial draw
drawScene();
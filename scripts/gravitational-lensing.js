// Refresh the page in case of zoom due to canvas.
let canvas, w, h;

// Select the text container
const textContainer = document.getElementById("aboutUs");

// Split text into individual letters wrapped in spans
const text = textContainer.innerHTML;
const heading = textContainer.children[0].textContent

let contents =  [];
for(let i = 1; i < textContainer.children.length; i++) {
    contents.push(textContainer.children[i].textContent);
}
textContainer.innerHTML = ""; // Clear existing text

function writeText(){
    heading.split(" ").forEach(word => {
        const wordWrapper = document.createElement("span");
        wordWrapper.classList.add("about-us-heading")
        wordWrapper.style.whiteSpace = "nowrap"; // Prevent word breaking
        wordWrapper.style.display = "inline-block"; // Ensure words are grouped inline

        word.split("").forEach(char => {
            const span = document.createElement("span");
            span.textContent = char;
            wordWrapper.appendChild(span);
        });

        textContainer.appendChild(wordWrapper);
        textContainer.appendChild(document.createTextNode("\u00A0")); // Add a space after the word
    });

    let br = document.createElement("br");
    textContainer.appendChild(br);

    contents.forEach(content => {
        content = content.replace(/[\r\n]+/gm, " ");
        content = content.replace(/\s{2,}/g, ' ').trim();

        content.split(" ").forEach(word => {
            const wordWrapper = document.createElement("span");
            wordWrapper.classList.add("about-us-content")
            wordWrapper.style.whiteSpace = "nowrap"; // Prevent word breaking
            wordWrapper.style.display = "inline-block"; // Ensure words are grouped inline

            word.split("").forEach(char => {
                const span = document.createElement("span");
                span.textContent = char;
                wordWrapper.appendChild(span);
            });

            textContainer.appendChild(wordWrapper);
            textContainer.appendChild(document.createTextNode("\u00A0")); // Add a space after the word
        });

        br = document.createElement("p");
        textContainer.appendChild(br);
    });

    const spans = document.querySelectorAll("#aboutUs span");
    const letterRadius = 70;

    // Listen for mouse movement
    textContainer.addEventListener("mousemove", (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    spans.forEach(span => {
        const rect = span.getBoundingClientRect(); // Get the position of each letter
        const letterX = rect.left + rect.width / 2; // Center X of the letter
        const letterY = rect.top + rect.height / 2; // Center Y of the letter

        const dx = letterX - mouseX;
        const dy = letterY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < letterRadius) {
            // Apply lensing transformation
            const d = distance / letterRadius; // Normalize distance
            const scale = 0.2 * (1 - smootherstep(1 - d)); // Compute scaling factor
            const offsetX = dx * scale * 0.1; // Displace X based on distance
            const offsetY = dy * scale * 0.1; // Displace Y based on distance

            span.style.transform = `scale(${1 + scale}) translate(${offsetX}px, ${offsetY}px)`;
        } else {
            // Reset transformations for letters outside the lens radius
            span.style.transform = "none";
        }

        // Old code
        // const rect = span.getBoundingClientRect();
        // const letterX = rect.left + rect.width / 2; // Center X of the letter
        // const letterY = rect.top + rect.height / 2; // Center Y of the letter

        // // Calculate distance between the mouse and the letter
        // const dx = mouseX - letterX;
        // const dy = mouseY - letterY;
        // const distance = Math.sqrt(dx * dx + dy * dy);
        // const lensRadius = 70;

        // if (distance < lensRadius) {
        //     // Non-linear scaling and translation for lensing effect
        //     const distortionFactor = 1 - distance / lensRadius; // Proximity effect
        //     const scale = 1 + distortionFactor * 0.6; // Scale letters closer to the lens
        //     const translateX = dx * distortionFactor * 0.3; // Displacement X
        //     const translateY = dy * distortionFactor * 0.3; // Displacement Y

        //     // Apply CSS transform for position and scale
        //     span.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
        //     span.classList.add("lensing"); // Add SVG filter for subtle warping
        // } else {
        //     // Reset transform and remove filter when outside the radius
        //     span.style.transform = "none";
        //     span.classList.remove("lensing");
        // }
    });

    let mousePos = getMousePos(canvas, e);
        updatecanvas(canvas, mousePos.x, mousePos.y);
    });


    textContainer.addEventListener("mouseleave", () => {
        spans.forEach(span => {
            span.style.transform = "none";
            span.classList.remove("lensing");
        });
    })
}



/////////////////////// Gravitational Lensing Effect for Image ///////////////////////
let oldx = 0;
let oldy = 0;

let imageDataDst, imageDataSrc;

let img = new Image();
img.src = "../images/gravitational_lensing.png";

// Radius for the gravitational lens effect
const radius = 100;

// A helper function to smoothly interpolate values over time.
let lerp = function(a, b, t) {
    return (b - a) * (1-Math.exp(-t)) + a;
}

let smootherstep = function(t) {
    return 1 / (Math.exp(-6 * t + 3)) - Math.exp(-3);
};

// Function to get the mouse position on the canvas
function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        // x: evt.clientX - rect.left,
        // y: evt.clientY - rect.top
        x: evt.clientX,
        y: evt.clientY
    };
}

function initCanvas() {
    w = window.innerWidth;
    h = window.innerHeight;
    
    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
}

function resizeCanvas() {
    w = window.innerWidth;
    h = textContainer.offsetHeight;
    
    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
}

window.addEventListener("resize", resizeCanvas);

window.onload = function() {
    canvas = document.querySelector("canvas");
    initCanvas();
    writeText();
    resizeCanvas();

    imageDataSrc = ctx.getImageData(0, 0, w, h);
    imageDataDst = ctx.getImageData(0, 0, w, h);

    px = 0;
    py = 310;
    ti = 0;
    
    let timer = setInterval(function() {
        if (ti++ > 100)
            clearInterval(timer);
        updatecanvas(canvas, lerp(0,850 , ti / 20), py);
    }, 16);

    canvas.addEventListener('mousemove', function(evt) {
        let mousePos = getMousePos(canvas, evt);
        updatecanvas(canvas, mousePos.x, mousePos.y);
    }, false);
};



function updatecanvas(canvas, px, py) {
    let ctx = canvas.getContext('2d');

    xmin = oldx - radius;
    xmax = oldx + radius;
    ymin = oldy - radius;
    ymax = oldy + radius;

    xmin = Math.max(0, xmin);
    xmax = Math.min(w, xmax);
    ymin = Math.max(0, ymin);
    ymax = Math.min(h, ymax);
    
    for (y = ymin; y < ymax; y++) {
        for (x = xmin; x < xmax; x++) {
            index = (x + y * w) << 2;
            imageDataDst.data[index] = imageDataSrc.data[index++];
            imageDataDst.data[index] = imageDataSrc.data[index++];
            imageDataDst.data[index] = imageDataSrc.data[index++];
            imageDataDst.data[index] = 255;
        }
    }

    let dstdata = imageDataDst.data;
    let srcdata = imageDataSrc.data;

    xmin = px - radius;
    xmax = px + radius;
    ymin = py - radius;
    ymax = py + radius;

    // Clamp to canvas boundaries
    xmin = Math.max(0, xmin);
    xmax = Math.min(w, xmax);
    ymin = Math.max(0, ymin);
    ymax = Math.min(h, ymax);

    let tol = -15;
    let maxSize = w * (h - 1) + w - 1;

    for (y = ymin; y < ymax; y++) {
        index = (xmin + y * w) << 2;
        for (x = xmin; x < xmax; x++) {
            x1 = x - px;
            y1 = y - py;
            d = Math.sqrt(x1 * x1 + y1 * y1);
            if (d <= radius) {
                sc = 1 - smootherstep((radius - d) / radius);
                //sc = 1;
                xx = Math.floor(px + x1 * sc);
                yy = Math.floor(py + y1 * sc);

                //Antialiasing
                if (sc < tol * 0.9 && sc > tol * 1.1)
                    sc = 0.9;
                else if (sc < tol)
                    sc = 0.1;
                else
                    sc = 1;

                //end of lens math
                index2 = ((xx + yy * w) % maxSize) << 2;
                dstdata[index++] = sc * srcdata[index2 + 0];
                dstdata[index++] = sc * srcdata[index2 + 1];
                dstdata[index++] = sc * srcdata[index2 + 2];
                index++;
            } else {
                index = index + 4;
            }
        }
    }

    imageDataDst.data = dstdata;
    ctx.putImageData(imageDataDst, 0, 0);
    oldx = px;
    oldy = py;
}
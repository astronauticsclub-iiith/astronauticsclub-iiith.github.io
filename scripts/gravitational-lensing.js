let oldx = 0;
let oldy = 0;

let imageDataDst, imageDataSrc;

let w = 1024;
let h = 512;

let img = new Image();
img.src = "../images/gravitational_lensing.png";

let lerp = function(a, b, t) {
    return (b - a) * (1-Math.exp(-t)) + a;
}

function writeText(ctx) {
    // Get the text content from the hidden section
    const contentElement = document.getElementById('clubContent');
    const contentText = contentElement.textContent.trim();

    // Set up the canvas font and styles
    ctx.font = "1.5rem Roboto, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";

    // Split the content into lines for better formatting on the canvas
    const lines = contentText.split(/\r?\n/).map(line => line.trim());
    const lineHeight = 30; // Set line height
    let x = 20; // Left padding
    let y = 50; // Top padding

    // Draw each line on the canvas
    lines.forEach(line => {
    const words = line.split(" ");
    let currentLine = "";
    
    words.forEach(word => {
        const testLine = currentLine + word + " ";
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > canvas.width - 40) { // 40 for padding
        ctx.fillText(currentLine, x, y);
        currentLine = word + " ";
        y += lineHeight;
        } else {
        currentLine = testLine;
        }
    });
    ctx.fillText(currentLine, x, y);
    y += lineHeight;
    });
}

window.onload = function() {
    w = img.width;
    h = img.height;

    canvas = document.querySelector("canvas");
    canvas.width = w;
    canvas.height = h;

    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    i = 0;
    imageDataSrc = ctx.getImageData(0, 0, w, h);
    imageDataDst = ctx.getImageData(0, 0, w, h);

    px = 0;
    py = 320;

    ti = 0;
    let timer = setInterval(function() {
        if (ti++ > 100)
            clearInterval(timer);

        updatecanvas(canvas, lerp(0,900 , ti / 20), py);
    }, 16);

    canvas.addEventListener('mousemove', function(evt) {
        let mousePos = getMousePos(canvas, evt);
        updatecanvas(canvas, mousePos.x, mousePos.y);
    }, false);
    writeText(ctx);
};



let smootherstep = function(t) {
    //return 1/(Math.exp(-5*t+Math.E)) - Math.exp(-Math.E);
    return 1 / (Math.exp(-6 * t + 3)) - Math.exp(-3);
};


function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}




function updatecanvas(canvas, px, py) {
    let context = canvas.getContext('2d');

    r = 100;
    xmin = oldx - r;
    xmax = oldx + r;
    if (xmin < 0) {
        xmin = 0;
    }
    if (xmax > w) {
        xmax = w;
    }
    ymin = oldy - r;
    ymax = oldy + r;

    if (ymin < 0) {
        ymin = 0;
    }
    if (ymax > h) {
        ymax = h;
    }
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

    xmin = px - r;
    xmax = px + r;
    ymin = py - r;
    ymax = py + r;


    if (xmin < 0) {
        xmin = 0;
    }
    if (xmax > w) {
        xmax = w;
    }

    if (ymin < 0) {
        ymin = 0;
    }
    if (ymax > h) {
        ymax = h;
    }

    let tol = -15;
    let maxSize = w * (h - 1) + w - 1;

    for (y = ymin; y < ymax; y++) {
        index = (xmin + y * w) << 2;
        for (x = xmin; x < xmax; x++) {
            x1 = x - px;
            y1 = y - py;
            d = Math.sqrt(x1 * x1 + y1 * y1);
            if (d <= r) {
                sc = 1 - smootherstep((r - d) / r);
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
    writeText(ctx);
    oldx = px;
    oldy = py;
}
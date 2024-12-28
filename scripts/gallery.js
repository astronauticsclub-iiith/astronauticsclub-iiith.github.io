const images = document.querySelectorAll('figure')
const imageFocus = document.getElementById('zoomedImage')
const cross = document.getElementById("cross")
const blurOverlay = document.getElementById("blurOverlay")

images.forEach(img => {
    img.addEventListener("click", (e)=>{
        const src = e.target.src;
        blurOverlay.style.display = "block";
        imageFocus.style.display = "block";
        imageFocus.children[1].src = src
    })

    // img.addEventListener("mouseover", )
})

cross.addEventListener("click", ()=>{
    imageFocus.style.display = "none"
    blurOverlay.style.display = "none"
})
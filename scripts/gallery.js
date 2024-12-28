const images = document.querySelectorAll('figure')
const imageFocus = document.getElementById('zoomedImage')
const cross = document.getElementById("cross")
const blurOverlay = document.getElementById("blurOverlay")

images.forEach(img => {
    img.addEventListener("click", (e)=>{
        const src = e.target.src;
        blurOverlay.style.display = "block";
        imageFocus.children[1].src = src
        imageFocus.style.display = "block";
    })

    img.addEventListener("mouseenter", (e)=>{
        e.target.children[0].style.filter = "3px"
        e.target.children[0].setAttribute("style", "-webkit-filter: blur(3px)"); 
        e.target.children[1].style.display = "inline"
    })

    img.addEventListener("mouseleave", (e)=>{
        e.target.children[0].style.filter = "none"
        e.target.children[1].style.display = "none"
    })
})

cross.addEventListener("click", ()=>{
    imageFocus.style.display = "none"
    blurOverlay.style.display = "none"
})

blurOverlay.addEventListener("click", (e)=>{
    let isClicked = imageFocus.contains(e.target)
    if(!isClicked){
        imageFocus.style.display = "none"
        blurOverlay.style.display = "none"
    }
}, true)
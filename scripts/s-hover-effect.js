const s = document.getElementById("s-hover-effect");
const logo = document.getElementById("logo");

let s_clicked = false;
s.addEventListener("click", () => {
    if (s_clicked) {
        s.style.color = "white";
        logo.src = "images/astronautics_club_logo_brighten.png";
        s_clicked = false;
    } 
    
    else {
        s.style.color = "#d2042d";
        logo.src = "icons/moon.gif";
        s_clicked = true;
    }
});
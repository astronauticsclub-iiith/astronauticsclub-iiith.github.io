let mobileNavbarOn = false;

function showMobileNavbar() {
    const navLinks = document.querySelector(".nav-links");
    if(mobileNavbarOn){
        navLinks.style.display = "none";
        mobileNavbarOn = false;
    }
    else{
        navLinks.style.display = "block";
        mobileNavbarOn = true;
    }
}
let mobileNavbarOn = false;

function showMobileNavbar() {
    const sidebar = document.querySelector("asside");
    const body = document.querySelector("body");
    
    if(mobileNavbarOn){
        sidebar.style.display = "block";
        body.style.overflow = "hidden";
        mobileNavbarOn = false;
    }

    else{
        sidebar.style.display = "none";
        body.style.overflow = "scroll";
        mobileNavbarOn = true;
    }
}
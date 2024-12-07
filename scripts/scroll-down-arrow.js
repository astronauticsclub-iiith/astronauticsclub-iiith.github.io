// Scroll down arrow icon
window.onscroll = function () {
    if (document.body.scrollTop > 50 ||
        document.documentElement.scrollTop > 300
    ) 
    {
        document.getElementById("scroll-down-arrow").style.display = "none";
    } 

    else {
        document.getElementById("scroll-down-arrow").style.display = "block";
    }
};
// Scroll down arrow icon
window.onscroll = function () {
    if (document.body.scrollTop > 50 ||
        document.documentElement.scrollTop > 300) 
    {
      document.querySelector("nav").style.backgroundColor = "black";
      document.getElementById("scroll-down-arrow").style.display = "none";
    } 

    else {
      document.querySelector("nav").style.opacity = 0.85;
      document.getElementById("scroll-down-arrow").style.display = "block";
    }
};
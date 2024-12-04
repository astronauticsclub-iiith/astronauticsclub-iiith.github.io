// For scrolling and reducing the opacity of the navbar
window.onscroll = function () {
    if (document.body.scrollTop > 50 ||
        document.documentElement.scrollTop > 50) 
    {
      document.querySelector("nav").style.backgroundColor = "black";
    } 

    else {
      document.querySelector("nav").style.opacity = 0.85;
    }

    // Scroll down arrow icon
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
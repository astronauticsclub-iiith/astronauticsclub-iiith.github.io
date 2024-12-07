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
  };
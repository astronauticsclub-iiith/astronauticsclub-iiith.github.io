var swiper = new Swiper(".team-swiper", {
    slidesPerView: 3,
    spaceBetween: 30,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
  
      200: {
        slidesPerView: 1,
        spaceBetween: 20
      },
      750: {
        slidesPerView: 2,
        spaceBetween: 30
      },
      1024: {
        slidesPerView: 2.5,
        spaceBetween: 30
      },
      1100: {
        slidesPerView: 3,
        spaceBetween: 30
      },
    }
  });
const backToTopButton = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopButton.style.display = 'block';
  } else {
    backToTopButton.style.display = 'none';
  }
});
backToTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const searchBar = document.getElementById('search-bar');
  const blogPosts = document.querySelectorAll('.latest-updates-blogpost-subcontainer');

  searchBar.addEventListener('input', () => {
    const searchText = searchBar.value.toLowerCase();
    blogPosts.forEach(post => {
      const title = post.querySelector('.latest-updates-blogpost-heading').innerText.toLowerCase();
      const content = post.querySelector('.latest-updates-blogpost-content').innerText.toLowerCase();
      post.style.display = (title.includes(searchText) || content.includes(searchText)) ? 'block' : 'none';
    });
  });
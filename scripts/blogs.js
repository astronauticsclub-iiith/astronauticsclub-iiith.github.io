let topBlogNum = 1;
const numTopBlogs = 3;

const topBlogSection = document.querySelector(".top-blog-section")
const blogTitle = document.getElementById("top-blog-title")
const blogDesc = document.getElementById("top-blog-description")
const blogCategory = document.getElementById("top-blog-category")

const leftArrow = document.getElementById("slider-left-arrow");
const rightArrow = document.getElementById("slider-right-arrow");

let blogImageList = [
    "../images/blog_1.jpg",
    "../images/telescope_blog.jpg",
]

let blogTitleList = [
    "Astronomy 101: Your First Steps into Astronomy and Astrophysics",
    "A Beginner’s Guide to Telescopes",
]

let blogDescriptionList = [
    "An approachable guide for curious minds to the wonders of astronomy",
    "Explore the fascinating world of telescopes! Learn about their types, how they work, and essential tips for handling",
]

let blogTagList = [
    "Astronomy",
    "Astronomy",
]

function checkArrowDisplay(){
    if(topBlogNum == 1){
        leftArrow.style.display = "none"
    }
    else if(topBlogNum == numTopBlogs){
        rightArrow.style.display = "none"
    }
    else{
        leftArrow.style.display = "block"
        rightArrow.style.display = "block"
    }
}

function changeTopBlog(){
    const topblogNumber = document.querySelector(`#topblog-number span:nth-child(${topBlogNum})`);
    topblogNumber.classList.add('filled')
    topBlogSection.style.backgroundImage = `url(${blogImageList[topBlogNum - 1]})`;
    blogTitle.textContent = `${blogTitleList[topBlogNum - 1]}`;
    blogDesc.textContent = `${blogDescriptionList[topBlogNum - 1]}`;
    blogCategory.textContent = `${blogTagList[topBlogNum - 1]}`;
}

document.addEventListener('DOMContentLoaded', ()=> {
    checkArrowDisplay();
    changeTopBlog();
})

leftArrow.addEventListener('click', () => {
    if(topBlogNum > 1){
        const topblogNumber = document.querySelector(`#topblog-number span:nth-child(${topBlogNum})`);
        topblogNumber.classList.remove('filled')
        topBlogNum--;
        changeTopBlog();
        checkArrowDisplay();
    }
})

rightArrow.addEventListener('click', () => {
    if(topBlogNum < numTopBlogs){
        const topblogNumber = document.querySelector(`#topblog-number span:nth-child(${topBlogNum})`);
        topblogNumber.classList.remove('filled')
        topBlogNum++;
        changeTopBlog();
        checkArrowDisplay();
    }
})
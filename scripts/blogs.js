let topBlogNum = 1;
const numTopBlogs = 2;

const topBlogSection = document.querySelector(".top-blog-section")
const blogTitle = document.getElementById("top-blog-title")
const blogDesc = document.getElementById("top-blog-description")
const blogCategory = document.getElementById("top-blog-category")
const blogDetails = document.querySelector('.blog-details-wrapper')

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

///////////////// HELPER FUNCTIONS //////////////////
function changeTopBlog(){
    topBlogSection.style.backgroundImage = `url(${blogImageList[topBlogNum - 1]})`;
    blogTitle.textContent = `${blogTitleList[topBlogNum - 1]}`;
    blogDesc.textContent = `${blogDescriptionList[topBlogNum - 1]}`;
    blogCategory.textContent = `${blogTagList[topBlogNum - 1]}`;
    addCircleFill();
}

function checkArrowDisplay(){
    if(topBlogNum == 1){
        leftArrow.style.display = "none"
        rightArrow.style.display = "block"
    }
    else if(topBlogNum == numTopBlogs){
        leftArrow.style.display = "block"
        rightArrow.style.display = "none"
    }
    else{
        leftArrow.style.display = "block"
        rightArrow.style.display = "block"
    }
}

function createInitCircleList(){
    const circleList = document.createElement('div')
    circleList.classList.add('topblogCircle')
    blogDetails.appendChild(circleList)

    for(let i=0; i < numTopBlogs; i++){
        const circle = document.createElement('span')
        circle.classList.add('circle')
        circleList.appendChild(circle)
    }
}

function addCircleFill(){
    const topblogNumber = document.querySelector(`.topblogCircle span:nth-child(${topBlogNum})`);
    topblogNumber.classList.add('filled')
}

function removeCircleFill(){
    const topblogNumber = document.querySelector(`.topblogCircle span:nth-child(${topBlogNum})`);
    topblogNumber.classList.remove('filled')
}


document.addEventListener('DOMContentLoaded', ()=> {
    createInitCircleList();
    changeTopBlog();
    checkArrowDisplay();
})

leftArrow.addEventListener('click', () => {
    if(topBlogNum > 1){
        removeCircleFill()
        topBlogNum--;
        changeTopBlog();
        checkArrowDisplay();
    }
})

rightArrow.addEventListener('click', () => {
    if(topBlogNum < numTopBlogs){
        removeCircleFill()
        topBlogNum++;
        changeTopBlog();
        checkArrowDisplay();
    }
})
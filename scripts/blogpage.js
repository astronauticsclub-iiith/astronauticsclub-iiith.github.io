// Space-themed blog interactions with local storage

let likeCount = localStorage.getItem('spaceBlogLikes') 
    ? parseInt(localStorage.getItem('spaceBlogLikes')) 
    : 0;
const likeCountElem = document.getElementById("like-count");
const commentList = document.getElementById("comments-list");

// Initialize like count
likeCountElem.textContent = `${likeCount} Cosmic Likes`;

function incrementLike() {
    likeCount++;
    likeCountElem.textContent = `${likeCount} Cosmic Likes`;
    
    // Animate like button with space-like effect
    const likeBtn = document.getElementById('like-button');
    likeBtn.style.transform = 'scale(1.2) rotate(360deg)';
    likeBtn.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        likeBtn.style.transform = 'scale(1) rotate(0deg)';
    }, 300);
    
    // Save to local storage
    localStorage.setItem('spaceBlogLikes', likeCount);
}

function addComment() {
    const commentInput = document.getElementById("comment-input");
    const commentText = commentInput.value.trim();
    
    if (commentText !== "") {
        const newComment = document.createElement("div");
        newComment.classList.add("comment");
        
        const timestamp = new Date().toLocaleString();
        
        newComment.innerHTML = `
            <p>
                <strong>Space Explorer ${timestamp}:</strong> 
                ${commentText}
                <span style="font-size: 0.7em; color: #4fc3f7; margin-left: 10px;">🚀</span>
            </p>
        `;
        
        // Add comment to the top of the list
        commentList.insertBefore(newComment, commentList.firstChild);
        commentInput.value = ""; // Clear input
        
        // Save to local storage
        saveCommentToLocalStorage(commentText);
    }
}

function saveCommentToLocalStorage(commentText) {
    let comments = JSON.parse(localStorage.getItem('spaceComments') || '[]');
    comments.unshift({
        text: commentText,
        timestamp: new Date().toISOString()
    });
    
    // Limit to last 10 comments
    comments = comments.slice(0, 10);
    
    localStorage.setItem('spaceComments', JSON.stringify(comments));
}

function loadSavedComments() {
    const comments = JSON.parse(localStorage.getItem('spaceComments') || '[]');
    comments.forEach(comment => {
        const newComment = document.createElement("div");
        newComment.classList.add("comment");
        
        const timestamp = new Date(comment.timestamp).toLocaleTimeString();
        
        newComment.innerHTML = `
            <p>
                <strong>Space Explorer ${timestamp}:</strong> 
                ${comment.text}
                <span style="font-size: 0.7em; color: #4fc3f7; margin-left: 10px;">🚀</span>
            </p>
        `;
        
        commentList.appendChild(newComment);
    });
}

// Load saved comments on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSavedComments();
});
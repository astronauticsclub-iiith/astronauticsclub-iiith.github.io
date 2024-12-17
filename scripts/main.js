/////////////////////  Main JS - Common script file  ////////////////////

const yearElement = document.getElementById('yearId');
const year = new Date().getFullYear();
yearElement.textContent = year;
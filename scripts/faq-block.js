const bg_color = "#afadad";
const active_color = "#eae5e5";

function toggle_answer(id){
    let question = document.getElementById("question_"+id);
    let arrow = document.getElementById("arrow_"+id);
    let answer = document.getElementById("ans_"+id);

    if (answer.style.display == "none" || answer.style.display == "") {
        answer.style.display = "block";
        arrow.src = "../icons/up_arrow.png";
        question.style.backgroundColor = active_color;
    } 
    else {
        answer.style.display = "none";
        arrow.src = "../icons/down_arrow.png";
        question.style.backgroundColor = bg_color;
    }
}
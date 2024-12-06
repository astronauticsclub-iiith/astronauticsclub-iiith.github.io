const bg_color = "#afadad";
const active_color = "#eae5e5";
const num_faqs = 8;

function reset_faqs(){
    let question, arrow, answer;

    for (let i = 1; i <= num_faqs; i++) {
        answer = document.getElementById("ans_"+i);
        
        if(answer.style.display == "block"){
            arrow = document.getElementById("arrow_"+i);
            question = document.getElementById("question_"+i);

            answer.style.display = "none";
            arrow.src = "../icons/down_arrow.png";
            question.style.backgroundColor = bg_color;
        }
    }
}


function toggle_answer(id){
    let question = document.getElementById("question_"+id);
    let arrow = document.getElementById("arrow_"+id);
    let answer = document.getElementById("ans_"+id);

    if (answer.style.display == "none" || answer.style.display == "") {
        reset_faqs(); // only one answer can be active at a time
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
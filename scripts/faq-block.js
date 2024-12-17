let active_cell = -1000;

function reset_faqs(){
    if(active_cell <= 0) return;
    let question = document.getElementById("question_"+active_cell);
    question.classList.remove("faq-highlight");
    question.parentElement.removeAttribute('open');
    
    let arrow = document.getElementById("arrow_"+active_cell);
    arrow.classList.remove("fa-caret-up");
    arrow.classList.add("fa-caret-down");
    
    active_cell = -1000;
}


function toggle_answer(id){
    let question = document.getElementById("question_"+id);
    let arrow = document.getElementById("arrow_"+id);

    if (active_cell != id){
        reset_faqs(); // only one answer can be active at a time
        arrow.classList.remove("fa-caret-down");
        arrow.classList.add("fa-caret-up");
        question.classList.add("faq-highlight");
        active_cell = id;
    } 
    else {
        question.classList.remove("faq-highlight");
        arrow.classList.remove("fa-caret-up");
        arrow.classList.add("fa-caret-down");
        active_cell = -1000;
    }
}
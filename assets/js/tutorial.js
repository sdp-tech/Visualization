//tutorial Get the modal
var modal = document.getElementById("tutorial");
var currentIndex = 0;

// When the user clicks the button, open the modal 
function tutorial_on() {
    modal.style.display = "block";
    currentIndex = 0;
    showpage(currentIndex);
};
  
function tutorial_off(){
    modal.style.display = "none";
};

function tutorialpage(action) {
    if (action == previous){
        currentIndex--;
    }
    if (action == next){
        currentIndex++;
    }
    showpage(currentIndex);
}

function showpage(currentIndex){

    for (let input of document.querySelectorAll('.tutorial_content')) {
        if (input.id == currentIndex){
            input.hidden = false;
        }
        else{
            input.hidden = true;
        }
    }
        
    // disable button when reached min/max page
    let minIndex = 0;
    let maxIndex = 2;
    if (currentIndex == minIndex){
        document.getElementById("previous").disabled = true;
    }
    else{
        document.getElementById("previous").disabled = false;
    }

    if (currentIndex == maxIndex){
        document.getElementById("next").disabled = true;
    }
    else{
        document.getElementById("next").disabled = false;
    }
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
      tutorial_off();
    }
};

const lightbox = GLightbox({});

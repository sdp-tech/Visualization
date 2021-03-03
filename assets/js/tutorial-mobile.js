//variables

//functions
const addCookieCloseTutorial = () => {
    if($.cookie('mobile-tutorial-oneday-cookie') == undefined){
        //add cookie that lasts for one day
        $.cookie('mobile-tutorial-oneday-cookie', 'Y', { expires: 1, path: '/' });
    }
    //close anyway
    const element = document.getElementById('modaal-close');
    element.click();
}

const addOnedayCheckbox = () => {
    let checkbox = document.createElement('input');
    checkbox.innerText = "dddd";
    checkbox.setAttribute('type', 'checkbox');
    checkbox.classList.add('mobile-oneday-box');  
    checkbox.addEventListener('click', addCookieCloseTutorial);

    let label = document.createElement('label');
    label.setAttribute('for', 'oneday');
    label.innerText = '하루 동안 보지 않기'

    //checkbox appear only in the last tutorial page
    $('.modaal-gallery-item-wrap').children().last().append(checkbox);
    $('.modaal-gallery-item-wrap').children().last().append(label);
}

//running codes
$('.m-tutorial-wrapper').modaal({
    type: 'image',
    //tutorial page opens only if cookie is undefined
    start_open: $.cookie('mobile-tutorial-oneday-cookie') == undefined
});

//Adding checkbox
addOnedayCheckbox();
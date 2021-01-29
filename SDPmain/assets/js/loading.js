$.loading = {
    //to support IE
    cache : false,
    start: function (loadingTips='') {
        let _LoadingHtml = '<div id="loader">'+
        '<div id="shadow"></div>'+
        '<div id="box"></div>'+
        `<br><br><br><br><p class="loading">${loadingTips}</p>`+'</div>'

        $('#tutorial_btn').hide();
        $('.mapcontainer').append(_LoadingHtml);
        $('.hamburger').hide();

    },
    end: function () {
        $("#loader").remove();
        $('.hamburger').show();
        $('#tutorial_btn').show();
    }
}
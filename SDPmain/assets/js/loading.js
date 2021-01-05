$.loading = {
    start: function (loadingTips='') {
        let _LoadingHtml = '<div id="loader">'+
        '<div id="shadow"></div>'+
        '<div id="box"></div>'+
        '<br><br><br><br><p class="loading">Loading...</p>'+'</div>'

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
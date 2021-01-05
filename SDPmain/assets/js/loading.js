$.loading = {
    start: function (loadingTips='') {
        let _LoadingHtml = '<div id="loader">'+
        '<div id="shadow"></div>'+
        '<div id="box"></div>'+
        '<br><br><br><br><p class="loading">Loading...</p>'+'</div>'

        $('.mapcontainer').append(_LoadingHtml);
        $('.hamburger').hide();
    },
    end: function () {
        $(".box").remove();
        $('.hamburger').show();
    }
}
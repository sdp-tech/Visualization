document.addEventListener('DOMContentLoaded', function() {

    // Load data and save it as variable
    // load_data();
    // var mapdata = localStorage.getItem('mapdata');

    // console.log(JSON.parse(mapdata));

    // load the map
    load_map();
    
    /* sidemenu */
    $('#toolbar .hamburger').on('click', function() {
        $(this).parent().toggleClass('open');
  });
  
});

// load data and save in 
// local storage for time saving
// function load_data()
// {
//     // #TODO API로 나중에 바꾸기
//     // const proxyurl = "https://cors-anywhere.herokuapp.com/";
//     // const url = "https://5jp713qow1.execute-api.ap-northeast-2.amazonaws.com/sdp-map-get-data";
//     const url = "http://127.0.0.1:8080/output.json";
//     // load data
//     $.getJSON(url, function(json) {
//         localStorage.setItem('mapdata', JSON.stringify(json));
//     })
//     .catch(err => console.error(err));


//     // #TODO 우선 Local file
//     // $.getJSON("./temp/output.json", function(json) {
//     //     localStorage.setItem('mapdata', JSON.stringify(json));
//     // })
//     // .catch(err => console.error(err));
    
// }

// function onEachFeature(feature, layer) {
        
//     var popupText = 
//         "<p id='p_popup_detail'>"+
//         "<strong style='color: #84b819' >" + feature.properties.project_name_wb + "</strong><br>" + 
//         "<b>Country:</b> " + feature.properties.countries + "<br>"+
//         "<b>Status:</b> " + feature.properties.ppi_status + "<br>"+
//         "<b>Prime Sector:</b> " + feature.properties.sector + "<br>"+
//         "<b>Sub Sector:</b> " + feature.properties.subsector + "<br>"+
//         "<b>Problem:</b> " + feature.properties.reason_for_delay +
//         "<p id='linked_p_popup_detail'>" +
//         "<b><a href='"+ feature.properties.urls +"'>URL</a>"+ " | " +
//         "<a href='#'>See also</a></b>"+
//         "</p></p>";

//     layer.bindPopup(popupText, {
//         closeButton: true,
//         offset: L.point(0, -20)
//     });
//     layer.on('click', function() {
//         layer.openPopup();
//     });
    
// }


// function pointToLayer(feature, latlng) {

//     var sector = feature.properties.sector;
//     switch (sector) {
//         case "Energy":
//             icon_color = 'green';
//             icon_png = 'lightbulb';
//             break;
//         case "Transport":
//             icon_color = 'blue';
//             icon_png = 'bus';
//             break;
//         default:
//             icon_color = 'orange';
//             icon_png = 'heart';
//     };

//     var colored_marker = L.AwesomeMarkers.icon({
//         icon: icon_png,
//         prefix:'fa',
//         markerColor: icon_color
//     });

//     marker = new L.Marker(latlng, {
//         icon : colored_marker
//     });

//     return marker;
// }

// setting a map 
function load_map(){

    // /***************************
    //  *      Base map Layer     *
    // ***************************/

    var mymap = L.map('mapwrap', {zoomControl: true}).setView([10,10],2);
    L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        tileSize: 512,

        // zoom controller
        minZoom: 2,
        maxZoom: 16,
        zoomOffset: -1

    }).addTo(mymap);
    
    $.getJSON("http://127.0.0.1:8080/output.json", function(json) {

        localStorage.setItem('mapdata', JSON.stringify(json));
        var mapdata = localStorage.getItem('mapdata');

        geoLayer = L.geoJson(mapdata, {

            onEachFeature: function (feature, layer) {
                var popupText = 
                    "<p id='p_popup_detail'>"+
                    "<strong style='color: #84b819' >" + feature.properties.project_name_wb + "</strong><br>" + 
                    "<b>Country:</b> " + feature.properties.countries + "<br>"+
                    "<b>Status:</b> " + feature.properties.ppi_status + "<br>"+
                    "<b>Prime Sector:</b> " + feature.properties.sector + "<br>"+
                    "<b>Sub Sector:</b> " + feature.properties.subsector + "<br>"+
                    "<b>Problem:</b> " + feature.properties.reason_for_delay +
                    "<p id='linked_p_popup_detail'>" +
                    "<b><a href='"+ feature.properties.urls +"'>URL</a>"+ " | " +
                    "<a href='#'>See also</a></b>"+
                    "</p></p>";
            
                layer.bindPopup(popupText, {
                    closeButton: true,
                    offset: L.point(0, -20)
                });
                layer.on('click', function() {
                    layer.openPopup();
                });
                
            },
            pointToLayer: function (feature, latlng) {
            
                var sector = feature.properties.sector;
                switch (sector) {
                    case "Energy":
                        icon_color = 'green';
                        icon_png = 'lightbulb';
                        break;
                    case "Transport":
                        icon_color = 'blue';
                        icon_png = 'bus';
                        break;
                    default:
                        icon_color = 'orange';
                        icon_png = 'heart';
                };
                
                var awesomemark = L.AwesomeMarkers.icon({
                    icon: icon_png,
                    prefix:'fa',
                    markerColor: icon_color})

                var marker = new L.Marker(latlng, {
                    icon : awesomemark,
                });
            
                return marker;
            },
            
        }).addTo(mymap);

    }).catch(err => console.error(err));;

    // // back to original zoom
    // mymap.addControl(new L.Control.ZoomMin())
}

//     /*********************************
//      *  set each datum into markers  *
//     *********************************/

//     /// process data
//     // each_data(data, mymap, markersLayer);

//     /**********************************
//      *   Search bar outside the map   *
//     **********************************/

//     // add the search bar to the map
//     var controlSearch = new L.Control.Search({
//         container: 'findbox',
//         initial: false,
//         collapsed: false,
//         layer: markersLayer,  // name of the layer
//         zoom: 10,        // set zoom to found location when searched
//         // marker: false,
//         // textPlaceholder: 'search...' // placeholder while nothing is searched
//     });
    
//     mymap.addControl(controlSearch); // add it to the map
    
//     controlSearch.on('search:locationfound', function(e) {
//         if(e.layer._popup)
//             e.layer.openPopup();
    
//     })


// // filters
// // data_filtering(data, mymap, markersLayer);


//     /**********************
//      *   Error Handling   *
//     **********************/

//     // error handling
//     function onLocationError(e) {
//         alert(e.message);
//     }
//     mymap.on('locationerror', onLocationError);

// }


// markers 불러오기

// function data_filtering(data, mymap, markersLayer){

//     /**********************************
//      * filter markers with conditions *
//     **********************************/
//     /* ref : https://codepen.io/izelvor/pen/oRGowL */

//     // 이미 각자 attribute로 tags 있으니까 분류하기만 하면 됨

//     // // set list into html
//     // var buildingLayers = L.layerGroup().addTo(mymap);
//     // var $listItem = $('<li>').html(set_continents).appendTo('#toolbar ul');
//     // $listItem.on('click', function(){
//     //     buildingLayers.clearLayers();
//     //     buildingLayers.addLayer(thisLayer);
//     //     var notifyIcon = L.divIcon({
//     //         className: 'notify-icon',
//     //         iconSize: [25, 25],
//     //         html: '<span></span>'
//     // })});
//     // // var notifyMarker = L.marker([thisLat,thisLon], {icon: notifyIcon});
//     // // buildingLayers.addLayer(notifyMarker);

//     // let filter_custom = [];
    
//     // document.querySelectorAll('.form-control').forEach(item => {
//     //     item.addEventListener('change', event => {
//     //     filter_custom.push(item.value);
//     //     let unique_list = [...new Set(filter_custom)];
//     //     const result = document.querySelector('.result');
//     //     result.textContent = `You chose ${unique_list}`;
//     // })});


//     let dict_country = set_countries.reduce((a,x) => ({...a, [x]: x}), {});
//     var select = document.getElementById("country-select");

//     for(index in dict_country) {
//         select.options[select.options.length] = new Option(dict_country[index], index);
//     }
//     // console.log(select.options[select.selectedIndex].value);

//     let user_selection = [];

//     $(document).ready(function() {
//         $('.js-example-matcher-start').select2({
//             tags: true,
//             tokenSeparators: [',', ' '],
//             placeholder: "Select a country",
            
//         });

//     });

//     document.querySelectorAll('.js-example-matcher-start').forEach(item => {
//         item.addEventListener('change', event => {
//             user_selection.push(item.value);
//         let unique_list = [...new Set(user_selection)];
//         const result = document.querySelector('.result');
//         result.textContent = `You chose ${unique_list}`;
//     })});

// }
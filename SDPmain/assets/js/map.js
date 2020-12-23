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


// setting a map 
function load_map(){

    // /***************************
    //  *      Base map Layer     *
    // ***************************/

    var mymap = L.map('mapwrap', {zoomControl: false}).setView([10,10],2);
    L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
        attribution: 'SDP &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        tileSize: 512,

        // zoom controller
        minZoom: 2,
        maxZoom: 16,
        zoomOffset: -1

    }).addTo(mymap);

    L.control.zoom({
        position: 'topright'
    }).addTo(mymap);
    
    // const proxyurl = "https://cors-anywhere.herokuapp.com/";
    // const url = "https://5jp713qow1.execute-api.ap-northeast-2.amazonaws.com/sdp-map-get-data";
    
    // $.getJSON(proxy+url, function(json) {

    $.getJSON("http://127.0.0.1:8080/output.json", function(json) {

        try{
            geoLayer = L.geoJson(json, {
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

                // filter: userfilter,

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


        } catch(err){
            console.error(err);
        };
        
        // add to HTML
        options_to_html(json);

    // // back to original zoom
    // mymap.addControl(new L.Control.ZoomMin())
    });
}

//////////////
/// filter ///
//////////////

function options_to_html(data){

    var property_list = getKeys(data);
    console.log(data);
    var geographical_set = property_list["geographical"];
    // console.log(geographical_set);
    var country_set = property_list["country"];
    
    var selectElement = document.getElementById('country-select');

    for (option of geographical_set.values()) {
        ggnew = new Option(option, option);
        selectElement.add(ggnew);
        ggnew.disabled = true;
        for (country of country_to_geographical(data, option).values()) {
            countryoption = new Option(country, country);
            selectElement.add(countryoption);
        }
    }


    // console.log(select.options[select.selectedIndex].value);

    let user_selection = [];

    // const selectElement = document.querySelector('.js-select2-multi');
    $(document).ready(function() {
        $('.js-select2-multi').select2();
    });

    function showvalue(e) { 
        var select_val = $(e.currentTarget).val();
        console.log(select_val)
    }

    $(".js-select2-multi")
        .on("change", showvalue)
}

function updatefilter() {
	inputstates = {
  	geographical: [],
    country: []
  }
}

function userfilter(feature){
    document.querySelectorAll('input')
}

function getKeys(input){

    // Step 1, group feature values by property.
    let out = input.features.reduce((acc, {properties}) =>
    {
        Object.entries(properties).forEach(([key, val]) =>
        {
            acc[key] = acc[key] || new Set();
            acc[key].add(val);
        });

        return acc;
    }, {});

    return out;
}

function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

// map country-geographical into a set
function country_to_geographical(input, geographical) {;

    array = getObjects(input, "geographical", geographical);

    // console.log(array);

    data = array.map(data => data.country);
    data = Array.from(new Set(data)).sort();

    return data;
};

document.addEventListener('DOMContentLoaded', function() {

    // Load data and save it as variable
    var data = load_data();

    // load the map
    load_map(data);
    
    /* sidemenu */
    $('#toolbar .hamburger').on('click', function() {
        $(this).parent().toggleClass('open');
  });
  
});

// load data and save in 
// local storage for time saving
function load_data()
{
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const url = "https://5jp713qow1.execute-api.ap-northeast-2.amazonaws.com/sdp-map-get-data";

    // load data
    fetch(proxyurl+url)
    .then(response => response.json())
    .then(data => 
        localStorage["data"] = JSON.stringify(data)
    )

    return localStorage["data"];
}

// process each data
function each_data(data, mymap, markersLayer){

    data = JSON.parse(data);

    // set for each data
    globalThis.set_continents = [];
    globalThis.set_countries = [];
    globalThis.set_ppi_status = [];
    globalThis.set_prime_sectors = [];
    globalThis.set_subsector = [];
    globalThis.set_reason_for_delay = [];
    globalThis.set_type_of_ppi = [];
    globalThis.set_income_group = [];

    data.forEach(datum => {
        // console.log(data);
        // console.log(data.country);

        const continent = datum.geographical;
        const country = datum.country;
        const latitude = datum.latitude;
        const longitude = datum.longitude;
        const project_name_wb = datum.project_name_wb;
        const income_group = datum.income_group;
        const ppi_status = datum.ppi_status;
        const type_of_ppi = datum.type_of_ppi;
        const prime_sector = datum.sector;
        const subsector = datum.subsector;
        const reason_for_delay = datum.reason_for_delay;
        const url = datum.urls;

        
        // push into the array
        set_continents.push(continent);
        set_countries.push(country);
        set_ppi_status.push(ppi_status);
        set_prime_sectors.push(prime_sector);
        set_subsector.push(subsector);
        set_reason_for_delay.push(reason_for_delay);
        set_type_of_ppi.push(type_of_ppi);
        set_income_group.push(income_group);


        // pop-up contents 
        const popup_detail = document.createElement('div');
        popup_detail.setAttribute("id", "popup_detail");
        popup_detail.innerHTML = 
            "<p id='p_popup_detail'>"+
            "<strong style='color: #84b819' >" + project_name_wb + "</strong><br>" + 
            "<b>Country:</b> " + country + "<br>"+
            "<b>Status:</b> " + ppi_status + "<br>"+
            "<b>Prime Sector:</b> " + prime_sector + "<br>"+
            "<b>Sub Sector:</b> " + subsector + "<br>"+
            "<b>Problem:</b> " + reason_for_delay +
            "<p id='linked_p_popup_detail'>" +
            "<b><a href='"+ url +"'>URL</a>"+ " | " +
            "<a href='#'>See also</a></b>"+
            "</p></p>";

        // add marker + popup
        try
        {
            var title = project_name_wb; // value searched
            loc = [latitude, longitude]    //position found

            // case
            var x = prime_sector;
            switch (x) {
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
            }

            var colored_marker = L.AwesomeMarkers.icon({
                icon: icon_png,
                prefix:'fa',
                markerColor: icon_color
                });

            marker = new L.Marker(new L.latLng(loc), {
                title: title,
                opacity: 0.8,
                tags: [ continent, income_group, prime_sector, subsector, ppi_status, type_of_ppi],
                icon : colored_marker
            }).bindPopup(popup_detail).addTo(mymap);


            //필터링 구현할 수 있을 것 같닷
            var markersLayer = markersLayer.addLayer(marker);

        }
        // skip the error
        // N/A value ?
        catch(e)
        {
            return true;
        }

    }

)
    // save all the properties as a set
    set_continents = [...new Set(set_continents)];
    set_countries = [...new Set(set_countries)];
    set_ppi_status = [...new Set(set_ppi_status)];
    set_prime_sectors = [...new Set(set_prime_sectors)];
    set_subsector = [...new Set(set_subsector)];
    set_reason_for_delay = [...new Set(set_reason_for_delay)];
    set_type_of_ppi = [...new Set(set_type_of_ppi)];
    set_income_group = [...new Set(set_income_group)];

}



// setting a map 
function load_map(data){

    /***************************
     *      Base map Layer     *
    ***************************/

    var mymap = L.map('mapwrap', {zoomControl: false}).setView([10,10],2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        tileSize: 512,

        // zoom controller
        minZoom: 2,
        maxZoom: 16,
        zoomOffset: -1

    }).addTo(mymap);

    // back to original zoom
    mymap.addControl(new L.Control.ZoomMin())

    // markers layer
    var markersLayer = new L.LayerGroup();  
    mymap.addLayer(markersLayer); 

    /*********************************
     *  set each datum into markers  *
    *********************************/

    /// process data
    each_data(data, mymap, markersLayer);

    /**********************************
     *   Search bar outside the map   *
    **********************************/

    // add the search bar to the map
    var controlSearch = new L.Control.Search({
        container: 'findbox',
        initial: false,
        collapsed: false,
        layer: markersLayer,  // name of the layer
        zoom: 10,        // set zoom to found location when searched
        // marker: false,
        // textPlaceholder: 'search...' // placeholder while nothing is searched
    });
    
    mymap.addControl(controlSearch); // add it to the map
    
    controlSearch.on('search:locationfound', function(e) {
        if(e.layer._popup)
            e.layer.openPopup();
    
    })


// filters
data_filtering(data, mymap, markersLayer);


    /**********************
     *   Error Handling   *
    **********************/

    // error handling
    function onLocationError(e) {
        alert(e.message);
    }
    mymap.on('locationerror', onLocationError);

}


// markers 불러오기

function data_filtering(data, mymap, markersLayer){

    /**********************************
     * filter markers with conditions *
    **********************************/
    /* ref : https://codepen.io/izelvor/pen/oRGowL */

    // 이미 각자 attribute로 tags 있으니까 분류하기만 하면 됨

    // // set list into html
    // var buildingLayers = L.layerGroup().addTo(mymap);
    // var $listItem = $('<li>').html(set_continents).appendTo('#toolbar ul');
    // $listItem.on('click', function(){
    //     buildingLayers.clearLayers();
    //     buildingLayers.addLayer(thisLayer);
    //     var notifyIcon = L.divIcon({
    //         className: 'notify-icon',
    //         iconSize: [25, 25],
    //         html: '<span></span>'
    // })});
    // // var notifyMarker = L.marker([thisLat,thisLon], {icon: notifyIcon});
    // // buildingLayers.addLayer(notifyMarker);

    // let filter_custom = [];
    
    // document.querySelectorAll('.form-control').forEach(item => {
    //     item.addEventListener('change', event => {
    //     filter_custom.push(item.value);
    //     let unique_list = [...new Set(filter_custom)];
    //     const result = document.querySelector('.result');
    //     result.textContent = `You chose ${unique_list}`;
    // })});


    let dict_country = set_countries.reduce((a,x) => ({...a, [x]: x}), {});
    var select = document.getElementById("country-select");
    for(index in dict_country) {
        select.options[select.options.length] = new Option(dict_country[index], index);
    }
    // console.log(select.options[select.selectedIndex].value);

    let user_selection = [];

    $(document).ready(function() {
        $('.js-example-matcher-start').select2({
            tags: true,
            tokenSeparators: [',', ' '],
            placeholder: "Select a country",
            
        });

    });

    document.querySelectorAll('.js-example-matcher-start').forEach(item => {
        item.addEventListener('change', event => {
            user_selection.push(item.value);
        let unique_list = [...new Set(user_selection)];
        const result = document.querySelector('.result');
        result.textContent = `You chose ${unique_list}`;
    })});

}
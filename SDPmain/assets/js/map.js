//class
//var 선언부
//function 선언부
//call 

//module
//tutorial button 끝
//side bar
//map

var mapdata;
var mymap;
var markers = [];

// filterArray
var customOption = {
    countryOp: [],
    sectorOp: [],
    yearOp:{
        "from" : 1960,
        "to": 2021,
    },
    statusOp: [],
    incomeOp: [],
    ppitypeOp: [],
};

function toolbar_open() {
    $('#toolbar').toggleClass('open');
};

function load_data(customOption)
{
    // const proxy = "https://cors-anywhere.herokuapp.com/";
    // const url = "https://5jp713qow1.execute-api.ap-northeast-2.amazonaws.com/sdp-map-get-data";
    const url = 'apis/data'

    $.ajax({
        dataType: "json",
        crossDomain:true,
        url: url,
        //to support IE
        cache : false,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',

    },

        success: function(requested)
        {
            let json=requested['body'];
            mapdata = data_process(json);
            load_map(mapdata, customOption);
            $.loading.end();
        },
        error : function(err){

            console.log("ERR", err);
        }
    });
}

// processing data
function data_process(rawdata)
{
    $.each(rawdata.features, function (key, val) {
        $.each(val.properties, function(col, option){
            if(option == null)
                option = ""
            switch(col) {
                case "fc_year":                    
                    option = (isNaN(option) ? "N/A" : Math.round(option));
                    break;

                case "ppi_status":
                    if (option.toLowerCase().includes("delay")){
                        option = "Delayed";
                    }
                    else if(option.toLowerCase().includes("cancel")){
                        option = "Canceled";
                    }
                    else {
                        option = "N/A";
                    }
                    break;

                case "type_of_ppi":
                    
                    if (option.toLowerCase().includes("green")){
                        option = "Greenfield";
                    }
                    else if(option.toLowerCase().includes("brown")){
                        option = "Brownfield";
                    }
                    else if(option.toLowerCase().includes("expans")){
                        option = "Expansion";
                    }
                    else {
                        option = "N/A";
                    }
                    break;
              }
            val.properties[col] = option;
        })              
    });
    
    return rawdata;
};

// setting a map 
function load_map(json,customOption){

    // /***************************
    //  *      Base map Layer     *
    // ***************************/

    mymap = L.map('mapwrap', {zoomControl: false}).setView([35,40],2.5);
    
    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGluYTAwNyIsImEiOiJja2hmZDNvOTgwNnVrMnJsNG1sOWtzcXNoIn0.Do0MCp-8-o2cv5cl-A2sNQ', 
    {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        subdomains: 'abcd',
        tileSize: 512,

        // zoom controller
        minZoom: 2,
        maxZoom: 16,
        zoomOffset: -1

    }).addTo(mymap);

    // prohibit dragging when mouse is over the filterbar
    $('#toolbar').on("mouseover", function(){ 
        mymap.dragging.disable();
        mymap.doubleClickZoom.disable();
        mymap.scrollWheelZoom.disable();
        mymap.keyboard.disable();
        mymap.boxZoom.disable(); 
    }).on("mouseout", function(){
        mymap.dragging.enable();
        mymap.doubleClickZoom.enable();
        mymap.scrollWheelZoom.enable();
        mymap.keyboard.enable();
        mymap.boxZoom.enable();  
    });
    try {
        let geoLayer = L.geoJson(json, {
            onEachFeature : addPopup,
            filter : geoJson_filter,
            pointToLayer: geoJson_pointToLayer 
        });

        mymap.addLayer(geoLayer);
                
        // Initialization
        updateStates(customOption);
        geoLayer.addData(json);

        // Updata when any change is detected
        detectChange(json, geoLayer, customOption);
        
        // Searchbox
        mymap.addControl( new L.Control.Search({
            // container: 'toolbar',
            position: 'topright',
            layer: geoLayer,
            initial: false,
            collapsed: true,

            moveToLocation: function(latlng, title, map) {
                map.setView(latlng,10);
                let targetmarker = markers.find(el => el.defaultOptions.title === title);
                targetmarker.openPopup();
            }
        }) 
        );

        // zoom box
        L.control.zoom({
            position: 'topright'
        }).addTo(mymap);


        L.easyButton({
            position: 'topright',
            states: [{
                        stateName: 'zoom-to-original',        // name the state
                        icon:      'fas fa-map',               // and define its properties
                        title:     'zoom to a original',      // like its title
                        onClick: function(btn, map) {       // and its callback
                            map.setView([35,40],2.5);
                            btn.state('zoom-to-original');    // change state on click!
                        }
                }]
            }).addTo(mymap);


    } catch(err){
        console.error(err);
    };
        
    // add to HTML
    options_to_html(json);

    // // back to original zoom
    // mymap.addControl(new L.Control.ZoomMin())
    
}

function addPopup(feature, layer) {
    var popupText = 
        "<p id='p_popup_detail'>"+
        "<strong style='color: #84b819; font-size:120%;' >" + feature.properties.project_name_wb + "</strong><br>" + 
        "<b>Country:</b> " + feature.properties.country + "<br>"+
        "<b>Income Group:</b> " + feature.properties.income_group + "<br>"+
        "<b>FC Year:</b> " + feature.properties.fc_year + "<br>"+
        "<b>Status:</b> " + feature.properties.ppi_status + "<br>"+
        "<b>Prime Sector:</b> " + feature.properties.sector + "<br>"+
        "<b>Sub Sector:</b> " + feature.properties.subsector + "<br>"+
        "<b>Problem:</b> " + feature.properties.reason_for_delay + "<br>"+
        "<b>Type of PPI:</b> " + feature.properties.type_of_ppi + "<br>"+
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
};

function geoJson_filter(feature) {
    // if no filter, select all
    const countryselect = (customOption.countryOp.length == 0) ? true : (customOption.countryOp.includes(feature.properties.country));
    const sectorselect = (customOption.sectorOp.length == 0) ? true : (sectorClass(customOption.sectorOp, feature.properties));
    const statusselect = (customOption.statusOp.length == 0) ? true : (customOption.statusOp.includes(feature.properties.ppi_status));
    const incomeselect = (customOption.incomeOp.length == 0) ? true : (customOption.incomeOp.includes(feature.properties.income_group));
    const ppitypeselect = (customOption.ppitypeOp.length == 0) ? true : (customOption.ppitypeOp.includes(feature.properties.type_of_ppi));
    const yearselect = yearIsincluded(feature, customOption.yearOp);
    return (countryselect && sectorselect && yearselect && incomeselect && statusselect && ppitypeselect);
}

function geoJson_pointToLayer(feature, latlng, layer) {

    const sector = feature.properties.sector;
    const subsector = feature.properties.subsector;
    const icon_color = sector_to_icon(sector);
    const icon_png = subsector_to_icon(subsector);

    const awesomemark = L.AwesomeMarkers.icon({
        icon: icon_png,
        prefix:'fa',
        markerColor: icon_color
    });

    const marker = new L.Marker(latlng, {
        title : feature.properties.project_name_wb,
        icon : awesomemark,
    });

    markers.push(marker);
    return marker;
};

function sector_to_icon(sector){
// sector
    switch (sector) {
        case "Energy":
            icon_color = 'green';
            break;
        case "ICT":
            icon_color = 'purple';
            break;
        case "Municipal Solid Waste":
            icon_color = 'orange';
            break;
        case "Transport":
            icon_color = 'blue';
            break;
        case "Water and sewerage":
            icon_color = 'gray';
            break;                        
        default:
            icon_color = 'red';
    };
    return icon_color;
}

function subsector_to_icon(subsector){
                //subsector
    switch (subsector) {
        case "Airports":
            icon_png = "plane-departure";
            break;
        case "Railways":
            icon_png = "subway";
            break;
        case "Electricity":
            icon_png = "bolt";
            break;
        case "Natural Gas":
            icon_png = "burn";
            break;
        case "ICT backbone":
            icon_png = "sitemap";
            break;
        case "Ports":
            icon_png = "ship";
            break;
        case "Roads":
            icon_png = "road";
            break;
        case "Treatment/Disposal":
            icon_png = "trash-alt";
            break;
        default:
            icon_png = 'globe';
    };
    return icon_png;
}

//////////////
/// filter ///
//////////////

function options_to_html(data){

    const property_list = getKeys(data);

    const geographical_set = arraytosortedSet(property_list["geographical"]);
    const sector_set = arraytosortedSet(property_list["sector"]);
    const status_set = arraytosortedSet(property_list["ppi_status"]);
    const income_set = arraytosortedSet(property_list["income_group"]);
    const ppitype_set = arraytosortedSet(property_list["type_of_ppi"]);
    
    var statusselect = document.getElementById('status-select');
    var incomeselect = document.getElementById('income-select');
    var ppitypeselect = document.getElementById('ppitype-select');

    // region select
    $(function(){
        var $select = $('#country-select');
        $.each(geographical_set, function(index, optgroup){
            var group = $('<optgroup class="optionlist" label="' + optgroup + '" />');
            $.each(country_to_geographical(optgroup), function(index, value){
                $('<option class="optionlist" />').html(value).appendTo(group);
            });
            group.appendTo($select);
        });
    });

    // sector select
    $(function(){
        var $select = $('#sector-select');
        $.each(sector_set, function(index, optgroup){
            var group = $('<optgroup label="' + optgroup + '" />');
            $.each(subsector_to_region(optgroup), function(index, value){
                $(`<option value="${optgroup}:${value}"/>`).html(value).appendTo(group);
            });
            group.appendTo($select);
        });
    });

    // status
    addOptionToSelect(status_set, statusselect);

// income
    addOptionToSelect(income_set, incomeselect);

    // ppi-type
    addOptionToSelect(ppitype_set, ppitypeselect);
}

function addOptionToSelect(option_set, select){
    for (let option of option_set.values()) {
        select.add(new Option(option, option));
    }
}

function updateStates(customOption) {

    // region
    $(document).ready(function() {
        let value;
        // country selection
        $('.country-select')
        .select2({
            placeholder: "Choose a Country"
        })
        .on('change.select2', function (el) {
            value = $(el.currentTarget).val();
            customOption.countryOp = [];
            for (let i = 0; i < value.length; i++) {
                customOption.countryOp.push(value[i]);}
        });

        // sector selection
        $('.sector-select')
        .select2({
            placeholder: "Choose a Sector"
        })
        .on('change', function (el) {
            value = $(el.currentTarget).val();
            customOption.sectorOp = [];
            for (let i = 0; i < value.length; i++) {
                customOption.sectorOp.push(value[i]);}
        });


        // FC year slider
        $('.js-range-slider').ionRangeSlider({
            type: "double",
            min: 1960,
            max: 2021,
            from: 1960,
            to: 2021,
            grid: true,
            prettify: function(date){
                return date.toString();
            },
            onChange: function (data) {
                // Called every time handle position is changed
                customOption.yearOp = {};
                customOption.yearOp["from"]=(data.from);
                customOption.yearOp["to"]=(data.to);
            }})

        // status selection
        $('.status-select')
        .select2({
            placeholder: "Choose Status"
        })
        .on('change', function (el) {
            value = $(el.currentTarget).val();
            customOption.statusOp = [];
            for (let i = 0; i < value.length; i++) {
                customOption.statusOp.push(value[i]);}
        });


        // income group selection
        $('.income-select')
        .select2({
            placeholder: "Choose an Income Group"
        })
        .on('change', function (el) {
            value = $(el.currentTarget).val();
            customOption.incomeOp = [];
            for (let i = 0; i < value.length; i++) {
                customOption.incomeOp.push(value[i]);}
        });
        
        // ppi type selection
        $('.ppitype-select')
        .select2({
            placeholder: "Choose a PPI Type"
        })
        .on('change', function (el) {
            value = $(el.currentTarget).val();
            customOption.ppitypeOp = [];
            for (let i = 0; i < value.length; i++) {
                customOption.ppitypeOp.push(value[i]);}
        });
    })
}

function detectChange(json, geoLayer, customOption) {

    for (let input of document.querySelectorAll('.select, .js-range-slider, #myCheck')) {
        //Listen to 'change' event of all inputs
        input.onchange = (e) => {
            geoLayer.clearLayers()
            updateStates(customOption)
            geoLayer.addData(json)   
        }
    }
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
function country_to_geographical(geographical) {;

    let input = mapdata;
    let array = getObjects(input, "geographical", geographical);
    let data = array.map(data => data.country);
    
    return arraytosortedSet(data);
};

function subsector_to_region(sector) {;

    let input = mapdata;
    let array = getObjects(input, "sector", sector);
    let data = array.map(data => data.subsector);

    return arraytosortedSet(data);
};

// Manage Range slider
function yearIsincluded(feature, yearOp)
{

    let    targetyear = feature.properties.fc_year;
    let dateFrom = yearOp["from"];
    let dateTo = yearOp["to"];
    
    if ((targetyear >= dateFrom) && (targetyear <= dateTo)) {
        return true;
    }
    return includeNA();
}

function sectorClass(sectorOp,properties){
    return sectorOp.includes(`${properties.sector}:${properties.subsector}`);
}

// checkbox checking
function includeNA() {
    // Get the checkbox
    return document.getElementById("myCheck").checked;
}

function arraytosortedSet(array){
    return Array.from(new Set(array)).sort();
}

function toggle_selectableOptgroup(){
    
    // Region // 
    $('.country-select').select2();

    $(document).on("click", "#select2-country-select-results strong", function(){

        let groupName = $(this).html()
        let options = $('.country-select option');
    
        $.each(options, function(key, value){
            if($(value)[0].parentElement.label.indexOf(groupName) >= 0){
                $(value).prop("selected", true);
            }
        });        

    $('.country-select').trigger("change");
    $('.country-select').select2('close'); 
    });

    // Sector // 
    $('.sector-select').select2();

    $(document).on("click", "#select2-sector-select-results strong", function(){

        let groupName = $(this).html()
        let options = $('.sector-select option');
    
        $.each(options, function(key, value){
            if($(value)[0].parentElement.label.indexOf(groupName) >= 0){
                $(value).prop("selected", true);
            }
        });        

    $('.sector-select').trigger("change");
    $('.sector-select').select2('close'); 
    })
}

// load the map
$.loading.start('Loading...');

load_data(customOption);

/* sidemenu */
toggle_selectableOptgroup();

/*clear button*/
// clear filters - select2 & js slider
$('.clearfilter').on('click', function (){
    $('#myCheck').checked="true";
    $('.select').val(null).trigger('change');
    $('.js-range-slider').data("ionRangeSlider").update({
        from: 1960,
        to: 2021,
    });
});

for (let input of document.querySelectorAll('#clearEach')) {
    input.onclick = (e) =>{
        switch(input.className) {
            case "region_clear":
                $('.country-select').val(null).trigger('change');
                break;
            case "sector_clear":
                $('.sector-select').val(null).trigger('change');
                break;
            case "fcyear_clear":
                $('.js-range-slider').data("ionRangeSlider").update({
                    from: 1960,
                    to: 2021,
                })
                break;
            case "status_clear":
                $('.status-select').val(null).trigger('change');
                break;
            case "income_clear":
                $('.income-select').val(null).trigger('change');
                break;
            case "ppitype_clear":
                $('.ppitype-select').val(null).trigger('change');
                break;
            default:
        }
    }
}

/////////////
// tooltip //
/////////////
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();   
});
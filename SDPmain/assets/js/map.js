// filterArray
let customOption = {
    countryOp: [],
    sectorOp: [],
    yearOp:{
        "from" : 1960,
        "to": 2021,
    },
    statusOp: [],
    incomeOp: [],
    ppitypeOp: [],
}

// load the map
$.loading.start('Loading...')

var mapdata;
load_data(customOption);

/* sidemenu */
function toolbar_open() {
    $toolbar = $('#toolbar');
    $toolbar.toggleClass('open');
};
toggle_selectableOptgroup();


//tutorial//
currentIndex = 0;
minIndex = 0;
maxIndex = 3;

function on() {
    $toolbar = $('#toolbar');
    className = $('#toolbar').attr('class');

    document.getElementById("tutorial").style.display = "block";
    if (className != 'open'){
        $('#toolbar').toggleClass('open');
    }

    currentIndex = 0;
    showpage(currentIndex);
  }
  
function off() {
    document.getElementById("tutorial").style.display = "none";
    if ($('#toolbar').attr('class') == 'open'){
        $('#toolbar').toggleClass('open');
    }
}

function tutorialpage(action) {
    if (action == previous){
        currentIndex--;
    }
    if (action == next){
        currentIndex++;
    }
    console.log(currentIndex);
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
    }
}

/*clear button*/
// clear filters - select2 & js slider
$('.clearfilter').on('click', function (){
    $('#myCheck').checked="true"
    $('.select').val(null).trigger('change');
    $('.js-range-slider').data("ionRangeSlider").update({
        from: 1960,
        to: 2021,
    })
})

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
                console.log("default");
            }
    }
}

function load_data(customOption)
{
    const proxy = "https://cors-anywhere.herokuapp.com/";
    const url = "https://5jp713qow1.execute-api.ap-northeast-2.amazonaws.com/sdp-map-get-data";
    $.ajax({
        dataType: "json",
        url: proxy+url,
        success: function(requested)
        {
            json=requested['body'];
            mapdata = data_process(json);
            load_map(mapdata, customOption);
            $.loading.end();
        }
    });
}

// processing data
function data_process(rawdata)
{
    // processing = JSON.stringify(rawdata);
    // console.log(rawdata);
    // console.log(processing);

    $.each(rawdata.features, function (key, val) {
        $.each(val.properties, function(i,j){
            switch(i) {
                case "fc_year":
                    if (isNaN(j)){
                        return true;
                    }
                    else{
                        j = Math.round(j);
                    }
                    val.properties[i] = j;
                    break;
                case "type_of_ppi":
                    if (j.toLowerCase().includes("green")){
                        j = "Greenfield";
                    }
                    else if(j.toLowerCase().includes("brown")){
                        j = "Brownfield";
                    }
                    else if(j.toLowerCase().includes("expans")){
                        j = "Expansion";
                    }
                    else if(j.toLowerCase().includes("n/a")){
                        j = "N/A";
                    }
                    else{
                        return true;
                    }
                    val.properties[i] = j;
                    break;
                case "ppi_status":
                    if (j.toLowerCase().includes("delay")){
                        j = "Delayed";
                    }
                    else if(j.toLowerCase().includes("cancel")){
                        j = "Canceled";
                    }
                    else{
                        return true;
                    }
                    val.properties[i] = j;
                    break;
              }
        })              
    });

    // console.log(processing);
    // console.log(processing);

    return rawdata;
};

// setting a map 
function load_map(json,customOption){

    // /***************************
    //  *      Base map Layer     *
    // ***************************/

    var mymap = L.map('mapwrap', {zoomControl: false}).setView([35,40],2.5);

    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGluYTAwNyIsImEiOiJja2hmZDNvOTgwNnVrMnJsNG1sOWtzcXNoIn0.Do0MCp-8-o2cv5cl-A2sNQ', {
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
    
    var markers=[];
    try{
        geoLayer = L.geoJson(json, {
            onEachFeature: function (feature, layer) {
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
                
            },

            filter: function(feature) {

                // if no filter, select all
                    countryselect = (customOption.countryOp.length == 0)? true : (customOption.countryOp.includes(feature.properties.country));
                    sectorselect = (customOption.sectorOp.length == 0)? true : (sectorClass(customOption.sectorOp,feature.properties));
                    statusselect = (customOption.statusOp.length == 0)? true : (customOption.incomeOp.includes(feature.properties.ppi_status));
                    incomeselect = (customOption.incomeOp.length == 0)? true : (customOption.incomeOp.includes(feature.properties.income_group));
                    ppitypeselect = (customOption.ppitypeOp.length == 0)? true : (customOption.ppitypeOp.includes(feature.properties.type_of_ppi));
                    yearselect = yearIsincluded(feature, customOption.yearOp);
                    return (countryselect&&sectorselect&&yearselect&&incomeselect&&statusselect&&ppitypeselect);
            },

            pointToLayer: function (feature, latlng, layer) {

                var sector = feature.properties.sector;
                var subsector = feature.properties.subsector;

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
                
                var awesomemark = L.AwesomeMarkers.icon({
                    icon: icon_png,
                    prefix:'fa',
                    markerColor: icon_color})

                var marker = new L.Marker(latlng, {
                    title : feature.properties.project_name_wb,
                    icon : awesomemark,
                });
                markers.push(marker);
                return marker;
            },
        });
        mymap.addLayer(geoLayer);
                
        // Initialization
        updateStates(customOption);
        geoLayer.addData(json);

        // Updata when any change is detected
        detectChange(json, geoLayer, customOption);
        
        // Searchbox
        var searchControl = mymap.addControl( new L.Control.Search({
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
        }) );

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
                }]}).addTo(mymap);


    } catch(err){
        console.error(err);
    };
        
    // add to HTML
    options_to_html(json);

    // // back to original zoom
    // mymap.addControl(new L.Control.ZoomMin())
    
}



//////////////
/// filter ///
//////////////

function options_to_html(data){

    var property_list = getKeys(data);

    var geographical_set = arraytosortedSet(property_list["geographical"]);
    var sector_set = arraytosortedSet(property_list["sector"]);
    var status_set = arraytosortedSet(property_list["ppi_status"]);
    var income_set = arraytosortedSet(property_list["income_group"]);
    var ppitype_set = arraytosortedSet(property_list["type_of_ppi"]);
    
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
    for (option of status_set.values()) {
        stnew = new Option(option, option);
        statusselect.add(stnew);
        stnew.disabled = false;
    }    

    // income
    for (option of income_set.values()) {
        icnew = new Option(option, option);
        incomeselect.add(icnew);
        icnew.disabled = false;
    }    

    // ppi-type
    for (option of ppitype_set.values()) {
        ptnew = new Option(option, option);
        ppitypeselect.add(ptnew);
        ptnew.disabled = false;
    }    
    // console.log(select.options[select.selectedIndex].value);
}

function updateStates(customOption) {

    console.log(customOption);
  
    // region
    $(document).ready(function() {

        // country selection
        $('.country-select')
        .select2({
            placeholder: "Choose a Country"
        })
        .on('change.select2', function (el) {
            value = $(el.currentTarget).val();
            console.log("region selected");
            customOption.countryOp = [];
            for (i = 0; i < value.length; i++) {
                customOption.countryOp.push(value[i]);}
        });

        // sector selection
        $('.sector-select')
        .select2({
            placeholder: "Choose a Sector"
        })
        .on('change', function (el) {
            value = $(el.currentTarget).val();
            console.log("sector selected");
            customOption.sectorOp = [];
            for (i = 0; i < value.length; i++) {
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
                // console.log(customOption);
            }})

        // status selection
        $('.status-select')
        .select2({
            placeholder: "Choose Status"
        })
        .on('change', function (el) {
            value = $(el.currentTarget).val();
            console.log("Status selected");
            customOption.statusOp = [];
            for (i = 0; i < value.length; i++) {
                customOption.statusOp.push(value[i]);}
        });


        // income group selection
        $('.income-select')
        .select2({
            placeholder: "Choose an Income Group"
        })
        .on('change', function (el) {
            value = $(el.currentTarget).val();
            console.log("Income group selected");
            customOption.incomeOp = [];
            for (i = 0; i < value.length; i++) {
                customOption.incomeOp.push(value[i]);}
        });
        
        // ppi type selection
        $('.ppitype-select')
        .select2({
            placeholder: "Choose a PPI Type"
        })
        .on('change', function (el) {
            value = $(el.currentTarget).val();
            console.log("PPI type selected");
            customOption.ppitypeOp = [];
            for (i = 0; i < value.length; i++) {
                customOption.ppitypeOp.push(value[i]);}
        });
    })
}

function detectChange(json, geoLayer, customOption) {

    for (let input of document.querySelectorAll('.select, .js-range-slider, #myCheck')) {
        //Listen to 'change' event of all inputs
        input.onchange = (e) => {
            console.log("change detected");
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

    input = mapdata;
    array = getObjects(input, "geographical", geographical);

    // console.log(array);

    data = array.map(data => data.country);
    data = Array.from(new Set(data)).sort();

    return data;
};

//
function subsector_to_region(sector) {;

    input = mapdata;
    array = getObjects(input, "sector", sector);

    // console.log(array);

    data = array.map(data => data.subsector);
    data = Array.from(new Set(data)).sort();
    return data;
};

// Manage Range slider
function yearIsincluded(feature, yearOp)
{
    let targetyear = feature.properties.fc_year;
    dateFrom = yearOp["from"];
    dateTo = yearOp["to"];
    
    if (targetyear == ("N/A"||"BLANK")){
        return includeNA();
    }
    else if ((targetyear >= dateFrom) && (targetyear <= dateTo))
    {
        return true;
    }
    return false;
}

function sectorClass(sectorOp,properties){
    if (sectorOp.includes(`${properties.sector}:${properties.subsector}`)){
        return true;
    }
    else{
        return false;
    }
}

// checkbox checking
function includeNA() {
    // Get the checkbox
    var checkBox = document.getElementById("myCheck");
  
    // If the checkbox is checked, display the output text
    if (checkBox.checked == true){
      return true;
    } else {
      return false;
    }
  }

function arraytosortedSet(array)
{
    array = Array.from(new Set(array)).sort();
    return array;
}


function toggle_selectableOptgroup()
{
    ////////////
    // Region // 
    ////////////

    $('.country-select').select2();

    $(document).on("click", "#select2-country-select-results  strong", function(){

        var groupName = $(this).html()
        var options = $('.country-select option');
    
        $.each(options, function(key, value){
            console.log($(value).prop("selected"), $(key).prop)
            if($(value)[0].parentElement.label.indexOf(groupName) >= 0){
                if($(value).prop("selected")== true){
                    $(value).prop("selected",false);
                    return true;
                }
                else if($(value).prop("selected")== false){
                    $(value).prop("selected",true);
                    return true;
                }
            }
            else
            {
                return true;
            }
        });        

    $('.country-select').trigger("change");
    $('.country-select').select2('close'); 

    })

    ////////////
    // Sector // 
    ////////////

    $('.sector-select').select2();

    $(document).on("click", "#select2-sector-select-results  strong", function(){

        var groupName = $(this).html()
        var options = $('.sector-select option');
    
        $.each(options, function(key, value){
            console.log($(value).prop("selected"), $(key).prop)
            if($(value)[0].parentElement.label.indexOf(groupName) >= 0){
                if($(value).prop("selected")== true){
                    $(value).prop("selected",false);
                    return true;
                }
                else if($(value).prop("selected")== false){
                    $(value).prop("selected",true);
                    return true;
                }
            }
            else
            {
                return true;
            }
        });        

    $('.sector-select').trigger("change");
    $('.sector-select').select2('close'); 

    })

}


/////////////
// tooltip //
/////////////
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();   
  });
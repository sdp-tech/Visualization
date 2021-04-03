var mapdata;
var geoLayer;
var idnameDict = new Object();
var bounds = [[-90,-180],   [90,180]];
var mymap = L.map('mapwrap', { 
        zoomControl: false,
        maxBounds: bounds
     }).setView([35, 40], 2.5);;


// Marker Clusterer using Donut Clustering
var markers = L.DonutCluster({
    chunkedLoading: true
}, {
    key: 'sector',
    sumField : 'value', 
    order : ['Energy', 'ICT', 'Municipal Solid Waste', 'Transport', "Water and sewerage"], 
    // title is the visible value when mouse over to cluster
    title: { 
        'Energy' : 'Energy',
        'ICT' : "ICT", 
        'Municipal Solid Waste' : 'Municipal Solid Waste', 
        'Transport' : 'Transport', 
        'Water and sewerage' : "Water and sewerage"
        },
    arcColorDict: {
        "Energy": 'green',
        "ICT" : 'purple',
        "Municipal Solid Waste" : 'orange',
        "Transport" : 'blue',
        "Water and sewerage" : 'gray',
        }
});

var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    isMobile = true;
    mobileset();
}

function iOS() {
    return [
      'iPhone Simulator',
      'iPhone'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

// filterArray
var customOption = {
    countryOp: [],
    sectorOp: [],
    yearOp: {
        "from": 1960,
        "to": 2021,
    },
    statusOp: [],
    incomeOp: [],
    ppitypeOp: [],
};

function mobileset(){
    $('.js-select2-multi').on('select2:opening select2:closing', function( event ) {
        var $searchfield = $('.select2-search__field');
        $searchfield.attr('inputmode', 'none');
        $searchfield.prop('readonly', 'readonly');
    });
}

function toolbar_open() {
    document.getElementById("toolbar").classList.toggle('open');
    setTimeout('$(".sidebar").removeAttr("disabled")', 100);
};

function load_data(customOption) {

    const url = 'apis/data'

    $.ajax({
        dataType: "json",
        crossDomain: true,
        url: url,
        //to support IE
        cache: false,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },

        success: function (requested) {
            let json = requested['body'];
            mapdata = data_process(json);
            load_map(mapdata, customOption);
            options_to_html(json);
            $.loading.end();
        },
        error: function (err) {
            console.log("ERR", err);
        }
    });
}

// processing data
function data_process(json) {
    json.forEach((element) => {
        Object.keys(element.properties).forEach((col) => {
            let option = element.properties[col];

            if (option == null)
                option = ""

            switch (col) {
                case "fc_year":
                    option = (isNaN(option) ? 0 : Math.round(option));
                    break;
                case "ppi_status":
                    if (option.toLowerCase().includes("delay")) {
                        option = "Delayed";
                    }
                    else if (option.toLowerCase().includes("cancel")) {
                        option = "Canceled";
                    }
                    else {
                        option = "N/A";
                    }
                    break;
                case "type_of_ppi":
                    if (option.toLowerCase().includes("green")) {
                        option = "Greenfield";
                    }
                    else if (option.toLowerCase().includes("brown")) {
                        option = "Brownfield";
                    }
                    else if (option.toLowerCase().includes("expans")) {
                        option = "Expansion";
                    }
                    else {
                        option = "N/A";
                    }
                    break;
            }
            element.properties[col] = option;
        })

        // add to dictionary
        idnameDict[element._id]=element.properties.project_name_wb;
    });

    return json;
};

// setting a map 
function load_map(json, customOption) {

    // /***************************
    //  *      Base map Layer     *
    // ***************************/
    // mymap = L.map('mapwrap', { zoomControl: false }).setView([35, 40], 2.5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
            tileSize: 512,
            noWrap: false,
            // zoom controller
            minZoom: 2,
            maxZoom: 16,
            zoomOffset: -1

        }).addTo(mymap);


    set_filter_touch_options();

    try {
        // markers
        geoLayer = L.geoJson(json, {
            onEachFeature: addPopup,
            filter: geoJson_filter,
            pointToLayer: geoJson_pointToLayer
        });
        
        mymap.fitBounds(geoLayer.getBounds());

        markers.addLayer(geoLayer);
        mymap.addLayer(markers);
        
        // Initialization
        updateStates(customOption);

        // Updata when any change is detected
        reloadMap(json);

        // Searchbox
        mymap.addControl(new L.Control.Search({
            container: 'header__search',
            position: 'topright',
            layer: markers,
            initial: false,
            collapsed: true,

            moveToLocation: function (latlng, title, map) {
                map.setView(latlng, 10);
                let targetmarker = markers.find(el => el.defaultOptions.title === title);
                targetmarker.openPopup();
            }
        })
        );

        // zoom box
        L.control.zoom({
            position: isMobile ? 'bottomright':'topright'
        }).addTo(mymap);

        // zoom out to original level
        L.easyButton({
            position: isMobile ? 'bottomright':'topright',
            states: [{
                stateName: 'zoom-to-original',        // name the state
                icon: 'fas fa-map',               // and define its properties
                title: 'zoom to a original',      // like its title
                onClick: function (btn, map) {       // and its callback
                    map.setView([35, 40], 2.5);
                    btn.state('zoom-to-original');    // change state on click!
                }
            }]
        }).addTo(mymap);

        L.easyButton({
          position: isMobile ? "topright" : null,
          states: [
            {
              icon: "fas fa-filter",
              title: "mobile filter button",
              onClick: function (e) {
                $("#modal_filter").modal("show");
              },
            },
          ],
        }).addTo(mymap);

    } catch (err) {
        console.error(err);
    };

    // // back to original zoom
    // mymap.addControl(new L.Control.ZoomMin())
}

function addPopup(feature, layer) {
    let see_also_list = feature.properties.see_also
    if(see_also_list) {
        see_also_list = see_also_list.map((_id) => idnameDict[_id]).join(', ');
    }

    var popupText =
        `<p id=p_popup_detail>
            <strong id=p_popup-title> ${feature.properties.project_name_wb}</strong><br>
            <b>Country :</b> ${feature.properties.country}<br>
            <b>Income Group :</b> ${feature.properties.income_group}<br>
            <b>FC Year :</b> ${feature.properties.fc_year}<br>
            <b>Status :</b> ${feature.properties.ppi_status}<br>
            <b>Primary Sector :</b> ${feature.properties.sector}<br>
            <b>Sub Sector :</b>${feature.properties.subsector}<br>
            <b>Problem :</b>${feature.properties.reason_for_delay}<br>
            <b>Type of PPI :</b>${feature.properties.type_of_ppi}<br>
            <b>See also :</b> ${see_also_list}<br>
            <p id=linked_p_popup_detail>
                <b><a href=${feature.properties.urls} target=_blank rel=noopener noreferrer>URL</a>
            </p>
        </p>
        `

    // <button id=seealso onclick=addLayerToMap(${feature.properties.project_name_wb})>See also</button><br>


    layer.bindPopup(popupText, {
        closeButton: true,
        offswet: L.point(0, -20)
    });

    layer.on('click', function () {
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
    const icon_color = sector_to_color(sector);
    const icon_png = subsector_to_icon(subsector);

    const awesomemark = L.AwesomeMarkers.icon({
        icon: icon_png,
        prefix: 'fa',
        markerColor: icon_color
    });

    const marker = new L.Marker(latlng, {
        // title is not the visible one. only for clustering
        title: feature.properties.project_name_wb,
        sector : sector,
        icon: awesomemark,
    });
    
    return marker;
};

function sector_to_color(sector) {
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

function subsector_to_icon(subsector) {
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

// prohibit dragging when mouse is over the filterbar
function set_filter_touch_options(){
    $('#toolbar').on("mouseover", function () {
        mymap.touchZoom.disable()
        mymap.dragging.disable();
        mymap.doubleClickZoom.disable();
        mymap.scrollWheelZoom.disable();
        mymap.keyboard.disable();
        mymap.boxZoom.disable();
    }).on("mouseout", function () {
        mymap.dragging.enable();
        mymap.doubleClickZoom.enable();
        mymap.scrollWheelZoom.enable();
        mymap.keyboard.enable();
        mymap.boxZoom.enable();
    });

}
//////////////
/// filter ///
//////////////

function options_to_html(data) {

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
    $(function () {
        var $select = $('#country-select');
        $.each(geographical_set, function (index, optgroup) {
            var group = $('<optgroup class="optionlist" label="' + optgroup + '" />');
            $.each(country_to_geographical(optgroup), function (index, value) {
                $('<option class="optionlist" />').html(value).appendTo(group);
            });
            group.appendTo($select);
        });
    });

    // sector select
    $(function () {
        var $select = $('#sector-select');
        $.each(sector_set, function (index, optgroup) {
            var group = $('<optgroup label="' + optgroup + '" />');
            $.each(subsector_to_region(optgroup), function (index, value) {
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

function addOptionToSelect(option_set, select) {
    for (let option of option_set.values()) {
        select.add(new Option(option, option));
    }
}

function updateStates(customOption) {

    // region
    $(document).ready(function () {
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
                    customOption.countryOp.push(value[i]);
                }
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
                    customOption.sectorOp.push(value[i]);
                }
            });


        // FC year slider
        $('.js-range-slider').ionRangeSlider({
            type: "double",
            min: 1960,
            max: 2021,
            from: 1960,
            to: 2021,
            grid: true,
            prettify: function (date) {
                return date.toString();
            },
            onChange: function (data) {
                // Called every time handle position is changed
                customOption.yearOp["from"] = (data.from);
                customOption.yearOp["to"] = (data.to);
            }
        })

        // status selection
        $('.status-select')
            .select2({
                placeholder: "Choose Status"
            })
            .on('change', function (el) {
                value = $(el.currentTarget).val();
                customOption.statusOp = [];
                for (let i = 0; i < value.length; i++) {
                    customOption.statusOp.push(value[i]);
                }
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
                    customOption.incomeOp.push(value[i]);
                }
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
                    customOption.ppitypeOp.push(value[i]);
                }
            });
    })
}

function reloadMap(json) {

    for (let input of document.querySelectorAll('.select, .js-range-slider, #myCheck')) {
        //Listen to 'change' event of all inputs
        input.onchange = (e) => {
            markers.clearLayers()
            let geoLayer = L.geoJson(json, {
                onEachFeature: addPopup,
                filter: geoJson_filter,
                pointToLayer: geoJson_pointToLayer
            });
            markers.addLayer(geoLayer)
            mymap.addLayer(markers);
        }
    }
}

//feature array 
function getKeys(input) {
    // Step 1, group feature values by property.
    let out = input.reduce((acc, { properties }) => {
        Object.entries(properties).forEach(([key, val]) => {
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
function country_to_geographical(geographical) {

    let input = mapdata;
    let array = getObjects(input, "geographical", geographical);
    let data = array.map(data => data.country);

    return arraytosortedSet(data);
};

function subsector_to_region(sector) {
    let input = mapdata;
    let array = getObjects(input, "sector", sector);
    let data = array.map(data => data.subsector);

    return arraytosortedSet(data);
};

// Manage Range slider
function yearIsincluded(feature, yearOp) {

    let targetyear = feature.properties.fc_year;
    let dateFrom = yearOp["from"];
    let dateTo = yearOp["to"];

    if(includeNA()){
        return ((dateFrom <= targetyear && targetyear <= dateTo) || targetyear == 0);            
    }
    return (dateFrom <= targetyear && targetyear <= dateTo);
}

function sectorClass(sectorOp, properties) {
    return sectorOp.includes(`${properties.sector}:${properties.subsector}`);
}

// checkbox checking
function includeNA() {
    // Get the checkbox
    return document.getElementById("myCheck").checked;
}

function arraytosortedSet(array) {
    return Array.from(new Set(array)).sort();
}

function toggle_selectableOptgroup() {

    // Region // 
    $('.country-select').select2();

    $(document).on("click", "#select2-country-select-results strong", function () {

        let groupName = $(this).html()
        let options = $('.country-select option');

        $.each(options, function (key, value) {
            if ($(value)[0].parentElement.label.indexOf(groupName) >= 0) {
                $(value).prop("selected", true);
            }
        });

        $('.country-select').trigger("change");
        $('.country-select').select2('close');
    });

    // Sector // 
    $('.sector-select').select2();

    $(document).on("click", "#select2-sector-select-results strong", function () {

        let groupName = $(this).html()
        let options = $('.sector-select option');

        $.each(options, function (key, value) {
            if ($(value)[0].parentElement.label.indexOf(groupName) >= 0) {
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
$('.clearfilter').on('click', function () {
    $('#myCheck').checked = "true";
    $('.select').val(null).trigger('change');
    $('.js-range-slider').data("ionRangeSlider").update({
        from: 1960,
        to: 2021,
    });
});

for (let input of document.querySelectorAll('#clearEach')) {
    input.onclick = (e) => {
        switch (input.className) {
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


////////////////

var dataLayerGroup;

function addLayerToMap(subject){

    // remove geoLayer
    if (mymap.hasLayer(geoLayer)){
        geoLayer.remove();
    }
    //remove the layer from the map entirely
    if (mymap.hasLayer(dataLayerGroup)){
        dataLayerGroup.remove();
    }

    //add the data layer and style based on attribute. 
    dataLayerGroup = L.geoJson(mapdata, {
        onEachFeature: addPopup,
        filter: function (feature){
            
            if(feature.properties.see_also)
                return (feature.properties.see_also).includes(subject)
            return false     
        },
        pointToLayer: geoJson_pointToLayer
    });

    markers.addLayer(dataLayerGroup);
    mymap.addLayer(markers);

}
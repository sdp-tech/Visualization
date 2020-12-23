var map = L.map('mapwrap').setView([40, -120], 4);


L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  maxZoom: 18,
  id: 'mapbox.streets'
}).addTo(map);

$.getJSON("./temp/output.json", function(json) {

  geoLayer = L.geoJson(json, {

    style: function(feature) {
      var lat = feature.properties.lat;
      if (lat >= 50) {
        return {
          color: "red"
        }; 
      }
      else if (lat >= 40) {
        return {
          color: "orange"
        };
      } else if (lat >= 20) {
        return {
          color: "yellow"
        };
      } else {
        return {
          color: "green"
        }
      }
    },

    onEachFeature: function(feature, layer) {

      var popupText = "<b>Country:</b> " + feature.properties.country +
        "<br><b>Sector:</b> " + feature.properties.sector +
        "<br><a href='" + feature.properties.urls + "'>More info</a>";

      layer.bindPopup(popupText, {
        closeButton: true,
        offset: L.point(0, -20)
      });
      layer.on('click', function() {
        layer.openPopup();
      });
    },

    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: 10,
      });
    },
  }).addTo(map);
});

L.marker([51.930295,4.515209], {icon: L.AwesomeMarkers.icon({icon: 'shopping-cart', prefix: 'fa', markerColor: 'blue'}) }).addTo(map);


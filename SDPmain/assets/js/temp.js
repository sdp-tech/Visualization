var map = L.map('mapwrap').setView([40, -120], 4);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  maxZoom: 18,
  id: 'mapbox.streets'
}).addTo(map);

$.getJSON('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson', function(json) {

  geoLayer = L.geoJson(json, {

    style: function(feature) {
      var mag = feature.properties.mag;
      if (mag >= 4.0) {
        return {
          color: "red"
        }; 
      }
      else if (mag >= 3.0) {
        return {
          color: "orange"
        };
      } else if (mag >= 2.0) {
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

      var popupText = "<b>Magnitude:</b> " + feature.properties.mag +
        "<br><b>Location:</b> " + feature.properties.place +
        "<br><a href='" + feature.properties.url + "'>More info</a>";

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
        radius: Math.round(feature.properties.mag) * 3,
      });
    },
  }).addTo(map);
});
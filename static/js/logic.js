//api call on USGS to get earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function (eqData) {
  createFeatures(eqData.features);
});

// function for magnitude
function markerSize(magnitude) {
  return magnitude * 25000;
};

// color function for magnitude
function getColor(mag) {

  var colors = ['whitesmoke', 'skyblue', 'blue', 'darkblue', 'navy', 'black'];

  return mag > 5 ? colors[5] :
    mag > 4 ? colors[4] :
      mag > 3 ? colors[3] :
        mag > 2 ? colors[2] :
          mag > 1 ? colors[1] :
            colors[0];
};

function createFeatures(eqData) {

  var earthquakes = L.geoJSON(eqData, {

    // feature popup information 
    onEachFeature: function (feature, layer) {
      layer.bindPopup("<h3 > Magnitude: " + feature.properties.mag +
        "</h3><h3>Location: " + feature.properties.place +
        "</h3><hr><h3>" + new Date(feature.properties.time) + "</h3>");
    },

    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {
          radius: markerSize(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: .8,
          color: 'grey',
          weight: .5
        })
    }
  });

  createMap(earthquakes);
};

function createMap(earthquakes) {

  // create layers
  let mapboxUrl = "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}";


  let lightmap = L.tileLayer(mapboxUrl, { id: 'mapbox.light', maxZoom: 20, accessToken: API_KEY });
  let outdoorsmap = L.tileLayer(mapboxUrl, { id: 'mapbox.run-bike-hike', maxZoom: 20, accessToken: API_KEY });
  let satellitemap = L.tileLayer(mapboxUrl, { id: 'mapbox.streets-satellite', maxZoom: 20, accessToken: API_KEY });


  // object layer base map
  var baseMaps = {
    "Grayscle": lightmap,
    "Outdoors": outdoorsmap,
    "Satellite Map": satellitemap
  };

  // object layer overlay
  var overlayMaps = {
    "Earthquakes": earthquakes,
  };

  // lightmap and earthquakes layers 
  var myMap = L.map("map", {
    center: [39.8283, -98.5795],
    zoom: 3,
    layers: [lightmap, earthquakes]
  });

  // map layer controls
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // legend 
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      magnitudes = [0, 1, 2, 3, 4, 5],
      labels = [];

    div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>"
    // interval labels
    for (var i = 0; i < magnitudes.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
        magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);
}
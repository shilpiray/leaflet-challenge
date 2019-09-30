// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data){
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
    console.log(data.features);
});

var legend = L.control({position:'bottomright'});
legend.onAdd =  function(map){
  var div = L.DomUtil.create('div','info legend'),
  grades = [0,1,2,3,4,5];
  for (var i = 0; i < grades.length;i++){
    div.innerHTML += 
    '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  return div;
};




var tectonicplates = new L.LayerGroup();

function createFeatures(earthquakeData){
    // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake

  var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng);
  }, style: style,
      onEachFeature: function(feature, layer) {
        layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
      }
  });
  createMap(earthquakes);
}

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",function(platedata){
  L.geoJson(platedata, {
    color: "orange",
    weight: 2
  })
  // add the tectonicplates layer to the map.
  .addTo(tectonicplates);  
});

//function to get colors
function getColor(d) {
    return d > 5 ? 'red' :
        d > 4 ? 'darkorange' :
        d > 3 ? 'tan' :
        d > 2 ? 'yellow' :
        d > 1 ? 'darkgreen' :
                'lightgreen';
}


// function for style
function style(feature) {
  return {
    color: "black",
    fillColor: getColor(feature.properties.mag),
    weight: 0.9,
    opacity: 1,
    fillOpacity: 0.9,
    radius: (feature.properties.mag) * 5
  };
}

function createMap(earthquakes){
    // Define streetmap and darkmap layers
    var graymap_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy",
    maxZoom: 18,
    accessToken:"pk.eyJ1IjoicmF5c2hpbHBpIiwiYSI6ImNrMG80cmdieTAzcDAzbW11ZTJ6ZXQ1a2UifQ.tasF5_SyP3lzSOUmvVLswQ"
  });

  var satellitemap_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy",
    maxZoom: 18,
    accessToken: "pk.eyJ1IjoicmF5c2hpbHBpIiwiYSI6ImNrMG80cmdieTAzcDAzbW11ZTJ6ZXQ1a2UifQ.tasF5_SyP3lzSOUmvVLswQ"
  });

  var outdoors_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy",
    maxZoom: 18,
    accessToken: "pk.eyJ1IjoicmF5c2hpbHBpIiwiYSI6ImNrMG80cmdieTAzcDAzbW11ZTJ6ZXQ1a2UifQ.tasF5_SyP3lzSOUmvVLswQ"
  });

   // Define a baseMaps object to hold our base layers
   var baseMaps = {
       "Satellite" : satellitemap_background,
       "Grayscale" : graymap_background,
       "Outdoors" : outdoors_background
   };

   // Create overlay object to hold our overlay layer
   var overlayMap = {
       Earthquakes : earthquakes,
       Fault_lines :  tectonicplates
   };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map",{
        center:[
            37.09,-95.71
        ],
        zoom :5,
        layers : [satellitemap_background,earthquakes]
    });

    

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map

  L.control.layers(baseMaps, overlayMap, {
    style: style,
    collapsed: false
  }).addTo(myMap);
  legend.addTo(myMap);
}

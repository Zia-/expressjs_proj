// Fix mapbox token
L.mapbox.accessToken = 'pk.eyJ1IjoiemlhLW0iLCJhIjoiQjM5aVpfTSJ9.s_U7YxQCK-Zq5SaJemH5bA';

// Construct a bounding box for this map that the user cannot move out of
var minlat = 54.025266, minlon = -4.840972, maxlat = 54.423030, maxlon = -4.311309, zoom;
var southWest = L.latLng(minlat, minlon),
    northEast = L.latLng(maxlat, maxlon),
    bounds = L.latLngBounds(southWest, northEast);

// Function to load custom url to mongo on mouse events
jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}

// Function to load data from custom url onto map
function loaddata(zoom){
  var url = 'http://localhost:3002/osmnodes?minlat=' + minlat.toString()
            + '&minlon=' + minlon.toString() + '&maxlat=' + maxlat.toString()
            + '&maxlon=' + maxlon.toString() + '&zoom=' + zoom.toString()
  $.loadScript(url, function(){
      osmnodes_js = osmnodes_js.map(function (p) { return [p[1], p[0]]; });
      var heatMap = L.heatLayer(osmnodes_js,
                {gradient: {0.4: 'gold', 0.65: 'lime', 1: 'red'}});
      heatMap.setOptions({blur: 0});
      // Other options can be found here https://github.com/Leaflet/Leaflet.heat
      heatMap.setOptions({radius: 25});
      // if (true){
        // map.removeLayer(heatMap);
        // window.alert("sometext");
        // heatMap.addTo(map);
      // } else {
        // heatMap.addTo(map);
      // }
      // console.log(map.hasLayer(heatMap));

      // console.log(map.getLayer(1));

        //  console.log(map.layer(heatMap));

      if (map.hasLayer(heatMap)) {
            console.log("has");
            map.removeLayer(heatMap);
            map.addLayer(heatMap);
        } else {
          console.log("not has");
            map.addLayer(heatMap);
        }

        // map.eachLayer(function (layer) {
  	    //      console.log(map.hasLayer(layer));
        //     //  layer.bindPopup('Hello');
        //    });

      // window.alert("sometext");

  })
}

// Initialize the map
var map = L.mapbox.map('map', 'mapbox.dark', {
          maxBounds: bounds,
          maxZoom: 19,
          minZoom: 7
});

// Load map function
map.on('load', function () {
  zoom = map.getZoom();
  loaddata(zoom);
});

// zoom the map to that bounding box.
// fitBounds must come after load event and before zoom event.
map.fitBounds(bounds);

// Mouse zoom event
map.on('zoomend', function(){
  zoom = map.getZoom()
  minlat = map.getBounds([0])["_southWest"]["lat"];
  minlon = map.getBounds([0])["_southWest"]["lng"];
  maxlat = map.getBounds([0])["_northEast"]["lat"];
  maxlon = map.getBounds([0])["_northEast"]["lng"];
  loaddata(zoom);
})

// Mouse drag event
map.on('dragend', function(){
  zoom = map.getZoom()
  minlat = map.getBounds([0])["_southWest"]["lat"];
  minlon = map.getBounds([0])["_southWest"]["lng"];
  maxlat = map.getBounds([0])["_northEast"]["lat"];
  maxlon = map.getBounds([0])["_northEast"]["lng"];
  loaddata(zoom);
})

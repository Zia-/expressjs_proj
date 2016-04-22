// Function to load custom url to mongo on mouse events
jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}

// Fix mapbox token
L.mapbox.accessToken = 'pk.eyJ1IjoiemlhLW0iLCJhIjoiQjM5aVpfTSJ9.s_U7YxQCK-Zq5SaJemH5bA';

// Construct a bounding box for this map that the user cannot move out of
var southWest = L.latLng(54.025266, -4.840972),
    northEast = L.latLng(54.423030, -4.311309),
    bounds = L.latLngBounds(southWest, northEast);

// Initialize the map
var map = L.mapbox.map('map', 'mapbox.dark', {
          maxBounds: bounds,
          maxZoom: 19,
          minZoom: 7
          });

// zoom the map to that bounding box
map.fitBounds(bounds);

var minlat = 54.025266, minlon = -4.840972, maxlat = 54.423030, maxlon = -4.311309;

// Mouse zoom event
map.on('zoomend', function(){
  minlat = map.getBounds([0])["_southWest"]["lat"];
  minlon = map.getBounds([0])["_southWest"]["lng"];
  maxlat = map.getBounds([0])["_northEast"]["lat"];
  maxlon = map.getBounds([0])["_northEast"]["lng"];
})

// Mouse drag event
map.on('dragend', function(){
    minlat = map.getBounds([0])["_southWest"]["lat"];
    minlon = map.getBounds([0])["_southWest"]["lng"];
    maxlat = map.getBounds([0])["_northEast"]["lat"];
    maxlon = map.getBounds([0])["_northEast"]["lng"];

  var url = 'http://localhost:3002/osmnodes?minlat=' + minlat.toString()
            + '&minlon=' + minlon.toString() + '&maxlat=' + maxlat.toString()
            + '&maxlon=' + maxlon.toString()

  $.loadScript(url, function(){
      osmnodes_js = osmnodes_js.map(function (p) { return [p[1], p[0]]; });
      var heatMap = L.heatLayer(osmnodes_js,
                {gradient: {0.4: 'gold', 0.65: 'lime', 1: 'red'}});
      heatMap.setOptions({blur: 0});
      // Other options can be found here https://github.com/Leaflet/Leaflet.heat
      heatMap.setOptions({radius: 25});
      heatMap.addTo(map);
  })
})

var url = 'http://localhost:3002/osmnodes?minlat=' + minlat.toString()
          + '&minlon=' + minlon.toString() + '&maxlat=' + maxlat.toString()
          + '&maxlon=' + maxlon.toString()

$.loadScript(url, function(){
    osmnodes_js = osmnodes_js.map(function (p) { return [p[1], p[0]]; });
    var heatMap = L.heatLayer(osmnodes_js,
              {gradient: {0.4: 'gold', 0.65: 'lime', 1: 'red'}});
    heatMap.setOptions({blur: 0});
    // Other options can be found here https://github.com/Leaflet/Leaflet.heat
    heatMap.setOptions({radius: 25});
    heatMap.addTo(map);
})

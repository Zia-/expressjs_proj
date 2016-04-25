// Fix mapbox token
L.mapbox.accessToken = 'pk.eyJ1IjoiemlhLW0iLCJhIjoiQjM5aVpfTSJ9.s_U7YxQCK-Zq5SaJemH5bA';

// Construct a bounding box for this map that the user cannot move out of
var minlatbound = 54.025266, minlonbound = -4.840972, maxlatbound = 54.423030, maxlonbound = -4.311309;
var southWestbound = L.latLng(minlatbound, minlonbound),
    northEastbound = L.latLng(maxlatbound, maxlonbound),
    bounds = L.latLngBounds(southWestbound, northEastbound);

// Function to load custom url to mongo on mouse events
jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}

// Function to handle how many requests must be send to complete all tiles
var tileflag = [];
function tilerequests(minlattile, minlontile, maxlattile, maxlontile, zoom){
  // Calculate number of tiles should be there in the present screen
  // 180/Math.pow(2, zoom) and 360/Math.pow(2, zoom) is giving ideal tile size at that zoom level
  // more info here: https://www.mapbox.com/tilemill/docs/manual/basics/#zoom-levels
  // Math.ceil() to round off to next integer
  // var numtiles = Math.ceil((maxlattile-minlattile)/(180/Math.pow(2, zoom))) *
  //                 Math.ceil((maxlontile-minlontile)/(360/Math.pow(2, zoom)))
  // // tileflag.push()
  // console.log(numtiles);
  console.log(zoom0_arr);
}

// Declaring min max lan lot tiles
var minlattile, minlontile, maxlattile, maxlontile, zoom;

// Function to load data from custom url onto map
function loaddata(minlattile, minlontile, maxlattile, maxlontile, zoom){
  // maxlontile = minlontile + 360/Math.pow(2, zoom);
  // maxlattile = minlattile + 180/Math.pow(2, zoom);
  // console.log(zoom);
  // console.log(maxlattile);
  // console.log(minlattile);
  // console.log(maxlontile);
  // console.log(minlontile);
  // console.log(zoom);

  // Check how many tile centers are lying within the given min max lat lon
  // Generate Db requests accordingly and insert all of them into one variable.
  tilerequests();



  var url = 'http://localhost:3002/osmnodes?minlat=' + minlattile.toString()
            + '&minlon=' + minlontile.toString() + '&maxlat=' + maxlattile.toString()
            + '&maxlon=' + maxlontile.toString() + '&zoom=' + zoom.toString()
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
        // var x;
        // console.log(map.hasLayer(x));
        // console.log(x);

        // var count = 0;
        // map.eachLayer(function (layer) {
        //   count += 1;
        //   console.log(layer);
        //   if (count == 4){
        //     map.removeLayer(heatMap);
        //     map.addLayer(heatMap, true);
        //     console.log("second");
        //   } else if (count == 3) {
        //     map.addLayer(heatMap, true);
        //     console.log("first");
        //   }
        // });

      function load_reload_data(){
        var heatMap_map;
        var count = 0;
        map.eachLayer(function (layer) {
          count += 1;
          if (count == 4){
              heatMap_map = layer; // heatMap_map and heatMap are different objects.
          }
        })

        if (map.hasLayer(heatMap_map)) { // We cant pass heatMap obj to hasLayer also. Dunno why!
            map.removeLayer(heatMap_map); // We cant pass simply heatMap object here.
            map.addLayer(heatMap);
        } else {
          map.addLayer(heatMap);
        }
      }

      load_reload_data();

        // map.eachLayer(function (layer) {
  	    //      var x = layer;
        //      console.log(x);
        //      map.removeLayer(x);
        // //     //  layer.bindPopup('Hello');
        //    });

      // window.alert("sometext");

  })
}

// Initialize the map
var map = L.mapbox.map('map', 'mapbox.dark', {
          maxBounds: bounds,
          // maxZoom: 19,
          // minZoom: 7
          maxZoom: 19,
          minZoom: 14
});

// Load map function
map.on('load', function () {
  zoom = map.getZoom();
  minlattile = map.getBounds([0])["_southWest"]["lat"];
  minlontile = map.getBounds([0])["_southWest"]["lng"];
  maxlattile = map.getBounds([0])["_northEast"]["lat"];
  maxlontile = map.getBounds([0])["_northEast"]["lng"];
  loaddata(minlattile, minlontile, maxlattile, maxlontile, zoom);
});

// zoom the map to that bounding box.
// fitBounds must come after load event and before zoom event.
map.fitBounds(bounds);

// Mouse zoom event
map.on('zoomend', function(){
  zoom = map.getZoom()
  minlattile = map.getBounds([0])["_southWest"]["lat"];
  minlontile = map.getBounds([0])["_southWest"]["lng"];
  maxlattile = map.getBounds([0])["_northEast"]["lat"];
  maxlontile = map.getBounds([0])["_northEast"]["lng"];
  loaddata(minlattile, minlontile, maxlattile, maxlontile, zoom);
})

// Mouse drag event
map.on('dragend', function(){
  zoom = map.getZoom()
  minlattile = map.getBounds([0])["_southWest"]["lat"];
  minlontile = map.getBounds([0])["_southWest"]["lng"];
  maxlattile = map.getBounds([0])["_northEast"]["lat"];
  maxlontile = map.getBounds([0])["_northEast"]["lng"];
  loaddata(minlattile, minlontile, maxlattile, maxlontile, zoom);
})

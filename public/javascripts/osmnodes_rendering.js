// Fix mapbox token
L.mapbox.accessToken = 'pk.eyJ1IjoiemlhLW0iLCJhIjoiQjM5aVpfTSJ9.s_U7YxQCK-Zq5SaJemH5bA';
// 40.903699, 28.697378  41.177273, 29.276363 Istanbul bounds which was used to download osm data
// Construct a bounding box for this map that the user cannot move out of
var minlatbound = 40.903699, minlonbound = 28.697378, maxlatbound = 41.177273, maxlonbound = 29.276363;
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
var requestcovered_region = turf.polygon([[[],[],[],[],[]]]);
function tilerequests(minlontile, minlattile, maxlontile, maxlattile, zoom){
  // Calculate number of tiles should be there in the present screen
  // 180/Math.pow(2, zoom) and 360/Math.pow(2, zoom) is giving ideal tile size at that zoom level
  // more info here: https://www.mapbox.com/tilemill/docs/manual/basics/#zoom-levels
  // Math.ceil() to round off to next integer
  // var numtiles = Math.ceil((maxlattile-minlattile)/(180/Math.pow(2, zoom))) *
  //                 Math.ceil((maxlontile-minlontile)/(360/Math.pow(2, zoom)))
  // // tileflag.push()
  // console.log(numtiles);
  // console.log(zoom0_arr);

  var bbox = turf.polygon([[[minlontile, minlattile], [maxlontile, minlattile],
          [maxlontile, maxlattile], [minlontile, maxlattile], [minlontile, minlattile]]])
  // console.log(bbox);
  var extrabbox = turf.erase(bbox, requestcovered_region);
  // console.log(extrabbox.geometry.coordinates[0]); // This is array
  var polygon_arr = [requestcovered_region, bbox];
  // console.log(polygon_arr);
  var poly_fc = turf.featurecollection(polygon_arr);
  // console.log(poly_fc);
  requestcovered_region = turf.merge(poly_fc);
  // console.log(requestcovered_region);


  // We have to make those boxes here
  // array = [];
  // array.push([28.979798555374146, 41.039112115960954, 28.99394989013672, 41.04214667672059])
  // array.push([28.979798555374146, 41.04214667672059, 28.99394989013672, 41.04514667672059])
  // array.push([28.979798555374146, 41.04514667672059, 28.99394989013672, 41.04814667672059])
  // array.push([28.979798555374146, 41.039012115960954, 28.979998555374146, 41.039212115960954])
  // array.push([28.979798555374146, 41.039012115960954, 28.979998555374146, 41.039212115960954])
  // array.push([28.979798555374146, 41.039012115960954, 28.979998555374146, 41.039212115960954])
  // return array[0][0]

  if (extrabbox == null){
    // console.log("extrabbox undefined");
    var array = [];
    return array;
  } else {
    var array = extrabbox.geometry.coordinates[0];
    return array;
  }

  // var array = extrabbox.geometry.coordinates[0]
  // console.log(array);
  // return array
}

// Declaring min max lan lot tiles
var minlontile, minlattile, maxlontile, maxlattile, zoom;

// Function to load data from custom url onto map
// var osmnodes_zoom17 = [];
function loaddata(minlontile, minlattile, maxlontile, maxlattile, zoom){
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
  // console.log(tilerequests().length);

  var tilesarray = tilerequests(minlontile, minlattile, maxlontile, maxlattile, zoom);

  if (tilesarray.length == 0){
    return;
  } else {



    var url = 'http://localhost:3002/osmnodes?bboxarray=' + tilesarray.toString()
              + '&zoom=' + zoom.toString()
    $.loadScript(url, function(){
      // Dont write var osmnodes_js as this var has already been declared in url response
      osmnodes_js = osmnodes_js.map(function (p) { return [p[1], p[0]]; });
      var heatMap = L.heatLayer(osmnodes_js,
                    {gradient: {0.4: 'gold', 0.65: 'lime', 1: 'red'}});
      heatMap.setOptions({blur: 0});
      // maxZoom is imp otherwise the points will be at max intensity of display.
      heatMap.setOptions({maxZoom: 19});
      // Other options can be found here https://github.com/Leaflet/Leaflet.heat
      heatMap.setOptions({radius: 25});
      heatMap.addTo(map);
    });

  }
  // for (i=0; i<tilesarray.length; ++i){
  //   var url = 'http://localhost:3002/osmnodes?minlon=' + tilesarray[i][0].toString()
  //             + '&minlat=' + tilesarray[i][1].toString() + '&maxlon=' + tilesarray[i][2].toString()
  //             + '&maxlat=' + tilesarray[i][3].toString() + '&zoom=' + zoom.toString()
  //   // console.log(url);
  //   $.loadScript(url, function(){
  //     console.log(osmnodes_js.length);
  //     // Dont write var osmnodes_js as this var has already been declared in url response
  //     osmnodes_js = osmnodes_js.concat(osmnodes_js.map(function (p) { return [p[1], p[0]]; }));
  //     var heatMap = L.heatLayer(osmnodes_js,
  //                   {gradient: {0.4: 'gold', 0.65: 'lime', 1: 'red'}});
  //     heatMap.setOptions({blur: 0});
  //     // maxZoom is imp otherwise the points will be at max intensity of display.
  //     heatMap.setOptions({maxZoom: 19});
  //     // Other options can be found here https://github.com/Leaflet/Leaflet.heat
  //     heatMap.setOptions({radius: 25});
  //     heatMap.addTo(map);
  //   });
  // }

  // map.eachLayer(function (layer) {
  //   console.log(layer);
  // })


  // console.log(osmnodes_zoom17.length);
  //
  // var heatMap = L.heatLayer(osmnodes_zoom17,
  //           {gradient: {0.4: 'gold', 0.65: 'lime', 1: 'red'}});
  // heatMap.setOptions({blur: 0});
  // heatMap.setOptions({maxZoom: 19});
  // heatMap.setOptions({radius: 25});
  // heatMap.addTo(map);


  // var url = 'http://localhost:3002/osmnodes?minlat=' + minlattile.toString()
  //           + '&minlon=' + minlontile.toString() + '&maxlat=' + maxlattile.toString()
  //           + '&maxlon=' + maxlontile.toString() + '&zoom=' + zoom.toString()
  // // console.log(url);
  // $.loadScript(url, function(){
  //     osmnodes_js = osmnodes_js.map(function (p) { return [p[1], p[0]]; });
  //     var heatMap = L.heatLayer(osmnodes_js,
  //               {gradient: {0.4: 'gold', 0.65: 'lime', 1: 'red'}});
  //     heatMap.setOptions({blur: 0});
  //     // maxZoom is imp otherwise the points will be at max intensity of display.
  //     heatMap.setOptions({maxZoom: 19});
  //     // Other options can be found here https://github.com/Leaflet/Leaflet.heat
  //     heatMap.setOptions({radius: 25});
  //     // if (true){
  //       // map.removeLayer(heatMap);
  //       // window.alert("sometext");
  //       // heatMap.addTo(map);
  //     // } else {
  //       // heatMap.addTo(map);
  //     // }
  //     // console.log(map.hasLayer(heatMap));
  //
  //     // console.log(map.getLayer(1));
  //
  //       //  console.log(map.layer(heatMap));
  //       // var x;
  //       // console.log(map.hasLayer(x));
  //       // console.log(x);
  //
  //       // var count = 0;
  //       // map.eachLayer(function (layer) {
  //       //   count += 1;
  //       //   console.log(layer);
  //       //   if (count == 4){
  //       //     map.removeLayer(heatMap);
  //       //     map.addLayer(heatMap, true);
  //       //     console.log("second");
  //       //   } else if (count == 3) {
  //       //     map.addLayer(heatMap, true);
  //       //     console.log("first");
  //       //   }
  //       // });
  //
  //     function load_reload_data(){
  //       var heatMap_map;
  //       var count = 0;
  //       map.eachLayer(function (layer) {
  //         count += 1;
  //         if (count == 4){
  //             heatMap_map = layer; // heatMap_map and heatMap are different objects.
  //         }
  //       })
  //
  //       if (map.hasLayer(heatMap_map)) { // We cant pass heatMap obj to hasLayer also. Dunno why!
  //           map.removeLayer(heatMap_map); // We cant pass simply heatMap object here.
  //           map.addLayer(heatMap);
  //       } else {
  //         map.addLayer(heatMap);
  //       }
  //     }
  //
  //     load_reload_data();
  //
  //       // map.eachLayer(function (layer) {
  // 	    //      var x = layer;
  //       //      console.log(x);
  //       //      map.removeLayer(x);
  //       // //     //  layer.bindPopup('Hello');
  //       //    });
  //
  //     // window.alert("sometext");
  //
  // })
}

// Initialize the map
var map = L.mapbox.map('map', 'mapbox.dark', {
          maxBounds: bounds,
          // maxZoom: 19,
          // minZoom: 7
          maxZoom: 19,
          minZoom: 19
});

// Load map function
map.on('load', function () {
  zoom = map.getZoom();
  minlattile = map.getBounds([0])["_southWest"]["lat"];
  minlontile = map.getBounds([0])["_southWest"]["lng"];
  maxlattile = map.getBounds([0])["_northEast"]["lat"];
  maxlontile = map.getBounds([0])["_northEast"]["lng"];
  // console.log(minlattile);
  // console.log(minlontile);
  // console.log(maxlattile);
  // console.log(maxlontile);
  loaddata(minlontile, minlattile, maxlontile, maxlattile, zoom);
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
  loaddata(minlontile, minlattile, maxlontile, maxlattile, zoom);
})

// Pan move end event. Dragend event is not used as map keeps moving a bit after
// drag event is over by mouse. moveend is the best to check end most bbox.
map.on('moveend', function(){
  zoom = map.getZoom()
  minlattile = map.getBounds([0])["_southWest"]["lat"];
  minlontile = map.getBounds([0])["_southWest"]["lng"];
  maxlattile = map.getBounds([0])["_northEast"]["lat"];
  maxlontile = map.getBounds([0])["_northEast"]["lng"];
  loaddata(minlontile, minlattile, maxlontile, maxlattile, zoom);
})

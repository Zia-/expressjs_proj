// Run mongo_con function in app.js, which eventually will connect to mongo
module.exports.mongo_con = function(){

  //Include mongoose to our project
  var mongoose = require('mongoose');

  //Connect to mongoose
  mongoose.connect('mongodb://localhost:27017/test', function(error){
    if (error){
      console.log(error);
    };
    console.log("Mongo Connection Successful :)");
  });

  // Define mongo schema. No need to declare _id info inside it.
  var nodesSchema = {
    node: {id: String, lat: String,
          lon: String, version: String, timestamp: String,
          changeset: String, uid: String, user: String}
  };

  // Initializing a model out of our schema. The first argument should be
  // the variable name itself, and thrid argument is the collection name in mongo
  var node_model = mongoose.model('node_model', nodesSchema, 'istanbul_osmnodes');

  // var minlat = '54.191105';
  // var maxlat = '54.277578';
  // var minlon = '-4.462829';
  // var maxlon = '-4.632459';

  // Function to generate query for mongo
  function query_gen_old(minlat,maxlat,minlon,maxlon){
    var latbounds_key = 'node.lat';
    var latbounds_condition = {};
    latbounds_condition['$gt'] = minlat;
    latbounds_condition['$lt'] = maxlat;
    var lat_bounds = {};
    lat_bounds[latbounds_key] = latbounds_condition;
    var lonbounds_key = 'node.lon';
    var lonbounds_condition = {};
    lonbounds_condition['$gt'] = minlon;
    lonbounds_condition['$lt'] = maxlon;
    var lon_bounds = {};
    lon_bounds[lonbounds_key] = lonbounds_condition;
    var dic = [];
    dic.push(lat_bounds);
    dic.push(lon_bounds);
    var and = '$and';
    var query = {};
    query[and] = dic;
    // console.log(typeof(query));
    return query;
  }

  // Function to generate query for mongo
  function query_gen(bboxarray){
    // var query1 = "{ node: { $geoWithin: { $polygon: " +
    //         "[ [ 29.007910,41.064178 ], [ 29.007910,41.067769 ], " +
    //         "[ 29.014705,41.067769 ] ,[ 29.014705,41.064178 ],[ 29.007910,41.064178 ]," +
    //         "[ 29.020334,41.083466 ], [ 29.020334,41.085471 ], [ 29.024150,41.085471 ] ," +
    //         "[ 29.024150,41.083466 ],[ 29.020334,41.083466 ]] } } }";
    // var query1 = JSON.stringify(eval("(" + query1 + ")"));
    // console.log(typeof(query1));
    // return query1;
    //
    // var latbounds_key = 'node.lat';
    // var latbounds_condition = {};
    // latbounds_condition['$gt'] = minlat;
    // latbounds_condition['$lt'] = maxlat;
    // var lat_bounds = {};
    // lat_bounds[latbounds_key] = latbounds_condition;
    // var lonbounds_key = 'node.lon';
    // var lonbounds_condition = {};
    // lonbounds_condition['$gt'] = minlon;
    // lonbounds_condition['$lt'] = maxlon;
    // var lon_bounds = {};
    // lon_bounds[lonbounds_key] = lonbounds_condition;
    // var dic = [];
    // dic.push(lat_bounds);
    // dic.push(lon_bounds);
    // // var and = '$and';
    // var node = 'node';
    // var query = {};
    // query[and] = dic;
    // console.log(bboxarray);
    // console.log(bboxarray.length);

    // console.log(bboxarray);
    // console.log(bboxarray.length);

    var polygon = '$polygon';
    var dic = [];
    // var dic1 = [];
    var bboxarray = bboxarray.split(',');
    for (i=0; i<(bboxarray.length/2); ++i){
      dic.push([parseFloat(bboxarray[2*i]),parseFloat(bboxarray[(2*i)+1])])
    }
    // console.log(dic);
    // dic.push([ 29.007910,41.064178 ]);
    // dic.push([ 29.107910,41.067769 ]);
    // dic.push([ 29.114705,41.167769 ]);
    // dic.push([ 29.007910,41.064178 ]);
    // console.log(dic);
    var polygon_query = {};
    polygon_query[polygon] = dic;
    // console.log(polygon_query);
    var geowitnin_query = {};
    geowitnin_query['$geoWithin'] = polygon_query;
    var node_query = {};
    node_query['node'] = geowitnin_query;
    // console.log(typeof(node_query));
    // console.log(node_query);
    return node_query;
  }

  // // Generate query instance by executing query_gen function
  // query = query_gen(minlat,maxlat,minlon,maxlon);

  // This get function of app will handle url requestes coming on http://localhost:3002/osmnodes
  app.get('/osmnodes', function(req, res){
    // Generate query instance by executing query_gen function
    // var minlat = req.query.minlat, minlon = req.query.minlon, maxlat = req.query.maxlat, maxlon = req.query.maxlon;
    // var minlat = 53.95931761174562, minlon = -5.723876953125, maxlat = 54.48759113734097, maxlon = -3.4304809570312496;
    // query = query_gen(req.query.minlat,req.query.maxlat,req.query.minlon,req.query.maxlon);

    // query_gen_old = query_gen_old(54.191105,54.277578,-4.462829,-4.632459)

    var bboxarray = req.query.bboxarray
    query = query_gen(bboxarray);

    node_model.find(query, function(err, doc){

      // Access minlat etc etc params coming with the url
      // console.log(req.query.minlat);
      // console.log(req.query.minlon);
      // console.log(req.query.maxlat);
      // console.log(req.query.maxlon);
      // console.log(req.query.zoom);
      // console.log(doc);
      // Make js array to hold queried lat lon
      var geojson_latlon_array = new Array;
      for (var d in doc){
        // var lon = parseFloat(doc[d]['node'].lon);
        // console.log(doc[d]);
        // console.log(doc[d]['node']);
        // var node = JSON.stringify(doc[d]['node']);
        // console.log(doc[d]);
        // console.log(typeof(doc[d]));
        // console.log(doc[d]["node"]);
        // console.log(typeof(doc[d]["node"]));
        // var x = doc[d]["node"]["coordinates"];
        // console.log(doc[d]["node"]);
        // strcoord = JSON.stringify(doc[d]["node"]);

        var lon = (JSON.parse(JSON.stringify(doc[d]["node"])))["coordinates"][0];
        var lat = (JSON.parse(JSON.stringify(doc[d]["node"])))["coordinates"][1];
        // console.log((JSON.parse(JSON.stringify(doc[d]["node"]))))
        // console.log(doc[d]["node"]["coordinates"][0]);
        // console.log(doc[d]["_id"]);
        // console.log(typeof(doc[d]["node"]["coordinates"]));
        // console.log(doc[d]["node"]["coordinates"][0]);
        // js_obj["node"]["coordinates"][0]
        // console.log(parseFloat(node));
        // console.log(doc[d].node);
        // var lon = 29.0478561;
        // var lat = parseFloat(doc[d]['node'].lat);
        // var lat = 41.0213525;
        var latlonset = new Array;
        latlonset.push(lon);
        latlonset.push(lat);
        geojson_latlon_array.push(latlonset);
      }

      // Make js out of that generated array to return back
      var geojson_str = 'var osmnodes_js = ';
      var geojson_latlon = JSON.stringify( geojson_latlon_array );
      var geojson_end = ';';
      var geojson_str = geojson_str.concat(geojson_latlon, geojson_end);

      // Return queried data in js format, being able to render onto mapbox
      res.send(geojson_str);
    })
  })
}

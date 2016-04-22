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
  var node_model = mongoose.model('node_model', nodesSchema, 'nodes_collection');

  var minlat = '54.191105';
  var maxlat = '54.277578';
  var minlon = '-4.462829';
  var maxlon = '-4.632459';

  // Function to generate query for mongo
  function query_gen(minlat,maxlat,minlon,maxlon){
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
    return query;
  }

  // Generate query instance by executing query_gen function
  query = query_gen(minlat,maxlat,minlon,maxlon);

  // This get function of app will handle url requestes coming on http://localhost:3002/osmnodes
  app.get('/osmnodes', function(req, res){
    node_model.find(query, function(err, doc){

      // Access minlat etc etc params coming with the url
      console.log(req.query.minlat);
      console.log(req.query.minlon);
      console.log(req.query.maxlat);
      console.log(req.query.maxlon);

      // Make js array to hold queried lat lon
      var geojson_latlon_array = new Array;
      for (var d in doc){
        var lon = parseFloat(doc[d]['node'].lon);
        var lat = parseFloat(doc[d]['node'].lat);
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

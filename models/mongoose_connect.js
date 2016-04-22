module.exports.mongo_con = function(){
  console.log("mongo12313");
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

  // Making a query
  // var key = 'node.version';
  // var value = '5';
  // var query = {};
  // query[key] = value;

  // global.myvar = 100;

  // var latbound_key = 'node.lat';
  // var latbound_value = '$gt: 54.191105, $lt: 54.277578';
  // // latbound_value.push({key: '$gt'},{value: '54.191105'});
  // // latbound_value.push({key: '$lt'},{value: '54.277578'});
  // var latbound_query = {};
  // latbound_query[latbound_key] = latbound_value;
  // console.log(latbound_query);
  // console.log("hi");
  var minlat = '54.191105';
  var maxlat = '54.277578';
  // var latbounds_key = 'node.lat';
  // var latbounds_condition = {};
  // latbounds_condition['$gt'] = minlat;
  // latbounds_condition['$lt'] = maxlat;
  // var lat_bounds = {};
  // lat_bounds[latbounds_key] = latbounds_condition;
  // Again
  var minlon = '-4.462829';
  var maxlon = '-4.632459';
  // var lonbounds_key = 'node.lon';
  // var lonbounds_condition = {};
  // lonbounds_condition['$gt'] = minlon;
  // lonbounds_condition['$lt'] = maxlon;
  // var lon_bounds = {};
  // lon_bounds[lonbounds_key] = lonbounds_condition;
  //
  // var dic = [];
  // dic.push(lat_bounds);
  // dic.push(lon_bounds);
  //
  // var and = '$and';
  // var query = {};
  // query[and] = dic;

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

  query = query_gen(minlat,maxlat,minlon,maxlon);

  app.get('/osmnodes', function(req, res){
    node_model.find(query, function(err, doc){
      // res.send(doc);
      // console.log(typeof doc);
      console.log(req.query.minlat);
      console.log(req.query.minlon);
      console.log(req.query.maxlat);
      console.log(req.query.maxlon);

      var geojson_latlon_array = new Array;
      for (var d in doc){
        var lon = parseFloat(doc[d]['node'].lon);
        var lat = parseFloat(doc[d]['node'].lat);
        var latlonset = new Array;
        latlonset.push(lon);
        latlonset.push(lat);
        geojson_latlon_array.push(latlonset);
      }
      // var geojson_latlon_array = [[-3.5, 53.5], [0, 0], [23, 41]];
      // var geojson_str = '{ "type": "MultiPoint", "coordinates": ';
      // var geojson_latlon = JSON.stringify( geojson_latlon_array );
      // var geojson_end = ' }';
      // var geojson_str = geojson_str.concat(geojson_latlon, geojson_end);

      var geojson_str = 'var osmnodes_js = ';
      var geojson_latlon = JSON.stringify( geojson_latlon_array );
      var geojson_end = ';';
      var geojson_str = geojson_str.concat(geojson_latlon, geojson_end);
      res.send(geojson_str);
    })
  })
}

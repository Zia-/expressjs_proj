var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Add cors to permit server to interact with other IPs.
var cors = require('cors');

//Include mongoose to our project
var mongoose = require('mongoose');

var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/users', users);

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
var key = 'node.version';
var value = '5';
var query = {};
query[key] = value;


app.get('/osmnodes', function(req, res){
  node_model.find(query, function(err, doc){
    // res.send(doc);
    // console.log(typeof doc);
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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

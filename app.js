var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
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
mongoose.connect('mongodb://160.75.81.194:27017/test', function(error){
  if (error){
    console.log(error);
  };
  console.log("Mongo Connection Successful :)");
});

var personSchema = {
  node: {id: String, lat: String,
        lon: String, version: String, timestamp: String,
        changeset: String, uid: String, user: String}
};

var Person = mongoose.model('Person', personSchema, 'nodes_collection');
app.get('/peop', function(req, res){
  Person.find({'node.version': '5'}, function(err, doc){
    res.send(doc);
  })
})

// var schemamongo = mongoose.Schema;
// var dataSchema = new schemamongo({
//   _id: schemamongo.Types.ObjectId,
//   node: {id: String, lat: String,
//         lon: String, version: String, timestamp: String,
//         changeset: String, uid: String, user: String}
// });
//
// var dataget = mongoose.model('nodes_collection', dataSchema, 'files');
// app.get('/nodes_url', function(req, res){
//   dataget.find({'node.version': '5'}, function(err, nodes){
//     res.send(nodes);
//   });
//   //res.send("hi");
//
//   // dataget.find({}, function(err, node){
//   //   if(err){
//   //           console.log('error..');
//   //           return handleError(err);
//   //       }
//   //       else {
//   //           console.log('returning data..');
//   //           // res.render( "parkings", { version: 1 });
//   //           res.send(node);
//   //       }
//   // });
// });


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

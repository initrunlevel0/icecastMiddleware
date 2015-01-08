var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var mongoose = require('mongoose');

var userModel = require('../models/userModel');
var peerModel = require('../models/peerModel');
var streamModel = require('../models/streamModel');

mongoose.connect('mongodb://localhost/mbahmu');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/static', express.static(__dirname + '/static'))
app.listen(9500);


app.get('/', function(req, res) {
    // Server app.html
    fs.readFile('./app.html', function(err, data) {
        res.end(data);
    });
});

// The REST is API...
//

app.get('/users', function(req, res) {
    userModel.User.find({}, function(err, users) {
        res.send(users);
    });
});

app.post('/users', function(req, res) {
    userModel.newUser(req.body.userName, req.body.password, function(err, user) {
        res.send(user);
    });
});

app.get('/users/:user_id/streams', function(req, res) {
    streamModel.Stream.find({user: req.params.user_id}, function(err, streams) {
        res.send(streams);
    });
});

app.post('/users/:user_id/streams', function(req, res) {
    req.body.user = req.params.user_id;
    streamModel.Stream.create(req.body, function(err, result) {
        res.send(result);
    });
});




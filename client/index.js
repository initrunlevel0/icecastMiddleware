var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var ejs = require('ejs');
var mongoose = require('mongoose');

var streamModel = require('../models/streamModel');

mongoose.connect('mongodb://localhost/mbahmu');

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/static', express.static(__dirname + '/static'))
app.listen(9550);

app.get('/', function(req, res) {
    streamModel.Stream.find({}, function(err, streams){
        res.render('lists', {streams: streams});
    });
});


app.get('/stream/:streamId', function(req, res) {
    streamModel.Stream.findOne({_id: req.params.streamId}, function(err, stream) {
        res.render('stream', { stream: stream });
    })
});

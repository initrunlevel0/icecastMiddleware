var mongoose = require('mongoose');

var userModel = require('./userModel');
var peerModel = require('./peerModel');
var streamModel = require('./streamModel');

mongoose.connect('mongodb://localhost/mbahmu');

userModel.newUser("wira", "uyung_nggilani", function(err, user) {
    streamModel.Stream.create({mountPoint: '/stream', user: user._id});
    peerModel.Peer.create({ip: "127.0.0.1", online: true});
});





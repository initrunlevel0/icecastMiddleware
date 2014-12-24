var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var peerSchema = new mongoose.Schema({
    ip: String,
    online: Boolean
});

var Peer = mongoose.model('Peer', peerSchema);

exports.Peer = Peer;

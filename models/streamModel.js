var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var streamSchema = new mongoose.Schema({
    mountPoint: String,
    streamName: String,
    categoryName: String,
    region: String,
    user: mongoose.Schema.Types.ObjectId
});

var Stream = mongoose.model('Stream', streamSchema);

exports.Stream = Stream;

exports.streamMountUser = function(mountPoint, userId, callback) {
    Stream.find({mountPoint: mountPoint, user: userId}, function(err, result) {
        if(result.length > 0) callback(err, true);
        else callback(err, false);
    });

}

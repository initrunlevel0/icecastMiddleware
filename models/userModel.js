var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
    userName: String,
    password: String,
});

var User = mongoose.model('User', userSchema);

exports.User = User;

// Model logic

exports.getUser = function(userName, callback) {
    User.findOne({userName: userName}, function(err, resultUser) {
        if(err) callback(err);
        else {
            if(resultUser == null) {
                callback(new Error("User do not exist"));

            } else {
                callback(err, resultUser);
            }
        }
    });
}

exports.authenticateUser = function(userName, password, callback) {
    exports.getUser(userName, function(err, resultUser) {
        if(err) callback(err);
        else {
            bcrypt.compare(password, resultUser.password, function(err, res) {
                if(resultUser) {
                    callback(err, res, resultUser._id);
                } else {
                    callback(err, res)
                }
            });
        }
    });
};

exports.newUser = function(userName, password, callback) {
    // Check if user is exist
    exports.getUser(userName, function(err, resultUser) {
        if(resultUser == null) {
            // Proceed with user creation
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    var newUser = new User({userName: userName, password: hash });
                    newUser.save(function(err) {
                        callback(err, newUser);
                    });
                })
            });
        } else {
            callback(new Error("User already exist"));
        }
    });

};

exports.generatePasswordHash = function(password, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            callback(null, hash);
        })
    });
};

exports.getUserId = function(userName, callback) {
    exports.getUser(userName, function(err, data) {
        callback(err, data['_id']);
    });

}

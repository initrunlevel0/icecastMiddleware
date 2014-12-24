var net = require('net');
var async = require('async');
var mongoose = require('mongoose');

var userModel = require('../models/userModel');
var peerModel = require('../models/peerModel');
var streamModel = require('../models/streamModel');

mongoose.connect('mongodb://localhost/mbahmu');


var connectIcecast = function(mountPoint, method, headers, callback) {
    var clients = [];
    peerModel.Peer.find({}, function(err, peers) {
        async.eachSeries(peers, function(peer, callback) {
            if(peer.online == true) {
                console.log("Connecting to: " + peer.ip)
                var client = net.connect({host: peer.ip, port: 8000}, function() {
                    var stdout = "";
                    // Connect, give me some header
                    client.write(method + " " + mountPoint + " HTTP/1.0\r\n");
                    console.log(method, mountPoint)
                    for(idx in headers) {
                        if(idx == "Authorization") {
                            client.write('Authorization: Basic c291cmNlOmhhY2ttZQ==\r\n')
                        } else {
                            client.write(idx + ': ' +  headers[idx] + '\r\n');
                        }
                    }

                    client.write('\r\n');
                    client.on('data', function(data) {
                        console.log(data.toString())
                        stdout += data.toString();
                        if(stdout.indexOf("HTTP/1.0 200 OK\r\n") >= 0) {
                            console.log('Connected to: ' + peer.ip);
                            clients.push(client);
                            callback();
                        }
                    });

                });


            } else {
                callback();
            }

        }, function(err) {
            callback(clients);
        });

    })

};

net.createServer(function(stream) {

    var headerRaw = "";
    var headerMode = true;
    var peerStreams = null;

    stream.on('data', function(data) {
        // Header Mode
        // Get header and check when it is completed.
        if(headerMode) {
            try {
                headerRaw += data.toString();

                // Completed yet?
                if(headerRaw.indexOf("\r\n\r\n") >= 0) {
                    // Separate first line and the rest
                    var headerSplit = headerRaw.split("\r\n");
                    var mountPoint = headerSplit[0].split(" ")[1];
                    var method = headerSplit[0].split(" ")[0];
                    var headers = {};

                    console.log(method, mountPoint);
                    for(var i=1; i<headerSplit.length; i++) {
                        var name = headerSplit[i].split(": ")[0];
                        var value = headerSplit[i].split(": ")[1];
                        if(name && value) {
                            headers[name] = value;
                        }
                    }

                    console.log(headers);


                    // Check authentication part
                    var authString = new Buffer(headers['Authorization'].split(" ")[1], 'base64');

                    var userName = authString.toString('ascii').split(":")[0];
                    var password = authString.toString('ascii').split(":")[1];




                    // Authenticate with Model
                    userModel.authenticateUser(userName, password, function(err, result, userId) {
                        if(result == true) {
                            // Check if this user is appropriate for this moutnPoint
                            // Stream Mode
                            if(mountPoint.indexOf("/admin/") < 0) {
                                streamModel.streamMountUser(mountPoint, userId, function(err, result) {
                                    if(result == true) {
                                        // Roger that
                                        headerMode = false;

                                        // But first, connect to the real stream server
                                        connectIcecast(mountPoint, method, headers, function(result) {
                                            console.log('Connected to all, ready to serve...')
                                            peerStreams = result;

                                            // Ready to serve a media
                                            stream.write('HTTP/1.0 200 OK\r\n\r\n')
                                        });

                                    } else {
                                        stream.end('HTTP/1.0 500 ERROR\r\n\r\n')
                                    }
                                });

                            // Admin mode
                            } else {
                            }
                        } else {
                            stream.end('HTTP/1.0 500 ERROR\r\n\r\n')
                        }
                    })
                }
            } catch(ex) {
                stream.end('HTTP/1.0 500 ERROR\r\n\r\n')

            }
        } else {
            // Piping the media to all peer
            try {
                if(peerStreams) {
                    for(idx in peerStreams) {
                        peerStreams[idx].write(data);
                    }
                }

            } catch(ex) {
                stream.end();
            }
        }
    });

    stream.on('end', function() {
        if(peerStreams) {
            for(idx in peerStreams) {
                peerStreams[idx].end();
            }
        }
    })
}).listen(9000);

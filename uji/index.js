// Uji Coba

var spawn = require('child_process').spawn;
var async = require('async');
var fs = require('fs');
require('events').EventEmitter.prototype._maxListeners = 1000000;


// Configuration
var servers = [
    "10.151.36.205:8001",
    "10.151.36.205:8002",
    "10.151.36.205:8003"
];

var testNodes = [
    {ip: "10.151.36.27", user: "praktikum"},
    {ip: "10.151.36.34", user: "praktikum"},
    {ip: "10.151.36.39", user: "wira"}
];

var mountPoint = "/halo"

var timePerRequest = 300;
var instancesPerServer = 100;

// Create array with instancePerServer times element for the sake of async library
var arr = []
for(var i=0; i < instancesPerServer; i++) {
    arr.push(i);
}

async.series([
function(callback) {
    // Copy script file
    async.each(testNodes, function(testNode, callback) {
        var ps = spawn("scp", ["./uji.sh", testNode.user + "@" + testNode.ip + ":~/uji.sh"])
        ps.stderr.pipe(process.stdout);
        ps.on('exit', function() {
            callback();
        });
    }, function(err) {
        callback();
    });

}, function(callback) {
    // Execute it
    async.eachSeries(servers, function(server, callback) {
        // Open file for the result
        var output = fs.createWriteStream(server, {flags: 'w'});

        async.each(testNodes, function(testNode, callback) {
            var stdout = "";
            var ps = spawn("ssh", ['-vv', testNode.user + "@" + testNode.ip, "~/uji.sh",
                           instancesPerServer, timePerRequest, "http://" + server + mountPoint]);

            ps.stderr.pipe(process.stdout);

            ps.stdout.on('data', function(data) {
                output.write(data);
            });

            ps.on('close', function() {
                callback();
            });
        }, function(err) {
            output.end();
            callback();
        });
    }, function(err) {
        callback();
    });
}
], function(err) {
});

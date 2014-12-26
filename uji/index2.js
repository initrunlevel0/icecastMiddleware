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

var mountPoint = "/halo"

var timePerRequest = 300;
var instancesPerServer = 300;

// Create array with instancePerServer times element for the sake of async library
var arr = []
for(var i=0; i < instancesPerServer; i++) {
    arr.push(i);
}

async.eachSeries(servers, function(server, callback) {
    // Open file for the result
    var output = fs.createWriteStream(server, {flags: 'w'});
    async.each(arr, function(i, callback) {
        // Do a curl
        var stdout = "";
        var ps = spawn('curl', ['-o',  '/dev/null', '-m', timePerRequest, '-s',
                       '-w', "%{size_download}", 'http://' + server + mountPoint]);

        ps.stdout.on('data', function(data) {
            stdout += data.toString();
        });

        ps.stderr.pipe(process.stdout);

        ps.on('close', function() {
            output.write(server + " " + i + " " + (parseFloat(stdout) / 1024).toString() + " KB\n");
            console.log(server + " " + i + " " + (parseFloat(stdout) / 1024).toString() + " KB");
            callback();
        });


    }, function(err) {
        output.end();
        callback();
    });
}, function(err) {

});

// Uji Coba

var spawn = require('child_process').spawn;
var async = require('async');
var moment = require('moment');
var fs = require('fs');

require('events').EventEmitter.prototype._maxListeners = 1000000;


// Configuration
var server = process.argv[2];
var mountPoint = process.argv[3];
var instancesPerServer = process.argv[4];
var timePerRequest = process.argv[5];

var success = 0;
var fail = 0;

// Create array with instancePerServer times element for the sake of async library
var arr = []
for(var i=0; i < instancesPerServer; i++) {
    arr.push(i);
}
async.each(arr, function(i, callback) {
    // Do a curl
    var stdout = "";
    var start = moment(new Date());
    var ps = spawn('curl', ['-o',  '/dev/null', '-m', timePerRequest, '-s',
                   '-w', "%{size_download}", 'http://' + server + mountPoint]);


    ps.stdout.on('data', function(data) {
        stdout += data.toString();
    });

    ps.stderr.pipe(process.stdout);

    ps.on('exit', function() {
        var end = moment(new Date());
        var result = parseFloat(stdout) / 1024;
        var diff =  moment.duration(end.diff(start));

        if(diff.asSeconds() < timePerRequest) {
            fail++;
        } else {
            success++;
        }

        callback();
    });


}, function(err) {
    console.log(success)
});

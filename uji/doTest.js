var async = require('async');
var spawn = require('child_process').spawn;
var testNodes = [
    {ip: "10.151.36.27", user: "praktikum"},
    {ip: "10.151.36.34", user: "praktikum"},
    {ip: "10.151.36.39", user: "wira"}
];

var servers = [
    {ip: "10.151.36.201:8000", mountPoint: "/halo"},
    {ip: "10.151.36.205:8003", mountPoint: "/halo"},
]

var instancesPerServers = [90, 150, 300, 450, 600];
var timePerRequest = 30;

async.eachSeries(servers, function(server, callback) {
    async.eachSeries(instancesPerServers, function(instancesPerServer, callback) {
        var instancesPerServerPerTest = Math.round(instancesPerServer / testNodes.length);
        var successCount = 0;

        async.each(testNodes, function(testNode, callback) {
            var stdout = "";
            var ps = spawn("ssh", [testNode.user + "@" + testNode.ip, "node", "~/icecastMiddleware/uji/index.js",
                           server.ip, server.mountPoint, instancesPerServerPerTest, timePerRequest]);
            ps.stdout.on('data', function(data) {
                stdout += data.toString();
            });

            ps.on('exit', function() {
                successCount += parseInt(stdout);
                setTimeout(callback, 10000)
            })

        }, function(err) {
            console.log(server.ip, instancesPerServerPerTest * testNodes.length, successCount);
            setTimeout(callback, 10000)
        });
    }, function(err) {
        setTimeout(callback, 10000)
    });

}, function(err) {

})

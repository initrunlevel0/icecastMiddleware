var app = angular.module('app', ['ngRoute',]);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: '/static/users.html'});
    $routeProvider.when('/:userId', {templateUrl: '/static/streams.html'});
}])

app.controller('userController', function($scope, $http) {
    $scope.newUser = {};
    var loadUsers = function() {
        $http.get('/users').success(function(data) {
            $scope.users = data;
        })
    };

    loadUsers();

    $scope.createUser = function() {
        $http.post('/users', $scope.newUser).success(function() {
            loadUsers();
        })
    }

});

app.controller('streamController', function($routeParams, $scope, $http) {
    $scope.userId = $routeParams.userId;
    $scope.newStream = {};
    $scope.newStream.user = $scope.userId;
    var loadStreams = function() {
        $http.get('/users/' + $scope.userId + '/streams').success(function(data) {
            $scope.streams = data;
        })
    };

    loadStreams();

    $scope.createStream = function() {
        $http.post('/users/' + $scope.userId + '/streams', $scope.newStream).success(function() {
            loadStreams();
        })
    }

});

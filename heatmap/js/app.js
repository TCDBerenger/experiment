var app = angular.module('surveyApp', ['gist', 'mcq', 'ngRoute']);
app.config(['$routeProvider', '$sceDelegateProvider',
  function($routeProvider, $sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['**']);
    $routeProvider.
      when('/index', { templateUrl: 'https://dl.dropboxusercontent.com/u/14718379/survey/tpl/help-intro.html'}).
      when('/about-code', { templateUrl: 'https://dl.dropboxusercontent.com/u/14718379/survey/tpl/help-code.html'}).
      when('/about-tool', { templateUrl: 'https://dl.dropboxusercontent.com/u/14718379/survey/tpl/help-tool.html'}).
      when('/eval-code', { templateUrl: 'https://dl.dropboxusercontent.com/u/14718379/survey/tpl/eval-code.html'}).
      when('/eval-tool', { templateUrl: 'https://dl.dropboxusercontent.com/u/14718379/survey/tpl/eval-tool.html'}).
      when('/thankyou', {templateUrl: 'https://dl.dropboxusercontent.com/u/14718379/survey/tpl/thankyou.html'}).
      otherwise({
        redirectTo: '/index'
      });
  }]);

// The main controller
app.controller('AppController', ['$scope', '$http', '$location', '$sce', 
  function($scope, $http, $location, $sce) {
  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

  // Load the code snippets
  $http.get('https://dl.dropboxusercontent.com/u/14718379/survey/src-data.json').then(function(res){
    $scope.srcData = res.data;
  });

  // Load the questions on the code
  $http.get('https://dl.dropboxusercontent.com/u/14718379/survey/src-survey.json').then(function(res){
    $scope.srcSurvey = res.data;
  });

  // Load the visualisation URLs
  $http.get('https://dl.dropboxusercontent.com/u/14718379/survey/vis-data.json').then(function(res){
    $scope.visData = res.data;
  });

  // Load the questions on the code
  $http.get('https://dl.dropboxusercontent.com/u/14718379/survey/vis-survey.json').then(function(res){
    $scope.visSurvey = res.data;
  });

  // Information about the participant
  $scope.info = {
    date: new Date(),
    email: "",
    age: null,
    gender: null,
    education: null,
    expertise: null,
    experience: null,
    consent: false
  };

  // Current page
  $scope.current = 0;

  // Answers for a page
  $scope.srcAnsw = {};
  $scope.visAnsw = {};

  // Moves to the next page on the code experiment
  $scope.srcNext = function(){
    // Write the answers to our server
    $scope.write({
      type: 'src', time: new Date(), page: $scope.current, result: $scope.srcAnsw
    });

    // Go the the next page
    if($scope.current >= ($scope.srcData.data.length - 1)){
      $location.path("/about-tool");
      $scope.current = 0;
    }else{
      $scope.current++;
    }
    $scope.clear();
  };

  // Moves to the next page on the code experiment
  $scope.visNext = function(){
    // Write the answers to our server
    $scope.write({
      type: 'vis', time: new Date(), page: $scope.current, result: $scope.visAnsw
    });

    // Go to the next page
    if($scope.current >= ($scope.visData.length - 1)){
      $location.path("/thankyou");
      $scope.current = 0;
    }else{
      $scope.current++;
    }
    $scope.clear();
  };

  // Clears everything that is required
  $scope.clear = function(){
    $scope.srcAnsw = {};
    $scope.visAnsw = {};
    var chk = document.getElementsByClassName("choice");
    for(var i=0;i<chk.length;i++)
      chk[i].checked = false;
  }

  // Writes the data object to the log file
  $scope.write = function(payload){
    console.log('WRITE: ' + JSON.stringify(payload));
    $http.post('http://multicore.scss.tcd.ie/write', payload)
      .success(function(data, status, headers, config) {
        console.log('HTTP Status: ' + status); 
      });
  };


}]);


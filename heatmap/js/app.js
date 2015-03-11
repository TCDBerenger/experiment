angular.module('surveyApp', ['gist', 'mcq'])
  .controller('MainController', ['$scope', function($scope) {

    $scope.nav = {
      current: 0,
      min: 0, 
      max: 10
    };

    $scope.currentPage = 1;
    $scope.maxPage = 4;

  	$scope.gists = {
  		a: "Kelindar/fe30dcf73184dafce005",
  		b: "Kelindar/fe30dcf73184dafce005"
  	};

    $scope.questions = [
      {
        id: 1, text: 'Select the most likely efficiency assessment:',
        choices: [
          "Program A will finish before Program B.", 
          "Program B will finish before Program A.", 
          "They both would finish at about the same time.", 
          "I don't know / I need more data."
        ]
      },
      {
        id: 2, text: 'Select the most likely data locality assessment:',
        choices: [
          "Program A has better data locality than Program B.",
          "Program B has better data locality than Program A.", 
          "They would have a similar data locality pattern.",
          "I don't know / I need more data."
        ]
      },
    ];


  }]);
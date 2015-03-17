var module = angular.module('mcq', []);
module.directive('mcq', function ($parse) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        id: "=",
        text: "=",
        options: "=",
        value: "=", 
        check: "="
      },
      controller: function($scope){
        $scope.select = function(option, $event){
          $scope.value = option;
        }
      },
      template: '<div class="col-md-12" ng-model="value">'
        + '   <h4>{{text}}</h4>'
        + '   <div class="radio" ng-repeat="opt in options">'
        + '      <label>'
        + '      <input type="radio" class="choice" ng-click="select(opt, $event)" name="{{id}}" value="{{opt}}">{{opt}}'
        + '      </label>'
        + '   </div>'
        + '</div>'
    };
  });
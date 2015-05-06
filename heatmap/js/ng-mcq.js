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
        $scope.set = function(v, $event){
          $scope.value = $event.target.value;
        }
      },
      template: '<div class="col-md-12" ng-model="value">'
        + '   <h4>{{text}}</h4>'
        + '   <div ng-if="options.length > 0" class="radio" ng-repeat="opt in options">'
        + '      <label>'
        + '      <input type="radio" class="choice" ng-click="select(opt, $event)" name="{{id}}" value="{{opt}}">{{opt}}'
        + '      </label>'
        + '   </div>'
        + '   <div ng-if="options.length == 0">'
        + '      <textarea class="form-control open-question" rows="5" ng-keyup="set(1, $event)" id="{{id}}"></textarea>'
        + '   </div>'
        + '</div>'
    };
  });
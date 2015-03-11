angular.module('mcq', []);

angular.module('mcq')
  .directive('mcq', function () {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        id: "@",
        text: "@",
        choices: "@"
      },
      template: '<div class="col-md-12"></div>',
      link: function(scope, element, attrs) {
        
        //console.log(element.append)
        element.append('<h4>' + attrs.text + '</h4>');
        JSON.parse(attrs.choices).forEach(function(choice){
          element.append(
            '<div class="radio">' + 
              '<label>' + 
                '<input type="radio" name="' + attrs.id + '" value="' + choice + '" checked>' + 
                choice +
              '</label>' +
            '</div>'
            );  
        });
        

      }
    };
  });

(function() {
  "use strict";

  //handles negative value correctly
  Math.mod = function(value, modder){
    if(value < 0){
      var loops = (-value)/modder;
      return (value + parseInt(loops+1)*modder) % modder;
    } else return value % modder;
  };

  angular.module("slideInput", ['ngSanitize'])
    .directive('slideInput', SlideInputDirective)
    .service('SlideInputFormatter', SlideInputFormatter);


  SlideInputDirective.$inject = ['$timeout'];

  function SlideInputDirective($timeout){
    return {
      /* for some odd reason angular doesn't like type="email" */
      restrict: 'E',
      template: "<div class='slideInput' ng-class='{focus:focus, hasValue:model.length > 0}'>" +
        "<div class='slideInput-box'>" +
          "<input type='text' class='slideInput-input suggest' placeholder='{{suggested}}' disabled />" +
          "<input type='text' class='slideInput-input' placeholder='{{placeholder}}' ng-model='model' ng-focus='focus=true' ng-blur='focus=false' ng-keyup='_keyup($event)' ng-keydown='_keydown($event)' ng-change='_change()'/>" +
          "<button class='slideInput-button' ng-show='button' ng-click='_click()'>{{button}}</button>" +
        "</div>" +
        "<div class='slideInput-typeahead'>" +
          "<div class='slideInput-typeaheadItem' ng-class='{\"slideInput-typeaheadItem-active\":typeaheadHoverIndex == ($index+1)}' ng-repeat='item in typeaheadData track by (item.id || $id(item))' ng-bind-html='typeaheadFormat({item:item, query:model})' ng-click='_typeaheadClick(item)' ng-mouseover='_mouseover(item)' ng-mouseleave='_mouseleave(item)'></div>" +
        "</div>" +
        "<div class='slideInput-emptyTypeahead' ng-show='empty && (typeaheadData == null || typeaheadData.length == 0) && model.length > 1'><div class='slideInput-emptyTypeaheadText'>{{empty}}</div></div>" +
        "</div>",
      require: 'ngModel',
      scope: {
        button: "@",
        placeholder: "@",
        model: '=ngModel',
        change: '&',
        click: '&',
        focus: '=?',
        typeaheadData: '=?',
        typeaheadFormat: '&',
        typeaheadHoverItem: '&',
        typeaheadActiveItem:'&',
        suggestedFormat: '&',
        empty:'@'
      },
      link: function($scope, element, attrs, ctrl) {
        $scope.typeaheadHoverIndex = 0;

        $scope.$watch("focus", function(value){
          if(value === true) {
            element.find('input')[1].focus();
          }
        });

        $scope.updateSuggested = function(){
          if($scope.typeaheadHoverIndex > 0 && $scope.typeaheadData && $scope.typeaheadHoverIndex - 1 < $scope.typeaheadData.length){
            var item = $scope.typeaheadData[$scope.typeaheadHoverIndex - 1];
            $scope.suggested = $scope.suggestedFormat({item: item, query:$scope.model});
            $scope.typeaheadActiveItem({item: item});
          } else {
            $scope.suggested = null;
            $scope.typeaheadActiveItem({item: null});
          }
        };

        $scope._keydown = function($event){
          if($event.keyCode == 13 || $event.keyCode == 40 || $event.keyCode == 38) {
            $event.preventDefault();
            return false;
          }
        };

        $scope._click = function($event) {
          var item = null;
          if($scope.typeaheadHoverIndex > 0 && $scope.typeaheadData && $scope.typeaheadHoverIndex - 1 < $scope.typeaheadData.length){
            item = $scope.typeaheadData[$scope.typeaheadHoverIndex - 1];
          }
          $scope.click({item:item, value:$scope.model});
        };

        $scope._typeaheadClick = function(item){
          $scope.click({item:item, value:$scope.model});
        };

        $scope._keyup = function($event) {
          if($event.keyCode == 13) { //enter
            $scope._click();
            $event.preventDefault();
            return false;
          } else if($event.keyCode == 40) { //down
            var length = 1;
            if($scope.typeaheadData && $scope.typeaheadData.length > 0) length = $scope.typeaheadData.length + 1;
            $scope.typeaheadHoverIndex = Math.mod($scope.typeaheadHoverIndex + 1, length);
            $scope.updateSuggested();
            $event.preventDefault();
            return false;
          } else if($event.keyCode == 38) { //up
            var length = 1;
            if($scope.typeaheadData && $scope.typeaheadData.length > 0) length = $scope.typeaheadData.length + 1;
            $scope.typeaheadHoverIndex = Math.mod($scope.typeaheadHoverIndex - 1, length);
            $scope.updateSuggested();
            $event.preventDefault();
            return false;
          }
        };
        $scope._change = function(){
          $scope.typeaheadHoverIndex = 0;
          $scope.change({model:$scope.model});
          $scope.updateSuggested();
          $scope.typeaheadHoverItem({item: null});
        };

        $scope._mouseover = function(item){
          $scope.typeaheadHoverItem({item: item});
        };
        $scope._mouseleave = function(item){
          $scope.typeaheadHoverItem({item: null});
        }
      }
    }
  }

  function SlideInputFormatter(){

    //(value:String, query:String, tag:String) -> :Html
    this.injectBold = function(value, query, tag){
      if(tag == null) tag = "b";

      var splitValue = value.toLowerCase().split(query.toLowerCase());
      var withBold = [];

      var startingIndex = 0;
      for(var i=0; i<splitValue.length; i++){
        var originalValue = value.slice(startingIndex, startingIndex + splitValue[i].length);
        var queryValueAtLocation = value.slice(startingIndex + splitValue[i].length, startingIndex + splitValue[i].length + query.length);
        startingIndex += splitValue[i].length + query.length;

        withBold.push(originalValue);
        if(i < splitValue.length - 1){
          withBold.push("<"+tag+">" + queryValueAtLocation + "</"+tag+">");
        }
      }
      return withBold.join("");
    };

    //(value:String, query:String) -> :String
    this.afterFirstOccurence = function(value, query) {
      var index = value.toLowerCase().indexOf(query.toLowerCase());

      return query + value.slice(index + query.length, value.length);
    }
  }

})();
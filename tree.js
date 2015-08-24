'use strict';

var app = angular.module('90TechSAS.angular-tree', []);

app.factory('RecursionHelper', ['$compile', function($compile){
    return {
        /**
         * Manually compiles the element, fixing the recursion loop.
         * @param element
         * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
         * @returns An object containing the linking functions.
         */
        compile: function(element, link){
            // Normalize the link parameter
            if (angular.isFunction(link)){
                link = {post: link};
            }

            // Break the recursion loop by removing the contents
            var contents = element.contents().remove();
            var compiledContents;
            return {
                pre : (link && link.pre) ? link.pre : null,
                /**
                 * Compiles and re-adds the contents
                 */
                post: function(scope, element){
                    // Compile the contents
                    if (!compiledContents){
                        compiledContents = $compile(contents);
                    }
                    // Re-add the compiled contents to the element
                    compiledContents(scope, function(clone){
                        element.append(clone);
                    });

                    // Call the post-linking function, if any
                    if (link && link.post){
                        link.post.apply(null, arguments);
                    }
                }
            };
        }
    };
}]);

app.directive("zlTree", function(RecursionHelper){
    return {
        restrict  : "E",
        scope     : {elt: '=zlTreeRoot', loadFunction: '&', template: '=', zlSelected: '=', idField: '@'},
        template  :
        '<div class="zl-tree-button-container"><button ng-if="elt.children.length" class="zl-tree-toggle-button" ng-click="toggleMe()">{{toggle ? \'-\' : \'+\'}}</button></div>' +
        '<input class="zl-tree-checkbox" type="checkbox" ng-click="checkme(elt)" ng-checked="checked(elt)">' +
        '<ng-include src="template" ></ng-include>' +
        '<ul class="zl-tree-ul" ng-if="toggle">' +
        '<div ng-if="loading" class="zl-tree-spinner"></div>' +
        '<li class="zl-tree-li" ng-if="!loading" ng-repeat="child in children">' +
        '<zl-tree zl-tree-root="child" load-function="loadFunction({$id: $id, $parent: $parent})" template="template" zl-selected="zlSelected" id-field="idField"></zl-tree>' +
        '</li>' +
        '</ul>',
        compile   : RecursionHelper.compile,
        controller: function($scope){
            $scope.zlSelected = $scope.zlSelected || [];
            var idField = $scope.idField || 'id';
            $scope.checkme = function(elt){
                if (_.contains($scope.zlSelected, elt[idField])){
                    _.pull($scope.zlSelected, elt[idField]);
                } else {
                    $scope.zlSelected.push(elt[idField]);
                }
            };
            $scope.checked = function(elt){
                return _.contains($scope.zlSelected, elt[idField]);
            };
            $scope.toggleMe = function(){
                $scope.toggle = !$scope.toggle;
                if ($scope.toggle && !$scope.children){
                    $scope.loading = true;
                    $scope.loadFunction({$id: $scope.elt.children, $parent: $scope.elt}).then(function(data){
                        $scope.children = data;
                        $scope.loading  = false;
                    })
                }
            }
        }
    };
});
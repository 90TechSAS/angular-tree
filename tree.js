'use strict';

var app = angular.module('90TechSAS.angular-tree', []);


app.directive("zlTreeRow", ['$compile', function($compile){
    return {
        restrict  : 'A',
        scope     : {elt: "=zlTreeRoot", loadFunction: '&', columns: '=', depth: '=', zlSelected: '=', idField: '@', selectCallback: '&'},
        replace: true,
        template  : '<tr ng-click="checkme(elt)" ng-class="{\'checked\': checked(elt)}">' +
        '<td ng-click="toggleMe(); $event.stopImmediatePropagation()">' +
        '<button class="zl-tree-toggle-button"  ng-class="{\'open\': toggle}"  ng-if="elt.children.length"></button>' +
        '<div class="zl-tree-no-children" ng-if="!elt.children.length"></div>' +
        '</td>' +
        '<td ng-repeat="col in columns">{{elt[col]}}</td></tr>',
        controller: function($scope){
            $scope.zlSelected = $scope.zlSelected || [];
            $scope.depth      = $scope.depth || 0;
            var idField       = $scope.idField || 'id';
            $scope.checkme    = function(elt){
                if (_.contains($scope.zlSelected, elt[idField])){
                    _.pull($scope.zlSelected, elt[idField]);
                } else{
                    $scope.zlSelected.push(elt[idField]);
                    $scope.selectCallback && $scope.selectCallback({$elt: elt});
                }
            };
            $scope.checked    = function(elt){
                return _.contains($scope.zlSelected, elt[idField]);
            };

            function extractChildrenIds(elt){
                return _.map(elt.children, function(c){
                    if (typeof c === 'object'){
                        return c[idField];
                    }
                    return c;
                });
            }

            $scope.addChildren = function(elt){
                $scope.zlSelected = _.union($scope.zlSelected, extractChildrenIds(elt));
            };

            $scope.removeChildren = function(elt){
                $scope.zlSelected = _.difference($scope.zlSelected, extractChildrenIds(elt));
            };

            $scope.loadChildren = function(){
                $scope.loadFunction({$id: $scope.elt.children, $parent: $scope.elt}).then(function(data){
                    $scope.children     = data;
                    $scope.elt.children = _.pluck(data, idField);
                    $scope.loading      = false;
                })
            };

            $scope.toggleMe = function(){
                if (!$scope.elt.children.length){
                    return;
                }
                $scope.toggle = !$scope.toggle;
                if ($scope.toggle && !$scope.children){
                    $scope.loading = true;
                    $scope.loadChildren();
                }
            }
        },
        compile   : function(){
            return {
                post: function(scope, element){

                    var tplte = '<tr ng-if="loading"><td style="text-align:center;" colspan="{{columns.length + 1}}"><div class="zl-tree-loading"></div></td></tr>' +
                        '<tr ng-if="!loading && toggle" ' +
                        'ng-repeat="child in children" ' +
                        'zl-tree-row zl-tree-root="child" ' +
                        'load-function="loadFunction({$id: $id, $parent: $parent})" ' +
                        'columns="columns" depth="depth+1"' +
                        'zl-selected="zlSelected"' +
                        'id-field="{{idField}}">' +
                        'select-callback="selectCallback({$elt: $elt})"' +
                        '</tr>';
                    $compile(tplte)(scope, function(clone){
                        element.after(clone);
                        element.addClass('depth-' + scope.depth);
                    });
                }
            }
        }
    }


}]);

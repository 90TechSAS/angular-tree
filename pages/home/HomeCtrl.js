/**
 */

'use strict';

angular.module('myApp').controller('HomeCtrl', ['$scope', '$q', '$timeout', function($scope, $q, $timeout){

    $scope.root = makeOne(0);

    function makeOne(id){
        var detail = {id: id, children: []};
        _.times(_.random(1000), function(i){
            detail.children.push(_.random(10000000));
        });
        return detail
    }

    $scope.getBatch = function(ids){
        console.info(ids);
        var def = $q.defer();
        $timeout(function(){
            def.resolve(_.map(ids, makeOne));
        }, 1000);
        return def.promise;
    };


    $scope.getDetail = function(id){
        var def = $q.defer();
        $timeout(function(){
            def.resolve(makeOne(id));
        }, 1000);
        return def.promise;
    }

}]);
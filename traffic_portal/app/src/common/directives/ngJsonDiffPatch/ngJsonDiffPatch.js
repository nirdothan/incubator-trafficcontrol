/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var ngJsonDiffPatch = function() {
  var defaults = {};

  return {
    restrict: "A",
    require: "ngModel",
    link: function($scope, element, attrs, ngModel) {
      function update() {
        var delta = jsondiffpatch.diff($scope.originalFullData, $scope.fullData);
        element.html(jsondiffpatch.formatters.html.format(delta));
      }

      $scope.$watch("fullData", function() { update(); });
      $scope.$watch("originalFullData", function() { update(); });
    },
  };
};

ngJsonDiffPatch.$inject = [];
module.exports = ngJsonDiffPatch;

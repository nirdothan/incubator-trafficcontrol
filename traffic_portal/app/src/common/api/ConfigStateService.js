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

var ConfigStateService = function($http, $q, ENV) {

    this.getConfigState = function() {
        var deferred = $q.defer();

        // var json = {"response":[{"FormatVersion":1,"DbState":{"Info":[{"Table":"Deliveryservice","RowsCount":2,"RowLastUpdated":"2018-01-15 13:27:00.668942+00"},{"Table":"DeliveryserviceServer","RowsCount":2,"RowLastUpdated":"2018-01-15 14:48:35.242432+00"}],"Label":"20180115-144835"},"QueueUpdate":{"Info":{"Prefix":null,"Time":null},"Label":":"}}]}
        // deferred.resolve(json.response)
        $http.get(ENV.api['root'] + "config-state")
            .then(
                function(result) {
                    deferred.resolve(result.data.response);
                },
                function(fault) {
                    deferred.reject(fault);
                }
            );

        return deferred.promise;
    };
};

ConfigStateService.$inject = ['$http', '$q', 'ENV'];
module.exports = ConfigStateService;

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

var FormUtils = function() {
  this.labelize = function(string) {
    return string.replace(/([A-Z])/g, " $1").replace(/^./, function(str) {
      return str.toUpperCase();
    });
  };

  this.extractJsonFromRemapText = function(remapText) {
    var regex = /^(.*?)#\s*?config=(.+$)$/;
    var original = "";
    var data = {};

    try {
      if (remapText) {
        var match = remapText.match(regex);
        if (match) {
          original = match[1];
          data = JSON.parse(match[2]);
        } else {
          original = remapText;
        }
      }
    } catch (e) {
      original = remapText;
      console.error("exception during remap parsing:", e);
    }

    return [original, data];
  };

  this.combineToRemapText = function(remapTextReal, jsonData) {
      return remapTextReal + "# config=" + JSON.stringify(jsonData)
  }
};

FormUtils.$inject = [];
module.exports = FormUtils;

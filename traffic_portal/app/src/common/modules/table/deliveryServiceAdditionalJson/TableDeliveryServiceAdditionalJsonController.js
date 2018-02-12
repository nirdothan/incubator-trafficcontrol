var TableDeliveryServiceServersController = function(
  deliveryService,
  deliveryServiceService,
  $scope,
  messageModel,
  stringUtils,
  $http,
  ENV
) {
  var EASY_MODE = "easy";
  var FULL_MODE = "full";

  var mappings = [
    // Subitem
    {
      from: "subitem[0].operation.subitemManipulation.minStepSizeForChunking",
      to: "subitem.minStepSizeForChunking",
      default: null,
      discardIf: isNull,
      schema: { oneOf: [{ type: "integer", minimum: 1 }, { type: "null" }] },
    },
    {
      from: "subitem[0].operation.subitemManipulation.maxSegmentSecViewTime",
      to: "subitem.maxSegmentSecViewTime",
      default: null,
      discardIf: isNull,
      schema: { oneOf: [{ type: "integer", minimum: 1 }, { type: "null" }] },
    },
    {
      from: "subitem[0].operation.subitemManipulation.requiredChunkSecViewTime",
      to: "subitem.requiredChunkSecViewTime",
      default: null,
      discardIf: isNull,
      schema: { oneOf: [{ type: "integer", minimum: 1 }, { type: "null" }] },
    },
    {
      from: "subitem[0].elements[0].priority",
      to: "subitem.priority",
      default: null,
      discardIf: isNull,
      schema: { oneOf: [{ type: "integer", minimum: 1 }, { type: "null" }] },
    },
    {
      from: "subitem[0].elements[0].match",
      to: "subitem.match",
      default: null,
      discardIf: isNull,
      schema: { oneOf: [{ type: "string", enum: ["kMatchAll", "kMatchOnlyOne"] }, { type: "null" }] },
    },
    {
      from: "subitem[0].elements[0].tokens",
      to: "subitem.tokens",
      default: [],
      discardIf: isEmpty,
      transformFullToPartialFunc: tokenTransformFullToPartialFunc,
      transformPartialToFullFunc: tokenTransformPartialToFullFunc,
      schema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            pathSegment: {
              type: "object",
              properties: {
                prefix: { type: ["string", "null"] },
                suffix: { type: ["string", "null"] },
              },
            },
            extractionRule: {
              type: "object",
              properties: {
                startExtractDelimiter: { type: "string" },
                startExtractDelimiterIndex: { type: "integer", minimum: 0 },
                endExtractDelimiter: { type: "string" },
                endExtractDelimiterIndex: { type: "integer", minimum: 0 },
              },
            },
          },
        },
      },
    },
    // Cache
    {
      from: "serverResponseEchoRules",
      to: "cache.serverResponseEchoRules",
      default: [],
      discardIf: isEmpty,
      schema: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,

          properties: {
            name: { type: "string" },
            type: { type: "string", enum: ["kStoreAndServe", "kDontStoreDontServe"] },
          },
        },
      },
    },
    {
      from: "shouldStoreOrigServerResponseHeadersInMeta",
      to: "cache.shouldStoreOrigServerResponseHeadersInMeta",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "shouldServeOrigServerResponseHeadersFromMetaToLocal ",
      to: "cache.shouldServeOrigServerResponseHeadersFromMetaToLocal ",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "shouldStoreLastModifiedPerSubietm",
      to: "cache.shouldStoreLastModifiedPerSubietm",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "shouldStoreEtagPerSubietm",
      to: "cache.shouldStoreEtagPerSubietm",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "deleteContentOn404",
      to: "cache.deleteContentOn404",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useSMaxAge",
      to: "cache.useSMaxAge",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useMaxAge",
      to: "cache.cacheControlKnobs.useMaxAge",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useNoStore",
      to: "cache.cacheControlKnobs.useNoStore",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useNoCache",
      to: "cache.cacheControlKnobs.useNoCache",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useNoTransform",
      to: "cache.cacheControlKnobs.useNoTransform",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useProxyRevalidate",
      to: "cache.cacheControlKnobs.useProxyRevalidate",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.usePrivate",
      to: "cache.cacheControlKnobs.usePrivate",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useMustRevalidate",
      to: "cache.cacheControlKnobs.useMustRevalidate",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.usePublic",
      to: "cache.cacheControlKnobs.usePublic",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useExpires",
      to: "cache.cacheControlKnobs.useExpires",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.invalidateByLastModified",
      to: "cache.cacheControlKnobs.invalidateByLastModified",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.invalidateByEtag",
      to: "cache.cacheControlKnobs.invalidateByEtag",
      schema: { oneOf: [{ type: "boolean", enum: [true, false] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.fallbackMinExpirySec",
      to: "cache.cacheControlKnobs.fallbackMinExpirySec",
      schema: { oneOf: [{ type: "integer" }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.maxStaleSec",
      to: "cache.cacheControlKnobs.maxStaleSec",
      schema: { oneOf: [{ type: "integer" }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.minExpirySec",
      to: "cache.cacheControlKnobs.minExpirySec",
      schema: { oneOf: [{ type: "integer" }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.minFreshSec",
      to: "cache.cacheControlKnobs.minFreshSec",
      schema: { oneOf: [{ type: "integer" }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    // Multi origin
    {
      from: "origins.hosts",
      to: "origins.hosts",
      default: [],
      schema: {
        type: "array",
        items: {
          type: "string",
          pattern: "^\\S+\\.\\S+",
        },
      },
    },
    {
      from: "origins.algorithm",
      to: "origins.algorithm",
      default: "ROUNDROBIN",
      schema: {
        type: "string",
        enum: ["ROUNDROBIN", "WRR", "HASH"],
      },
    },
    {
      from: "origins.config",
      to: "origins.config",
      default: [],
      schema: {
        type: "array",
        items: {
          type: "integer",
        },
      },
    },
  ];

  function createSchemaFromMappings(mappings) {
    const schema = {
      title: "Validation schema",
      type: "object",
      additionalProperties: false,
      properties: {},
    };

    mappings.forEach(function(mapping) {
      var parts = mapping.to.split(".");

      var currentProperties = schema;
      for (var i = 0; i < parts.length - 1; i++) {
        if (!currentProperties["properties"][parts[i]]) {
          currentProperties["properties"][parts[i]] = { type: "object", properties: {} };
        }

        currentProperties = currentProperties["properties"][parts[i]];
      }

      currentProperties.properties[parts[parts.length - 1]] = mapping.schema;
    });

    return schema;
  }

  function tokenTransformFullToPartialFunc(tokens) {
    if (tokens) {
      return tokens.filter(function(token) {
        return "pathSegment" in token;
      });
    } else {
      return [];
    }
  }

  function tokenTransformPartialToFullFunc(currentTokens, newTokens) {
    if (currentTokens) {
      return currentTokens
        .filter(function(token) {
          return !("pathSegment" in token);
        })
        .concat(newTokens);
    } else {
      return newTokens;
    }
  }

  function isNull(value) {
    return value === null;
  }

  function isEmpty(value) {
    return value === null || value.length === 0;
  }

  function convertFullDataToEasyData(fullData, mappings) {
    const friendlyJson = {};
    mappings.forEach(function(mapping) {
      const value = lodash.get(fullData, mapping.from, mapping.default);
      const transformedValue = mapping.transformFullToPartialFunc ? mapping.transformFullToPartialFunc(value) : value;
      lodash.set(friendlyJson, mapping.to, transformedValue);
    });
    return friendlyJson;
  }

  function convertEasyDataToFullData(easyData, mappings, currentFullData) {
    var newFullData = angular.copy(currentFullData);

    mappings.forEach(function(mapping) {
      const newValue = lodash.get(easyData, mapping.to, null);
      const currentValue = lodash.get(newFullData, mapping.from, null);

      var transformedValue = newValue;
      if (mapping.transformPartialToFullFunc) {
        transformedValue = mapping.transformPartialToFullFunc(currentValue, newValue);
      }

      if (mapping.discardIf && mapping.discardIf(transformedValue)) {
        lodash.unset(newFullData, mapping.from);
      } else {
        lodash.set(newFullData, mapping.from, transformedValue);
      }
    });

    // Special post-processing
    if (newFullData.cacheControlKnobs && Object.keys(newFullData.cacheControlKnobs).length === 0) {
      delete newFullData.cacheControlKnobs;
    }

    if (newFullData.origins && newFullData.origins.hosts && newFullData.origins.hosts.length === 0) {
      delete newFullData.origins;
    }

    return newFullData;
  }

  function getJsonEditorEasyDataConfig(fullData, mappings, schema) {
    return {
      json: convertFullDataToEasyData(fullData, mappings),
      options: { mode: "tree", schema: schema, history: false },
    };
  }

  function getJsonEditorFullDataConfig(fullData) {
    return {
      json: fullData,
      options: { mode: "code", schema: null, history: false },
    };
  }

  function updateFullDataFromJsonEditor() {
    if ($scope.selectedMode === EASY_MODE) {
      $scope.fullData = convertEasyDataToFullData($scope.jsonEdtiorConfig.json, mappings, $scope.fullData);
    } else if ($scope.selectedMode === FULL_MODE) {
      $scope.fullData = $scope.jsonEdtiorConfig.json;
    }
  }

  function updateJsonEditorFromFullData() {
    if ($scope.selectedMode === EASY_MODE) {
      $scope.jsonEdtiorConfig = getJsonEditorEasyDataConfig($scope.fullData, mappings, schema);
    } else if ($scope.selectedMode === FULL_MODE) {
      $scope.jsonEdtiorConfig = getJsonEditorFullDataConfig($scope.fullData);
    }
  }

  function _friendlyExceptionNotification(e, customMessage) {
    if (customMessage) {
      console.error("Message: " + customMessage);
    }
    console.error(e);

    var friendlyMessage =
      "Additional JSON editor failed - Please report this issue to the developers and don't use it to edit the JSON";
    if (customMessage) {
      friendlyMessage = customMessage;
    }

    messageModel.setMessages([{ level: "error", text: friendlyMessage }], false);
  }

  $scope.onModeChange = function() {
    try {
      if ($scope.selectedMode === FULL_MODE) {
        $scope.fullData = convertEasyDataToFullData($scope.jsonEdtiorConfig.json, mappings, $scope.fullData);
      }

      updateJsonEditorFromFullData();
    } catch (e) {
      _friendlyExceptionNotification(e);
    }
  };
  $scope.onUpdate = function() {
    try {
      updateFullDataFromJsonEditor();
      var dataWithName = { signature: $scope.fullData };
      if ($scope.fullData.remoteClassificationFallbackSignature) {
        dataWithName.sourceSignature = $scope.fullData.remoteClassificationFallbackSignature;
      }
      deliveryService.remapText = stringUtils.combineToRemapText($scope.originalBeforeData, dataWithName);

      $scope.isUpdateInProgress = true;
      deliveryServiceService
        .updateDeliveryService(deliveryService)
        .then(function() {
          $scope.originalFullData = $scope.fullData;
          $scope.isUpdateInProgress = false;
        })
        .catch(function(e) {
          _friendlyExceptionNotification(e, "Failed to save changes");
        });
      //$location.path('/configure/delivery-services/' + deliveryService.id);
    } catch (e) {
      _friendlyExceptionNotification(e);
    }
  };

  $scope.onRevert = function() {
    try {
      $scope.selectedMode = FULL_MODE;
      $scope.fullData = $scope.originalFullData;
      updateJsonEditorFromFullData();
    } catch (e) {
      _friendlyExceptionNotification(e);
    }
  };

  $scope.updateFromTemplate = function(template) {
    try {
      $scope.selectedMode = FULL_MODE;
      $scope.fullData = template;
      updateJsonEditorFromFullData();
    } catch (e) {
      _friendlyExceptionNotification(e);
    }
  };

  $scope.$watch(
    "jsonEdtiorConfig.json",
    function(newValue, oldValue) {
      try {
        updateFullDataFromJsonEditor();
      } catch (e) {
        _friendlyExceptionNotification(e);
      }
    },
    true
  );

  var schema = createSchemaFromMappings(mappings);

  try {
    $scope.deliveryService = deliveryService;

    var result = stringUtils.extractJsonFromRemapText(deliveryService.remapText);
    $scope.originalBeforeData = result[0];
    $scope.originalFullData = result[1].signature || {};

    $scope.fullData = angular.copy($scope.originalFullData);
    $scope.jsonEdtiorConfig = getJsonEditorEasyDataConfig($scope.fullData, mappings, schema);
    $scope.selectedMode = EASY_MODE;
    $scope.isUpdateInProgress = false;
  } catch (e) {
    _friendlyExceptionNotification(e);
  }

  $scope.templates = [];
  try {
    $http
      .get(ENV.api["root"] + "msp-templates/dump")
      .then(function(result) {
        $scope.templates = result.data.response.templates;
      })
      .catch(function(e) {
        _friendlyExceptionNotification("Failed to load templates");
      });
  } catch (e) {
    _friendlyExceptionNotification("Failed to load templates");
  }
};

TableDeliveryServiceServersController.$inject = [
  "deliveryService",
  "deliveryServiceService",
  "$scope",
  "messageModel",
  "stringUtils",
  "$http",
  "ENV",
];
module.exports = TableDeliveryServiceServersController;

var TableDeliveryServiceServersController = function(
  deliveryService,
  $scope,
  $state,
  $uibModal,
  locationUtils,
  serverUtils,
  deliveryServiceService
) {
  function extractJsonFromRemapText(deliveryService) {
    var regex = /^#\s*?config=(.+$)/;
    var data = {};

    if (!deliveryService) {
      throw new Error("expected a deliveryService, got: " + deliveryService);
    }

    var remapText = deliveryService.remapText;
    try {
      if (remapText) {
        var match = remapText.match(regex);
        if (match) {
          data = JSON.parse(match[1]);
        }
      }
    } catch (e) {
      console.error("failed to find a JSON object in: " + remapText);
    }

    return data;
  }
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
    return tokens.filter(function(token) { return 'pathSegment' in token; });
  }
  function tokenTransformPartialToFullFunc(currentTokens, newTokens) {
    if (currentTokens) {
      return currentTokens.filter(function(token) { return !('pathSegment' in token); }).concat(newTokens);
    } else {
      return newTokens;
    }
  }
  function isNull(value) {
    return value === null;
  }

  function convertDataToEasyData(data, mappings) {
    const friendlyJson = {};
    mappings.forEach(function(mapping) {
      const value = lodash.get(data, mapping.from, mapping.default);
      const transformedValue = mapping.transformFullToPartialFunc ? mapping.transformFullToPartialFunc(value) : value;
      lodash.set(friendlyJson, mapping.to, transformedValue);
    });
    return friendlyJson;
  }

  var mappings = [
    // Subitem
    {
      from: "subitem[0].operation.subitemManipulation.minStepSizeForChunking",
      to: "subitem.minStepSizeForChunking",
      default: 1,
      schema: { type: "integer", minimum: 1 },
    },
    {
      from: "subitem[0].operation.subitemManipulation.maxSegmentSecViewTime",
      to: "subitem.maxSegmentSecViewTime",
      default: 7,
      discardIf: isNull,
      schema: { oneOf: [{ type: "integer", minimum: 1 }, { type: "null" }] },
    },
    {
      from: "subitem[0].operation.subitemManipulation.requiredChunkSecViewTime",
      to: "subitem.requiredChunkSecViewTime",
      default: 3600,
      schema: { type: "integer", minimum: 1 },
    },
    {
      from: "subitem[0].elements[0].priority",
      to: "subitem.priority",
      default: 1,
      schema: { type: "integer", minimum: 1 },
    },
    {
      from: "subitem[0].elements[0].match",
      to: "subitem.match",
      default: "kMatchOnlyOne",
      schema: { type: "string", enum: ["kMatchAll", "kMatchOnlyOne"] },
    },
    {
      from: "subitem[0].elements[0].tokens",
      to: "subitem.tokens",
      default: 1,
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
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "shouldServeOrigServerResponseHeadersFromMetaToLocal ",
      to: "cache.shouldServeOrigServerResponseHeadersFromMetaToLocal ",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "shouldStoreLastModifiedPerSubietm",
      to: "cache.shouldStoreLastModifiedPerSubietm",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "shouldStoreEtagPerSubietm",
      to: "cache.shouldStoreEtagPerSubietm",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "deleteContentOn404",
      to: "cache.deleteContentOn404",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useSMaxAge",
      to: "cache.useSMaxAge",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useMaxAge",
      to: "cache.cacheControlKnobs.useMaxAge",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useNoStore",
      to: "cache.cacheControlKnobs.useNoStore",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useNoCache",
      to: "cache.cacheControlKnobs.useNoCache",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useNoTransform",
      to: "cache.cacheControlKnobs.useNoTransform",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useProxyRevalidate",
      to: "cache.cacheControlKnobs.useProxyRevalidate",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.usePrivate",
      to: "cache.cacheControlKnobs.usePrivate",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useMustRevalidate",
      to: "cache.cacheControlKnobs.useMustRevalidate",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.usePublic",
      to: "cache.cacheControlKnobs.usePublic",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.useExpires",
      to: "cache.cacheControlKnobs.useExpires",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.invalidateByLastModified",
      to: "cache.cacheControlKnobs.invalidateByLastModified",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
      default: null,
      discardIf: isNull,
    },
    {
      from: "cacheControlKnobs.invalidateByEtag",
      to: "cache.cacheControlKnobs.invalidateByEtag",
      schema: { oneOf: [{ type: "string", enum: ["yes", "no"] }, { type: "null" }] },
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
      default: "RR",
      schema: {
        type: "string",
        enum: ["RR", "WRR", "HASH"],
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
  var originalData = extractJsonFromRemapText(deliveryService);

  var data = angular.copy(originalData);
  var schema = createSchemaFromMappings(mappings);
  var easyData = convertDataToEasyData(data, mappings);

  $scope.jsonEdtiorData = { json: easyData, options: { mode: "tree", schema: schema } };

  $scope.refresh = function() {
    alert("refreshing!");
  };
};

TableDeliveryServiceServersController.$inject = [
  "deliveryService",
  "$scope",
  "$state",
  "$uibModal",
  "locationUtils",
  "serverUtils",
  "deliveryServiceService",
];
module.exports = TableDeliveryServiceServersController;

var TableDeliveryServiceServersController = function(
  deliveryService,
  $scope,
  $state,
  $uibModal,
  locationUtils,
  serverUtils,
  deliveryServiceService
) {
  var originalData = {};
  var regex = /^#\s*?config=(.+$)/;

  if(!deliveryService || deliveryService.length < 1) {
    throw new Error('expected a deliveryService, got: ' + deliveryService);
  }

  var remapText = deliveryService[0].remapText;
  try {
    if (remapText) {
      var match = remapText.match(regex);
      if (match) {
        originalData = JSON.parse(match[1]);
      }
    }
  } catch(e) {
    console.error('failed to find a JSON object in: ' + remapText);
  }

  $scope.jsonEdtiorData = { json: originalData, options: { mode: 'tree' } };

  $scope.refresh = function() {
    alert('refreshing!');
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

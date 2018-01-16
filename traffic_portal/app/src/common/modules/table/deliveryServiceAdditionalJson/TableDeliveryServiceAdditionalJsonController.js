var TableDeliveryServiceServersController = function(deliveryService, $scope, $state, $uibModal, locationUtils, serverUtils, deliveryServiceService) {
  $scope.obj = {data: {a: 1}, options: { mode: 'tree' }};

  $scope.refresh = function() {alert("refreshing!")}
};

TableDeliveryServiceServersController.$inject = ['deliveryService', '$scope', '$state', '$uibModal', 'locationUtils', 'serverUtils', 'deliveryServiceService'];
module.exports = TableDeliveryServiceServersController;

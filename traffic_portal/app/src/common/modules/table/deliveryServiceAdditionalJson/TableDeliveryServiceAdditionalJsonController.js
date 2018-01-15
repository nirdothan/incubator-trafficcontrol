var TableDeliveryServiceServersController = function(deliveryService, $scope, $state, $uibModal, locationUtils, serverUtils, deliveryServiceService) {
  var container = document.getElementById("jsoneditor");
  var editor = new JSONEditor(container, {history: false});
};

TableDeliveryServiceServersController.$inject = ['deliveryService', '$scope', '$state', '$uibModal', 'locationUtils', 'serverUtils', 'deliveryServiceService'];
module.exports = TableDeliveryServiceServersController;

function ShiftsController() {

  var self = this;

}

let ShiftsComponent = {
  templateUrl: 'shifts/shifts.html',
  controller: ShiftsController,
  controllerAs: '$ctrl'
};

angular.module('app')
  .component('shiftsComponent', ShiftsComponent);

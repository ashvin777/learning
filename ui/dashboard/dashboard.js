function DashboardController($rootScope, $http, $state) {

  var self = this;
  self.username = $rootScope.username || 'admin';
  self.current = $state.current.name;
  
  self.tabs = [{
    label: 'Production Report',
    state: 'dashboard.reports'
  }, {
    label: 'Settings',
    state: 'dashboard.settings'
  }];

  self.activeTab = self.tabs[0];

  self.setTab = function (tab) {
    self.current = tab.state;
  }

  self.getSelectedFrame = function () {
    $http.get(BASE_URL + 'storage?key=selectedFrame').then(function (res) {
      $rootScope.selectedFrame = res.data;
    });
  }

  self.logout = function () {
    $state.go('login');
  }

  self.getSelectedFrame();

}




let DashboardComponent = {
  templateUrl: 'dashboard/dashboard.html',
  controller: DashboardController,
  controllerAs: '$ctrl'
};

angular.module('app')
  .component('dashboardComponent', DashboardComponent);

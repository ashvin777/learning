const BASE_URL = '/sql';

angular.module('app', [
  'ui.router',
  'ui.scroll'
  ])
  .config(($stateProvider, $urlRouterProvider) => {

    $stateProvider
      .state('login', {
        url: '/login',
        component: 'loginComponent'
      })

      .state('dashboard', {
        url: '/dashboard',
        component: 'dashboardComponent'
      })
      
      .state('dashboard.reports', {
        url: '/reports',
        component: 'reportsComponent'
      })
      
      .state('dashboard.shifts', {
        url: '/shifts',
        component: 'shiftsComponent'
      })
      
      .state('dashboard.settings', {
        url: '/settings',
        component: 'settingsComponent'
      });

    $urlRouterProvider.otherwise('/login');

  });

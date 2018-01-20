function ReportsController($http, $timeout, $rootScope) {

  var self = this;
  self.searchBy = 'none';
  $rootScope.logs = [];

  var get = function (index, count, success) {
    $timeout(function () {

      // If a negative, reset to start of list.
      if (index < 0) {
        count = count + index;
        index = 0;

        if (count <= 0) {
          success([]);
          return;
        }
      }

      var result = [];
      for (var i = index; i <= index + count - 1; i++) {
        if ($rootScope.logs[i]) {
          result.push($rootScope.logs[i]);
        }
      }
      success(result);
    }, 100);
  };

  self.getLogs = function () {
    $http.post(BASE_URL + 'sql', {
      "query": "select * from logs ORDER BY ID DESC"
    }).then(function (logs) {

      $timeout(function () {
        $rootScope.logs = [];
        $rootScope.logs = logs.data;
        self.lastLog = $rootScope.logs[0];
        if (self.logsAdapter) {
          self.logsAdapter.reload(0);
        }
      }, 100);

    });
  }

  self.logsDatasource = {
    get: get
  };

  self.searchLogs = function () {
    if (self.searchBy && self.searchBy != 'none' && self.searchString) {

      self.options = {
        searchBy: self.searchBy,
        searchString: self.searchString,
        startTime: self.searchStartTime,
        endTime: self.searchEndTime
      };

      self.getLogs();

    } else {
      alert('Please select search by and search text');
    }
  }

  self.clear = function () {
    self.options = {};
    self.searchBy = 'none';
    self.searchString = '';
    self.searchStartTime = null;
    self.searchEndTime = null;
    self.getLogs();
  };

  self.downloadLogs = function () {

	var timestamp = new Date().getTime();

    bootbox.prompt("Enter the file name", function (name) {
		
	  var path = 'E:/' + name + '.xlsx';
		
      if (path) {
        $http.get(BASE_URL + 'downloadLogs?path=' + path, { params: self.options }).then(function () {
          alert('File save at path ' + path);
        });
      }
    });
  }

  self.getFormattedDate = function (date) {
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return month + '-' + day + '-' + year;
  }

  self.getTime = function (date) {
    return new Date(date).getTime();
  }


  var ws = new WebSocket("ws://localhost:1880/ws/logs");

  ws.onmessage = function (evt) {
    self.getLogs();
  };

  window.onbeforeunload = function (event) {
    socket.close();
  };

  self.getLogs();

}

let ReportsComponent = {
  templateUrl: 'reports/reports.html',
  controller: ReportsController,
  controllerAs: '$ctrl'
};

angular.module('app')
  .component('reportsComponent', ReportsComponent);
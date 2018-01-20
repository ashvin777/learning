function SettingsController($http, $interval, $timeout, $rootScope) {

  var self = this;
  self.frames = [];
  self.shifts = [];
  self.options = {};
  self.selectedShift = {};

  self.getFrames = function () {
    $http.post(BASE_URL + 'sql', {
      query: 'select * from frames'
    }).then(function (frames) {
      self.frames = frames.data;

      self.getSelectedFrame();
    });
  }

  self.getSelectedFrame = function () {
    $http.get(BASE_URL + 'storage?key=selectedFrame').then(function (res) {
      $rootScope.selectedFrame = res.data;
    });
  }

  self.setSelectedFrame = function (frame) {
    $rootScope.selectedFrame = frame;
    $http.post(BASE_URL + 'storage', {
      key: 'selectedFrame',
      value: frame
    }).then(function (selectedFrame) {
      alert('Frame set successfully');
    });
  }

  self.getShifts = function () {
    $http.post(BASE_URL + 'sql', {
      query: 'select * from shifts'
    }).then(function (res) {
      self.shifts = res.data;
    });
  }

  self.addShift = function (shift) {
    let data = {};
    data.name = shift.name;
    data.starttime = new Date(shift.starttime).toString().slice(16, 21);
    data.endtime = new Date(shift.endtime).toString().slice(16, 21);

    $http.post(BASE_URL + 'sql', {
      query: `insert into shifts(id, name, starttime,endtime) values(5, '${data.name}', '${data.starttime}', '${data.endtime}')`
    }).then(function () {
      alert('Shift added successfully');
      self.getShifts();
    });
  }

  self.deleteShift = function (shift) {
    $http.post(BASE_URL + 'sql', {
      query: 'DELETE FROM SHIFTS WHERE id= ' + shift.id + ';'
    }).then(function () {
      alert('Shift deleted successfully');
      self.getShifts();
    });
  }



  self.saveFrameSerial = function (frame) {
    if (!(frame.serialstart >= 0)) {
      frame.serialstart = '';
      alert('Please enter a number');
      return;
    }

    $http.post(BASE_URL + 'sql', {
      query: 'UPDATE FRAMES SET serialstart = ' + frame.serialstart + ' WHERE id = ' + frame.id + ';'
    }).then((res) => {
      alert('Frame updated successfully');
    });
  }

  self.getSelectedFrame = function () {
    $http.get(BASE_URL + 'storage?key=selectedFrame').then(function (res) {
      self.selectedFrame = res.data;
    });
  }

  self.getFrames();
  self.getShifts();

}

let SettingsComponent = {
  templateUrl: 'settings/settings.html',
  controller: SettingsController,
  controllerAs: '$ctrl'
};

angular.module('app')
  .component('settingsComponent', SettingsComponent);

/* global angular */
'use strict';

angular.module('DoozerApp')
  .controller('MainCtrl', function ($scope, $http, $domUtilityService, $timeout) {
    $scope.routes = [];
    $scope.exports = [];
    $scope.formData = {};

    // ng-grid setup
    $scope.myData = [];
    $scope.colDefs = [];
    $scope.filterOptions = { filterText: '' };

    $scope.$watch('myData', function () {
      $scope.colDefs = [];

      if ($scope.myData[0]) {
        angular.forEach(Object.keys($scope.myData[0]), function (key) {
          $scope.colDefs.push({ field: key });
        });
      }
    });

    $scope.gridOptions = {
      data: 'myData',
      columnDefs: 'colDefs',
      enableColumnResize: true,
      enableRowSelection: false,
      filterOptions: $scope.filterOptions,
      showGroupPanel: true,
      enableHighlighting: true
    };

    $scope.currentRoute = {
      description: null,
      name: 'Select One',
      uri: '/'
    };

    // Get all the routes
    $scope.getRoutes = function () {
      $http.get('/routes').then(function (r) {
        $scope.routes = r.data.routes;
      });
    };

    $scope.getExports = function () {
      $http.get('/exports').then(function (r) {
        $scope.exports = r.data.exports;
      });
    };

    // Drop down control
    $scope.changeRoute = function (i) {
      $scope.currentRoute = $scope.routes[i];
      $scope.toggle = false;
      $scope.getForm();
    };

    $scope.exportResults = function (i) {
      switch ($scope.exports[i].name) {
      case 'email':
        if ($scope.currentRoute.results) {
          $scope.showModal(true);
        }
        break;
      case 'csv':
        break;
      default:
        var data = btoa(JSON.stringify({
          results: $scope.currentRoute.results,
          form: {email: ''}
        }));
        // can also be a get with /exports/uri/download?data=data
        $http.post('/exports/' + $scope.exports[i].name + '/download', data).success(function (r) {

        }).error(function () {

        });
      }
    };

    $scope.emailResults = function () {
      var data = btoa(JSON.stringify({
        results: $scope.currentRoute.results,
        form: {email: $scope.email}
      }));
      // can also be a get with /exports/uri/download?data=data
      $http.post('/exports/email/download', data).success(function (r) {
        $scope.showModal(false);
      }).error(function () {

      });
    };

    // Get form
    $scope.getForm = function () {
      $scope.loading = true;
      $scope.formData = {};

      $http.get($scope.currentRoute.uri + '/form').success(function (r) {
        if (r.fields) {
          $scope.currentRoute.form = r;
          $scope.currentRoute.formData = {};

          $scope.setDefaultFormData(r);

          $scope.currentAlert = { type: 'alert-success', msg: 'Loaded form schema from ' + $scope.currentRoute.uri + '/form' };
          $scope.loading = false;
        } else {
          $scope.currentRoute.form = {}
          $scope.getResults();
        }
      }).error(function () {
        $scope.loading = false;

        $scope.currentAlert = { type: 'alert-danger', msg: 'There was an error retrieving the form schema from ' + $scope.currentRoute.uri + '/form' };
      });
    };

    // Submit form
    $scope.submitForm = function () {
      $scope.loading = true;
      var data = JSON.stringify($scope.currentRoute.formData);
      $scope.getResults(data);
    };

    // Get results
    $scope.getResults = function (data) {
      $scope.loading = true;
      $http.post($scope.currentRoute.uri + '/results', data).success(function (r) {
        if (r) {
          $scope.currentRoute.results = r;
          $scope.myData = r.results;
          $scope.currentRoute.results.results = $scope.orderResults(r);
          $scope.currentAlert = { type: 'alert-success', msg: 'Results from ' + $scope.currentRoute.uri + '/results' };
          $scope.toggle = true;

          // Setup csv exports
          var data = btoa(JSON.stringify({
            results: $scope.currentRoute.results,
            form: {}
          }));
          $scope.loading = false;

          $http.post('/exports/csv/download', data).success(function (r) {
            angular.forEach($scope.exports, function (exportType) {
              if (exportType.name === 'csv') {
                exportType.href = 'data:application/csv;charset=utf-8,' + encodeURIComponent(r);
                exportType.filename = $scope.currentRoute.name + '.csv';
              }
            });
          });

        }
      }).error(function () {
        $scope.loading = false;
        $scope.currentAlert = { type: 'alert-danger', msg: 'There was an error retrieving the results from ' + $scope.currentRoute.uri + '/results' };
      });
    };


    // Set default fields
    $scope.setDefaultFormData = function (r) {
      angular.forEach(r.fields, function (val) {

        if (val['default'] && val.type !== 'p') {
          $scope.currentRoute.formData[val.id] = val['default'] || '';
        }

        if (val.type === 'multiselect') {
          $scope.currentRoute.formData[val.id] = [];
          angular.forEach(val.options, function (option) {
            if (option.selected) {
              $scope.currentRoute.formData[val.id].push(option.id);
            }
          });
        }

        if (val.type === 'radio' || val.type === 'select') {
          angular.forEach(val.options, function (option) {
            if (option.selected) {
              $scope.currentRoute.formData[val.id] = option.id;
            }
          });
          if (!$scope.currentRoute.formData[val.id]) {
            val.options[0].selected = true;
            $scope.currentRoute.formData[val.id] = val.options[0].id;
          }
        }

      });
    };

    $scope.orderResults = function (r) {
      var result = [],
          order = [],
          sorted = [];

      angular.forEach(r.headers, function (header) {
        order.push(header.id);
      });

      angular.forEach(r.results, function (val) {
        sorted = [];
        angular.forEach(order, function (header) {
          sorted.push({ 'class': header, 'val': val[header] });
        });
        result.push(sorted);
      });

      return result;
    };

    // Tell ng-grid to resize
    $scope.$watch('toggle', function () {
      $timeout(function () {
        $domUtilityService.RebuildGrid($scope.gridOptions.$gridScope, $scope.gridOptions.ngGrid);
      }, 0);

    });

    // Get routes on page load
    $scope.getRoutes();
    $scope.getExports();
  });

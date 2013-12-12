'use strict';

angular.module('DoozerApp', ['ui.utils', 'ngGrid'])
  .config([
    '$compileProvider',
    function ($compileProvider) {
      $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/);
    }
  ]);
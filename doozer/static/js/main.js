(function($) {

  var config = {
    routesUri: '/routes',
    apiUrl: "",
    debug: true,
    formContainer: '#form-container',
    formToggleIcons: {
      up: "glyphicon-chevron-up",
      down: "glyphicon-chevron-down"
    },
    resultsWidthIcons: {
      expand: "icon-resize-full",
      contract: "icon-resize-small"
    },
    resultsContainer: '#results',
    resultsContainerCsv: '#results-csv',

    init: function() {
      var _this = this;

      $resultsWidthToggle = $('#results-width-toggle');

      toolbar.init();

      $.get(config.routesUri, function(data) {
        $dropdown = $('#route-fields-menu');

        for (i in data.routes) {
          item = data.routes[i];

          $dropdown.append($("<li />")
                   .append($("<a />")
                   .attr('data-id', item.uri)
                   .text(item.name)));
        }

        _this.setListeners();
      })
      .error(function() { updateStatus("There was an error retrieving the routes from " + config.routesUri, 'alert-danger'); });
    },

    setListeners: function() {
      var _this = this;

      $('#route-fields-menu a').click(function(e) {
        e.preventDefault();
        if($(this).data('id') != 'select') {
          $('#route-fields-toggle').html($(this).text() + ' <b class="caret"></b>');

          config.apiUrl = (endsWith($(this).data('id'), '/')) ? $(this).data('id') : $(this).data('id') + "/";

          form.init();
        } else {
          $('#route-fields-toggle').html($(this).text() + ' <b class="caret"></b>');
        }
      });

      $('#form-toggle').click(function(e) {
        e.preventDefault();
        form.toggleForm();
      });

    }

  };

  var toolbar = {
    init: function() {
      this.setListeners();
      this.updateResultList();
    },

    saveResults: function(name, resultSet) {
      $.jStorage.set(name, resultSet);

      toolbar.updateResultList();
    },

    deleteResult: function(name) {
      $.jStorage.deleteKey(name)

      $('#results_save_name').val('');
      $('#results-list-toggle').html('Load Results <span class="caret"></span>');

      toolbar.updateResultList();
    },

    updateResultList: function() {
      var resultMenu = $('#results-list-menu');

      resultMenu.find('li[data-result-item="true"]').remove();

      var resultsIndex = $.jStorage.index();

      for (rs in resultsIndex) {
        var item = resultsIndex[rs];

        resultMenu.append($("<li />")
                   .attr('data-result-item', 'true')
                   .append($("<a />")
                   .attr('data-id', item)
                   .text(item)));
      }

      this.setListeners();
    },

    setListeners: function() {

      $('#results-width-toggle').unbind('click');
      $('#results-list-menu a').unbind('click');
      $('#results_save').unbind('click');
      $('#results_delete').unbind('click');
      $('#results-set-toggle').unbind('click');

      $('#savedresults-rollup').unbind('click');

      $('#results-width-toggle').click(function(e) {
        e.preventDefault();
        results.toggleWidth();
      });

      $('#results-list-menu a').click(function(e) {
        e.preventDefault();
        if ($(this).data('id') != 'select') {
          results.formData = $.jStorage.get($(this).data('id'));
          results.buildTable();

          $('#results_save_name').val($(this).text());

          $('#results-list-toggle').html($(this).text() + ' <span class="caret"></span>');
        } 
      });

      $('#results_save').click(function(e) {
        e.preventDefault();

        toolbar.saveResults($('#results_save_name').val(), results.formData);
      });

      $('#results_delete').click(function(e) {
        e.preventDefault();

        toolbar.deleteResult($('#results_save_name').val());
      });

      $('#savedresults-rollup').click(function(e) {
        e.preventDefault();

        $('#savedresults-toolbar').slideToggle();
        if ($('#savedresults-rollup').hasClass('glyphicon-chevron-down')) {
          $('#savedresults-rollup').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');

          return;
        }
        else {
          $('#savedresults-rollup').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');

          return;
        }
      });

      $('#results-set-toggle').click(function(e) {
        e.preventDefault();

        $(config.resultsContainerCsv).parent().slideToggle();
        $(config.resultsContainer).parent().slideToggle();
      });
    }
  };

  // Form object - builds the form and set listeners
  var form = {

    init: function() {

      var _this = this;
      $toggle = $('#form-toggle');

      // get schema from api
      $.get(config.apiUrl + 'form', function(data) {
        _this.schema = data.fields;
        updateStatus('Loaded form schema from ' + config.apiUrl + 'form', 'alert-success');
        _this.buildForm();
      })
      .error(function() { updateStatus("There was an error retrieving the form schema from " + config.apiUrl,'alert-danger'); });

    },

    show: function() {
      try {
        if(!$toggle.find('span').hasClass(config.formToggleIcons.up)) {
          form.toggleForm();
        }
      } catch (err) {

      }
    },

    hide: function() {
      try {
        if($toggle.find('span').hasClass(config.formToggleIcons.up)) {
          form.toggleForm();
        }
      } catch (err) {

      }
    },

    toggleForm: function() {
      $(config.formContainer).slideToggle();
      if($toggle.find('span').hasClass(config.formToggleIcons.up)) {
        $toggle.html('<span class="glyphicon '+config.formToggleIcons.down+'"></span>');
      } else {
        $toggle.html('<span class="glyphicon '+config.formToggleIcons.up+'"></span>');
      }
    },

    buildForm: function() {

      var $form,
          $group,
          $label,
          $input,
          $select, $option,
          item, option;

      $form = $('<form></form>');
      
      if(this.schema !== undefined) {

        for(var key in this.schema) {
          if(this.schema.hasOwnProperty(key)) {

            item = this.schema[key];

            // Build control group
            $group = $('<div />').addClass('control-group');

            switch (item.type) {

              case 'select':
              case 'multiselect':

                // Build label for form element
                $label = $('<label />')
                          .attr('for',item.id)
                          .text(item.text)
                          .addClass('control-label');

                $select = $('<select />').attr({
                            'id': item.id,
                            'name': item.id,
                            'multiple': 'multiple',
                            'data-type': item.type
                          });

                for(option in item['options']) {
                  option = item['options'][option];
                  $option = $('<option />')
                            .attr({'value': option.id})
                            .text(option.text);
                  if (option.selected) {
                    $option.attr('selected',true);
                  }
                  $select.append($option);
                }

                $group.append($label, $select);
                $form.append($group);

                if(item.type === 'select') {
                  $select.addClass('selectpicker');
                  $select.attr("multiple", false);
                  $select.selectpicker();
                } else {
                  $select.multiselect();
                }

                break;

              case 'radio':

                // Build label for form element
                $label = $('<label />')
                          .attr('for',item.id)
                          .text(item.text)
                          .addClass('control-label');

                $group.append($label);

                for(option in item['options']) {
                  option = item['options'][option];

                  $label = $('<label />')
                            .attr('for',option.id)
                            .text(option.text)
                            .addClass('radio-label');

                  $option = $('<input type="radio" />').attr({
                              'id': option.id,
                              'value': option.id,
                              'name': item.id
                            });

                  if (option.selected) {
                    $option.attr('checked',true);
                  }

                  $group.append($('<div />').append($option, $label));

                }

                $form.append($group);

                break;

              default:
                 // Build label for form element
                  $label = $('<label />')
                            .attr('for',item.id)
                            .text(item.text)
                            .addClass('control-label');

                  // Build input
                  $input = $('<input type="text" />').attr({
                              'id': item.id,
                              'name': item.id,
                              'value': item.default,
                              'style': item.style,
                              'class': item.class,
                              'data-type': item.type
                            })
                            .addClass('input-block-level');

                  if (item.required === true) {
                    $input.addClass('required');
                  }
                  $group.append($label, $input);
                  $form.append($group);

            }
           
          }
        }

        $form.append('<button class="btn btn-primary pull-left" type="submit">Submit</button>');
        $form.append('<div id="spinner" class="span4 progress progress-striped active"><div class="bar" style="width: 100%;"></div></div>');
        $(config.formContainer).empty();
        $(config.formContainer).append($form);
        
      } else {

        // If there's no form, just get results
        $form.append('<div id="spinner" class="span4 progress progress-striped active"><div class="bar" style="width: 100%;"></div></div>');
        $(config.formContainer).empty();
        $(config.formContainer).append($form);
        results.init('');

      }



      // replace inputs with p data type with a paragraph at the parent (gets rid of label).
      //$(config.formContainer).find('[data-type="p"]').parent().replaceWith(function() { return "<p>" + $(this).find('[data-type="p"]').val() + "</p>"; });
      this.controlReplace();

      // configure date fields on the form
      $(config.formContainer).find('input[data-type="date"]').datepicker({'format': 'yyyy-mm-dd','autoclose': 'true'});

      this.$form = $form;
      this.setListeners();
      this.show();
    },

    controlReplace: function() {
      $(config.formContainer)
        .find('[data-type="p"]')
        .parent()
        .replaceWith(function() {
          t = $(this).find('[data-type="p"]')

          p = $('<p>').text(t.val());

          $(t[0].attributes).each(function() {
            p.attr(this.nodeName, this.nodeValue);
          });

          return p;
        });
    },

    setListeners: function() {

      var _this = this;

      $.validator.messages.required = " ";

      // validate form and initialize the results object
      this.$form.find('button[type="submit"]').click(function(e) {

        $('form').validate({
          highlight: function(label) {
            $(label).closest('.control-group').removeClass('success').addClass('error');
          },
          success: function(label) {
            label
              .closest('.control-group').removeClass('error').addClass('success');
          }
        });

        if($('form').valid()) {
          e.preventDefault();
          var params = _this.$form.serializeObject();
          results.init(params);
        } else {
          updateStatus('Form Validation Error', 'alert-danger');
          e.preventDefault();
        }
      
      });

    }

  };

  var results = {
    starttime: null,

    init: function(params) {
      var _this = this;

      $('#spinner').css({'display':'inline-block'});
      $('#filter').val('');
      $('#form-fields-toggle').html('All <b class="caret"></b>');

      // get our results from the api
      _this.starttime = (new Date()).getTime();
      $.ajax({
        url: config.apiUrl + 'results',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(params)
      })
      .success(function(data) {
        $('#spinner').hide();
        _this.formData = data;
        
        updateStatus('Results from ' + config.apiUrl + 'results ' + _this.responseTime(), 'alert-success');
        _this.buildTable();
      })
      .error(function() {
        $('#spinner').hide();
        updateStatus('There was an error retrieving ' + config.apiUrl + 'results ' + _this.responseTime(), 'alert-danger');
      });
    },

    responseTime: function() {
      var timespent = ((new Date()).getTime() - this.starttime) / 1000;
      timespent = Math.round(timespent*10)/10

      var minutes = Math.floor(timespent / 60);
      var seconds = timespent - (minutes * 60);

      var rs = 'in ';

      if (minutes > 0) {
        rs += minutes + ' minute' + ((minutes != 1) ? 's' : '') + " ";
      }
      
      if ((minutes > 0 && seconds > 0) || (minutes <= 0 && seconds >= 0 )) {
        rs += (Math.round(seconds*100)/100) + " second" + ((seconds != 1) ? 's' : '');
      }
      
      return rs;
    },

    buildTable: function() {
      var $table,
          $thead,
          $tbody,
          $head,
          $results,
          $entry,
          $dropdown,
          item,
          key,
          order = [];

      // Clear any previous results
      $(config.resultsContainer).html('');
      // Todo: find a better way to produce csv output
      $(config.resultsContainerCsv).empty();

      $table = $('<table />').addClass('table').addClass('table-hover').addClass('tablesorter');
      $thead = $('<thead />');
      $tbody = $('<tbody />');
      $head = $('<tr />');
      $dropdown = $('#form-fields-menu');

      $('li[data-generated="true"]').remove();

      // Set up default filter
      this.filter = 'all';

      for(key in this.formData.headers) {
        item = this.formData.headers[key];

        $head.append($('<th />')
                .attr('id',item.id)
                .text(item.text));
        $dropdown.append($("<li />")
                .attr('data-generated', 'true')
                .append($("<a />")
                .attr('data-id', item.id)
                .text(item.text)));
        
        $thead.append($head);

        // Add a comma on any header after the first
        if ($(config.resultsContainerCsv).html().length > 0) {
          $(config.resultsContainerCsv).append(',');
        }
        $(config.resultsContainerCsv).append('"' + quoteEscape(item.text) + '"');
      }
      // add newline after headers
      $(config.resultsContainerCsv).append("\n");

      $table.append($thead);


      if(this.formData.results.length === 0) {

        updateStatus('No results found','alert-warning');

      } else {
        form.hide();

        toolbar.saveResults('Last Results', this.formData);

        for(var i=0; i<this.formData.results.length; i++) {
          item = this.formData.results[i];

          $results = $('<tr />');

          // Put results in order, based on headers
          for(key in item) {
            for(var num in this.formData.headers) {
              if(this.formData.headers[num].id === key) {
                order[num] = key;
              }
            }
          }

          // Create the row
          for(var j=0; j<order.length; j++) {
            $entry = $('<td />')
                    .text(item[order[j]])
                    .addClass(order[j]);

            $results.append($entry);

            // add to results csv
            $(config.resultsContainerCsv).append('"' + quoteEscape(item[order[j]]) + '"');
            if  (j < order.length - 1) {
              $(config.resultsContainerCsv).append(",");
            }
          }

          // Append the new row to the table
          $tbody.append($results);
          // add newline after entry in csv
          $(config.resultsContainerCsv).append("\n");
        }
      }

      // Put our results into the table
      $table.append($tbody);
      $(config.resultsContainer).append($table);
      $table.tablesorter();
      $table.colResizable();
      this.setListeners();
    },

    setListeners: function() {
      var _this = this;

      $('#filter').keydown(function(e) {
        if(e.which == 13) {
          e.preventDefault();
          return false;
        }
      });

      $('#filter').keyup(function(e) {
        // on backspace check length of field
        if(e.which == 8 && $('#filter').val().length <= 0) {
          $('tbody tr').show();
        }

        results.doFilter();
      });

      $('#form-fields-menu a').click(function(e) {
        e.preventDefault();
        if($(this).data('id') === 'all') {
          $('th').show();
          $('td').show();
          $('#form-fields-toggle').html($(this).text() + ' <b class="caret"></b>');
        } else {
          $('#form-fields-toggle').html($(this).text() + ' <b class="caret"></b>');
        }
        _this.filter = $(this).data('id');
        
        _this.doFilter();
      });

      $('#clear').click(function(e) {
        e.preventDefault();
        $('#filter').val('');
        $('tbody tr').show();
      });
    },

    doFilter: function() {
      var filter = this.filter;
      $('#results tbody tr').hide();
      var testString = '';

      var testFilter = function(testString) {
        var test = $('#filter').val().toLowerCase().split(' ');
        var result = true;
        
        if(test[0].indexOf('!') === 0) {
          test[0] = test[0].replace('!','');

          if(test.length > 1) {
            for(var i=0; i<test.length; i++) {
              if (testString.indexOf(test[i]) !== -1) {
                result = false;
              }
            }
          } else {
            if (testString.indexOf(test[0]) !== -1) {
              result = false;
            }
          }

        } else {

          if(test.length > 1) {
            for(var i=0; i<test.length; i++) {
              if (testString.indexOf(test[i]) === -1) {
                result = false;
              }
            }
          } else {
            if (testString.indexOf(test[0]) === -1) {
              result = false;
            }
          }

        }
        
        return result;
      };

      if(filter !== 'all') {
        $('#results tbody td.' + filter).parent().each(function() {
          $(this).find('td.' + filter).each(function() {
            testString += $(this).text().toLowerCase();
          });
          var result = testFilter(testString);
          testString = '';
          if(result === true) {
            $(this).show();
          }
        });
      } else {
        $('#results tbody td').parent().each(function() {
          $(this).find('td').each(function() {
            testString += $(this).text().toLowerCase();
          });
          var result = testFilter(testString);
          testString = '';
          if(result === true) {
            $(this).show();
          }
        });
      }

      if(testFilter(testString) === true) {

      }

    },

    toggleWidth: function() {
      if($resultsWidthToggle.find('i').hasClass(config.resultsWidthIcons.expand)) {
        $(config.resultsContainer).parent().addClass('maxwide');
        $resultsWidthToggle.html('<i class="'+config.resultsWidthIcons.contract+'"></i>');
      } else {
        $(config.resultsContainer).parent().removeClass('maxwide');
        $resultsWidthToggle.html('<i class="'+config.resultsWidthIcons.expand+'"></i>');
      }
    }

  };

  var updateStatus = function(message,state) {
    if(config.debug) {
      $('#status').show();
    }

    $('#status').removeClass();
    $('#status').text(message).addClass('alert').addClass(state);
  };

  //Document ready
  $(function() {
    config.init();
  });

})(jQuery);

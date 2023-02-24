/*
 *	tiny-bs-grid https://github.com/jeffhehe/tiny-bs-grid
 *  this works for TinyMCE5.* on Bootstrap 3.*
 *  Version: v0.4
 *  Author: Jeff Wang
 *  Date: Jan 20, 2023
 */

(function () {
  tinymce.PluginManager.add('bootstrap3grid', bootstrap3GridPlugin);

  function bootstrap3GridPlugin(editor, url) {
    editor.contentCSS.push(url + '/bootstrapgrid-style.css');

    editor.ui.registry.addToggleButton('bootstrap3grid', {
      text: 'Colonnes',
      tooltip: 'Système de grille',
      onAction: Tinymce_bs3_grid,
      onSetup: function (api) {
        editor.selection.selectorChanged('div.row', function (state) {
          api.setActive(state);
        });
      }
    });

    function Tinymce_bs3_grid() {
      var dialogueTitle = 'Insérer une grille';
      var columnValue = ['12'];
      var screenSize = 'sm';
      var node = editor.selection.getNode();
      var parentDOMS = jQuery(node).parents('div.row');
      var editMode = parentDOMS.length > 0;
      if (editMode) {
        var parentRow = parentDOMS[0];
        var oldGrids = jQuery(parentRow).children('div');
        var oldGridNumber = oldGrids.length;
        var oldGridContents = [];
        if (oldGridNumber > 0) {
          columnValue = [];
          for (i = 0; i < oldGridNumber; i++) {
            var gridClasses = jQuery(oldGrids[i]).attr('class').split(/\s+/);
            var gridContent = jQuery(oldGrids[i]).html();
            oldGridContents.push(gridContent);
            for (j = 0; j < gridClasses.length; j++) {
              if (/^col-.*/i.test(gridClasses[j])) {
                //only need to check first column for targe screen size
                if (j == 0) {
                  if (gridClasses[0].indexOf('col-lg') > -1) {
                    screenSize = 'lg';
                  } else if (gridClasses[0].indexOf('col-sm') > -1) {
                    screenSize = 'sm';
                  } else if (gridClasses[0].indexOf('col-xs') > -1) {
                    screenSize = 'xs';
                  }
                }
                var lastDashPos = gridClasses[j].lastIndexOf('-');
                var widthNumb = gridClasses[j].substr(lastDashPos + 1);
                columnValue.push(widthNumb);
              }
            }
          }
        }
        dialogueTitle = 'Modifier/supprimer la grille';
      }

      var mainPanelItems = [
        {
          type: 'selectbox',
          name: 'grid',
          label: 'Grid',
          items: [{
              text: '1 Colonne',
              value: '12'
            },
            {
              text: '2 Colonnes (½:½)',
              value: '6,6'
            },
            {
              text: '2 Colonnes (⅔:⅓)',
              value: '8,4'
            },
            {
              text: '2 Colonnes (¾:¼)',
              value: '9,3'
            },
            {
              text: '2 Colonnes (⅓:⅔)',
              value: '4,8'
            },
            {
              text: '2 Colonnes (¾:¼)',
              value: '3,9'
            },
            {
              text: '3 Colonnes (⅓:⅓:⅓)',
              value: '4,4,4'
            },
            {
              text: '3 Colonnes (½:¼:¼)',
              value: '6,3,3'
            },
            {
              text: '3 Colonnes (¼:½:¼)',
              value: '3,6,3'
            },
            {
              text: '3 Colonnes (¼:¼:½)',
              value: '3,3,6'
            },
            {
              text: '4 Colonnes (¼:¼:¼:¼)',
              value: '3,3,3,3'
            }
          ],
        }
      ];

      var advancedPanelItems = [
        {
          type: 'selectbox',
          name: 'size',
          label: '(Avancé) Point de rupture',
          items: [{
              text: 'Grand écran (>= 1200px)',
              value: 'lg'
            },
            {
              text: 'Écran de petit ordinateur (>= 992px)',
              value: 'md'
            },
            {
              text: 'Tablette (>= 768px)',
              value: 'sm'
            },
            {
              text: 'Téléphone (< 768px)',
              value: 'xs'
            },
          ],
        },
        {
          type: 'checkbox',
          name: 'leadingBreak',
          label: 'Ajouter un saut de ligne' + (editMode? '(recommandé)' : ''),
        }
      ];



      var panelBody = {
        type: 'tabpanel',
        tabs: [
          {
            title: 'Grille',
            items: mainPanelItems
          },
          {
            title: 'Paramètres avancés',
            items: advancedPanelItems,
          }
        ]
      }

      if (editMode) {
        panelBody = {
          type: 'tabpanel',
          tabs: [{
              title: 'Modifier la grille',
              items: mainPanelItems
            },
            {
              title: 'Paramètres avancés',
              items: advancedPanelItems,
            },
            {
              title: 'Supprimer la grille',
              items: [{
                type: 'checkbox',
                name: 'removeGrids',
                label: 'Supprimer la grille',
              }]
            }
          ]
        };
      }

      editor.windowManager.open({
        title: dialogueTitle,
        body: panelBody,
        initialData: {
          size: screenSize,
          grid: columnValue.toString(),
          leadingBreak: (!editMode)
        },
        buttons: [{
            type: 'submit',
            name: 'submitBtn',
            text: (editMode ? 'Modifier' : 'Insérer'),
          },
          {
            type: 'cancel',
            name: 'cancelBtn',
            text: 'Annuler',
          }
        ],
        onSubmit: function (e) {
          var data = e.getData();
          var leadingHtml = '';
          var htmlContents = '';
          var endingHtml = '<p>&nbsp;</p>';
          if (data.leadingBreak == true) {
            leadingHtml = '<p>&nbsp;</p>';
          };
          if (data.removeGrids == true && editMode) {
            // get contents from the grids
            htmlContents = oldGridContents.join('<p>&nbsp;</p>');
            jQuery(parentDOMS).replaceWith(leadingHtml + htmlContents + endingHtml);
            e.close();
            return;
          }
          var generateHtmlContents = function (gridWidthValues) {
            const newGridNumber = gridWidthValues.length;
            if (!editMode) {
              // create new grids 
              for (var n = 0; n < newGridNumber; n++) {
                htmlContents += '<div class="col-' + data.size + '-' + gridWidthValues[n] + '"><p>&nbsp;</p></div>';
              }
            } else {
              // update existing grids
              if (oldGridNumber > 0 && oldGridNumber < newGridNumber) {
                // if the number of new grids is more than the number of old grids
                for (var k = 0; k < oldGridNumber; k++) {
                  htmlContents += '<div class="col-' + data.size + '-' + gridWidthValues[k] + '">' + oldGridContents.shift() + '</div>';
                }
                // create empity girds
                for (var m = oldGridNumber; m < newGridNumber; m++) {
                  htmlContents += '<div class="col-' + data.size + '-' + gridWidthValues[m] + '"><p>&nbsp;</p></div>';
                }
              } else if (oldGridNumber >= newGridNumber) {
                // if the number of new grids is less than the number of old grids
                for (var k = 0; k < newGridNumber; k++) {
                  htmlContents += '<div class="col-' + data.size + '-' + gridWidthValues[k] + '">' + oldGridContents.shift() + '</div>';
                }
                // create a new container for all remaining contents below the row
                if (oldGridNumber > newGridNumber) {
                  endingHtml = '<p>&nbsp;</p><div>' + oldGridContents.join('<p>&nbsp;</p>') + '</div><p>&nbsp;</p>';
                }
              }
            }
          };

          generateHtmlContents(data.grid.split(','));

          if (editMode) {
            jQuery(parentDOMS).replaceWith(leadingHtml + '<div class="row">' + htmlContents + '</div>' + endingHtml);
          } else {
            editor.insertContent(leadingHtml + '<div class="row">' + htmlContents + '</div>' + endingHtml);
          }
          e.close();
        }
      });
    };
  }
})();
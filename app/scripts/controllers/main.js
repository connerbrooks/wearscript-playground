'use strict';

angular.module('wearscriptPlaygroundApp')
  .controller('MainCtrl',
      function ($scope,$window,$location,Profile,$routeParams,$rootScope,Socket,Playground) {

    $scope.aceLoaded = function(_editor) {
      function gistcb() {
        if (!Socket.ws.readyState || !Socket.exists('gist')) {
          $window.setTimeout(gistcb, 50);
        } else {
          Playground.gistGet(
            Socket,
            $routeParams.gistid,
            function (channel, gist) {
              _editor.getSession().setValue(gist.files[file].content);
            }
          );
        }
      }
      // Options
      //_editor.setReadOnly(false);
        if (Profile.vim_mode){
          _editor.setKeyboardHandler("ace/keyboard/vim");
        }
        if ($routeParams.gistid) {
            var file = $routeParams.file || 'glass.html';
            console.log('GIST:' + $routeParams.gistid + ' File: ' + file);
            gistcb();
        } else {
            _editor.getSession().setValue(GLASS_BODY);
        }
        _editor.commands.addCommand({
            name: "evaluate-editor",
            bindKey: {win: "Ctrl-Enter", mac: "Command-Enter"},
            exec: function(editor) {
                console.log('run');
                Playground.runScriptOnGlass(Socket, $window.HACK_EDITOR.getSession().getValue());
            }
        });
        _editor.commands.addCommand({
            name: "save-editor",
            bindKey: {win: "Ctrl-S", mac: "Command-S"},
            exec: function(editor) {
                console.log('save: ' + $routeParams.gistid + ' ' + $routeParams.file);
                if ($routeParams.gistid && $routeParams.file) {
                    Playground.gistModify(Socket, $routeParams.gistid, $routeParams.file, HACK_EDITOR.session.getValue(), function (x, y) {console.log('Gist saved. Result in HACK_GIST_MODIFY');HACK_GIST_MODIFY=y});
                } else {
                    // HACK(brandyn): Need to allow user to select secret and set description with a modal
                    Playground.gistCreate(Socket, true, "[wearscript]", 'glass.html', HACK_EDITOR.session.getValue(), function (x, y) {
                        console.log('Gist saved. Result in HACK_GIST_CREATE');
                        HACK_GIST_CREATE=y;
                        if (y && y.id) {
                            $rootScope.$apply(function() {
                                $location.path("/gist/" + y.id);
                            });
                        }
                    });
                }
            }
        });
        _editor.commands.addCommand({
            name: "evaluate-region",
            bindKey: {win: "Alt-Enter", mac: "Alt-Enter"},
            exec: function(editor) {
                var line = _editor.session.getTextRange(_editor.getSelectionRange());
                if (!line.length) {
                    line = _editor.session.getLine(_editor.selection.getCursor().row);
                }
                Playground.runLambdaOnGlass(Socket, line);
            }
        });

        $window.HACK_EDITOR = _editor;
    };

    $scope.aceChanged = function(e) {
        /*
      var e_el = document.getElementsByClassName('.ace_editor')[0];
      //var doc = e.getSession().getDocument();
      e_el.style.height = 16 * doc.getLength() + 'px';
      e.resize();
      */
    };
  });

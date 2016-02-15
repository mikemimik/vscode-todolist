'use strict';

// INFO: core modules
var vscode = require('vscode');
var async = require('async');
var Workspace = vscode.workspace;
var Window = vscode.window;
var Commands = vscode.commands;
var Languages = vscode.languages;

// INFO: extension modules
var utils = require('./utils');

// INFO: global variables
var startup = true;
var statusBarItem = null;
var workspaceConfig = null;
var choosenLang = 'All';
var searchExts = null;
var excludedFiles = '**/node_modules/**';
var todoRegex = new RegExp('^\\W*(?:TODO|FIXME)\\s*\\W{0,1}(\\s+.*|(?:\\w|\\d).*)$', 'i');
var languageChoices = [
  'All',
  'Go',
  'Javascript',
  'PHP',
  'Coffeescript',
  'C',
  'C++',
  'C#',
  'Objective-C',
  'Python',
  'Ruby',
  'Swift',
  'Typescript',
  'VisualBasic'
];

// INFO: main function
function activate(context) {
  console.log('>>', 'Extention init', 'loaded', 'vscode-todo');

  // INFO: if first time running from '*' activationEvent
  if (startup) { init(); }

  var chooseLangTodo = Commands.registerCommand('ext.chooseLangTodo', function() {
    Window.showQuickPick(languageChoices).then(function(language) {
      if (!language) { return; }
      choosenLang = language;
      searchExts = utils.changeSearchExts(language);
      // TODO: update excluded files;
      statusBarItem = utils.updateStatusBarItem(statusBarItem, language);
    });
  });

  var listTodos = Commands.registerCommand('ext.listTodos', function() {
    // TODO: update file extension
    // TODO: update excluded files
    Workspace.findFiles(searchExts, excludedFiles, 100).then(function(files) {
      console.log('>>', 'findFiles', 'arguments', arguments);
      if (!files) {
        utils.showMessage('nofiles', { lang: choosenLang });
      } else {

        // TODO: process item
        // TODO: build array of QuickPickItems
        async.each(files, function(file, each_cb) {
          Workspace.openTextDocument(file).then(function(doc) {

            // INFO: iterate over all lines in file
            for (var line = 0; line < doc.lineCount; line++) {
              var textLine = doc.lineAt(line).text;

              // INFO: check each line for matching regex
              var match = textLine.match(todoRegex);
              if (match) {
                console.log('>>', 'TESTING', match);
              }
            }
            each_cb(null);
          });
        }, function(err) {
          console.log('>>', 'TEST', 'async.each', 'complete');
        });
      }
    });
  });

  // context.subscriptions.push(chooseLangTodo);
  // context.subscriptions.push(listTodos);
}

// this method is called when your extension is deactivated
function deactivate() {
}

function init() {
  console.log('>>', 'init function called');
  statusBarItem = utils.createStatusBarItem();
  statusBarItem.show();

  searchExts = utils.changeSearchExts(choosenLang);
  workspaceConfig = Workspace.getConfiguration();

  // INFO: register event listener for workspace config changes
  Workspace.onDidChangeConfiguration(function(event) {
    workspaceConfig = Workspace.getConfiguration();
  });
  startup = false;
}

exports.activate = activate;
exports.deactivate = deactivate;
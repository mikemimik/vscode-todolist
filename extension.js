'use strict';

// INFO: core modules
var vscode = require('vscode');
var async = require('async');
var Workspace = vscode.workspace;
var Window = vscode.window;
var Commands = vscode.commands;
var Languages = vscode.languages;

// INFO: extension modules
var utils = require('./libs/utils');
var Todo = require('./libs/todo');

// INFO: global variables
var startup = true;
var statusBarItem = null;
var workspaceConfig = null;
var choosenLang = 'All';
var searchExts = null;
var excludedFiles = '**/node_modules/**';
var todoList = [];
var todoRegex = new RegExp('^\\W*(?:TODO|FIXME)\\s*\\W{0,1}(\\s+.*|(?:\\w|\\d).*)$', 'i');
var typeRegex = new RegExp('(TODO|FIXME)', 'i');
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
      // TODO: update excluded files
      statusBarItem = utils.updateStatusBarItem(statusBarItem, language);
    });
  });

  var listTodos = Commands.registerCommand('ext.listTodos', function() {
    // TODO: update file extension
    // TODO: update excluded files
    Workspace.findFiles(searchExts, excludedFiles, 100).then(function(files) {
      if (!files) {
        utils.showMessage('nofiles', { lang: choosenLang });
      } else {

        // TODO: process item
        // TODO: build array of todo-items (QuickPickItems?)
        async.each(files, function(file, each_cb) {
          Workspace.openTextDocument(file).then(function(doc) {

            // INFO: iterate over all lines in file
            for (var line = 0; line < doc.lineCount; line++) {
              var textLine = doc.lineAt(line);

              // INFO: check each line for matching regex
              var todoMatch = textLine.text.match(todoRegex);
              if (todoMatch) {

                // INFO: create todo list item
                // TODO: make this exchangable
                var todoItem = new Todo();

                // INFO: get the type of the comment
                var typeMatch = todoMatch[0].match(typeRegex);
                todoItem.type = typeMatch[1].toUpperCase();

                // TODO: change this to `doc.uri`
                todoItem.fileName = doc.fileName;
                todoItem.rawline = todoMatch[0];
                todoItem.range = textLine.range;

                // TODO: truncate this comment if too long
                todoItem.comment = todoMatch[1].trim();
                todoItem.lineNum = line + 1;

                // INFO: push item into list
                todoList.push(todoItem);
              }
            }
            each_cb(null);
          });
        }, function(err) {

          // INFO: we have an array of all the todo|fixme's in all the files
          displayTodoList();
        });
      }
    });
  });

  context.subscriptions.push(chooseLangTodo);
  context.subscriptions.push(listTodos);
}

// this method is called when your extension is deactivated
function deactivate() {
}

function init() {
  console.log('>>', 'init function called'); // TESTING
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

function displayTodoList() {

  // INFO: mutate the array to be a 'QuickPickItem' list
  var pickList = todoList.map(function(item) {
    return item.toQuickPickItem();
  });

  // INFO: reset todoList after pickList has been created
  clearTodoList();
  Window.showQuickPick(pickList).then(function(selected) {
    if (!selected) { return; }
    console.log('>>', 'selected todo', selected.fileUri); // TESTING
    if (Window.activeTextEditor) {

      // INFO: there is an active text editor
      var editor = Window.activeTextEditor;
      console.log('>>', 'active text editor', editor.document.uri); // TESTING
      if (selected.fileName === Window.activeTextEditor.document.fileName) {

        // INFO: the current editor is attached to the file where the todo is located
        displaySelectedTodo(selected, editor);
      }
    } else {

      // INFO: there is no active text editor
      console.log('>>', 'no active text editor'); // TESTING
      Workspace.openTextDocument(selected.fileUri).then(function(doc) {
        Window.showTextDocument(doc, vscode.ViewColumn.One).then(function(editor) {
          displaySelectedTodo(selected, editor);
        });
      });
    }
  });
}

function displaySelectedTodo(selected, editor) {
  var selectedLine = new vscode.Selection(selected.range.start, selected.range.end);
  editor.selection = selectedLine;
  editor.revealRange(selected.range, vscode.TextEditorRevealType.InCenter);
  return;
}

function clearTodoList() {
  todoList = [];
  return;
}
exports.activate = activate;
exports.deactivate = deactivate;
'use strict';

var vscode = require('vscode');
var Window = vscode.window;
var Workspace = vscode.workspace;

exports.createStatusBarItem = function createStatusBarItem() {
  var item = Window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  item.text = 'TODOs';
  item.tooltip = 'Show TODOs';
  item.command = 'ext.showTodos';
  item.color = '#FFFFFF';
  return item;
};

exports.updateStatusBarItem = function updateStatusBarItem(item, lang) {
  if (!lang) { return; }
  if (lang === 'All') {
    item.text = 'TODOs';
  } else {
    item.text = 'TODOs for ' + lang;
  }
  item.tooltip = 'Show TODOs for ' + lang;
  return item;
};

exports.changeSearchExts = function changeSearchExts(language) {
  switch (language) {
    case 'All': return '**/*.{php,go,js,coffee,c,cpp,cs,m,py,rb,swift,ts,vb}'; break;
    case 'Go': return '**/*.go'; break;
    case 'Javascript': return '**/*.js'; break;
    case 'PHP': return '**/*.php'; break;
    case 'Coffeescript': return '**/*[.js].coffee'; break;
    case 'C': return '**/*.c'; break;
    case 'C++': return '**/*.cpp'; break;
    case 'C#': return '**/*.cs'; break;
    case 'Objective-C': return '**/*.m'; break;
    case 'Python': return '**/*.py'; break;
    case 'Ruby': return '**/*.rb'; break;
    case 'Swift': return '**/*.swift'; break;
    case 'Typescript': return '**/*.ts'; break;
    case 'VisualBasic': return '**/*.vb'; break;
    default: return '**/*.{php,go,js,coffee,c,cpp,cs,m,py,rb,swift,ts,vb}'; break;
  }
};

exports.updateExcludedFiles = function updateExcludedFiles() {

  // TODO: create glob pattern for all files and folders to exclude
  // TODO: function should return one string
  return '';
};

exports.showMessage = function showMessage(type, options) {
  var message = '';
  switch(type) {
    case 'nofiles':
      if (options.lang) {
        message = '**There are no ' + options.lang + ' files in the open project.**';
      } else {
        message = '**Could not find any files to search.**';
      }
      break;
  }
  Window.showInformationMessage(message);
};
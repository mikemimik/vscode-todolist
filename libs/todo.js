'use strict';

var vscode = require('vscode');

function Todo() {

  // INFO: 'fixme' or 'todo'
  this.type = null;

  // INFO: fileName of the found todo|fixme
  this.fileName = null;

  // INFO: raw parsed line
  this.rawline = null;

  // INFO: length of line
  this.range = null;

  // INFO: the comment associated with the todo|fixme
  this.comment = null;

  // INFO: line number todo|fixme occours
  this.lineNum = null;
}

Todo.prototype.toQuickPickItem = function toQuickPickItem() {
  // desc: output file + line # + ':' + indexOf(todo)
  // label: (60 chars)
  var l = this.type;
  return {
    label: l,
    description: this.comment,
    range: this.range,
    fileName: this.fileName,

    // INFO: wrap created string as a vscode URI
    fileUri: vscode.Uri.parse('file://' + this.fileName)
  };
};

module.exports = Todo;
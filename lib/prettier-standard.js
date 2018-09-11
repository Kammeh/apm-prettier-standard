'use babel'

import { CompositeDisposable } from 'atom'
import format from 'prettier-standard'
import path from 'path'

export default {
  editorObserver: null,
  subscriptions: null,
  fileTypes: ['.js', '.jsx'],

  activate (state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'prettier-standard:format': () => this.format(),
        'prettier-standard:toggle': () => this.toggle()
      })
    )

    this.editorObserver = atom.workspace.observeTextEditors(
      this.handleEvents.bind(this)
    )
  },

  deactivate () {
    this.modalPanel.destroy()
    this.subscriptions.dispose()
    this.prettierStandardView.destroy()
  },

  toggle () {
    console.log('PrettierStandard was toggled!')
    let editor
    if ((editor = atom.workspace.getActiveTextEditor())) {
      let selection = editor.getSelectedText()
      let reversed = selection
        .split('')
        .reverse()
        .join('')
      editor.insertText(reversed)
    }
  },

  format () {
    let editor
    console.log('edit it!')
    if ((editor = atom.workspace.getActiveTextEditor())) {
      let selection = editor.getText()
      let formatted = format(selection)
      editor.setText(formatted)
    }
  },

  fileSupported (file) {
    var ext = path.extname(file)
    return !!~this.fileTypes.indexOf(ext)
  },

  handleEvents (editor) {
    editor.getBuffer().onWillSave(
      function () {
        console.log('saved')
        var path = editor.getPath()
        if (!path) {
          return
        }
        if (!editor.getBuffer().isModified()) {
          return
        }

        // Set the relative path based on the file's nearest package.json.
        // If no package.json is found, use path verbatim.
        var relativePath
        try {
          var projectPath = findRoot(path)
          relativePath = path.replace(projectPath, '').substring(1)
        } catch (e) {
          relativePath = path
        }

        if (this.fileSupported(relativePath)) {
          this.format({ selection: false })
        }
      }.bind(this)
    )
  }
}

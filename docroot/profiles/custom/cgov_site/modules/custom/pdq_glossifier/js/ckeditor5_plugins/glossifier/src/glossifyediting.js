import { Plugin } from 'ckeditor5/src/core';
import GlossifyActionCommand from './glossifyactioncommand';

export default class GlossifyEditing extends Plugin {
  init() {
    this.editor.commands.add(
      'glossifyAction',
      new GlossifyActionCommand(this.editor),
    );
  }
}

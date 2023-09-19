import { Plugin } from 'ckeditor5/src/core';
import GlossifyAction from './glossifyactioncommand';

export default class GlossifyEditing extends Plugin {
  init() {
    this.editor.commands.add(
      'glossifyAction',
      new GlossifyAction(this.editor),
    );
  }
}

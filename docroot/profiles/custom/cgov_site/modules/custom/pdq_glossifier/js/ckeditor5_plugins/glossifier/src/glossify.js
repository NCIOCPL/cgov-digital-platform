import { Plugin } from 'ckeditor5/src/core';
import GlossifyUI from './glossifyui';
import GlossifyEditing from './glossifyediting';

export default class Glossify extends Plugin {
  static get requires() {
    return [GlossifyEditing, GlossifyUI];
  }
}

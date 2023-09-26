import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from "ckeditor5/src/ui";
import icon from '../../../../icons/button.svg';

export default class GlossifyUI extends Plugin {
  init() {
    const { editor } = this;
    editor.ui.componentFactory.add('glossifier', (locale) => {
      const buttonView = new ButtonView(locale);

      // Create the toolbar button.
      buttonView.set({
        label: editor.t('Glossify'),
        icon,
        tooltip: true,
      });
      // Execute the command when the button is clicked (executed).
      this.listenTo(buttonView, 'execute', () =>
        editor.execute('glossifyAction'),
      );

      return buttonView;
    });
  }
}

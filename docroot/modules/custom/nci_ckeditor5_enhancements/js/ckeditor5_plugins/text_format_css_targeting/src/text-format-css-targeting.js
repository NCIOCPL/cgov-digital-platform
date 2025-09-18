import { Plugin } from "ckeditor5/src/core";

export default class TextFormatCSSTargeting extends Plugin {
  static get pluginName() {
    return "TextFormatCSSTargeting";
  }

  init() {
    const editor = this.editor;

    // Wait for editor to be ready
    editor.on("ready", () => {
      // Get format from Drupal settings
      const config = editor.config.get("text_format_css_targeting") || {};
      const format = config.format;
      const css_classes = config.css_classes;

      if (editor.ui.element) {
        if (format) {
          editor.ui.element.setAttribute("data-text-format", format);
        }
      }

      // Add classes to the editing pane (ck-content element). This is being
      // added to the preview to cut down on the size of the CKEditor CSS.
      // This is done as a view change instead of on init so that we can be
      // sure the class is always there.
      if (css_classes && Array.isArray(css_classes) && css_classes.length > 0) {
        editor.editing.view.change(writer => {
          const root = editor.editing.view.document.getRoot();
          writer.addClass(css_classes, root);
        });
      }

    });
  }
}

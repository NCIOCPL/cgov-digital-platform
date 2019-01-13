CKEDITOR.dialog.add('pullquoteDialog', function(editor) {
  return {
    title: 'Add a pullquote',
    minWidth: 400,
    minHeight: 200,
    contents: [
      {
        id: 'tab-basic',
        label: 'Basic Settings',
        elements: [
          {
            type: 'text',
            id: 'authortext',
            label: 'Author',
            validate: CKEDITOR.dialog.validate.notEmpty('Author Text field can not be empty.'),
            setup: function(element) {
              this.setValue(element.getText());
            },
            commit: function(element) {
              element.setText(this.getValue());
            }
          },
          {
            type: 'textarea',
            id: 'bodytext',
            label: 'Body',
            validate: CKEDITOR.dialog.validate.notEmpty('Body Text field can not be empty.'),
            setup: function(element) {
              this.setValue(element.getText());
            },
            commit: function(element) {
              element.setText(this.getValue());
            }
          },
          {
            type: 'radio',
            id: 'alignment',
            label: 'Alignment',
            items: [
              ['Left Aligned', 'left'],
              ['Centered', 'centered'],
              ['Right Aligned', 'right'],
            ],
            default: 'centered',
          }
        ]
      }
    ],

    onShow: function() {
      const selection = editor.getSelection();
      let element = selection.getStartElement();

      if (element.getAttribute('class') !== 'tweetabletext') {
        element = editor.document.createElement('a');
        this.insertMode = true;
      }
      else {
        this.insertMode = false;
      }

      this.element = element;
      if (!this.insertMode) {
        this.setupContent(this.element);
      }
    },

    onOk: function() {
      const dialog = this;
      const element = this.element;

      const authorText = dialog.getValueOf('tab-basic', 'authortext');
      const bodyText = dialog.getValueOf('tab-basic', 'bodytext');
      const alignment = dialog.getValueOf('tab-basic', 'alignment');
      const containerClass = alignment === 'centered' ? '' : '-' + alignment;

      const container = '<div class="pullquote'
        + containerClass
        + '"><p class="pullquote-text">'
        + bodyText
        + '</p><p class="author">'
        + authorText
        + '</p></div>';

      this.commitContent(element);
      if (this.insertMode) {
        editor.insertHtml(container);
      }
    }
  }
});

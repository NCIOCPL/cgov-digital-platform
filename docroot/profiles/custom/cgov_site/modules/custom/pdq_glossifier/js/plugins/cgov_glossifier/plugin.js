(function (CKEDITOR, Drupal) {
  CKEDITOR.plugins.add('cgov_glossifier', {
    icons: 'button',

    init: function(editor) {
      CKEDITOR.dialog.add('glossifyDialog', this.path + 'dialogs/glossify.js' );
      editor.addCommand('glossify', new CKEDITOR.dialogCommand('glossifyDialog'));
      editor.ui.addButton('Cgov_glossifier', {
        label: Drupal.t('Glossify Page'),
        icon: 'button',
        toolbar: 'tools, 0',
        command: 'glossify',
      });
    }
  })
})(CKEDITOR, Drupal)

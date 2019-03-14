(function (CKEDITOR, Drupal) {
  CKEDITOR.plugins.add('cgov_glossifier', {
    icons: 'button',

    init: function(editor) {
      const cssString = ".glossify-dialog-container { background: purple !important; color: white !important; font-size: 5em !important; }";
      CKEDITOR.addCss(cssString)
      CKEDITOR.dialog.add('glossifyDialog', this.path + 'dialogs/glossify.js' );
      editor.addCommand('glossify', new CKEDITOR.dialogCommand('glossifyDialog'));
      editor.ui.addButton('Cgov_glossifier', {
        label: Drupal.t('Glossify Page'),
        icon: 'button',
        toolbar: 'tools, 0',
        command: 'glossify',
      });


      // This should really be done somewhere more elevated, since it contains unrelated styles.
      // editor.addContentsCss('/profiles/custom/cgov_site/themes/custom/cgov/cgov_common/dist/css/Common.css')
      // editor.addContentsCss('/profiles/custom/cgov_site/modules/custom/cgov_ckeditor/js/plugins/cgov_glossifier/dialogs/reference/old.css')
    }
  })
})(CKEDITOR, Drupal)

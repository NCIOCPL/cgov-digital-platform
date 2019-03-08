((CKEDITOR, Drupal) => {
  CKEDITOR.plugins.add('cgov_glossifier', {
    icons: 'button',

    init: editor => {
      editor.ui.addButton('cgov_glossifier', {
        label: Drupal.t('Glossify Page'),
        icon: 'button',
        toolbar: 'tools, 0',
        command: 'glossify',
      });


      // This should really be done somewhere more elevated, since it contains unrelated styles.
      // editor.addContentsCss('/profiles/custom/cgov_site/themes/custom/cgov/cgov_common/dist/css/Common.css')
    }
  })

  // CKEDITOR.dialog.add('pullquoteDialog', '/profiles/custom/cgov_site/modules/custom/cgov_embed/js/plugins/pullquote_button/dialogs/pullquoteDialog.js' );
})(CKEDITOR, Drupal)

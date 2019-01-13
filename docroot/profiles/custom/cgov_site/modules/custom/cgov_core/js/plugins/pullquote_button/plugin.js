((Drupal, CKEDITOR) => {
  CKEDITOR.plugins.add('pullquote_button', {
    icons: 'pullquote',

    init: editor => {
      editor.addCommand( 'insertPullquote', new CKEDITOR.dialogCommand('pullquoteDialog'));

      editor.ui.addButton( 'Pullquote_button', {
        label: 'Insert Pullquote',
        icon: 'pullquote',
        command: 'insertPullquote',
        toolbar: 'insert, 0'
      });

      // This should really be done somewhere more elevated, since it contains unrelated styles.
      editor.addContentsCss('/profiles/custom/cgov_site/themes/custom/cgov/cgov_common/dist/css/Common.css')
    }
  })

  CKEDITOR.dialog.add('pullquoteDialog', '/profiles/custom/cgov_site/modules/custom/cgov_core/js/plugins/pullquote_button/dialogs/pullquoteDialog.js' );
})(Drupal, CKEDITOR)

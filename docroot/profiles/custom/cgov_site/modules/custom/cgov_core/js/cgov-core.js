/**
 *  @file
 */

 (function ($, Drupal) {
  Drupal.behaviors.cgovcore = {
    attach: function (context) {
    $('#edit-field-pretty-url-0-value').after(jQuery("<div id='url-data-value'>"));
    $('#edit-field-pretty-url-0-value').keyup(function () {
      if(this.value.length > 200){
        $("#url-data-value").html(this.value.substring(200) + ' - will be removed.');
      } else {
        $("#url-data-value").html('');
      }
    });
  }
  };
})(jQuery, Drupal);

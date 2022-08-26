/**
 *  @file
 */

 (function ($, Drupal) {
  Drupal.behaviors.cgov_core = {
    attach: function (context) {
      $("#url-data-value").remove();
      $('#edit-field-pretty-url-0-value').after(jQuery("<div id='url-data-value' style='font-weight:bold'>"));
      showWarningMessage();
      $('#edit-field-pretty-url-0-value').keyup(function () {
        showWarningMessage();
      });

      // Helper function to show warning message.
      function showWarningMessage() {
        $this = $('#edit-field-pretty-url-0-value');
        if ($("div.item-container").attr("site-section-data-path")) {
          let total_length = $("div.item-container").attr("site-section-data-path").length + $this.val().length;
          // Check for exceeding the character count of 200 limit.
          // Combine site section and pretty url.
          if (total_length > 200) {
            let remaining_length = 200 - $("div.item-container").attr("site-section-data-path").length;
            $("#url-data-value").html($this.val().substring(remaining_length) + ' - will be removed from URL.');
          } else {
            $("#url-data-value").html('');
          }
        }
      }
    }
  };
})(jQuery, Drupal);

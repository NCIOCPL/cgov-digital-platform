(function($) {
  $.fn.drawBlogTopics = function(topics) {
    // Uncheck and hide all checkboxes when this function is called.
    $('#edit-field-blog-topics .js-form-item').addClass('visually-hidden');
    $('#edit-field-blog-topics .form-checkbox').prop('checked', false);

    // Get the seleccted series ID.
    var sid = $('select#edit-field-blog-series')[0].value;

    // If the topic ID matches the series ID, remove the hidden class and show the checkboxes.
    for (var tid in topics) {
      if(topics[tid] === sid) {
        jQuery('input[value=' + tid + ']').parent().removeClass('visually-hidden');
      }
    }

  };
  // TODO: hide topics wrapper if not in categories
  // TODO: clear checkmarks on switch & select other
  // TODO: make visually-hidden a wrapper
  // TODO: follow Drupal JS coding/naming standards
})(jQuery);

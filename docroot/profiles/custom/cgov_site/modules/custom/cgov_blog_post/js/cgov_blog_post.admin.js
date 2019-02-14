/**
 * @file
 * Placeholder file for custom blog post form behaviors.
 */
(function($, Drupal) {

  /**
   * @type {Drupal~behavior}
   * @prop {Drupal~behaviorAttach} attach
   *   Set behaviors for the admin Blog Post create / edit form.
   */
  Drupal.behaviors.blogPostForm = {
    attach: function (context, settings) {
      if(context.querySelector('html')) {
        // Do page load actions per state...
      } else {
        // console.log('ajax form debug');
      }
    }
  };

  /**
   * Provides the ability to drag to manipulate a table and its fields.
   * 
   * @param {object} topics
   *   Collection of Blog Topics data.
   */
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
  // TODO: make visually-hidden a wrapper

})(jQuery, Drupal);
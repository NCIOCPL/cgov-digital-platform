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

      console.log(settings.adminJS.isDraft);
      console.log(settings.adminJS.idPairs);




      $( "#edit-field-blog-series" ).change(function() {

        $('#edit-field-blog-topics .js-form-item').addClass('visually-hidden');
        $('#edit-field-blog-topics .form-checkbox').prop('checked', false);
    
        // Get the seleccted series ID.
        var sid = $('select#edit-field-blog-series')[0].value;
    
        // If the topic ID matches the series ID, remove the hidden class and show the checkboxes.
        var topics = settings.adminJS.idPairs;

        for (var tid in topics) {
          if(topics[tid] === sid) {
            jQuery('input[value=' + tid + ']').parent().removeClass('visually-hidden');
          }
        }

      });





    }
  };


})(jQuery, Drupal);
/**
 * @file
 * Placeholder file for custom blog post form behaviors.
 * TODO: make selectors settings 
 * 
 */
(function($, Drupal) {

  /**
   * @type {Drupal~behavior}
   * @prop {Drupal~behaviorAttach} attach
   *   Set behaviors for the admin Blog Post create / edit form.
   */
  Drupal.behaviors.blogPostForm = {
    attach: function (context, settings) {

      //console.log(settings.adminJS.selectable);
      //console.log(settings.adminJS.idPairs);

      /** Initialize correct selections on ready(). */
      $(function () {
        filterTopicOptions(settings);
      });

      /** Clear checks and show correct selections on dropdown change. */
      $( "#edit-field-blog-series" ).change(function() {
        $('#edit-field-blog-topics .form-checkbox').prop('checked', false);
        filterTopicOptions(settings);
      });

      /**
       * If the topic ID matches the series ID, remove the hidden class and show the checkboxes.
       * 
       * @param {*} settings 
       *    Drupalsettings
       */
      function filterTopicOptions(settings) {
        // Hide checkboxes to start.
        $('#edit-field-blog-topics .js-form-item').addClass('visually-hidden');

        // Get the seleccted series ID.
        var sid = $('select#edit-field-blog-series')[0].value;

        // Show every checkbox item that matches the owner series.
        var topics = settings.adminJS.idPairs;
        for (var tid in topics) {
          if(topics[tid] === sid) {
            jQuery('input[value=' + tid + ']').parent().removeClass('visually-hidden');
          }
        }
      } // filterTopicOptions()

    } // attach()
    
  }; // Drupal.behaviors.blogPostForm {}

})(jQuery, Drupal);
(function($) {
  $.fn.drawBlogTopics = function(data) {
    // Hide all checkboxes by default
    $('#edit-field-blog-topics .js-form-item').addClass('visually-hidden');

    // Get the seleccted series ID

    var seriesId = $('select#edit-field-blog-series')[0].value;
    // What do we want from the data params?
    // 1. Selected Blog Series (number)
    // 2. ?
    // 3. Profit.
    // TODO: hide toics wrapper if not categories
    console.log(data);
    console.log('series ID: ' + seriesId);
  };
  //TODO: clean up and add guts
})(jQuery);

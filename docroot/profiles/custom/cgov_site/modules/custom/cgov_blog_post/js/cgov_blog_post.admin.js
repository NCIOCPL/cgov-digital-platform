(function($) {
  $.fn.drawBlogTopics = function(data) {
    // Hide all checkboxes by default
    $('#edit-field-blog-topics .js-form-item').addClass('to-be-hidden');

    // Get the seleccted series ID
    var seriesId = $('select#edit-field-blog-series')[0].value;

    // What do we want from the data params?
    // 1. Selected Blog Series (number)
    // 2. ?
    // 3. Profit.
    // TODO: hide toics wrapper if not categories
    for (var key in data) {
      if(data[key] === seriesId) {
        console.log(key + ', ' + data[key]);
      }
    }

    //console.log(data);
    console.log('series ID: ' + seriesId);
  };
  //TODO: clean up and add guts
})(jQuery);

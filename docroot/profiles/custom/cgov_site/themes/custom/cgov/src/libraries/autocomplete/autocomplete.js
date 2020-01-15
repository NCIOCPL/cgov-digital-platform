/**
 * @file
 */

import $ from 'jquery';
/*======================================================================================================
* function doAutocomplete
*
*  will generate an autocomplete box for an <input type="text"> element, using jQuery UI
*
* returns: null
* parameters:
*  !target[]            (string)(jQuery selector)    Specific(!) selector of the input to be autocompleted.
*  !src[]               (string || function)         URL (string) or function returning a Promise of the autocomplete service.
*  contains[false]      (boolean)                    Boolean variable describing whether the autocomplete is for "starts with" (false) or "contains" (true).
*  queryParam["term"]   (string)                     Primary search querystring parameter.
*  queryString{}        (object)                     Additional parts of the querystring to pass to the autocomplete service.
*  opts{}               (object)                     Other options to pass to jQuery UI's autocomplete function.
*
*====================================================================================================*/
export function doAutocomplete(target, src, contains, queryParam, queryString, opts) {
    // Ensure our target is a jQuery object.
    var $target = $(target);

    var appendTo = $target.is("#swKeyword") ? null : $target.parent(),
        queryParameter = queryParam || "term",
        defaultOptions = {
            appendTo: appendTo,
            // Set AJAX service source.
            source: function (request, response) {
        var term = request.term,
          xhr;

                if (xhr && xhr.abort) {
                    xhr.abort();
                }
                if (typeof src === 'string') {
                    xhr = $.ajax({
                        url: src + term
                    });
                }
else {
                    xhr = src.call(this, term)
                        .done(function (data) {
                            return data.results;
                        });
                }

                $.when(xhr)
                    .done(function (data) {
                        if (data.results) {
                            response(data.results.map(function (el) {
                                return el.term
                            }));
                        }
else {
                            var values = [];
                            for (var i = 0; i < data.length; i++) {
                                values.push(data[i].item);
                            }
                            response(values);
                        }
                    })
                    .fail(function () {
                        response([]);
                    });
            },
            minLength: 3
        },
        options = $.extend({}, defaultOptions, opts || {});

    $target.autocomplete(options);

    return $target;
}

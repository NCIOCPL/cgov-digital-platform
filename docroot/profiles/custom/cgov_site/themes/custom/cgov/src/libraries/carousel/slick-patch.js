// require('slick-carousel/slick/slick.js');
import $ from 'jquery';
/*
* slick.js Monkey Patch v2
*
* Authoring Information
* Lauren Ficco                     June 2014 (v1)      July 2014 (v2)
*
* Reasoning
* Slick is a javascript carousel library. It is responsive and accessible,
* but when we use "half slidesToShow", the half slide appears on the left,
* instead of on the right:
*
*      Slick:                              What we want(ed):
*          |---|  |------|  |------|           |------|  |------|  |---|
*          | 6 |  |   1  |  |   2  |           |   1  |  |   2  |  | 3 |
*          |---|  |------|  |------|           |------|  |------|  |---|
*
* Slick ultimately does this calculation in Slick.prototype.getLeft(). Thus,
* we can correct the problem by changing offset that returns in this function.
*
* V2 Enhanchments
* Slick does some REALLY weird stuff (even without our patch) to calculate the
* active slide when dealing with decimal values. Frankly, they probably just
* shouldn't allow it because they don't handle them accurately.
*
* Given a slide value of 1.1, we get the following (where ! denotes active class):
*      Slick                               What we want(ed):
*          !-----!  |--|                       !------!  |--|
*          !  6  !  | 1|                       !   1  !  | 2|
*          !-----!  |--|                       !------!  |--|
* And, with the patch added:
*          !  |------|  |-|
*          !  |   1  |  |2|    (Yes, the active class was to the left on an object
*          !  |------|  |-|        that didn't even show.)
*
* However, if the slide value was .5 or greater, everything calculated as expected.
*/

// Save the old slick function for future use
var oldSlickFunction = $.fn.slick;

// Rewrite the slick function
$.fn.slick = function(options) {
    // Call the old $().slick() function and capture what it returns.
    // NOTE: Use .call() instead of just calling the function directly with
    // oldSlickFunction() in order to preserve the scope.

    //The following patch was only really written to handle the initialization of slick,
    //not additional calls for information.  A quick fix is to call each if there is an
    //each function, otherwise, we return the call response.
    var callResponse = oldSlickFunction.call(this, options);

    if (callResponse['each'] !== "function") {
        return callResponse;
    }
    //Otherwise handle the each
    callResponse.each(function(index, element) {

        // The old slick function will return an array of elements that have
        // slick properties/objects attached to the original HTML element

        // If the element has been defined, override setSlideClasses as this
        // is a problem with the original library
        if (typeof element.slick !== 'undefined') {

            // The majority of this function is copied and pasted from the
            // Slick library, specifically, Slick.prototype.setSlideClasses
            // as well. I acknowledge that this not the best way to do it
            // (see below), but the .slice() jQuery function rounds down, so
            // it messes up what the active class is set to. This is true
            // regardless of this patch or not (see top description).
            element.slick.setSlideClasses = function(index) {
                // ----------------- BEGIN COPY FROM SLICK -----------------
                var _ = this,
                        centerOffset, allSlides, indexOffset;

                _.$slider.find('.slick-slide').removeClass('slick-active').removeClass('slick-center');
                allSlides = _.$slider.find('.slick-slide');

                if (_.options.centerMode === true) {

                    centerOffset = Math.floor(_.options.slidesToShow / 2);

                    if (_.options.infinite === true) {

                        if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {
                            _.$slides.slice(index - centerOffset, index + centerOffset + 1).addClass('slick-active');
                        } else {
                            indexOffset = _.options.slidesToShow + index;
                            allSlides.slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2).addClass('slick-active');
                        }

                        if (index === 0) {
                            allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass('slick-center');
                        } else if (index === _.slideCount - 1) {
                            allSlides.eq(_.options.slidesToShow).addClass('slick-center');
                        }

                    }

                    _.$slides.eq(index).addClass('slick-center');

                } else {

                    if (index > 0 && index < (_.slideCount - _.options.slidesToShow)) {
                        _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active');
                    } else if (allSlides.length <= _.options.slidesToShow) {
                        allSlides.addClass('slick-active');
                    } else {
                        // -------------- END COPY FROM SLICK --------------
                        if(_.options.centerItems === true) {
                        _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active');
                        } else {
                        // Seriously, all I'm doing to change this, is
                        // adding a Math.ceil()
                        indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;
                        allSlides.slice(indexOffset, Math.ceil(indexOffset + _.options.slidesToShow)).addClass('slick-active');
                        }
                        // ------------- BEGIN COPY FROM SLICK -------------
                    }

                }

                if (_.options.lazyLoad === 'ondemand') {
                    _.lazyLoad();
                }
                // ------------------ END COPY FROM SLICK ------------------
            };


            // If the slick element has the previewMode set, modify the getLeft
            // function. Otherwise, we can leave it in place.
            if (typeof element.slick.options.previewMode !== 'undefined' && element.slick.options.previewMode) {

                // The majority of this function is copied and pasted from the
                // Slick library, specifically, Slick.prototype.getLeft. I acknowledge
                // that this is a bizarre way to do it (setting it on each element),
                // but I was having trouble getting the scope to work with the way
                // the Slick Library was done; Slick.prototype could not be accessed
                // directly and it seemed to needed to be done on an individual
                // object basis.
                element.slick.getLeft = function(slideIndex) {
                    // Copying the method from Slick.prototype.getLeft is
                    // probably not the most impressive thing to do (e.g. we can
                    // backwards calculate based on what becomes set as the slideOffset
                    // and other variables), but I believe it to be the clearest
                    // to other developers.
                    // --------------- BEGIN COPY FROM SLICK ---------------
                    var _ = this,
                            targetLeft,
                            verticalHeight,
                            verticalOffset = 0;

                    _.slideOffset = 0;
                    verticalHeight = _.$slides.first().outerHeight();

                    if (_.options.infinite === true) {
                        if (_.slideCount > _.options.slidesToShow) {
                            _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                            verticalOffset = (verticalHeight * _.options.slidesToShow) * -1;
                        }
                        if (_.slideCount % _.options.slidesToScroll !== 0) {
                            if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                                _.slideOffset = ((_.slideCount % _.options.slidesToShow) * _.slideWidth) * -1;
                                verticalOffset = ((_.slideCount % _.options.slidesToShow) * verticalHeight) * -1;
                            }
                        }
                    } else {
                        if (_.slideCount % _.options.slidesToShow !== 0) {
                            if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                                _.slideOffset = (_.options.slidesToShow * _.slideWidth) - ((_.slideCount % _.options.slidesToShow) * _.slideWidth);
                                verticalOffset = ((_.slideCount % _.options.slidesToShow) * verticalHeight);
                            }
                        }
                    }
                    /*
                    if (_.options.centerMode === true) {
                    _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
                    }*/
                    // --------------- PAUSE COPY FROM SLICK ---------------

                    // Determine the difference in the number of slides (this
                    // is used for percentages of slides)
                    var fractionSize = Math.ceil(_.options.slidesToShow) - _.options.slidesToShow;

                    // Change the offset (we already know it's in preview mode
                    // from the above if statement and if we're individualizing
                    // the getLeft function due to the scope, then we don't need
                    // something more complex here.
                    if (_.options.centerItems === true) {
                    _.slideOffset -= (_.slideWidth * fractionSize) / 2;
                    } else {
                    _.slideOffset -= _.slideWidth * fractionSize;
                    }

                    // If our fractionSize is greater than 0.5, this means
                    // we are actually trying to show a smaller section of a
                    // slide and it will mess up the active classes (see
                    // overridden function above and/or explanations about
                    // v2). Thus, we should reset the active classes after the
                    // init.
                    if (fractionSize > 0.5) {
                        _.setSlideClasses(_.currentSlide);
                    }


                    // --------------- CONTINUE COPY FROM SLICK ---------------
                    if (_.options.vertical === false) {
                        targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
                    } else {
                        targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
                    }

                    return targetLeft;
                    // --------------- END COPY FROM SLICK ---------------
                };

            }
        }

    });
};

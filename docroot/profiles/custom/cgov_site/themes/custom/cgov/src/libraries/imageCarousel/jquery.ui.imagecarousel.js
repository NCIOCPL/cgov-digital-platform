/*!
 * jQuery UI Widget-factory plugin for supporting an image carousel.  Currently this uses slick for functionality.
 * this widget should be called on a element that matches the following structure:
 * <div class="ic-carousel">
 *   <div class="ic-carousel-title"><h4>Title</h4></div>
 *   <div class="row">
 *      <div class="slider">
 *        <div>
 *          <img alt="alt" src="/image.jpg" />
 *          <div class="ic-credit">Credit: Credit</div>
 *          <div class="ic-caption">...</div>
 *        </div>
 *        ... more images ...
 *      </div>
 *   </div>
 * </div>
 * Author: @bryanp
 */

(function( factory ) {
    if ( typeof define === "function" && define.amd ) {

        // AMD. Register as an anonymous module.
        define(["jquery", "jquery-ui", 'slick-carousel', 'Modules/carousel/slick-patch'], factory );
    } else {
        // Browser globals
        factory( jQuery );
    }
}(function( $ ) {

    /*var ENG_PREV_TEXT = "Previous";
    var ENG_NEXT_TEXT = "Next";
    var SPN_PREV_TEXT = "Anterior";
    var SPN_NEXT_TEXT = "Siguiente";*/

    return $.widget("nci.imagecarousel", {

        options: {
            previousText: "Previous",
            nextText: "Next",

            // Callbacks
            change: null //This is triggered on a slide change.
            
            //Examples
            //fetchSrc: false, //String or Promise
            //queryParam: false,
            //buttonText: 'Clear Selection'
            //
            //handle on click/on swipe
            //probably should have slick options
            //
        },
        getTitle: function() {
            return this.title;
        },
        setPosition: function() {
            this.$sliderEl.slick('setPosition');
        },
        // Adds the previous next controls to the element
        _addControls: function() {
            this.controls = {};
            
            /*var prevButtonTxt = ENG_PREV_TEXT;
            var nextButtonTxt = ENG_NEXT_TEXT;
    
            if ('language' == 'spanish') {
                prevButtonTxt = SPN_PREV_TEXT;
                nextButtonTxt = SPN_NEXT_TEXT;    
            }*/
    
            // Script for custom arrows
            // NOTE: The slick library comes with arrows, but they are pre-styled
            // and they go after the carousel. Front End Devs can decide if they'd
            // rather style the old ones or edit the HTML of the new ones, but
            // make sure to change arrow setting in .slick() declaration
            //
            // Draw Controls
            this.controls.$prevButton = $('<button>', {
                "class": 'previous',
                type: 'button'
            }).append('<span>', {
                "class": "ic-arrow-button",
                text: this.options.previousText
            })           
    
            this.controls.$nextButton = $('<button>', {
                "class": 'next'
            }).append('<span>', {
                "class": "ic-arrow-button",
                text: this.options.nextText
            });
    
            this.controls.$status = $('<div>', {
                "class": 'pagingInfo'
            });
    
            var controls = $('<div>', {
                "class": 'row ic-controls'
            }).append(
                $('<div>', {
                    "class": 'controls'
                }).append(
                    $('<div>').append(
                        this.controls.$status,
                        $('<div>', {
                            "class": 'arrows arrows-for-ic-carousel'
                        }).append(this.controls.$prevButton, this.controls.$nextButton)
                    )
                )
            );
    
            this.$el.append(controls);    
        },
        // Helper function to set the status information in the controls area
        _setStatus: function(slick, currentSlide, nextSlide) {
            //Note: this will be called with this as being the widget.

            //currentSlide is undefined on init -- set it to 0 in this case (currentSlide is 0 based)
            var i = (currentSlide ? currentSlide : 0) + 1;
            this.controls.$status.text(i + '/' + slick.slideCount);
        },
        // jQuery UI "abstract method" called when $el.imagecarousel() is first called on an element. 
        _create: function () {     

            var thisCarousel = this;
            thisCarousel.$el = $(this.element);
            thisCarousel.$sliderEl = thisCarousel.$el.find('.slider').first();     
            thisCarousel.title = thisCarousel.$el.find('.ic-carousel-title h4').text();

            //Add the controls
            thisCarousel._addControls();

            //Attach some events on the slider element, this is done before initializing slick as
            //we need init to fire off when we call slick below
            thisCarousel.$sliderEl.on('init reInit', function (event, slick, currentSlide, nextSlide) {
                //Set the slide count so that we can easily access it elsewhere
                thisCarousel.slideCount = slick.slideCount;

                thisCarousel._setStatus(slick, currentSlide, nextSlide);
            });

            thisCarousel.$sliderEl.on('afterChange', function (event, slick, currentSlide, nextSlide) {
                //currentSlide is undefined on init -- set it to 0 in this case (currentSlide is 0 based)
                thisCarousel._setStatus(slick, currentSlide, nextSlide);
            });

            // Handle raising events when a swipe occurs.
            thisCarousel.$sliderEl.on('swipe', function(event, slick, direction) {

                //Assume that we moved to the next slide first.
                var currSlide = thisCarousel.$sliderEl.slick('slickCurrentSlide');            
                var carouselDir = 'unknown';
                var previousSlide = -1;

                if (direction == 'right') {
                    carouselDir = 'previous';
                    //if we moved to the previous slide, then the previous one is the slide to the right of the current,
                    //otherwise we have looped and we are now at index 
                    previousSlide = (currSlide + 1) < thisCarousel.slideCount ? (currSlide + 1) : 0;
                } else {
                    carouselDir = 'next';
                    //if we moved to the next slide, then the previous one is the slide the the left of the current
                    previousSlide = (currSlide - 1) >= 0 ? (currSlide - 1) : thisCarousel.slideCount - 1;
                }

                //Core jQuery UI method to trigger events.  Even can either be set on options or element.
                //The event will be null, but eventData should be filled in.
                thisCarousel._trigger('change', null, {
                    triggerEvent: 'swipe',
                    direction: carouselDir,
                    beforeIndex: previousSlide,
                    afterIndex: currSlide,
                    totalImages: thisCarousel.slideCount,
                });
            })
           

            //Find and Attach an instance on the carousel and Enable Slick
            thisCarousel.$sliderEl.slick({
                lazyLoad: 'ondemand',
                arrows: true,
                slidesToShow: 1,
                previewMode: true,
                slidesToScroll: 1,
                speed: 500,
                dots: false,
                //customPaging: function(slider,index){return index + ' of ' + slider.slideCount;},
                customPaging : function(slider, i) {
                    var thumb = $(slider.$slides[i]).data();
                    return '<a>'+i+'</a>'; },
                responsive: [
                    //alter breakpoint settings for image carousel
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 1,
                            speed: 1000,
                            slidesToScroll: 1
                        }
                    },

                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            speed: 700,
                            slidesToScroll: 1
                        }
                    },
                    {
                        breakpoint: 576,
                        settings: {
                            slidesToShow: 1,
                            speed: 500,
                            slidesToScroll: 1
                        }
                    }
                ]
            })

            //TODO: event handlers should be attached using this._on
            //Handle Pager Actions here            
            thisCarousel.controls.$prevButton.click(function(){
                
                //Only fire off our click event if we actually have slides
                if (thisCarousel.slideCount > 0) {

                    //Get the current slide.
                    var beforeSlide = thisCarousel.$sliderEl.slick('slickCurrentSlide');
                    var nextSlide = ((beforeSlide - 1) >= 0) ? (beforeSlide - 1) : (thisCarousel.slideCount - 1);

                    thisCarousel.$sliderEl.slick("slickPrev");

                    //Core jQuery UI method to trigger events.  Even can either be set on options or element.
                    //The event will be null, but eventData should be filled in.
                    thisCarousel._trigger('change', null, {
                        triggerEvent: 'click',
                        direction: 'previous',
                        beforeIndex: beforeSlide,
                        afterIndex: nextSlide,
                        totalImages: thisCarousel.slideCount,                        
                    });
                }                
            }); 
            
            thisCarousel.controls.$nextButton.click(function(){
                
                //Only fire off our click event if we actually have slides
                if (thisCarousel.slideCount > 0) {
                    
                    //Get the current slide.
                    var beforeSlide = thisCarousel.$sliderEl.slick('slickCurrentSlide');                    
                    var nextSlide = ((beforeSlide + 1) < thisCarousel.slideCount) ? (beforeSlide + 1) : 0;

                    thisCarousel.$sliderEl.slick("slickNext");

                    //Core jQuery UI method to trigger events.  Even can either be set on options or element.
                    //The event will be null, but eventData should be filled in.
                    thisCarousel._trigger('change', null, {
                        triggerEvent: 'click',
                        direction: 'next',
                        beforeIndex: beforeSlide,
                        afterIndex: nextSlide,
                        totalImages: thisCarousel.slideCount,
                    });
                }                    
            });
        }
    });
}));
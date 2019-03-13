import $ from 'jquery';
import 'slick-carousel';
import './slick-patch';

var initialize = () => {

    // Script for carousel
    $('.slider').slick({
        arrows: false,
        slidesToShow: 4,
        previewMode: true,
        centerItems: true,
        slidesToScroll: 4,
        speed: 2000,
        dots: true,
        // customPaging: function(slider,index){return index + ' of ' + slider.slideCount;},
        responsive: [
            // Small desktop version shows 3.5 slides, with .25 slide on the right
            // and .25 slide on the left (this is previewMode); code is in the patch
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3.5,
                    speed: 1000,
                    slidesToScroll: 3
                }
            },

            // Tablet version shows 2.5 slides, with .25 slide on the right
            // and .25 slide on the left (this is previewMode); code is in the patch
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2.5,
                    speed: 700,
                    slidesToScroll: 2
                }
            },

            // Smartphone version shows 1.5 slides, with .25 slide on the right
            // and .25 slide on the left (this is previewMode); code is in the patch
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1.5,
                    speed: 500,
                    slidesToScroll: 1
                }
            }
        ]
    });

    // Script for custom arrows
    // NOTE: The slick library comes with arrows, but they are pre-styled
    // and they go after the carousel. Front End Devs can decide if they'd
    // rather style the old ones or edit the HTML of the new ones, but
    // make sure to change arrow setting in .slick() declaration
    $('.carousel-title .previous').on('click',function() {
        $('.slider').slick("slickPrev");
    });
    $('.carousel-title .next').on('click',function() {
        $('.slider').slick("slickNext");
    });
};

export default initialize;
import $ from 'jquery';
import FlexVideoAPI from './flex-video-api';
import 'slick-carousel';
import 'Core/libraries/carousel/slick-patch';
import { NCIAnalytics } from 'Core/libraries/analytics/nci-analytics-functions';

// Number of thumbnails to show in the carousel
var thumbsToShow = 3;

/***
 * This snippet uses the slick library to dynamically draw a clickable image carousel based on the playlist ID.
 * The client should only be loaded if this page contains the YouTube carousel HTML snippet.
 *
 * TODO: - Handle initial loading screen
 *       - Convert to .ts and refactor. This thing has turned into an abomination.
 **/
function _initialize(key) {
    if($('.yt-carousel').length) {
        handleClientLoad(key);
    }
}

/**
 * Load the API's client.
 */
function handleClientLoad(key) {
    $.getScript("https://apis.google.com/js/client.js", () => {
        gapi.load('client', {
            callback: function() {
                // Handle gapi.client initialization.
                if(typeof(key) == 'undefined') {
                    console.log('No API key provided for carousel initialization.');
                } else {
                    initClient(key);
                }
            },
            onerror: function() {
                // Handle loading error.
                console.log('Google api.js failed to load.');
            },
            timeout: 5000, // 5 seconds.
            ontimeout: function() {
                // Handle timeout.
                console.log('Google api.js did not load in a timely manner.');
            }
        });
    })

}

/**
 * Initialize the API client and draw HTML
 */
function initClient(key) {
        // YouTube API address & params
        // TODO: see if we can do without discoveryDocs
        var $key = key;
        var $discoveryDocs = ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']

        // Initialize the gapi.client object, which app uses to make API requests.
        // API URL pattern: googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=_MY_PLAYLIST_ID_&key=_MY_GOOLE_API_KEY_&maxResults=50
        // Get API key from API Console.
        gapi.client.init({
            'apiKey': $key,
            'discoveryDocs': $discoveryDocs
        })
        .then(function() {
            // For each video carousel on the page, build the collection, download images, and draw HTML.
            $(".yt-carousel").each(function(i) {

                var $this = $(this);
                var $playlistId = $this.attr("data-playlist-id");
                var $carouselTitle = $this.find('h4').text();

                // Draw the containers for the carousel thumbnails and arrows
                appendCarouselControls($this);

                // Get the list of items...
                gapi.client.youtube.playlistItems.list({
                    playlistId: $playlistId,
                    part: 'snippet',
                    maxResults: 50
                })
                // ...then build the HTML
                .then(function(data) {
                    // Create vars for commonly used selectors
                    var $carouselThumbs = $this.find('.yt-carousel-thumbs');

                    // Get total number of YouTube video items, maxed out at 50
                    var $count = data.result.pageInfo.totalResults;
                    if ($count > 50) {
                        $count = 50;
                    }

                    // Initialize the selected player with the first item in the playlist
                    var $initialID = data.result.items[0].snippet.resourceId.videoId;
                    var $initialTitle = data.result.items[0].snippet.title;
                    drawSelectedVideo($this, $initialID, $initialTitle, 0, $count);

                    // Draw the carousel thumbnails
                    $.each(data.result.items, function(j, item) {
                        var $vid = item.snippet.resourceId.videoId;
                        var $title = item.snippet.title;
                        var $imageUrl = item.snippet.thumbnails.medium.url;
                        appendCarouselThumbnails($carouselThumbs, $vid, $title, $imageUrl);
                    });

                    // Draw elements based on the total number of videos:
                    // If there are less videos than the set number of slides, hide the desktop slick arrows
                    // If the number of videos is not evenly divisible by the set number of slides, add 'dummy' thumbnails
                    if ($count <= thumbsToShow) {
                        $this.find('.yt-carousel-controls button').addClass('ytc-hidden');
                    }
                    else {
                        appendDummyThumbnails($this, $count);
                    }

                    // Fire off slick.js functions to draw the carousel
                    createSlickCarousel($this, $carouselThumbs, $count);

                    // Change the video on carousel click
                    $this.find('.slick-current .yt-carousel-thumb').first().addClass('ytc-clicked'); // init selector
                    $this.find('.yt-carousel-thumb').click(function() {
                        var $thumb = $(this);
                        doThumbClickActions($this, $thumb, $count, $carouselTitle);
                    });

                    // Change the video upon mobile next arrow click
                    $this.find('.m-previous').click(function() {
                        var $indexPcurr = $this.find('.flex-video').attr('ytc-index');
                        var $indexPrev = --$indexPcurr;
                        if ($indexPrev < 0) {
                            $indexPrev = ($count - 1);
                        }
                        var $selPrev = $this.find(".slick-slide[data-slick-index='" + $indexPrev + "']");
                        var $idPrev = $selPrev.find('.yt-carousel-thumb').attr('id');
                        var $titlePrev = $selPrev.text();
                        drawSelectedVideo($this, $idPrev, $titlePrev, $indexPrev, $count, true);
                        doCarouselAnalytics($this, $carouselTitle, 'swipe',  $indexPrev);
                    });

                    // Change the video upon mobile previous arrow click
                    $this.find('.m-next').click(function() {
                        var $indexNcurr = $this.find('.flex-video').attr('ytc-index');
                        var $indexNext = ++$indexNcurr;
                        if ($indexNext > ($count - 1)) {
                            $indexNext = 0;
                        }
                        var $selNext = $this.find(".slick-slide[data-slick-index='" + $indexNext + "']");
                        var $idNext = $selNext.find('.yt-carousel-thumb').attr('id');
                        var $titleNext = $selNext.text();
                        drawSelectedVideo($this, $idNext, $titleNext, $indexNext, $count, true);
                        doCarouselAnalytics($this, $carouselTitle, 'swipe',  $indexNext);
                    });

                }) // end HTML drawing
            }) // end yt-carousel.each()
        }); // end .then() after client init

        // // If we're inside a collapsed accordion, do a refresh of the slick carousel's position.
        // // This is a fix for slick image initialization error.
        // $('.yt-carousel-thumbs').closest('section').click(function() {
        //     $('.yt-carousel-thumbs').slick('setPosition');
        // });
}


/**
 * Draw a carousel thumbnail element & attributes
 * @param {any} $carousel
 * @param {any} $id
 * @param {any} $title
 * @param {any} $imgUrl
 */
function appendCarouselThumbnails($carousel, $id, $title, $imgUrl) {
    var $thumbBlob = '<div class="ytc-thumb-container">' +
                        '<a class="yt-carousel-thumb" id="' + $id + '">' +
                            '<img src="' + $imgUrl + '" alt="' + $title + '">' +
                        '</a>' +
                        '<span>' + $title + '</span>' +
                        '</div>'
    $carousel.append($thumbBlob);
}

/**
 * Add dummy thumbnails to make the total carousel elements divisible by 3.
 * This is to help delineate the last/first videos when scrolling around on slick.
 * @param {any} $this
 * @param {any} $total
 */
function appendDummyThumbnails($this, $total) {
    var $thumbSelector = $this.find('.ytc-thumb-container').last();
    var $dummyBlob = '<div class="ytc-thumb-container ytc-dummy" />';
    var $spacesToDraw = thumbsToShow - ($total % thumbsToShow);
    if($spacesToDraw != thumbsToShow) {
        for (let i = 0; i < $spacesToDraw; i++) {
            $thumbSelector.after($dummyBlob);
        }
    }
}

/**
 * Draw the containers for the carousel thumbnails and arrows
 * TODO: hide arrows if < 4 items
 * @param {any} $this
 */
function appendCarouselControls($this) {
    var $prev = 'previous';
    var $next = 'next';
    if($('.yt-carousel.ytc-spanish').length) {
        $prev = 'anterior';
        $next = 'siguiente';
    }

    var $carouselControls = '<div class="row yt-carousel-controls">' +
                            '<div class="yt-carousel-thumbs columns small-10"></div>' +
                            '<div class="yt-carousel-arrows columns small-2">' +
                                '<button class="previous" type="button" value="' + $prev + '" alt="' + $prev + '"></button>' +
                                '<button class="next" type="button" value="'+ $next +'" alt="'+ $next +'"></button>' +
                                '<div class="yt-carousel-pager" />' +
                                '</div>' +
                            '</div>';
    var $mobileControls = '<div class="row yt-carousel-m-controls">' +
                            '<div class="yt-carousel-m-pager columns small-9"></div>' +
                            '<div class="yt-carousel-m-arrows columns small-3">' +
                                '<button class="m-previous" type="button" value="' + $prev + '" alt="' + $prev + '"></button>' +
                                '<button class="m-next" type="button" value="'+ $next +'" alt="'+ $next +'"></button>' +
                            '</div>' +
                            '</div>';
    $this.append($carouselControls + $mobileControls);
}


/**
 * Update flex-video selector attributes with a new video ID, then draw the selected video, mobile elements, and
 * fire off onstatechanged events
 * @param {any} $this
 * @param {any} $vidID
 * @param {any} $vidTitle
 * @param {any} $index
 * @param {any} $total
 * @param {any} $isAutoPlay
 */
function drawSelectedVideo($this, $vidID, $vidTitle, $index, $total, $isAutoPlay) {

    // Replace all instances of the YouTube video ID within the <figure> element
    var $selectedVideo = $this.find('.yt-carousel-selected .flex-video');
    $selectedVideo.attr('id', 'ytplayer-' + $vidID);
    $selectedVideo.attr('data-video-id', $vidID);
    $selectedVideo.attr('data-video-title', $vidTitle);
    $selectedVideo.attr('ytc-index', $index);
    $selectedVideo.find('noscript a').attr('href', 'https://www.youtube.com/watch?v=' + $vidID);
    $selectedVideo.find('noscript a').attr('title', $vidTitle);

    // Draw mobile HTML elements
    var $pager = $this.find('.yt-carousel-m-pager');
    var $pos = 1 + parseInt($index);
    if($('.yt-carousel.ytc-spanish').length)
        $pager.text($pos + " de " + $total);
    else
        $pager.text($pos + " of " + $total);

    // Rebuild the YouTube embedded video from the updated flex-video element, then draw the player.
    // FlexVideoAPI.init() enables the embedding of YouTube videos and playlists as iframes.
    $selectedVideo.children('iframe').remove();
    FlexVideoAPI.init($this);

    //************ Begin YouTube API onPlayer functions  ************//
    /**
     * The API will call this function when the page has finished downloading the JavaScript for the player API,
     * which enables us to then use the API on the page
     */
    //var player;
    function onYouTubeIframeAPIReady() {
        new YT.Player('flex-video-api', {
            events : {
                'onReady' : onPlayerReady,
                'onStateChange' : onPlayerStateChange
            }
        })
    }

    // Function to execute when the onReady event fires
    function onPlayerReady(e) {
        if($isAutoPlay) {
            // Start the video when when the player is ready -
            // unless this is the initial page load.
            e.target.playVideo();
        }
    }

    // Call the onPlayerStateChange function when the player's state changes, which may indicate that the player is playing, paused, finished, etc
    function onPlayerStateChange(e) {
        switch (e.data) {
            // Finished event
            case 0:
                $indexCurr = $this.find('.flex-video').attr('ytc-index');
                $indexNext = ++$indexCurr;
                if($indexNext <= ($total - 1)) {
                    $carouselTitle = $this.find('h4').text();
                    $selNext = $this.find(".slick-slide[data-slick-index='" + $indexNext + "']");
                    $idNext = $selNext.find('.yt-carousel-thumb').attr('id');
                    $titleNext = $selNext.text();

                    // Change the thumbnail selector
                    $this.find('.ytc-clicked').removeClass('ytc-clicked');
                    $selNext.find('.yt-carousel-thumb').addClass('ytc-clicked');
                    if(($indexCurr % thumbsToShow == 0) && ($indexCurr < $total)) {
                        if($indexCurr <= $indexNext) {
                            $('.yt-carousel-thumbs').slick("slickNext");
                            drawThumbIndicator($this, $total);
                        }
                    }

                    // Fire off analytics and draw the video
                    doCarouselAnalytics($this, $carouselTitle, 'complete',  $index); // Fire analytics for current video ending
                    drawSelectedVideo($this, $idNext, $titleNext, $indexNext, $total, true);
                }
                break;
        }
    }

    // Initialize
    onYouTubeIframeAPIReady();
    //************ End YouTube API onPlayer functions  ************//
}

/**
 * slick-carousel calls to draw the YouTube playlist carousel
 * @param {any} $this
 * @param {any} $carousel
 * @param {any} $total
 */
function createSlickCarousel($this, $carousel, $total){
    // Draw slick slider for YT thumbnails
    $carousel.slick({
        infinite: true,
        slidesToShow: thumbsToShow,
        slidesToScroll: thumbsToShow
        // TODO: find workaround for responsive bug
        // https://github.com/kenwheeler/slick/issues/542
    });

    // Draw the "n of total" text under the slick arrows
    drawThumbIndicator($this, $total);
    $carousel.on('swipe', function(event, slick, direction){
        drawThumbIndicator($this, $total);
    });

    // Trigger slick & pager on custom arrow click
    $this.find('.yt-carousel-arrows .previous').click(function() {
        $carousel.slick("slickPrev");
        drawThumbIndicator($this, $total);
    });
    $this.find('.yt-carousel-arrows .next').click(function() {
        $carousel.slick("slickNext");
        drawThumbIndicator($this, $total);
    });

    // Trigger slick & pager on left/right arrow press
    $this.on('keydown', function(e) {
        if(e.keyCode == 37) {
            $carousel.slick('slickPrev'); // l
            drawThumbIndicator($this, $total);
        }
        if(e.keyCode == 39) {
            $carousel.slick('slickNext'); // right arrow
            drawThumbIndicator($this, $total);
        }
    });

}

/**
 * Draw new video and fire off analytics on thumbnail click
 * @param {any} $this
 * @param {any} $thumb
 * @param {any} $total
 * @param {any} $title
 */
function doThumbClickActions($this, $thumb, $total, $title){
    // Add 'ytc-clicked' class to thumbnail for selected item styling
    $this.find('.ytc-clicked').removeClass('ytc-clicked');
    $thumb.addClass('ytc-clicked');

    // Get data from clicked thumnail and pass to draw function
    var $thumbIndex = $thumb.closest('.slick-slide').attr('data-slick-index');
    var $thumbVideoTitle = $thumb.text();
    var $thumbVideoID = $thumb.attr('id');
    if($thumbVideoID.length < 1) {
        // For cases where slick does not clone the thumbnail link ID
        var $img = $thumb.find('img').attr('src');
        $thumbVideoID = $img.split('/')[4];
    }
    drawSelectedVideo($this, $thumbVideoID, $thumbVideoTitle, $thumbIndex, $total, true);
    doCarouselAnalytics($this, $title, 'click',  $thumbIndex);
}

/**
 * Draw text our displayed range of video thumbnail items
 * @param {any} $this
 * @param {any} $total
 */
function drawThumbIndicator($this, $total){
    var $pager = $this.find('.yt-carousel-pager');
    var $first = $this.find('.slick-current').attr('data-slick-index');
        $first = ++$first;
    var offset = thumbsToShow - 1;
    var $last = $first + offset;

    // Logic to handle text at the end of the carousel
    if($last > $total) {
        $last = $total;
    }
    var $range = $first + '-' + $last;
    if($first == $total) {
        $range = $total;
    }

    // Set 'of' value for English or Spanish
    if($('.yt-carousel.ytc-spanish').length)
        $pager.text($range + ' de ' + $total);
    else
        $pager.text($range + ' of ' + $total);
}

/**
 * Track analytics for click events on video carousel items.
 * @param {any} sender
 * @param {any} title
 * @param {any} action
 * @param {any} index
 */
function doCarouselAnalytics(sender, title, action, index){
    if(typeof(NCIAnalytics !== 'undefined')) {
        var safeTitle = title;
        if(title.length > 50) {
            safeTitle = title.substring(0,50);
        }
        ++index; // Add one to index to track corresponding video #
        var value = 'vidcar_' + safeTitle + '_' + action + '_' + index;
        if(action == 'complete') {
            NCIAnalytics.VideoCarouselComplete(sender, value);
        } else {
            NCIAnalytics.VideoCarouselClickSwipe(sender, value);
        }
    }
}

var initialized = false;

export default {
    init: function() {
        if (initialized) {
            return;
        }

        initialized = true;
        _initialize();
    },
    apiInit: function(key) {
        if (initialized) {
            return;
        }

        initialized = true;
        _initialize(key);
    }
};

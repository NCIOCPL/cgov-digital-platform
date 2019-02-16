import Headroom from 'headroom.js/dist/headroom.min';
import $ from 'jquery';

var oldHeadroom = Headroom;
var HeadroomExtensions = {
    options: {
        classes: {
            isFrozen: 'frozen'
        }
    },
    prototype: {
        shouldPin: function (currentScrollY, toleranceExceeded) {
            var scrollingUp  = currentScrollY < this.lastKnownScrollY,
                pastOffset = currentScrollY <= this.offset,
            isFrozen = this.elem.classList.contains(this.classes.isFrozen);

            return !isFrozen && ((scrollingUp && toleranceExceeded) || pastOffset);
        },
        shouldUnpin: function (currentScrollY, toleranceExceeded) {
            var scrollingDown = currentScrollY > this.lastKnownScrollY,
                pastOffset = currentScrollY >= this.offset,
                isFrozen = this.elem.classList.contains(this.classes.isFrozen);

            return !isFrozen && (scrollingDown && pastOffset && toleranceExceeded);
        }
    }
};

window.Headroom = $.extend(true, oldHeadroom, HeadroomExtensions);

import './Connect.scss';
import $ from 'jquery';

const onDOMContentLoaded = () => {
  micrositeSnippet().init()
};

// this was pulled from a Raw HTML block. It does DOM manipulation, mostly adding classes. The CSS classes, particularly micro-a, are used in the themes. A dev did it for Nano, the original theme, and its been copied over to all the themes.
var micrositeSnippet = function (i) {
  function e() {
    var i = $("#microsite-a");
    var $this;
    i.length > 0 && ($("#nvcgSlUtilityBar").addClass("micro-a"), $(".row.guide-card").addClass("micro-a"), $(".feature-primary-title h3, .guide-title h2").each(function (i) {
      $this = $(this), $this.html().trim() || $this.remove()
    }), "/" == $(".breadcrumbs li a").first().attr("href") && $(".breadcrumbs li").first().remove())
  }
  var t = !1;
  return {
    init: function () {
      t || (e(), t = !0)
    }
  }
}

document.addEventListener('DOMContentLoaded',onDOMContentLoaded);

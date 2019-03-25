import "./Homelanding.scss";

const onDOMContentLoaded = () => {
  // thumbnail list images and titles share a hover state
  $(".managed .title").hover(
    function() {
      $(this)
        .closest(".media")
        .addClass("hover");
    },
    function() {
      $(this)
        .closest(".media")
        .removeClass("hover");
    }
  );
};

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);

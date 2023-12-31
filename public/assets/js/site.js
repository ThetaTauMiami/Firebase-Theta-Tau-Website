
// animate scrolling whenever an anchor link is clicked
$(function() {

  var scrollTime = 1000; // Speed of animated scroll, lower = faster

  $('a[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      if(this.hash.slice(1) == "") return;
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, scrollTime);
        return false;
      }
    }
  });
});
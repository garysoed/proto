var Svg = (function() {

  /**
   * Returns a function to be passed into jQuery's each() to append the given SVG to each element.
   *
   * @param {string} uri URI of the SVG to load.
   */
  var appendSvg = function(uri) {
    return function() {
      var target = this;

      $.get(uri, function(data) {
          // Get the SVG tag, ignore the rest
          var svg = $(data)
              .find('svg')
              // Remove any invalid XML tags as per http://validator.w3.org
              .removeAttr('xmlns:a')

              // Set the size to 100% and rely on viewBox so the svg fits inside the 
              // containing element.
              .attr('width', '100%')
              .attr('height', '100%');

          // Replace image with new SVG
          $(target)
              .empty()
              .append(svg);
      }, 'xml');
    };
  };

  return { appendSvg: appendSvg };
})();
/**
 * @fileOverview Draws a SVG image of the 50 United States
 * @author Kirby Linvill 08/21/2015
 * 
 */


/**
 * Creates and initializes the d3.geo map projection.
 * @return {function} Initialized d3.geo map projection.
 */
function get_geomap() {
    var svg = d3.select("#airline_visualization");
    var width =  Number(svg.attr("width"));
    var height = Number(svg.attr("height"));


    // Full size geomap should be shown at 1200 width and 700 height, otherwise the geomap is optimized for about a 700 width
    //    and 500 height
    var geomap_scale = ((width == 1200 && height == 700) ? 1300 : 900);

    var geomap = d3.geo.albersUsa()
      .scale(geomap_scale)
      .translate([width / 2, height / 2]);

    return geomap;
}



(function () {
    var svg = d3.select("#airline_visualization");

    var geomap = get_geomap();

    var path = d3.geo.path()
      .projection(geomap);

    var country = svg.append("svg:g")
      .attr("id", "country");

    var states = svg.append("svg:g")
      .attr("id", "states");


    // Draw geomap of the US using the data in the us.json file
    d3.json("us.json", function(error, us) {
      
      svg.selectAll("#country")
        .datum(topojson.feature(us, us.objects.land))
        .append("svg:path")
        .attr("class", "land")
        .attr("d", path);
     
      svg.selectAll("#states")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .append("svg:path")
        .attr("class", "state-boundary")
        .attr("d", path);
    });
}) ();


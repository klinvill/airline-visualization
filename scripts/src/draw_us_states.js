/**
 * @fileOverview Draws a SVG image of the 50 United States
 * @author Kirby Linvill 08/21/2015
 * 
 */

import { config } from "./config.js";

/**
 * Creates and initializes the d3.geo map projection.
 * @return {projection} Initialized d3.geo map projection.
 */
export function get_geomap() {
    var svg = d3.select("#airline_visualization");
    var width =  Number(svg.attr("width"));
    var height = Number(svg.attr("height"));


    // Full size geomap should be shown at 1200 width and 700 height
    var geomap_scale = ((width == config.preferred_width && height == config.preferred_height) ? config.fallback_width : config.fallback_height);

    var geomap = d3.geoAlbersUsa()
      .scale(geomap_scale)
      .translate([width / 2, height / 2]);

    return geomap;
}


/**
 * Draw geomap of the US using the data in the us.json file
 * @param  {[type]} svg d3 svg element to draw the map in
 * @param {[type]} geomap d3 geo projection to use for the map
 */
export function drawUS(svg, geomap) {
  var path = d3.geoPath()
    .projection(geomap);

  var country = svg.append("svg:g")
    .attr("id", "country");

  var states = svg.append("svg:g")
    .attr("id", "states");

  d3.json("../data/us.json", function(error, us) {
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
}

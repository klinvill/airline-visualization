/*
 * Draws US airports (as circles) over an SVG image of the U.S.
 *
 * Written By: Kirby Linvill 08/21/2015
 * 
 */

import { config } from "./config.js";

export function draw_airports(svg, geomap) {
    return function (airports_list) {

        var airports = svg.append("svg:g")
          .attr("id", "airports");

        airports.selectAll("circle")
            .data(airports_list)
            .enter().append("svg:circle")
            .attr("class", "airport")

            .attr("cx", function(d, i) { return geomap([d.LONGITUDE, d.LATITUDE])[0]; })
            .attr("cy", function(d, i) { return geomap([d.LONGITUDE, d.LATITUDE])[1]; })
            .attr("r", config.standard_airport_radius)

            .attr("data-airport-cd", function(d) { return d.AIRPORT;})
            .attr("data-airport-name", function(d) { return d.DISPLAY_AIRPORT_NAME;})
        ;
    };
}

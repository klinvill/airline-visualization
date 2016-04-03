/*
 * Draws US airports (as circles) over an SVG image of the U.S.
 *
 * Written By: Kirby Linvill 08/21/2015
 * 
 */

(function () {
    d3.csv("filtered_airports.csv", function (airports_list) {
        var svg = d3.select("#airline_visualization");

        var geomap = get_geomap();

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

    
        // The draw_flights function requires the location of the airports. The draw 
        //      flights function is called from within the draw airports function 
        //      in order to keep this data out of the global scope.
        draw_flights(airports_list); 

    });

}) ();

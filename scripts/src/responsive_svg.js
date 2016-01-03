/**
 * Holds the javascript functions that are fired in response to user actions (mouseovers, clicks, etc.)
 */

// Globally tracks which airport is currently selected
var selected_airport;

/**
 * Enlarges an airport icon on the map
 * @param  {DOM Element} element The airport element to be enlarged
 */
function magnify_airport(element) {
    d3.select(element).attr("r", hover_airport_radius);
}

/**
 * Returns the size of an airport icon on the map to normal 
 * @param  {DOM Element} element The airport element to be returned to normal size
 */
function unmagnify_airport(element) {
    d3.select(element).attr("r", standard_airport_radius);
}

/**
 * Shows the routes originating from an airport on the map
 * @param  {String} airport The airport code of the airport whose outbound routes should be made visible
 */
function show_routes_from(airport) {
    d3.selectAll("#routes [data-src-airport='"+airport+"']")
        .style("display", "inherit");
}

/**
 * Hides the routes originating from an airport on the map
 * @param  {String} airport The airport code of the airport whose outbound routes should be hidden
 */
function hide_routes_from(airport) {
    d3.selectAll("#routes [data-src-airport='"+airport+"']")
        .style("display", "none");
}

/**
 * If the given route is flown by the airline selected in the airline input box, then the css 
 * class "highlighted" is added to the list of css classes currently assigned to that route.
 * @return {String}   Space separated list of css classes
 */
function highlight_airline() {
    var this_node = d3.select(this);
    var selected_airline = d3.select("input[name=airline]:checked").attr("value");
    var airline_data = JSON.parse(this_node.attr("data-airlines"));

    if (selected_airline in airline_data)
      return this_node.attr("class") + " highlighted";
    else
      return this_node.attr("class");
}


function unhighlight_airline() {
    var this_node = d3.select(this);

    console.log(this_node.attr("class").slice());

    //return this_node.attr("class");
    return "arc";
}


function attach_airport_handlers() {
    // When hovering over an airport on the map, the airport should appear larger
    //      and all routes from that airport should appear
    var airports = d3.selectAll(".airport");

    airports.on("mouseover", function (d, i) {
            magnify_airport(this);
            show_routes_from(d.AIRPORT);

            //d3.selectAll("[data-airport='"+d.AIRPORT+"'] .arc")
            //    .attr("class", highlight_airline);
            d3.selectAll("[data-src-airport='"+d.AIRPORT+"'] .arc")
                .attr("class", highlight_airline);
        })
        .on("mouseout", function (d, i) {
            unmagnify_airport(this);
            if (d.AIRPORT != selected_airport) {
                hide_routes_from(d.AIRPORT);
                d3.selectAll("[data-src-airport='"+d.AIRPORT+"'] .arc")
                    .attr("class", unhighlight_airline);
            }
        })

        .on("click", function (d, i) {
            hide_routes_from(selected_airport);
            d3.selectAll("[data-src-airport='"+selected_airport+"'] .arc")
                .attr("class", unhighlight_airline);

            selected_airport = d.AIRPORT;
            d3.selectAll("[data-src-airport='"+selected_airport+"'] .arc")
                .attr("class", highlight_airline);
            show_routes_from(d.AIRPORT);
            d3.select("#selected_airport_name").text(d.DISPLAY_AIRPORT_NAME);

            // The currently selected airport code is stored so that it can be easily accessed to only change the color of the highlighted routes
            d3.select("#routes").attr("data-selected", d.AIRPORT);

            // TODO: Dependent on flight_count.js
            graphCountsByAirline(d.AIRPORT);
        })
    ;
}



function attach_airline_handlers() {
    var airline_selector = d3.selectAll(".key input");
    
    airline_selector.on("click", function(d, i) {
        //selected_airport = d3.select("#routes").attr("data-selected");

        // resets the highlighting
        //d3.selectAll("[data-src-airport='"+selected_airport+"'] .arc").attr("class", "arc");
        d3.selectAll("[data-src-airport='"+selected_airport+"'] .arc")
            .attr("class", unhighlight_airline);

        d3.selectAll("[data-src-airport='"+selected_airport+"'] .arc")
            .attr("class", highlight_airline);
    })
}


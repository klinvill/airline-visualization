/**
 * Holds the configuration parameters for the airline visualization
 */

var config = {
    // Preferred and fallback map sizes
    "preferred_width": 1200,
    "preferred_height": 700,
    "fallback_width": 1300,
    "fallback_height": 900, 

    // Config parameters to determine the normal and enlarged sizes of the airport circls
    "standard_airport_radius": 3,
    "hover_airport_radius": 6,

    // Flight count bar graph params
    "bar_chart_width": d3.select("#airline_bar_chart") .attr("width"),
    "axis_width": 200,
    "label_width": 100
};
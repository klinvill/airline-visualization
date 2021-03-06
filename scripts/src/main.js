import { get_geomap, drawUS } from "./draw_us_states.js";
import { draw_airports } from "./draw_airports.js";
import { draw_flights } from "./draw_flights.js";
import { attach_airport_handlers, attach_airline_handlers, selected_airport } from "./responsive_svg.js";
import { add_airline_select_box } from "./select_airline.js";
import { addFlightCountChart } from "./flight_count.js";


(function () {
    var svg = d3.select("#airline_visualization");
    var geomap = get_geomap();
    drawUS(svg, geomap);

    // d3.csv("../data/processed/filtered_airports.csv", function (airport_list) {
    d3.csv("https://s3.amazonaws.com/airline-visualizations/processed_data/airports.csv").get(function (airport_list) {

        // filter out airports that are located outside the boundaries of the used geomap
        airport_list = airport_list.filter(function(airport) {return geomap([airport.LONGITUDE, airport.LATITUDE]) !== null; });

        draw_airports(svg, geomap)(airport_list);


        // The draw_flights function requires the location of the airports. The draw 
        //      flights function is called from within the airport parsing function 
        //      in order to keep this data out of the global scope and to guarantee 
        //      that the data has been loaded.
        // d3.csv("../data/processed/us_flights.csv", function (flights) {
        d3.csv("https://s3.amazonaws.com/airline-visualizations/processed_data/flights.csv").get(function (flights) {
            var flightCounts = draw_flights(svg, geomap, airport_list)(flights);

            attach_airport_handlers(flightCounts);
        });
    });

    // d3.csv("../data/processed/key_airlines.csv", function (airlines) {
    d3.csv("https://s3.amazonaws.com/airline-visualizations/processed_data/airlines.csv").get(function (airlines) {
        add_airline_select_box()(airlines);
        attach_airline_handlers();

        addFlightCountChart(airlines);
    });
}) ();
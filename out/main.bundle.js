/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _draw_us_states = __webpack_require__(1);

	var _draw_airports = __webpack_require__(3);

	var _draw_flights = __webpack_require__(4);

	var _responsive_svg = __webpack_require__(5);

	var _select_airline = __webpack_require__(7);

	var _flight_count = __webpack_require__(6);

	(function () {
	    var svg = d3.select("#airline_visualization");
	    var geomap = (0, _draw_us_states.get_geomap)();
	    (0, _draw_us_states.drawUS)(svg, geomap);

	    d3.csv("../data/processed/filtered_airports.csv", function (airport_list) {
	        (0, _draw_airports.draw_airports)(svg, geomap)(airport_list);

	        // The draw_flights function requires the location of the airports. The draw
	        //      flights function is called from within the airport parsing function
	        //      in order to keep this data out of the global scope and to guarantee
	        //      that the data has been loaded.
	        d3.csv("../data/processed/us_flights.csv", function (flights) {
	            var flightCounts = (0, _draw_flights.draw_flights)(svg, geomap, airport_list)(flights);

	            (0, _responsive_svg.attach_airport_handlers)(flightCounts);
	        });
	    });

	    d3.csv("../data/processed/key_airlines.csv", function (airlines) {
	        (0, _select_airline.add_airline_select_box)()(airlines);
	        (0, _responsive_svg.attach_airline_handlers)();

	        (0, _flight_count.addFlightCountChart)(airlines);
	    });
	})();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.get_geomap = get_geomap;
	exports.drawUS = drawUS;

	var _config = __webpack_require__(2);

	/**
	 * Creates and initializes the d3.geo map projection.
	 * @return {projection} Initialized d3.geo map projection.
	 */
	function get_geomap() {
	  var svg = d3.select("#airline_visualization");
	  var width = Number(svg.attr("width"));
	  var height = Number(svg.attr("height"));

	  // Full size geomap should be shown at 1200 width and 700 height
	  var geomap_scale = width == _config.config.preferred_width && height == _config.config.preferred_height ? _config.config.fallback_width : _config.config.fallback_height;

	  var geomap = d3.geo.albersUsa().scale(geomap_scale).translate([width / 2, height / 2]);

	  return geomap;
	}

	/**
	 * Draw geomap of the US using the data in the us.json file
	 * @param  {[type]} svg d3 svg element to draw the map in
	 * @param {[type]} geomap d3 geo projection to use for the map
	 */
	/**
	 * @fileOverview Draws a SVG image of the 50 United States
	 * @author Kirby Linvill 08/21/2015
	 * 
	 */

	function drawUS(svg, geomap) {
	  var path = d3.geo.path().projection(geomap);

	  var country = svg.append("svg:g").attr("id", "country");

	  var states = svg.append("svg:g").attr("id", "states");

	  d3.json("../data/us.json", function (error, us) {
	    svg.selectAll("#country").datum(topojson.feature(us, us.objects.land)).append("svg:path").attr("class", "land").attr("d", path);

	    svg.selectAll("#states").datum(topojson.mesh(us, us.objects.states, function (a, b) {
	      return a !== b;
	    })).append("svg:path").attr("class", "state-boundary").attr("d", path);
	  });
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * Holds the configuration parameters for the airline visualization
	 */

	// TODO: implement ES2015 module import/export syntax with Babel

	var config = exports.config = {
	    // Preferred and fallback map sizes
	    "preferred_width": 1200,
	    "preferred_height": 700,
	    "fallback_width": 1300,
	    "fallback_height": 900,

	    // Config parameters to determine the normal and enlarged sizes of the airport circles
	    "standard_airport_radius": 3,
	    "hover_airport_radius": 6,

	    // Flight count bar graph params
	    "bar_chart_width": d3.select("#airline_bar_chart").attr("width"),
	    "axis_width": 200,
	    "label_width": 100
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.draw_airports = draw_airports;

	var _config = __webpack_require__(2);

	function draw_airports(svg, geomap) {
	    return function (airports_list) {

	        var airports = svg.append("svg:g").attr("id", "airports");

	        airports.selectAll("circle").data(airports_list).enter().append("svg:circle").attr("class", "airport").attr("cx", function (d, i) {
	            return geomap([d.LONGITUDE, d.LATITUDE])[0];
	        }).attr("cy", function (d, i) {
	            return geomap([d.LONGITUDE, d.LATITUDE])[1];
	        }).attr("r", _config.config.standard_airport_radius).attr("data-airport-cd", function (d) {
	            return d.AIRPORT;
	        }).attr("data-airport-name", function (d) {
	            return d.DISPLAY_AIRPORT_NAME;
	        });
	    };
	} /*
	   * Draws US airports (as circles) over an SVG image of the U.S.
	   *
	   * Written By: Kirby Linvill 08/21/2015
	   * 
	   */

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.buildFlightCount = buildFlightCount;
	exports.draw_flights = draw_flights;
	// define(['d3'], function(d3) {

	function buildFlightCount(flight, currentFlightCounts) {

	    var origin = flight.ORIGIN;
	    var destination = flight.DEST;
	    var airline = flight.UNIQUE_CARRIER;
	    var num_flights = parseInt(flight.FLIGHTS, 10);

	    if (currentFlightCounts.has(origin)) {
	        var countByAirport = currentFlightCounts.get(origin);
	        var currentCount;

	        if (countByAirport.has(airline)) {
	            currentCount = countByAirport.get(airline);
	        } else {
	            currentCount = 0;
	        }

	        currentFlightCounts.get(origin).set(airline, currentCount + num_flights);
	    } else {
	        currentFlightCounts.set(origin, new Map([[airline, num_flights]]));
	    }

	    if (currentFlightCounts.has(destination)) {
	        var countByAirport = currentFlightCounts.get(destination);
	        var currentCount;

	        if (countByAirport.has(airline)) {
	            currentCount = countByAirport.get(airline);
	        } else {
	            currentCount = 0;
	        }

	        currentFlightCounts.get(destination).set(airline, currentCount + num_flights);
	    } else {
	        currentFlightCounts.set(destination, new Map([[airline, num_flights]]));
	    }

	    return currentFlightCounts;
	}

	function draw_flights(svg, geomap, airports_list) {
	    return function (flights) {
	        var routes = svg.append("svg:g").attr("id", "routes");

	        var routesByOrigin = {};

	        var flightCounts = new Map();

	        // TODO: remove reliance on state
	        // Build flight count map in memory
	        flights.forEach(function (flight) {
	            buildFlightCount(flight, flightCounts);
	        });

	        // Add flight information to html
	        flights.forEach(function (flight) {
	            var origin = flight.ORIGIN;
	            var destination = flight.DEST;
	            var airline = flight.UNIQUE_CARRIER;
	            var route_info = routesByOrigin[origin] || (routesByOrigin[origin] = {});
	            var num_flights = flight.FLIGHTS;

	            if (!route_info[destination]) route_info[destination] = { source: origin,
	                target: destination,
	                airlines: {}
	            };
	            if (route_info[destination].airlines[airline]) route_info[destination].airlines[airline] += Number(num_flights);else route_info[destination].airlines[airline] = Number(num_flights);
	        });

	        // airports_list is an array so random access by airport is slow.
	        //      Since we want to be able to lookup the location of the source
	        //      and target airports, it will be easier and faster to put the
	        //      location information in airport list into an object so that
	        //      access by key is very quick
	        var airport_locations = {};
	        airports_list.forEach(function (airport) {
	            airport_locations[airport.AIRPORT] = [airport.LONGITUDE, airport.LATITUDE];
	        });

	        var path = d3.geo.path().projection(geomap);
	        var arc = d3.geo.greatArc().source(function (d) {
	            return airport_locations[d.source];
	        }).target(function (d) {
	            return airport_locations[d.target];
	        });

	        // Actually draws the flight paths between airports
	        // Stores the flights per airline data as an html data element, data-airlines
	        // There are 1-many destinations nested under each source, this is to make it
	        //      easy to show the routes from an airport when the user clicks on an
	        //      airport on the map
	        routes.attr("data-selected", "").selectAll("g").data(airports_list).enter().append("svg:g").attr("class", "arcs").attr("data-src-airport", function (d) {
	            return d.AIRPORT;
	        }).selectAll("path.arc").data(function (d) {
	            return d3.values(routesByOrigin[d.AIRPORT]);
	        }).enter().append("svg:path").attr("class", "arc").attr("data-dest-airport", function (d) {
	            return d.target;
	        }).attr("data-airlines", function (d) {
	            return JSON.stringify(d.airlines);
	        }).attr("d", function (d) {
	            return path(arc(d));
	        });

	        return flightCounts;
	    };
	}

	// Return functions and data as an object to comply with RequireJS' format
	// return {
	//     flightCounts: flightCounts,
	//     buildFlightCount: buildFlightCount,
	//     draw_flights: draw_flights
	// }

	// });

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.selected_airport = undefined;
	exports.attach_airport_handlers = attach_airport_handlers;
	exports.attach_airline_handlers = attach_airline_handlers;

	var _flight_count = __webpack_require__(6);

	var _config = __webpack_require__(2);

	// Globally tracks which airport is currently selected
	/**
	 * Holds the javascript functions that are fired in response to user actions (mouseovers, clicks, etc.)
	 */
	var selected_airport = exports.selected_airport = undefined;

	/**
	 * Enlarges an airport icon on the map
	 * @param  {DOM Element} element The airport element to be enlarged
	 */
	function magnify_airport(element) {
	    d3.select(element).attr("r", _config.config.hover_airport_radius);
	}

	/**
	 * Returns the size of an airport icon on the map to normal 
	 * @param  {DOM Element} element The airport element to be returned to normal size
	 */
	function unmagnify_airport(element) {
	    d3.select(element).attr("r", _config.config.standard_airport_radius);
	}

	/**
	 * Shows the routes originating from an airport on the map
	 * @param  {String} airport The airport code of the airport whose outbound routes should be made visible
	 */
	function show_routes_from(airport) {
	    d3.selectAll("#routes [data-src-airport='" + airport + "']").style("display", "inherit");
	}

	/**
	 * Hides the routes originating from an airport on the map
	 * @param  {String} airport The airport code of the airport whose outbound routes should be hidden
	 */
	function hide_routes_from(airport) {
	    d3.selectAll("#routes [data-src-airport='" + airport + "']").style("display", "none");
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

	    if (selected_airline in airline_data) return this_node.attr("class") + " highlighted";else return this_node.attr("class");
	}

	function unhighlight_airlines() {
	    var this_node = d3.select(this);

	    return "arc";
	}

	function attach_airport_handlers(flightCounts) {
	    // When hovering over an airport on the map, the airport should appear larger
	    //      and all routes from that airport should appear
	    var airports = d3.selectAll(".airport");

	    airports.on("mouseover", function (d, i) {
	        magnify_airport(this);
	        show_routes_from(d.AIRPORT);

	        //d3.selectAll("[data-airport='"+d.AIRPORT+"'] .arc")
	        //    .attr("class", highlight_airline);
	        d3.selectAll("[data-src-airport='" + d.AIRPORT + "'] .arc").attr("class", highlight_airline);
	    }).on("mouseout", function (d, i) {
	        unmagnify_airport(this);
	        if (d.AIRPORT != selected_airport) {
	            hide_routes_from(d.AIRPORT);
	            d3.selectAll("[data-src-airport='" + d.AIRPORT + "'] .arc").attr("class", unhighlight_airlines);
	        }
	    }).on("click", function (d, i) {
	        hide_routes_from(selected_airport);
	        d3.selectAll("[data-src-airport='" + selected_airport + "'] .arc").attr("class", unhighlight_airlines);

	        exports.selected_airport = selected_airport = d.AIRPORT;

	        d3.selectAll("[data-src-airport='" + selected_airport + "'] .arc").attr("class", highlight_airline);
	        show_routes_from(d.AIRPORT);
	        d3.select("#selected_airport_name").text(d.DISPLAY_AIRPORT_NAME);

	        // TODO: Dependent on flight_count.js
	        (0, _flight_count.graphCountsByAirline)(d.AIRPORT, flightCounts);
	    });
	}

	function attach_airline_handlers() {
	    var airline_selector = d3.selectAll(".key input");

	    airline_selector.on("click", function (d, i) {

	        d3.selectAll("[data-src-airport='" + selected_airport + "'] .arc").attr("class", unhighlight_airlines);

	        d3.selectAll("[data-src-airport='" + selected_airport + "'] .arc").attr("class", highlight_airline);
	    });
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.addFlightCountChart = addFlightCountChart;
	exports.graphCountsByAirline = graphCountsByAirline;

	var _config = __webpack_require__(2);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function addFlightCountChart(airlines) {

	    d3.select("#airline_bar_chart").append("text").attr("x", _config.config.bar_chart_width / 2).attr("y", "1em").attr("text-anchor", "middle").text("Flights per Month by Airline and Airport");

	    var chart = d3.select("#airline_bar_chart").selectAll("g").data(airlines).enter().append("svg:g");

	    chart.attr("data-airline", function (d) {
	        return d.Code;
	    });

	    chart.append("svg:text").text(function (d) {
	        return d.Description;
	    }).attr("y", function (d, i) {
	        return (i + 1) * 2 + "em";
	    }).attr("dy", "1em");

	    chart.append("svg:rect").attr("y", function (d, i) {
	        return (i + 1) * 2 + "em";
	    }).attr("x", 200).attr("width", 0).attr("height", 20);

	    chart.append("svg:text").attr("class", "airlineCount").attr("y", function (d, i) {
	        return (i + 1) * 2 + "em";
	    }).attr("dy", "1em");
	}

	/**
	 * Reduces an array of maps where the key is the airline1 and the value is the number of flights.
	 *     Expects the initial value to have every airline as a key. 
	 * @param  {Map([airline, count])} previousValue    [description]
	 * @param  {Map([airline, count])} currentValue     [description]
	 * @param  {[type]} currentIndex                    [description]
	 * @param  {Array(Map([airline, count]))} array     [description]
	 * @return {Map([airline, count])}                  [description]
	 */
	function reduceFlights(previousValue, currentValue, currentIndex, array) {
	    var ret = new Map(previousValue);
	    //var ret = {};
	    ret.forEach(function (val, key, map) {
	        if (currentValue.get(map) !== undefined) ret.set(key, val + currentValue.get(key));
	    });
	    /*
	    for (airline in Object.keys(previousValue)) {
	        if (currentValue[airline] !== undefined) ret[airline] = previousValue[airline] + currentValue[airline];
	        else ret[airline] = previousValue[airline];
	    }
	    */
	    return ret;
	}

	function graphCountsByAirline(src_airport, flightCounts) {
	    var airline_counts = flightCounts.get(src_airport);
	    var local_max = Math.max.apply(Math, _toConsumableArray(airline_counts.values()));
	    var airlines = airline_counts.keys();

	    var x_scale = d3.scale.linear().domain([0, local_max]).range([0, _config.config.bar_chart_width - _config.config.axis_width - _config.config.label_width]);

	    d3.selectAll("#airline_bar_chart g").each(function (d, i) {
	        var airline = d3.select(this).attr("data-airline");

	        d3.select("#airline_bar_chart [data-airline=" + airline + "] rect").attr("width", x_scale(airline_counts.get(airline) || 0));
	        d3.select("#airline_bar_chart [data-airline=" + airline + "] .airlineCount").text(airline_counts.get(airline) || 0).attr("x", 200 + x_scale(airline_counts.get(airline) || 0) + 10);
	    });
	}

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.add_airline_select_box = add_airline_select_box;
	function add_airline_select_box() {
	    return function (airlines) {
	        var selection_box = d3.select(".key");

	        selection_box.append("p").text("Highlight an Airline");

	        airlines.forEach(function (airline) {

	            var entry = selection_box.append("span");

	            entry.append("input").attr("type", "radio").attr("name", "airline").attr("value", airline.Code);

	            entry.append("label").text(airline.Description);
	            entry.append("br");
	        });

	        // Option to not highlight any airline
	        var entry = selection_box.append("span");
	        entry.append("input").attr("type", "radio").attr("name", "airline").attr("value", "").attr("checked", "checked");
	        entry.append("label").text("None");
	        entry.append("br");
	    };
	}

/***/ }
/******/ ]);
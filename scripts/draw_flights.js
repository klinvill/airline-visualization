var svg = d3.select("#airline_visualization");

var routes = svg.append("svg:g")
    .attr("id", "routes");


var arc = d3.geo.greatArc()
    .source(function(d) { return locationByAirport[d.source]; })
    .target(function(d) { return locationByAirport[d.target]; });

var flightCounts = new Map();

function buildFlightCount (flight, currentFlightCounts) {
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


function draw_flights (airports_list) {
    d3.csv("us_flights.csv", function(flights) {
        var routesByOrigin = {};

        // TODO: remove reliance on state
        // Build flight count map in memory
        flights.forEach(function (flight) {
            buildFlightCount(flight, flightCounts);
        });

        // DEBUG
        console.log(flightCounts);
        

        // Add flight information to html
        flights.forEach(function(flight) {
                        var origin = flight.ORIGIN;
                        var destination = flight.DEST;
                        var airline = flight.UNIQUE_CARRIER;
                        var route_info = routesByOrigin[origin] || (routesByOrigin[origin] = {});
                        var num_flights = flight.FLIGHTS


                        if(!route_info[destination])
                            route_info[destination] =   {source: origin 
                                                        ,target: destination 
                                                        ,airlines: {}
                                                        };
                        if (route_info[destination].airlines[airline])
                            route_info[destination].airlines[airline] += Number(num_flights);
                        else 
                            route_info[destination].airlines[airline] = Number(num_flights);

                      });

        // airports_list is an array so random access by airport is slow.
        //      Since we want to be able to lookup the location of the source
        //      and target airports, it will be easier and faster to put the
        //      location information in airport list into an object so that 
        //      access by key is very quick
        var airport_locations = {};
        airports_list.forEach(function (airport) {
            airport_locations[airport.AIRPORT] = [airport.LONGITUDE, airport.LATITUDE];
        })

        var geomap = get_geomap();
        var path = d3.geo.path().projection(geomap);
        var arc = d3.geo.greatArc()
            .source(function(d) { return airport_locations[d.source] })
            .target(function(d) { return airport_locations[d.target] })
        ; 


        // Actually draws the flight paths between airports
        // Stores the flights per airline data as an html data element, data-airlines
        // There are 1-many destinations nested under each source, this is to make it 
        //      easy to show the routes from an airport when the user clicks on an 
        //      airport on the map
        routes.attr("data-selected", "")
            .selectAll("g")
            .data(airports_list)
            .enter().append("svg:g")
            .attr("class", "arcs")
            .attr("data-src-airport", function(d) { return d.AIRPORT})
            .selectAll("path.arc")
            .data(function(d) {return d3.values(routesByOrigin[d.AIRPORT])})
            .enter().append("svg:path")
            .attr("class", "arc")
            .attr("data-dest-airport", function(d) {return d.target})
            .attr("data-airlines", function(d) {return JSON.stringify(d.airlines);})
            .attr("d", function(d) { return path(arc(d)); })

        ;
    });

    attach_airport_handlers();
}
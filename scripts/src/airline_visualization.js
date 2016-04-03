var svg = d3.select("#airline_visualization");
var width =  Number(svg.attr("width")),
    height = Number(svg.attr("height"));

// Full size map should be shown at 1200 width and 700 height, otherwise the map is optimized for about a 700 width
//    and 500 height
var map_scale = ((width == 1200 && height == 700) ? 1400 : 900);


var projection = d3.geo.albersUsa()
  .scale(map_scale)
  .translate([width / 2, height / 2]);

var airport_radius = 3,
    hover_airport_radius = 6;

var path = d3.geo.path()
  .projection(projection);



var routes = svg.append("svg:g")
  .attr("id", "routes");

var circles = svg.append("svg:g")
  .attr("id", "airports");

function drawUS(svg) {
  var country = svg.append("svg:g")
    .attr("id", "country");

  var states = svg.append("svg:g")
    .attr("id", "states");

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
}

drawUS(svg);

d3.select(self.frameElement).style("height", height + "px");


function highlight_airline(d, i) {
  var this_node = d3.select(this);
  var clicked_airline = d3.select("input[name=airline]:checked").attr("value");
  if (this_node.attr("data-airlines").split(",").indexOf(clicked_airline) != -1)
    return this_node.attr("class") + " highlighted";
  else
    return this_node.attr("class");
}


d3.csv("us_flights.csv", function(flights) {
  var linksByOrigin = {};
  var countByAirport = {};
  var locationByAirport = {};
  var positions = [];
  var maxFlightsPerAirline = 0;  

  var arc = d3.geo.greatArc()
  .source(function(d) { return locationByAirport[d.source]; })
  .target(function(d) { return locationByAirport[d.target]; });


  flights.forEach(function(flight) {
    var origin = flight.ORIGIN;
    var destination = flight.DEST;
    var airline = flight.UNIQUE_CARRIER;
    var links = linksByOrigin[origin] || (linksByOrigin[origin] = {});

    if (links[destination]) links[destination].airlines.push(airline);
    else links[destination] = {source: origin, target: destination, airlines: [airline]};

    if(countByAirport[origin]) {
      countByAirport[origin].Total = countByAirport[origin].Total + Number(flight.FLIGHTS);
      countByAirport[origin][airline] = (countByAirport[origin][airline] || 0) + Number(flight.FLIGHTS);
      if (countByAirport[origin][airline] > maxFlightsPerAirline)
          maxFlightsPerAirline = countByAirport[origin][airline];
    } else {
      countByAirport[origin] = {};
      countByAirport[origin].Total = Number(flight.FLIGHTS);
      countByAirport[origin][airline] = Number(flight.FLIGHTS);
      if (countByAirport[origin][airline] > maxFlightsPerAirline)
          maxFlightsPerAirline = countByAirport[origin][airline];
    }


    if (countByAirport[destination]) {
      countByAirport[destination].Total = countByAirport[destination].Total + Number(flight.FLIGHTS);
      countByAirport[destination][airline] = (countByAirport[destination][airline] || 0) + Number(flight.FLIGHTS);
      if (countByAirport[destination][airline] > maxFlightsPerAirline)
          maxFlightsPerAirline = countByAirport[destination][airline];
    } else {
      countByAirport[destination] = {};
      countByAirport[destination].Total = Number(flight.FLIGHTS);
      countByAirport[destination][airline] = Number(flight.FLIGHTS);
      if (countByAirport[destination][airline] > maxFlightsPerAirline)
          maxFlightsPerAirline = countByAirport[destination][airline];
    }
    
  });


  var bar_chart_width = d3.select("#airline_bar_chart") .attr("width");
  var axis_width = 200;
  var label_width = 100;

  d3.select("#airline_bar_chart")
    .append("text")
    .attr("x", (bar_chart_width / 2))             
    .attr("y", "1em")
    .attr("text-anchor", "middle")  
    .text("Flights per Month by Airline and Airport");


  d3.csv("key_airlines.csv", function(airlines) {

    /*************************************
     *****            Key            *****
     *************************************/

    var key = d3.select(".key");

    key.append("p")
    .text("Highlight an Airline");

    airlines.forEach(function (airline) {
      var entry = key.append("span");

      entry.append("input")
      .attr("type", "radio")
      .attr("name", "airline")
      .attr("value", airline.Code)
      .on("click", function(d, i) {
        clicked_airport = d3.select("#routes").attr("data-selected");
        d3.selectAll("[data-airport='"+clicked_airport+"'] .arc").attr("class", "arc");
        d3.selectAll("[data-airport='"+clicked_airport+"'] .arc").attr("class", highlight_airline);
      });

      entry.append("label").text(airline.Description);
      entry.append("br");



    /*************************************
     *****         Bar Chart         *****
     *************************************/

    var chart = d3.select("#airline_bar_chart")
                  .selectAll("g")
                  .data(airlines)
                  .enter().append("svg:g");

    chart.attr("data-airline", function(d) {return d.Code;});

    chart.append("svg:text")
      .text(function(d) {return d.Description;})
      .attr("y", function(d, i) {return ((i+1)*2)+"em";})
      .attr("dy", "1em");

    chart.append("svg:rect")
      .attr("y", function(d, i) {return ((i+1)*2)+"em";})
      .attr("x", 200)
      .attr("width", 0)
      .attr("height", 20);

    chart.append("svg:text")
      .attr("class", "airlineCount")
      .attr("y", function(d, i) {return ((i+1)*2)+"em";})
      .attr("dy", "1em");

    
    });

    var entry = d3.select(".key").append("span");

    entry.append("input")
      .attr("type", "radio")
      .attr("name", "airline")
      .attr("value", "none")
      .attr("checked", "true")
      .on("click", function(d, i) {
        clicked_airport = d3.select("#routes").attr("data-selected");
        d3.selectAll("[data-airport='"+clicked_airport+"'] .arc").attr("class", "arc");
      });

    entry.append("label").text("None");
    entry.append("br");


    d3.csv("us_airports.csv", function(airports) {
         
      // Only consider airports with at least one flight.
      airports = airports.filter(function(airport) {
                                  var location = [+airport.LONGITUDE, +airport.LATITUDE];
                                  var map_loc = projection(location);
                                  if (countByAirport[airport.AIRPORT] && countByAirport[airport.AIRPORT].Total && map_loc) {
                                    locationByAirport[airport.AIRPORT] = location;
                                    positions.push(map_loc);
                                    return true;
                                  }
                                });

      circles.selectAll("circle")
        .data(airports)
        .enter().append("svg:circle")
        .attr("class", "airport")
        .attr("data-airport", function(d) { return d.AIRPORT;})
        .attr("cx", function(d, i) { return positions[i][0]; })
        .attr("cy", function(d, i) { return positions[i][1]; })
        .attr("r", airport_radius)
        //.attr("r", function(d, i) { return Math.sqrt(Math.sqrt(countByAirport[d.AIRPORT].Total));})
        .on("mouseover", function(d, i) {
            over_airport = d3.select(this).attr("data-airport");
            d3.select(this).attr("r", hover_airport_radius);
            d3.select("[data-airport='"+over_airport+"'").filter(".arcs").style("display", "inherit");

            d3.selectAll("[data-airport='"+over_airport+"'] .arc").attr("class", highlight_airline);
          })
        .on("mouseout", function(d, i) {
            over_airport = d3.select(this).attr("data-airport");
            clicked_airport = d3.select("#routes").attr("data-selected");
            d3.select(this).attr("r", airport_radius);
            if (over_airport != clicked_airport) {
              d3.select("[data-airport='"+over_airport+"']").filter(".arcs").style("display", "none");
              d3.selectAll("[data-airport='"+over_airport+"'] .arc").attr("class", "arc");
            }
          })
        .on("click", function(d, i) { 
            var prev_clicked =  d3.select("#routes").attr("data-selected"),
            new_clicked = d3.select(this).attr("data-airport");

            d3.select("h2 span").text(d.DISPLAY_AIRPORT_NAME);

            // Hide the routes associated with the previously selected airport
            d3.select("[data-airport='"+prev_clicked+"']").filter(".arcs").style("display", "none");
            d3.selectAll("[data-airport='"+prev_clicked+"'] .arc").attr("class", "arc");
          
            d3.select("#routes").attr("data-selected", new_clicked);

            // Show the routes associated with the newly selected airport
            d3.select("[data-airport='"+new_clicked+"']").filter(".arcs").style("display", "inherit");
            d3.selectAll("[data-airport='"+new_clicked+"'] .arc").attr("class", highlight_airline);

            var local_max = 0;
            airlines.forEach(function (airline) { 
              if(countByAirport[new_clicked][airline.Code] > local_max)
                local_max = countByAirport[new_clicked][airline.Code];
            });

          var x_scale = d3.scale.linear().domain([0, local_max]).range([0, bar_chart_width - axis_width - label_width]);

          airlines.forEach(function (airline) { 
            d3.select("[data-airline="+airline.Code+"] rect")
              .attr("width", x_scale(countByAirport[new_clicked][airline.Code] || 0));
            d3.select("[data-airline="+airline.Code+"] .airlineCount")
              .text(countByAirport[new_clicked][airline.Code] || 0)
              .attr("x", 200 + x_scale(countByAirport[new_clicked][airline.Code] || 0) + 10);
          });
        });

      routes.attr("data-selected", "")
        .selectAll("g")
        .data(airports)
        .enter().append("svg:g")
        .attr("class", "arcs")
        .attr("data-airport", function(d) { return d.AIRPORT;})
        .selectAll("path.arc")
        .data(function(d) {return d3.values(linksByOrigin[d.AIRPORT]) || []; })
        .enter().append("svg:path")
        .attr("class", "arc")
        .attr("data-airlines", function(d) { return d.airlines.join(","); })
        .attr("d", function(d) { return path(arc(d)); });

    });


  });


});

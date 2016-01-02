// TODO: Reading key_airlines.csv is done multiple times, this needs to be consolidated into one call

d3.csv("key_airlines.csv", function (airlines) {

    d3.select("#airline_bar_chart")
        .append("text")
        .attr("x", (bar_chart_width / 2))             
        .attr("y", "1em")
        .attr("text-anchor", "middle")  
        .text("Flights per Month by Airline and Airport");

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

function countFlightsByAirline(src_airport) {
    /*
    var airline_counts = []
    d3.selectAll("[data-src-airport="+src_airport+"] path")
        .each(function(d, i) {
            airline_counts.push(JSON.parse(d3.select(this).attr("data-airlines")));
        });
    console.log(typeof(airline_counts), airline_counts);
    //var mapped_airline_counts = airline_counts.map(function (currentVal, index, array) {return Map(currentVal);});
    return airline_counts.reduce(reduceFlights, new Map(airlines.map(function (currentVal, index, array){
        return [currentVal, 0];
    })));
    */

    // TODO: flightCounts is a global variable that is dependent on the draw_flights.js script
    return flightCounts.get(src_airport);
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
    ret.forEach(function (val, key, map) {if (currentValue.get(map) !== undefined) ret.set(key, val + currentValue.get(key));});
    /*
    for (airline in Object.keys(previousValue)) {
        if (currentValue[airline] !== undefined) ret[airline] = previousValue[airline] + currentValue[airline];
        else ret[airline] = previousValue[airline];
    }
    */
    return ret;
}


function graphCountsByAirline (src_airport) {
    var airline_counts = countFlightsByAirline(src_airport);
    var local_max = Math.max(...airline_counts.values());
    var airlines = airline_counts.keys();

    var x_scale = d3.scale.linear()
                    .domain([0, local_max])
                    .range([0, bar_chart_width - axis_width - label_width]);

    d3.selectAll("#airline_bar_chart g").each (function(d, i) {
        var airline = d3.select(this).attr("data-airline");

        d3.select("#airline_bar_chart [data-airline="+airline+"] rect")
          .attr("width", x_scale(airline_counts.get(airline) || 0));
        d3.select("#airline_bar_chart [data-airline="+airline+"] .airlineCount")
          .text(airline_counts.get(airline) || 0)
          .attr("x", 200 + x_scale(airline_counts.get(airline) || 0) + 10);
    });   
}

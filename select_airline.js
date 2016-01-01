var selection_box = d3.select(".key");

selection_box.append("p").text("Highlight an Airline");


d3.csv("key_airlines.csv", function (airlines) {
    airlines.forEach(function (airline) {

        var entry = selection_box.append("span");

        entry.append("input")
            .attr("type", "radio")
            .attr("name", "airline")
            .attr("value", airline.Code);

        entry.append("label").text(airline.Description);
        entry.append("br");
    });

    // Option to not highlight any airline
    var entry = selection_box.append("span")
    entry.append("input")
        .attr("type", "radio")
        .attr("name", "airline")
        .attr("value", "")
        .attr("checked", "checked");
    entry.append("label").text("None");
    entry.append("br");


    attach_airline_handlers();
});
export function add_airline_select_box() {
    return function (airlines) {
        var selection_box = d3.select(".key");

        selection_box.append("p").text("Highlight an Airline");

        airlines.forEach(function (airline) {

            var entry = selection_box.append("span");

            entry.append("input")
                .attr("type", "radio")
                .attr("name", "airline")
                .attr("value", airline.UNIQUE_CARRIER);

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
    };
}
// Requires draw_flights.js
define(['d3', 'draw_flights'], function(d3, df) {

    describe ( "Test draw_flights.js", function() {

        it ("buildFlightCount counts both origin and destination", function (done) {
            var origin = "ABC";
            var destination = "XYZ";
            var airline = "foo"
            var count = 11

            var flight = {
                "ORIGIN": origin
                ,"DEST": destination
                ,"UNIQUE_CARRIER": airline            
                ,"FLIGHTS": count
            }

            var res = df.buildFlightCount(flight, new Map());

            // Both the origin and destination should have recorded the flights
            expect(res.get(origin).get(airline)).toEqual(count);
            expect(res.get(destination).get(airline)).toEqual(count);

            // currently tested as asynchronous to pause long enough for the function to load
            done();
        })

        it ("buildFlightCount counts both origin and destination even if they are the same", function (done) {
            var origin = "ABC";
            var destination = origin;
            var airline = "foo"
            var count = 11

            var flight = {
                "ORIGIN": origin
                ,"DEST": destination
                ,"UNIQUE_CARRIER": airline            
                ,"FLIGHTS": count
            }

            var res = df.buildFlightCount(flight, new Map());

            // Both the origin and destination should have recorded the flights
            expect(res.get(origin).get(airline)).toEqual(2 * count);
        
            // currently tested as asynchronous to pause long enough for the function to load
            done();
        })

        //it ("buildFlightCount fails for a negative flight count", function() {})

    })
});
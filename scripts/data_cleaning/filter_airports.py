import pandas as pd

# Filters airport data based on flight data and prepares it for use with d3 visualizations
def filter_airports (flight_data_file="us_flights.csv", in_airport_file="us_airports.csv", out_airport_file="filtered_airports.csv") :
    airline_data = pd.read_csv(flight_data_file)

    origin_airports = airline_data[['ORIGIN', 'FLIGHTS']].rename(columns = {'ORIGIN': 'AIRPORT'})
    dest_airports = airline_data[['DEST', 'FLIGHTS']].rename(columns = {'DEST': 'AIRPORT'})
    airports = pd.concat([origin_airports, dest_airports])
    airports = airports.groupby(['AIRPORT']).aggregate(np.sum)

    airport_data = pd.read_csv(in_airport_file, index_col=0)

    airports = pd.merge(airports, airport_data, right_on='AIRPORT', left_index=True)
    airports.to_csv(out_airport_file)

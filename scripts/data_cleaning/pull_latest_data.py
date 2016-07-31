import requests
from datetime import date
from dateutil.relativedelta import relativedelta
from StringIO import StringIO
from zipfile import ZipFile
import pandas as pd
import numpy as np
import boto3
from os import path

# Unique Airline Codes for adjustments
AMERICAN_AIRLINES = "AA"
ALASKA_AIRLINES = "AS"
DELTA_AIRLINES = "DL"
UNITED_AIRLINES = "UA"
EXPRESS_JET_AIRLINES = "EV"
SKY_WEST_AIRLINES = "OO"

# S3 info
S3_BUCKET = "airline-visualizations"
DATA_DIRECTORY = "processed_data"

def downloadZippedFile(url, method, data=None, headers=None,):
    '''
    Downloads a zip file and returns it
    :param url:
    :param method:
    :param data:
    :param headers:
    :return:
    '''
    response = requests.request(method, url, data=data, headers=headers, stream=True)

    if response.status_code != 200:
        response.raise_for_status()

    data = ''
    for chunk in response.iter_content(1024):
        data = data + chunk

    zipped_data = StringIO(data)
    return zipped_data


def extractFromZip(zipped_data, filename):
    '''
    Extracts the contents of the specified file from a zip file
    :param zipped_data: zip file, must be a file-like object such as a StringIO object
    :param filename: name of the file to extract
    :return: contents of the specified file
    '''
    zipped_file = ZipFile(zipped_data)
    file = zipped_file.open(filename)
    return file.read()


def getAirportData():
    '''
    Downloads a csv file of airports from a zipped file from the United States' Bureau of Transportation and Statistics
    :return: contents of csv file of airports
    '''
    url = "http://www.transtats.bts.gov/DownLoad_Table.asp?Table_ID=288&Has_Group=0&Is_Zipped=0"
    form = "UserTableName=Master_Coordinate&DBShortName=Aviation_Support_Tables&RawDataTable=T_MASTER_CORD&sqlstr=+SELECT+AIRPORT%2CDISPLAY_AIRPORT_NAME%2CLATITUDE%2CLONGITUDE%2CAIRPORT_IS_LATEST+FROM++T_MASTER_CORD&"
    header = {"Content-Type": "application/x-www-form-urlencoded"}

    response = requests.post(url, form, headers=header)

    if response.status_code != 200:
        response.raise_for_status()

    # must be a file-like object in order to extract it using ZipFile
    zipped_data = StringIO(response.content)
    download_location = response.history[0].headers['location']

    # extract filename from url
    zip_filename = download_location.split('/')[-1]

    # replace .zip with .csv
    csv_filename = ".".join(zip_filename.split('.')[:-1]) + ".csv"

    csv_data = extractFromZip(zipped_data, csv_filename)

    return csv_data


def filterRelevantAirportData(airport_csv):
    '''
    Strips out all the unneeded columns from the airport data and only keeps the up-to-date rows. Retains the AIRPORT,
    DISPLAY_AIRPORT_NAME, LATITUDE, and LONGITUDE fields.
    :param airport_csv: csv of airport data with header row
    :return: pandas dataframe of relevant airport data
    '''
    airport_data = pd.read_csv(airport_csv)
    is_latest = airport_data['AIRPORT_IS_LATEST'] == 1
    latest_airport_data = airport_data[is_latest]
    return latest_airport_data[['AIRPORT', 'DISPLAY_AIRPORT_NAME', 'LATITUDE', 'LONGITUDE']]


def getFlightData(month, year):
    '''
    Downloads and extracts a csv file of Airline Flight On-Time Performance data from a zipped file from the United
    States' Bureau of Transportation and Statistics
    :param month: month to download the data for
    :param year: year to download the data for
    :return: contents of flight data csv
    '''
    url = "http://tsdata.bts.gov/PREZIP/On_Time_On_Time_Performance_{year}_{month}.zip" \
        .format(year=year, month=month)

    response = requests.get(url, stream=True)

    if response.status_code != 200:
        response.raise_for_status()

    data = ''
    for chunk in response.iter_content(1024):
        data = data + chunk

    # must be a file-like object in order to extract it using ZipFile
    zipped_data = StringIO(data)

    csv_filename = "On_Time_On_Time_Performance_{year}_{month}.csv".format(year=year, month=month)

    # convert to file-like object for Pandas to read and interpret
    flight_csv = extractFromZip(zipped_data, csv_filename)

    return flight_csv


def adjustExpressJet(flight_number):
    '''
    Returns the unique carrier code for the airline ExpressJet is contracted to using the information gathered by
    fivethirtyeight (http://fivethirtyeight.com/features/how-we-found-the-fastest-flights/#fn-5)

    :param flight_number:
    :return: UniqueCarrier code of airline the ExpressJet flight is contracted to
    '''
    if 2500 <= flight_number <= 2547:
        return AMERICAN_AIRLINES

    elif 3255 <= flight_number <= 4868 or 5660 <= flight_number <= 6189:
        return UNITED_AIRLINES

    elif 4869 <= flight_number <= 5632:
        return DELTA_AIRLINES

    else:
        return EXPRESS_JET_AIRLINES


def adjustSkyWest(flight_number):
    '''
    Returns the unique carrier code for the airline SkyWest is contracted to using the information gathered by
    fivethirtyeight (http://fivethirtyeight.com/features/how-we-found-the-fastest-flights/#fn-5)

    :param flight_number:
    :return: UniqueCarrier code of airline the SkyWest flight is contracted to
    '''
    if 2575 <= flight_number <= 2649 or 2901 <= flight_number <= 2974 or 6550 <= flight_number <= 6629:
        return AMERICAN_AIRLINES

    elif 3448 <= flight_number <= 3499:
        return ALASKA_AIRLINES

    elif 4438 <= flight_number <= 4859 or 7362 <= flight_number <= 7439:
        return DELTA_AIRLINES

    elif 4965 <= flight_number <= 6539:
        return UNITED_AIRLINES

    else:
        return SKY_WEST_AIRLINES


def mapCarrier(row):
    if row['UniqueCarrier'] == EXPRESS_JET_AIRLINES:
        return adjustExpressJet(row['FlightNum'])

    elif row['UniqueCarrier'] == SKY_WEST_AIRLINES:
        return adjustSkyWest(row['FlightNum'])

    else:
        return row['UniqueCarrier']


def adjustCarriers(flight_data):
    '''
    Assign regional contracted flight carriers to the airlines they're contracted to by changing the UniqueCarrier
    column. Done using the information provided by fivethirtyeight
    (http://fivethirtyeight.com/features/how-we-found-the-fastest-flights/#fn-5)

    :param flight_data: pandas dataframe of flight data, must have UniqueCarrier and FlightNum columns
    :return: pandas dataframe with updated UniqueCarrier values
    '''
    flight_data['UniqueCarrier'] = flight_data[['UniqueCarrier', 'FlightNum']].apply(mapCarrier, axis=1)
    return flight_data


def filterRelevantFlightData(flight_data):
    '''
    Strips out all the unneeded columns from the flight data. Only retains Origin, Dest, and UniqueCarrier fields.
    :param flight_csv: csv of flight data with header row
    :return: pandas dataframe of slimmed down flight data
    '''

    return flight_data[['Origin', 'Dest', 'UniqueCarrier']]


def aggregateFlights(flight_data):
    '''
    Aggregates the flight data by count
    :param flight_data: pandas dataframe of flights
    :return:
    '''
    counts = flight_data.groupby(['Origin', 'Dest', 'UniqueCarrier']).size()

    # size produces a series where the groupby columns are indices, but we want a flat dataframe
    counts_df = pd.DataFrame(counts, columns=['Flights'])
    counts_df.reset_index(inplace=True)

    return counts_df


# Filters airport data based on flight data and prepares it for use with d3 visualizations
def filterActiveAirports(flight_data, airport_data):
    '''
    Filters out all airports that are not connected to the flight data. Enriches each row with the number of flights
    arriving to and departing from the airport
    :param flight_data: pandas dataframe of flight data
    :param airport_data: pandas dataframe of airport data
    :return: pandas dataframe of enriched active airports
    '''

    origin_airports = flight_data[['Origin', 'Flights']].rename(columns = {'Origin': 'AIRPORT'})
    dest_airports = flight_data[['Dest', 'Flights']].rename(columns = {'Dest': 'AIRPORT'})
    active_airports = pd.concat([origin_airports, dest_airports])\
        .groupby(['AIRPORT']).aggregate(np.sum)

    active_airports = pd.merge(active_airports, airport_data, right_on='AIRPORT', left_index=True)

    return active_airports


def getAirlineCodes():
    '''
    Downloads the unique carrier lookup table from the United States Bureau of Transportation Statistics
    :return: csv of unique carrier lookup table
    '''
    url = "http://www.transtats.bts.gov/Download_Lookup.asp?Lookup=L_UNIQUE_CARRIERS"
    response = requests.get(url)

    if response.status_code != 200:
        response.raise_for_status()

    return response.text


def denormalizeFlightCarriers(flight_data, airline_data):
    '''
    Joins the unique carrier lookup data to the flight data
    :return: pandas dataframe of denormalized flight data
    '''
    denormalized_flights = pd.merge(flight_data, airline_data, left_on='UniqueCarrier', right_on='Code')\
        .drop('Code', 1)
    return denormalized_flights


if __name__ == "__main__":

    # Airline datasets are two months old
    latest_airline_date = date.today() - relativedelta(months=2)

    month = latest_airline_date.month
    year = latest_airline_date.year

    flight_csv = StringIO(getFlightData(month, year))
    flight_data = pd.read_csv(flight_csv)
    flight_data = adjustCarriers(flight_data)
    flight_data = filterRelevantFlightData(flight_data)
    flight_data = aggregateFlights(flight_data)

    airport_csv = StringIO(getAirportData())
    airport_data = filterRelevantAirportData(airport_csv)
    active_airports = filterActiveAirports(flight_data, airport_data)

    airline_csv = StringIO(getAirlineCodes())
    airline_data = pd.read_csv(airline_csv)

    flight_data = denormalizeFlightCarriers(flight_data, airline_data)

    airline_lookup = flight_data[['UniqueCarrier', 'Description']].drop_duplicates()

    # Save data as csv files to s3
    s3 = boto3.resource('s3')

    s3.Object(S3_BUCKET, path.join(DATA_DIRECTORY, 'airports.csv'))\
        .put(Body=active_airports.to_csv(index=False),
             ACL='public-read')

    s3.Object(S3_BUCKET, path.join(DATA_DIRECTORY, 'flights.csv')) \
        .put(Body=flight_data.to_csv(index=False),
             ACL='public-read')

    s3.Object(S3_BUCKET, path.join(DATA_DIRECTORY, 'airlines.csv')) \
        .put(Body=airline_lookup.to_csv(index=False),
             ACL='public-read')






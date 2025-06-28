import requests
import os
    
def get_weather(lat, lon):

    url = "https://api.open-meteo.com/v1/forecast"
    
    params = {
        'latitude': lat,
        'longitude': lon,
        'current': 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
        'timezone': 'auto'
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        current = data['current']
        
        return {
            'temperature': current['temperature_2m'],
            'humidity': current['relative_humidity_2m'],
            'weather_code': current['weather_code'],
            'wind_speed': current['wind_speed_10m'],
            'units': data['current_units'],
            'location': {
                'latitude': lat,
                'longitude': lon
            }
        }
    except:
        pass

    response = requests.get(url, params=params)
    data = response.json()

    return data

import requests

def get_location():
    try:
        response = requests.get('http://ip-api.com/json/')
        data = response.json()
        
        return {
            'ip': data['query'],
            'latitude': data['lat'], 
            'longitude': data['lon'],
            'city': data['city'],
            'country': data['country']
        }
    except Exception as e:
        print(f"Error: {e}")
        return None
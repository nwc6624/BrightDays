import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import Geolocation from '@react-native-community/geolocation';

function App(): React.JSX.Element {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Function to fetch weather data
  const fetchWeather = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const data = await response.json();
      setWeatherData(data.current_weather);
      setLoading(false);
    } catch (error) {
      setErrorMsg('Failed to fetch weather data.');
      setLoading(false);
    }
  };

  // Get device location
  const getLocation = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setErrorMsg('Location permission denied');
        setLoading(false);
        return;
      }
    }

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        fetchWeather(latitude, longitude);
      },
      error => {
        setErrorMsg('Error getting location.');
        setLoading(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.backgroundStyle}>
        <View style={styles.sectionContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : errorMsg ? (
            <Text style={styles.error}>{errorMsg}</Text>
          ) : weatherData ? (
            <>
              <Text style={styles.sectionTitle}>Real-Time Weather</Text>
              <Text style={styles.info}>
                Temperature: {weatherData.temperature}°C
              </Text>
              <Text style={styles.info}>
                Windspeed: {weatherData.windspeed} km/h
              </Text>
              <Text style={styles.info}>
                Weather Code: {weatherData.weathercode}
              </Text>
            </>
          ) : (
            <Text style={styles.sectionDescription}>
              Unable to fetch weather data.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundStyle: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  sectionContainer: {
    marginTop: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  info: {
    fontSize: 18,
    marginVertical: 5,
    color: '#555',
  },
  sectionDescription: {
    fontSize: 18,
    textAlign: 'center',
    color: '#777',
  },
  error: {
    fontSize: 18,
    color: 'red',
  },
});

export default App;
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground, RefreshControl, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';

const getBackgroundTheme = (weather, hour) => {
  const isDay = hour >= 6 && hour < 18;

  if (weather.includes('Cloud')) return isDay ? 'cloudy_day' : 'cloudy_night';
  if (weather.includes('Clear')) return isDay ? 'sunny' : 'night'; 
  if (weather.includes('Rain')) return isDay ? 'rain_day' : 'rain_night';

  return isDay ? 'sunny' : 'night';
};

const animationSources = {
  sunny: require('../assets/animations/sunny5.json'),
  night: require('../assets/animations/night2.json'),
  cloudy_day: require('../assets/animations/cloudy_day3.json'),
  cloudy_night: require('../assets/animations/cloudy_night.json'),
  rain_day: require('../assets/animations/rainy_day.json'),
  rain_night: require('../assets/animations/rainy_day2.json'),
};

const backgroundImages = {
  sunny: require('../assets/images/sun5.jpg'),
  night: require('../assets/images/night.jpg'),
  cloudy_day: require('../assets/images/clouds2.jpg'),
  cloudy_night: require('../assets/images/night.jpg'),
  rain_day: require('../assets/images/clouds2.jpg'),
  rain_night: require('../assets/images/night.jpg'),
};
const animationSizes = {
  sunny: { width: 210, height: 130 },
  night: { width: 2000, height: 130 },
  cloudy_day: { width: 200, height: 160 },
  cloudy_night: { width: 200, height: 160 },
  rain_day: { width: 200, height: 160 },
  rain_night: { width: 200, height: 160 },
};

const animationPositions = {
  sunny: { right: 6 },
  night: { right: 2 },
  cloudy_day: { right: 10 },
  cloudy_night: { right: 25 },
  rain_day: { right: 10 },
  rain_night: { right: 10 },
};

export default function WeatherWallpaper() {
  const [weatherData, setWeatherData] = useState(null);
  const [background, setBackground] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const isNight = background.includes('night');
  const textColor = isNight ? 'white' : 'black';

  const fetchWeather = async () => {
    try {
      setError(null);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Location permission denied');

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const apiKey = 'da1b90b603b1d8e9ad1b06829470209f';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
      );

      const data = await response.json();
      if (data.cod !== 200) throw new Error(data.message || 'Failed to fetch weather data');

      const hour = new Date().getHours();
      const theme = getBackgroundTheme(data.weather[0].main, hour);

      setWeatherData({
        city: data.name,
        temp: Math.round(data.main.temp),
        weather: data.weather[0].main,
      });
      setBackground(theme);
    } catch (err) {
      setError(err.message || 'Failed to load weather');
      const hour = new Date().getHours();
      const isDay = hour >= 6 && hour < 18;
      setBackground(isDay ? 'sunny' : 'night');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeather();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00cc88" />
        <Text>Loading Weather...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <ImageBackground
        source={backgroundImages[background]}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {background !== 'night' && (
          <LottieView
            source={animationSources[background]}
            autoPlay
            loop
            style={[
              styles.backgroundAnimation,
              {
                width: animationSizes[background].width,
                height: animationSizes[background].height,
                right: animationPositions[background].right,
              },
            ]}
          />
        )}

        <View style={styles.infoOverlay}>
          {error ? (
            <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
          ) : (
            <>
              <Text style={[styles.city, { color: textColor }]}>{weatherData.city}</Text>
              <Text style={[styles.temp, { color: textColor }]}>{weatherData.temp}°C</Text>
            </>
          )}
        </View>
      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  backgroundAnimation: {
    position: 'absolute',
    top: 1,
    zIndex: 1,
  },
  infoOverlay: {
    zIndex: 1,
    padding: 16,
  },
  city: {
    fontSize: 24,
    left: 20,
  },
  temp: {
    fontSize: 24,
    left: 20,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
  },
});

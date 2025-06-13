import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';
import { useColorScheme } from 'react-native';

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
  sunny: require('../assets/images/2.jpg'),
  night: require('../assets/images/night.jpg'),
  cloudy_day: require('../assets/images/clouds2.jpg'),
  cloudy_night: require('../assets/images/night.jpg'),
  rain_day: require('../assets/images/clouds2.jpg'),
  rain_night: require('../assets/images/night.jpg'),
};

const animationSizes = {
  //sunny: { width: 210, height: 170  }
  //sunny: { width: 500, height: 200 } with animation night
  sunny: { width: 210, height: 130 },
  night: { width: 10000, height: 200},
  cloudy_day: { width: 200, height: 160 },
  cloudy_night: {width: 500, height: 200},
  rain_day: { width: 200, height: 160 },
  rain_night: { width: 500, height: 210 },
};

const animationPositions = {
    //sunny: { right: 6 },

  sunny: {  right: 6 },
  night: { right: 2 },
  cloudy_day: { right: 10 },
  cloudy_night: { right: 25 },
  rain_day: { right: 10 },
  rain_night: { right: -55 },
};

export default function WeatherWallpaper() {
  const [weatherData, setWeatherData] = useState(null);
  const [background, setBackground] = useState('sunny');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 const textColor = 'black';


  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async () => {
      try {
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

        if (isMounted) {
          const hour = new Date().getHours();
          const theme = getBackgroundTheme(data.weather[0].main, hour);

          setWeatherData({
            city: data.name,
            temp: Math.round(data.main.temp),
            weather: data.weather[0].main,
          });
          setBackground(theme);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load weather');
          setLoading(false);

          const hour = new Date().getHours();
          const isDay = hour >= 6 && hour < 18;
          setBackground(isDay ? 'sunny' : 'night');
        }
      }
    };

    fetchWeather();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00cc88" />
        <Text>Loading Weather...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
    </View>
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
    color:'black'
  },
  temp: {
    fontSize: 24,
    left: 20,
    fontWeight: 'bold',
    color:'black'

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
// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
// import * as Location from 'expo-location';
// import LottieView from 'lottie-react-native';

// const getBackgroundTheme = (weather, hour) => {
//   const isDay = hour >= 6 && hour < 18;

//   if (weather.includes('Cloud')) return isDay ? 'cloudy_day' : 'cloudy_night';
//   if (weather.includes('Clear')) return isDay ? 'sunny' : 'night';
//   if (weather.includes('Rain')) return isDay ? 'rain_day' : 'rain_night';

//   return isDay ? 'sunny' : 'night';
// };

// const animationSources = {
//   sunny: require('../assets/animations/sunny5.json'),
//   night: require('../assets/animations/night2.json'),
//   cloudy_day: require('../assets/animations/cloudy_day3.json'),
//   cloudy_night: require('../assets/animations/cloudy_night.json'),
//   rain_day: require('../assets/animations/rainy_day.json'),
//   rain_night: require('../assets/animations/rainy_day2.json'),
// };

// const backgroundImages = {
//   sunny: require('../assets/images/sun5.jpg'),
//   night: require('../assets/images/night.jpg'),
//   cloudy_day: require('../assets/images/clouds2.jpg'),
//   cloudy_night: require('../assets/images/night.jpg'),
//   rain_day: require('../assets/images/clouds2.jpg'),
//   rain_night: require('../assets/images/night.jpg'),
// };

// const animationSizes = {
//   sunny: { width: 210, height: 130 },
//   night: { width: 10000, height: 200},
//   cloudy_day: { width: 200, height: 160 },
//   cloudy_night: {width: 500, height: 200},
//   rain_day: { width: 200, height: 160 },
//   rain_night: { width: 500, height: 210 },
// };

// const animationPositions = {
//   sunny: { right: 6 },
//   night: { right: 2 },
//   cloudy_day: { right: 10 },
//   cloudy_night: { right: 25 },
//   rain_day: { right: 10 },
//   rain_night: { right: -55 },
// };

// // تعريف ألوان ثابتة للأنيميشن
// const animationColorFilters = {
//   sunny: [
//     { keypath: 'sun', color: '#FFD700' }, // أصفر ذهبي للشمس
//   ],
//   night: [
//     { keypath: 'stars', color: '#FFFFFF' }, // أبيض للنجوم
//     { keypath: 'moon', color: '#E6E6FA' }, // لون فاتح للقمر
//   ],
//   cloudy_day: [
//     { keypath: 'cloud', color: '#FFFFFF' }, // أبيض للسحب
//   ],
//   cloudy_night: [
//     { keypath: 'cloud', color: '#A9A9A9' }, // رمادي للسحب الليلية
//   ],
//   rain_day: [
//     { keypath: 'rain', color: '#87CEEB' }, // أزرق فاتح للمطر
//     { keypath: 'cloud', color: '#FFFFFF' }, // أبيض للسحب
//   ],
//   rain_night: [
//     { keypath: 'rain', color: '#4682B4' }, // أزرق معدني للمطر الليلي
//     { keypath: 'cloud', color: '#A9A9A9' }, // رمادي للسحب
//   ],
// };

// export default function WeatherWallpaper() {
//   const [weatherData, setWeatherData] = useState(null);
//   const [background, setBackground] = useState('sunny');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchWeather = async () => {
//       try {
//         let { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== 'granted') throw new Error('Location permission denied');

//         let location = await Location.getCurrentPositionAsync({});
//         const { latitude, longitude } = location.coords;

//         const apiKey = 'da1b90b603b1d8e9ad1b06829470209f';
//         const response = await fetch(
//           `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
//         );

//         const data = await response.json();
//         if (data.cod !== 200) throw new Error(data.message || 'Failed to fetch weather data');

//         if (isMounted) {
//           const hour = new Date().getHours();
//           const theme = getBackgroundTheme(data.weather[0].main, hour);

//           setWeatherData({
//             city: data.name,
//             temp: Math.round(data.main.temp),
//             weather: data.weather[0].main,
//           });
//           setBackground(theme);
//           setLoading(false);
//         }
//       } catch (err) {
//         if (isMounted) {
//           setError(err.message || 'Failed to load weather');
//           setLoading(false);

//           const hour = new Date().getHours();
//           const isDay = hour >= 6 && hour < 18;
//           setBackground(isDay ? 'sunny' : 'night');
//         }
//       }
//     };

//     fetchWeather();
//     return () => { isMounted = false; };
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#00cc88" />
//         <Text style={{ color: 'black' }}>Loading Weather...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <ImageBackground
//         source={backgroundImages[background]}
//         style={styles.backgroundImage}
//         resizeMode="cover"
//       >
//         <LottieView
//           source={animationSources[background]}
//           autoPlay
//           loop
//           colorFilters={animationColorFilters[background]} // تطبيق الألوان الثابتة
//           style={[
//             styles.backgroundAnimation,
//             {
//               width: animationSizes[background].width,
//               height: animationSizes[background].height,
//               right: animationPositions[background].right,
//             },
//           ]}
//         />

//         <View style={styles.infoOverlay}>
//           {error ? (
//             <Text style={styles.errorText}>{error}</Text>
//           ) : (
//             <>
//               <Text style={styles.city}>{weatherData.city}</Text>
//               <Text style={styles.temp}>{weatherData.temp}°C</Text>
//             </>
//           )}
//         </View>
//       </ImageBackground>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     height: 200,
//     width: '100%',
//     borderRadius: 12,
//     overflow: 'hidden',
//     marginBottom: 16,
//   },
//   backgroundImage: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//   },
//   backgroundAnimation: {
//     position: 'absolute',
//     top: 1,
//     zIndex: 1,
//   },
//   infoOverlay: {
//     zIndex: 1,
//     padding: 16,
//   },
//   city: {
//     fontSize: 24,
//     left: 20,
//     color: 'black', // لون ثابت أسود
//     fontWeight: 'bold',
//   },
//   temp: {
//     fontSize: 24,
//     left: 20,
//     fontWeight: 'bold',
//     color: 'black', // لون ثابت أسود
//   },
//   errorText: {
//     fontSize: 16,
//     color: 'black', // لون ثابت أسود
//   },
//   loadingContainer: {
//     height: 200,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//     borderRadius: 12,
//     marginBottom: 16,
//   },
// });
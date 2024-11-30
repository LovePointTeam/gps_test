
// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import * as Location from 'expo-location';

// const GPSLocation = () => {
//   const [location, setLocation] = useState(null);
//   const [serverResponse, setServerResponse] = useState('');

//   const sendGPSData = async (longitude, latitude) => {
//     const url = `http://10.0.0.12:5000/${longitude}/${latitude}`; // Replace with your Flask server's IP

//     try {
//       const response = await fetch(url);
//       const data = await response.text();
//       setServerResponse(data); // Update server response
//     } catch (error) {
//       console.error("Error sending GPS data:", error);
//       setServerResponse("Unable to connect to the server.");
//     }
//   };

//   const fetchAndSendLocation = async () => {
//     try {
//       // Get the current location
//       const loc = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       });

//       const { longitude, latitude } = loc.coords;
//       setLocation({ longitude, latitude });

//       // Send GPS data to Flask server
//       sendGPSData(longitude, latitude);
//     } catch (error) {
//       console.error("Location Error:", error);
//       setServerResponse("Error fetching location.");
//     }
//   };

//   useEffect(() => {
//     const requestPermission = async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         console.error("Permission to access location was denied.");
//         setServerResponse("Location permission denied.");
//         return;
//       }

//       // Start sending location every 5 seconds
//       const interval = setInterval(fetchAndSendLocation, 5000);

//       // Cleanup interval on component unmount
//       return () => clearInterval(interval);
//     };

//     requestPermission();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>GPS Location</Text>
//       {location ? (
//         <Text style={styles.location}>
//           Latitude: {location.latitude} {'\n'}
//           Longitude: {location.longitude} {'\n'}
//           Server Response: {serverResponse}
//         </Text>
//       ) : (
//         <Text>Fetching location...</Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   header: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
//   location: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
//   error: { fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 20 },
// });

// export default GPSLocation;
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

const GPSLocation = () => {
  const [location, setLocation] = useState(null);
  const [serverResponse, setServerResponse] = useState('');
  const [intervalSeconds, setIntervalSeconds] = useState(5); // Default interval
  const [errorMsg, setErrorMsg] = useState(null);

  const FLASK_SERVER_URL = 'http://10.0.0.12:5000'; // Replace with your Flask server's IP

  // Fetch the interval from the Flask server
  const fetchInterval = async () => {
    try {
      const response = await fetch(`${FLASK_SERVER_URL}/get-interval`);
      const data = await response.json();
      if (data.interval) {
        const newInterval = parseInt(data.interval, 10);
        if (newInterval !== intervalSeconds) {
          setIntervalSeconds(newInterval); // Update interval state
        }
      }
    } catch (error) {
      console.error("Error fetching interval:", error);
      setErrorMsg("Error fetching interval from server.");
    }
  };

  // Send GPS data to the Flask server
  const sendGPSData = async (longitude, latitude) => {
    try {
      const response = await fetch(`${FLASK_SERVER_URL}/${longitude}/${latitude}`);
      const data = await response.text();
      setServerResponse(data); // Update server response
    } catch (error) {
      console.error("Error sending GPS data:", error);
      setErrorMsg("Error sending GPS data to server.");
    }
  };

  // Fetch the location and send it to the server
  const fetchAndSendLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { longitude, latitude } = loc.coords;
      setLocation({ longitude, latitude });

      // Send GPS data to Flask server
      await sendGPSData(longitude, latitude);
    } catch (error) {
      console.error("Location Error:", error);
      setErrorMsg("Error fetching location.");
    }
  };

  useEffect(() => {
    let intervalId;

    const startIntervalUpdates = async () => {
      await fetchInterval(); // Fetch the initial interval from the server
      fetchAndSendLocation(); // Fetch and send location immediately

      // Start a new interval
      intervalId = setInterval(() => {
        fetchAndSendLocation();
      }, intervalSeconds * 1000);
    };

    // Start updates
    startIntervalUpdates();

    // Cleanup: Clear interval when the component unmounts or intervalSeconds changes
    return () => clearInterval(intervalId);
  }, [intervalSeconds]); // Trigger effect whenever intervalSeconds changes

  // Periodically fetch updated interval from the server
  useEffect(() => {
    const intervalCheck = setInterval(fetchInterval, 5000); // Check for interval updates every 5 seconds
    return () => clearInterval(intervalCheck); // Cleanup interval on unmount
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>GPS Location</Text>
      {errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : location ? (
        <Text style={styles.location}>
          Latitude: {location.latitude} {'\n'}
          Longitude: {location.longitude} {'\n'}
          Server Response: {serverResponse} {'\n'}
          Interval: {intervalSeconds} seconds
        </Text>
      ) : (
        <Text>Fetching location...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  location: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
  error: { fontSize: 16, color: 'red', textAlign: 'center' },
});

export default GPSLocation;

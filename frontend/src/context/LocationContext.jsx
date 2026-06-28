import { createContext, useState } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(() => {
    const savedLocation = localStorage.getItem('userLocation');
    return savedLocation ? JSON.parse(savedLocation) : { city: 'Select Location', manual: true };
  });

  const setManualLocation = async (input) => {
    if (/^\d{6}$/.test(input.trim())) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${input.trim()}`);
        const data = await res.json();
        if (data && data[0].Status === "Success") {
          const city = data[0].PostOffice[0].District;
          const displayLoc = `${input}, ${city}`;
          const loc = { city: displayLoc, searchTerm: city, manual: true };
          setUserLocation(loc);
          localStorage.setItem('userLocation', JSON.stringify(loc));
          return true; 
        } else {
          alert("Invalid Pincode. Please enter a valid 6-digit Indian Pincode.");
          return false; 
        }
      } catch (error) {
        console.error(error);
      }
    }
    const loc = { city: input, searchTerm: input, manual: true };
    setUserLocation(loc);
    localStorage.setItem('userLocation', JSON.stringify(loc));
    return true;
  };

  // 🚀 THE ULTIMATE GPS FIX (Using Highly Accurate BigDataCloud API)
  const fetchCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        reject("Not supported");
        return;
      }
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // 🚀 FIX: This API returns exact Pincode and City accurately for India
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          
          if (data && data.city) {
            const city = data.city.replace(' District', '').trim();
            const postcode = data.postcode || ''; // BigDataCloud gives accurate postcode
            
            const displayLoc = postcode ? `${postcode}, ${city}` : city;
            
            const loc = { city: displayLoc, searchTerm: city, manual: false };
            setUserLocation(loc);
            localStorage.setItem('userLocation', JSON.stringify(loc));
            resolve(loc);
          } else {
            alert("Could not accurately detect your city. Please enter it manually.");
            reject("Location parse failed");
          }
        } catch (error) {
          console.error("GPS API Error:", error);
          alert("Network error while fetching location.");
          reject(error);
        }
      }, (error) => {
        alert("Please allow location permission in your browser popup! 📍");
        reject(error);
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    });
  };

  return (
    <LocationContext.Provider value={{ userLocation, setManualLocation, fetchCurrentLocation }}>
      {children}
    </LocationContext.Provider>
  );
};